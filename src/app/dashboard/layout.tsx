
'use client';

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser, useFirestore } from "@/firebase";
import { useProfileStore, DEFAULT_PROFILE } from "@/lib/store";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { RefreshCw, ShieldCheck, Loader2 } from "lucide-react";
import { subscribeToProfile, saveProfile } from "@/firebase/services";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { 
    profile, 
    replaceProfile, 
    markSynced, 
    isCloudLoaded, 
    setIsCloudLoaded, 
    reset 
  } = useProfileStore();
  const router = useRouter();
  
  // Tracks the last stringified version that exists in the Cloud
  const lastCloudDataRef = useRef<string | null>(null);
  // Tracks current local state to avoid stale closure issues
  const currentLocalRef = useRef(profile);

  useEffect(() => {
    currentLocalRef.current = profile;
  }, [profile]);

  // 1. Auth Guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // 2. Atomic Hydration (Read Path)
  useEffect(() => {
    if (!user || !db) return;

    console.log(`[Sync] Initializing vault for user: ${user.uid}`);

    const unsubscribe = subscribeToProfile(
      db, 
      user.uid, 
      (cloudData) => {
        const cloudDataStr = cloudData ? JSON.stringify(cloudData) : JSON.stringify(DEFAULT_PROFILE);
        const localDataStr = JSON.stringify(currentLocalRef.current);
        
        // ECHO-LOOP SUPPRESSION:
        // Only apply cloud update if:
        // 1. We haven't loaded yet (Initial load)
        // 2. The cloud data is different from what we thought was in the cloud
        // 3. AND the local state matches our last known cloud state (meaning user isn't mid-type)
        if (!isCloudLoaded || (cloudDataStr !== lastCloudDataRef.current && localDataStr === lastCloudDataRef.current)) {
          console.log(`[Sync] Applying Cloud -> Local update`);
          lastCloudDataRef.current = cloudDataStr;
          replaceProfile(cloudData || DEFAULT_PROFILE);
        } else {
          // If we are mid-type, we update our reference but don't overwrite the UI
          lastCloudDataRef.current = cloudDataStr;
          console.log(`[Sync] Cloud update acknowledged but suppressed (User is typing)`);
        }
        
        setIsCloudLoaded(true);
      },
      (err) => {
        console.error('[Sync] Vault access error:', err);
        setIsCloudLoaded(true); // Prevent infinite loading on error
      }
    );

    return () => unsubscribe();
  }, [user, db, isCloudLoaded, replaceProfile, setIsCloudLoaded]);

  // 3. Debounced Auto-Save (Write Path)
  useEffect(() => {
    if (!user || !db || !isCloudLoaded) return;

    const currentLocalStr = JSON.stringify(profile);

    // If local state hasn't changed from the last cloud state, skip save
    if (currentLocalStr === lastCloudDataRef.current) return;

    const timer = setTimeout(async () => {
      try {
        const syncTimestamp = new Date().toISOString();
        const profileToSync = { ...profile, lastSyncedAt: syncTimestamp };
        const dataToSaveStr = JSON.stringify(profileToSync);
        
        console.log(`[Sync] Pushing local changes to cloud vault...`);
        // Update local ref immediately to prevent the next listener event from thinking it's an external change
        lastCloudDataRef.current = dataToSaveStr;
        
        await saveProfile(db, user.uid, profileToSync);
        markSynced(syncTimestamp);
      } catch (error) {
        console.error("[Sync] Auto-save failed:", error);
      }
    }, 2000); // 2 second debounce

    return () => clearTimeout(timer);
  }, [profile, user, db, isCloudLoaded, markSynced]);

  // 4. Logout Cleanup
  useEffect(() => {
    if (!authLoading && !user) {
      reset();
      lastCloudDataRef.current = null;
    }
  }, [user, authLoading, reset]);

  if (authLoading || (user && !isCloudLoaded)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-6">
          <div className="relative p-6 bg-card border border-primary/20 rounded-3xl">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold">Accessing Secure Vault</h3>
            <p className="text-sm text-muted-foreground">Syncing your professional identity...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <DashboardLayout>{children}</DashboardLayout>;
}
