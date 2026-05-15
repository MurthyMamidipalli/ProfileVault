
"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser, useFirestore } from "@/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useProfileStore, DEFAULT_PROFILE, UserProfile } from "@/lib/store";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { RefreshCw } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { profile, replaceProfile, markSynced, _hasHydrated, isCloudLoaded, setIsCloudLoaded } = useProfileStore();
  const router = useRouter();
  const lastSyncRef = useRef<string>("");

  // Auth Protection: Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Initial Cloud Hydration: Pull data from Firestore on first load/login
  useEffect(() => {
    if (user && _hasHydrated && !isCloudLoaded) {
      const fetchCloudProfile = async () => {
        try {
          const docRef = doc(db, "shared-profiles", user.uid);
          const docSnap = await getDoc(docRef);
          
          let profileToApply: UserProfile = { 
            ...DEFAULT_PROFILE, 
            sharedId: user.uid 
          };
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.profileData) {
              profileToApply = { 
                ...profileToApply, 
                ...data.profileData,
                sharedId: user.uid
              };
            }
          }
          
          // Apply the fetched data
          const finalProfileString = JSON.stringify(profileToApply);
          replaceProfile(profileToApply);
          
          // Crucial: Set the sync ref immediately to prevent the local state 
          // (which might have just updated from the cloud) from syncing BACK to the cloud 
          // and creating a loop or race condition.
          lastSyncRef.current = finalProfileString;
          
        } catch (error) {
          console.error("Cloud hydration failed:", error);
        } finally {
          setIsCloudLoaded(true);
        }
      };
      fetchCloudProfile();
    } else if (!user && !authLoading) {
      setIsCloudLoaded(true);
    }
  }, [user, _hasHydrated, db, replaceProfile, authLoading, isCloudLoaded, setIsCloudLoaded]);

  // Background Auto-Sync: Automatically save local changes to the cloud
  useEffect(() => {
    // ONLY sync if we have a user AND the initial cloud data has been loaded.
    // This prevents wiping out cloud data with the local default state.
    if (user && isCloudLoaded && _hasHydrated) {
      const currentProfileString = JSON.stringify(profile);
      
      // Don't sync if nothing changed since last cloud update
      if (currentProfileString === lastSyncRef.current) return;

      const timer = setTimeout(async () => {
        try {
          const profileRef = doc(db, "shared-profiles", user.uid);
          const syncTimestamp = new Date().toISOString();
          
          // We don't update 'profile' in store here to avoid triggering another useEffect,
          // we just prepare the data for firestore.
          const syncData = {
            profileData: { ...profile, lastSyncedAt: syncTimestamp },
            updatedAt: serverTimestamp(),
          };

          await setDoc(profileRef, syncData, { merge: true });
          
          // Update ref and store synced timestamp
          lastSyncRef.current = JSON.stringify(syncData.profileData);
          markSynced(syncTimestamp);
          
          console.log("Auto-sync successful at", syncTimestamp);
        } catch (error) {
          console.error("Auto-sync failed:", error);
        }
      }, 3000); // 3 second debounce to group rapid edits

      return () => clearTimeout(timer);
    }
  }, [profile, user, isCloudLoaded, _hasHydrated, db, markSynced]);

  // Loading Gate: Prevents rendering the dashboard with empty data while cloud is fetching
  if (authLoading || !_hasHydrated || (user && !isCloudLoaded)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
            <div className="relative p-6 bg-card border border-primary/20 rounded-3xl shadow-2xl">
              <RefreshCw className="w-12 h-12 animate-spin text-primary" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-bold tracking-tight text-foreground">Accessing Your Vault</h3>
            <p className="text-sm text-muted-foreground">Synchronizing account data across devices...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <DashboardLayout>{children}</DashboardLayout>;
}
