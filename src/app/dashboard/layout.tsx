
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
  const fetchingRef = useRef(false);

  // Auth Protection
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Initial Cloud Hydration: Fetch profile only once on login or page load
  useEffect(() => {
    if (user && _hasHydrated && !isCloudLoaded && !fetchingRef.current) {
      fetchingRef.current = true;
      const fetchCloudProfile = async () => {
        try {
          console.log("Hydrating vault from cloud for user:", user.uid);
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
            console.log("Cloud profile found. Syncing local vault.");
          } else {
            // New vault: pin current local state to this user
            profileToApply = { 
              ...profile,
              sharedId: user.uid 
            };
            console.log("No cloud profile found. Initializing new vault.");
          }
          
          // CRITICAL: Update the ref BEFORE updating the store to prevent immediate re-sync
          lastSyncRef.current = JSON.stringify(profileToApply);
          replaceProfile(profileToApply);
          setIsCloudLoaded(true);
        } catch (error) {
          console.error("Cloud hydration failed:", error);
          setIsCloudLoaded(true); // Don't block UI indefinitely
        } finally {
          fetchingRef.current = false;
        }
      };
      fetchCloudProfile();
    }
  }, [user, _hasHydrated, db, replaceProfile, isCloudLoaded, setIsCloudLoaded, profile]);

  // Background Auto-Sync: Mirrors all local changes to the cloud
  useEffect(() => {
    // Only start auto-sync after cloud hydration is confirmed and we have a reference
    if (user && isCloudLoaded && _hasHydrated && lastSyncRef.current !== null) {
      const currentProfileString = JSON.stringify(profile);
      
      // Don't sync if local state matches the last cloud update
      if (currentProfileString === lastSyncRef.current) return;

      const timer = setTimeout(async () => {
        try {
          console.log("Auto-syncing changes to cloud...");
          const profileRef = doc(db, "shared-profiles", user.uid);
          const syncTimestamp = new Date().toISOString();
          
          const profileToSync = { ...profile, lastSyncedAt: syncTimestamp };
          const syncData = {
            profileData: profileToSync,
            updatedAt: serverTimestamp(),
          };

          await setDoc(profileRef, syncData, { merge: true });
          
          // Update ref and mark synced locally
          lastSyncRef.current = JSON.stringify(profileToSync);
          markSynced(syncTimestamp);
          
          console.log("Vault auto-sync complete at", syncTimestamp);
        } catch (error) {
          console.error("Auto-sync failed:", error);
        }
      }, 3000); // 3-second debounce

      return () => clearTimeout(timer);
    }
  }, [profile, user, isCloudLoaded, _hasHydrated, db, markSynced]);

  // Reset state on user logout
  useEffect(() => {
    if (!authLoading && !user) {
      reset();
      lastSyncRef.current = null;
    }
  }, [user, authLoading, reset]);

  // Loading Gate: Ensures perfect data consistency on initial load
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
              Verifying credentials and pulling profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <DashboardLayout>{children}</DashboardLayout>;
}
