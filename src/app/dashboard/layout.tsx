
"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser, useFirestore } from "@/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useProfileStore, DEFAULT_PROFILE, UserProfile } from "@/lib/store";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { RefreshCw, Cloud } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { profile, replaceProfile, markSynced, _hasHydrated, isCloudLoaded, setIsCloudLoaded, reset } = useProfileStore();
  const router = useRouter();
  
  // lastSyncRef holds the stringified profile from the cloud to prevent loops
  const lastSyncRef = useRef<string | null>(null);
  const hydrationAttempted = useRef(false);

  // 1. Auth Protection
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // 2. Initial Cloud Hydration (Atomic Fetch)
  useEffect(() => {
    // Only attempt hydration if we have a user and haven't loaded cloud data yet
    if (user && _hasHydrated && !isCloudLoaded && !hydrationAttempted.current) {
      hydrationAttempted.current = true;
      
      const fetchCloudProfile = async () => {
        try {
          const docRef = doc(db, "shared-profiles", user.uid);
          const docSnap = await getDoc(docRef);
          
          let profileToApply: UserProfile;
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            profileToApply = { 
              ...DEFAULT_PROFILE,
              ...data.profileData,
              sharedId: user.uid 
            };
          } else {
            // New vault: pin current local state to this user
            profileToApply = { 
              ...profile,
              sharedId: user.uid 
            };
          }
          
          // Set the sync reference BEFORE updating the store to prevent immediate re-sync
          lastSyncRef.current = JSON.stringify(profileToApply);
          replaceProfile(profileToApply);
          setIsCloudLoaded(true);
        } catch (error) {
          console.error("Cloud hydration failed:", error);
          // If hydration fails, we still set cloud loaded to allow local use
          // but we won't have a lastSyncRef which blocks auto-sync safety
          setIsCloudLoaded(true);
        }
      };
      
      fetchCloudProfile();
    }
  }, [user, _hasHydrated, db, replaceProfile, isCloudLoaded, setIsCloudLoaded]);

  // 3. Background Auto-Sync (Mirroring)
  useEffect(() => {
    // SECURITY GATE: Only sync if we are fully hydrated and have a reference to the cloud state
    // This prevents "blank" local sessions from overwriting cloud data during loading
    if (user && isCloudLoaded && _hasHydrated && lastSyncRef.current !== null) {
      const currentProfileString = JSON.stringify(profile);
      
      // Don't sync if local state matches the last cloud update (prevents loops)
      if (currentProfileString === lastSyncRef.current) return;

      const timer = setTimeout(async () => {
        try {
          const profileRef = doc(db, "shared-profiles", user.uid);
          const syncTimestamp = new Date().toISOString();
          
          // Ensure sharedId is always set to current user during sync
          const profileToSync = { ...profile, sharedId: user.uid, lastSyncedAt: syncTimestamp };
          const syncData = {
            profileData: profileToSync,
            updatedAt: serverTimestamp(),
          };

          await setDoc(profileRef, syncData, { merge: true });
          
          // Update ref and mark synced locally
          lastSyncRef.current = JSON.stringify(profileToSync);
          markSynced(syncTimestamp);
        } catch (error) {
          console.error("Auto-sync failed:", error);
        }
      }, 3000); // 3-second debounce

      return () => clearTimeout(timer);
    }
  }, [profile, user, isCloudLoaded, _hasHydrated, db, markSynced]);

  // 4. Cleanup on logout
  useEffect(() => {
    if (!authLoading && !user) {
      reset();
      lastSyncRef.current = null;
      hydrationAttempted.current = false;
    }
  }, [user, authLoading, reset]);

  // Loading Gate: Ensures perfect data consistency on initial load
  // If we have a user but haven't loaded their cloud data, we wait.
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
              <Cloud className="w-4 h-4" />
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
