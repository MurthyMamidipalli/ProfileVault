
'use client';

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useFirestore } from "@/firebase";
import { useProfileStore, DEFAULT_PROFILE, UserProfile } from "@/lib/store";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Loader2, ShieldCheck, CloudCheck } from "lucide-react";
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
  
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  
  // Ref-based state tracking to prevent echo-loops
  const lastCloudHashRef = useRef<string | null>(null);
  const currentProfileRef = useRef(profile);

  useEffect(() => {
    currentProfileRef.current = profile;
  }, [profile]);

  // 1. Auth Guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // 2. Real-Time Sync (Read Path)
  useEffect(() => {
    if (!user || !db) return;

    const unsubscribe = subscribeToProfile(
      db, 
      user.uid, 
      (cloudData: UserProfile | null) => {
        const cloudDataToHash = cloudData ? { ...cloudData, lastSyncedAt: undefined } : DEFAULT_PROFILE;
        const cloudHash = JSON.stringify(cloudDataToHash);
        
        const localToHash = { ...currentProfileRef.current, lastSyncedAt: undefined };
        const localHash = JSON.stringify(localToHash);

        // HYDRATION & SYNC LOGIC:
        // We only overwrite local state if it's the initial load OR if the cloud changed while we were idle.
        const isExternalChange = cloudHash !== lastCloudHashRef.current && localHash === lastCloudHashRef.current;

        if (!isCloudLoaded || isExternalChange) {
          console.log(`[Sync] Cloud Mirror -> Local Store Update`);
          lastCloudHashRef.current = cloudHash;
          replaceProfile(cloudData || DEFAULT_PROFILE);
        }
        
        setIsCloudLoaded(true);
      },
      (err) => {
        console.error('[Sync] Listener error:', err);
        setIsCloudLoaded(true);
      }
    );

    return () => unsubscribe();
  }, [user, db, isCloudLoaded, replaceProfile, setIsCloudLoaded]);

  // 3. Debounced Auto-Save (Write Path)
  useEffect(() => {
    if (!user || !db || !isCloudLoaded) return;

    // Compare local vs last known baseline
    const localToHash = { ...profile, lastSyncedAt: undefined };
    const localHash = JSON.stringify(localToHash);

    if (localHash === lastCloudHashRef.current) {
      setSyncStatus('synced');
      return;
    }

    setSyncStatus('syncing');

    const timer = setTimeout(async () => {
      try {
        const syncTimestamp = new Date().toISOString();
        const profileToSync = { ...profile, lastSyncedAt: syncTimestamp };
        
        await saveProfile(db, user.uid, profileToSync);
        
        // Update baseline to the state we just saved to prevent echo
        lastCloudHashRef.current = JSON.stringify({ ...profileToSync, lastSyncedAt: undefined });
        markSynced(syncTimestamp);
        setSyncStatus('synced');
      } catch (error) {
        console.error("[Sync] Save failed:", error);
        setSyncStatus('error');
      }
    }, 400); // Fast pulse for near-instant persistence

    return () => clearTimeout(timer);
  }, [profile, user, db, isCloudLoaded, markSynced]);

  // 4. Cleanup on Logout
  useEffect(() => {
    if (!authLoading && !user) {
      reset();
      lastCloudHashRef.current = null;
    }
  }, [user, authLoading, reset]);

  if (authLoading || (user && !isCloudLoaded)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div className="flex flex-col items-center gap-6">
          <div className="relative p-8 bg-card border border-primary/20 rounded-3xl shadow-2xl">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5 text-accent" />
              Syncing Professional Vault
            </h3>
            <p className="text-sm text-muted-foreground animate-pulse">Establishing cloud mirror...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <DashboardLayout syncStatus={syncStatus}>
      {children}
    </DashboardLayout>
  );
}
