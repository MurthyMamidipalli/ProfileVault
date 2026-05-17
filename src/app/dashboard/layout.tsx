
'use client';

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useFirestore } from "@/firebase";
import { useProfileStore, DEFAULT_PROFILE, UserProfile } from "@/lib/store";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Loader2, ShieldCheck, RefreshCw, CloudCheck } from "lucide-react";
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
  const lastCloudDataRef = useRef<string | null>(null);
  const currentLocalRef = useRef(profile);

  useEffect(() => {
    currentLocalRef.current = profile;
  }, [profile]);

  // 1. Auth Guard
  useEffect(() => {
    if (!authLoading && !user) {
      console.log("[Auth] Session missing, redirecting to login.");
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // 2. Real-Time Sync (Read Path)
  useEffect(() => {
    if (!user || !db) return;

    console.log(`[Auth] Authenticated as UID: ${user.uid}`);

    const unsubscribe = subscribeToProfile(
      db, 
      user.uid, 
      (cloudData: UserProfile | null) => {
        const cloudDataStr = cloudData ? JSON.stringify(cloudData) : JSON.stringify(DEFAULT_PROFILE);
        const localDataStr = JSON.stringify(currentLocalRef.current);
        
        // HYDRATION & SYNC LOGIC:
        // We only overwrite local state if:
        // A) We haven't loaded from cloud yet
        // B) The cloud data is genuinely different from our last known baseline AND we have no local pending changes
        const isExternalChange = cloudDataStr !== lastCloudDataRef.current && localDataStr === lastCloudDataRef.current;

        if (!isCloudLoaded || isExternalChange) {
          console.log(`[Sync] Applying Cloud -> Local mirror for UID: ${user.uid}`);
          lastCloudDataRef.current = cloudDataStr;
          replaceProfile(cloudData || DEFAULT_PROFILE);
        }
        
        setIsCloudLoaded(true);
      },
      (err) => {
        console.error('[Sync] Listener failure:', err);
        setIsCloudLoaded(true);
      }
    );

    return () => unsubscribe();
  }, [user, db, isCloudLoaded, replaceProfile, setIsCloudLoaded]);

  // 3. Debounced Auto-Save (Write Path) - Faster 500ms debounce
  useEffect(() => {
    if (!user || !db || !isCloudLoaded) return;

    // Compare local vs last known baseline (ignoring the sync timestamp itself)
    const profileToCompare = { ...profile, lastSyncedAt: undefined };
    const currentLocalStr = JSON.stringify(profileToCompare);
    
    const parsedLastCloud = lastCloudDataRef.current ? JSON.parse(lastCloudDataRef.current) : null;
    const lastCloudBaseline = parsedLastCloud 
      ? JSON.stringify({ ...parsedLastCloud, lastSyncedAt: undefined })
      : null;

    if (currentLocalStr === lastCloudBaseline) {
      setSyncStatus('synced');
      return;
    }

    setSyncStatus('syncing');

    const timer = setTimeout(async () => {
      try {
        const syncTimestamp = new Date().toISOString();
        const profileToSync = { ...profile, lastSyncedAt: syncTimestamp };
        
        console.log(`[Firestore] Syncing change (Projects: ${profileToSync.projects?.length || 0})`);
        
        await saveProfile(db, user.uid, profileToSync);
        
        lastCloudDataRef.current = JSON.stringify(profileToSync);
        markSynced(syncTimestamp);
        setSyncStatus('synced');
      } catch (error) {
        console.error("[Firestore] Sync failed:", error);
        setSyncStatus('error');
      }
    }, 500); // 500ms for near-instant persistence

    return () => clearTimeout(timer);
  }, [profile, user, db, isCloudLoaded, markSynced]);

  // 4. Cleanup on Logout
  useEffect(() => {
    if (!authLoading && !user) {
      reset();
      lastCloudDataRef.current = null;
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
              Verifying Professional Vault
            </h3>
            <p className="text-sm text-muted-foreground animate-pulse">Establishing secure link...</p>
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
