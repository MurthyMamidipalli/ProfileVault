
"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser, useFirestore } from "@/firebase";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { useProfileStore, DEFAULT_PROFILE, UserProfile } from "@/lib/store";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { RefreshCw, Cloud, ShieldCheck } from "lucide-react";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { profile, replaceProfile, markSynced, _hasHydrated, isCloudLoaded, setIsCloudLoaded, reset } = useProfileStore();
  const router = useRouter();
  
  // Ref to track the last version of the profile received from the cloud
  // This helps prevent infinite loops during auto-sync
  const cloudDataRef = useRef<string | null>(null);
  const hydrationAttempted = useRef(false);

  // 1. Auth Protection
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // 2. Real-time Cloud Sync & Hydration
  useEffect(() => {
    if (!user || !db || !_hasHydrated) return;

    const profileRef = doc(db, "shared-profiles", user.uid);
    
    // Initial fetch and real-time subscription
    const unsubscribe = onSnapshot(profileRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const cloudProfile = {
          ...DEFAULT_PROFILE,
          ...data.profileData,
          sharedId: user.uid
        };

        const cloudProfileStr = JSON.stringify(cloudProfile);
        
        // Only update local state if the cloud data is different from what we already have
        // OR if this is the first load
        if (cloudProfileStr !== JSON.stringify(profile) || !isCloudLoaded) {
          cloudDataRef.current = cloudProfileStr;
          replaceProfile(cloudProfile);
          setIsCloudLoaded(true);
        }
      } else {
        // New user: No profile in cloud yet. 
        // We mark cloud as loaded so the local profile can be synced later.
        setIsCloudLoaded(true);
        cloudDataRef.current = JSON.stringify(profile);
      }
    }, (err) => {
      const permissionError = new FirestorePermissionError({
        path: profileRef.path,
        operation: 'get',
      });
      errorEmitter.emit('permission-error', permissionError);
      // Even on error, we stop the loading state to allow local-only fallback
      setIsCloudLoaded(true);
    });

    return () => unsubscribe();
  }, [user, db, _hasHydrated, replaceProfile, setIsCloudLoaded]);

  // 3. Background Auto-Sync (Debounced Writes)
  useEffect(() => {
    // Only sync if:
    // 1. User is authenticated
    // 2. Cloud data has been successfully fetched at least once
    // 3. Local store has hydrated from localStorage
    if (!user || !db || !isCloudLoaded || !_hasHydrated) return;

    const currentProfileStr = JSON.stringify(profile);

    // If local data matches the last known cloud state, do nothing
    if (currentProfileStr === cloudDataRef.current) return;

    const timer = setTimeout(async () => {
      try {
        const profileRef = doc(db, "shared-profiles", user.uid);
        const syncTimestamp = new Date().toISOString();
        
        // Ensure sharedId is always correct
        const profileToSync = { ...profile, sharedId: user.uid, lastSyncedAt: syncTimestamp };
        
        const syncData = {
          profileData: profileToSync,
          updatedAt: serverTimestamp(),
        };

        // Non-blocking write
        setDoc(profileRef, syncData, { merge: true })
          .then(() => {
            // Update the reference to prevent re-fetching what we just wrote
            cloudDataRef.current = JSON.stringify(profileToSync);
            markSynced(syncTimestamp);
          })
          .catch(async (err) => {
            const permissionError = new FirestorePermissionError({
              path: profileRef.path,
              operation: 'write',
              requestResourceData: syncData
            });
            errorEmitter.emit('permission-error', permissionError);
          });

      } catch (error) {
        console.error("Auto-sync error:", error);
      }
    }, 2000); // 2-second debounce for writes

    return () => clearTimeout(timer);
  }, [profile, user, db, isCloudLoaded, _hasHydrated, markSynced]);

  // 4. Clean up on logout
  useEffect(() => {
    if (!authLoading && !user) {
      reset();
      cloudDataRef.current = null;
    }
  }, [user, authLoading, reset]);

  // Loading Screen: Visible until Auth is determined AND cloud data is fetched
  if (authLoading || !_hasHydrated || (user && !isCloudLoaded)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div className="flex flex-col items-center gap-6 animate-in fade-in duration-700">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
            <div className="relative p-6 bg-card border border-primary/20 rounded-3xl shadow-2xl">
              <RefreshCw className="w-12 h-12 animate-spin text-primary" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-bold tracking-tight">Accessing Secure Vault</h3>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-accent" />
              Opening your professional record...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <DashboardLayout>{children}</DashboardLayout>;
}
