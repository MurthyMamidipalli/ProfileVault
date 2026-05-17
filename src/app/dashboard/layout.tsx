'use client';

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser, useFirestore } from "@/firebase";
import { useProfileStore, DEFAULT_PROFILE } from "@/lib/store";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Loader2, ShieldCheck } from "lucide-react";
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
  
  // Ref-based state tracking to prevent echo-loops while typing
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
      (cloudData) => {
        const cloudDataStr = cloudData ? JSON.stringify(cloudData) : JSON.stringify(DEFAULT_PROFILE);
        const localDataStr = JSON.stringify(currentLocalRef.current);
        
        // HYDRATION LOGIC:
        // Apply cloud data if it's the first load OR if it's an external change (local matches old cloud)
        // This prevents incoming cloud updates from clearing the user's active typing (echo-loop)
        if (!isCloudLoaded || (cloudDataStr !== lastCloudDataRef.current && localDataStr === lastCloudDataRef.current)) {
          console.log(`[Sync] Applying Cloud -> Local mirror for UID: ${user.uid}`);
          lastCloudDataRef.current = cloudDataStr;
          replaceProfile(cloudData || DEFAULT_PROFILE);
        } else if (cloudDataStr !== lastCloudDataRef.current) {
          // Cloud changed but user is currently typing locally
          lastCloudDataRef.current = cloudDataStr;
          console.log(`[Sync] Cloud update acknowledged (Suppressing mid-edit overwrite)`);
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

  // 3. Debounced Auto-Save (Write Path)
  useEffect(() => {
    // CRITICAL: NEVER save until cloud is loaded to prevent blank overwrites
    if (!user || !db || !isCloudLoaded) return;

    const currentLocalStr = JSON.stringify(profile);

    // Skip if local state matches the last known cloud state (no change)
    if (currentLocalStr === lastCloudDataRef.current) return;

    const timer = setTimeout(async () => {
      try {
        const syncTimestamp = new Date().toISOString();
        const profileToSync = { ...profile, lastSyncedAt: syncTimestamp };
        const dataToSaveStr = JSON.stringify(profileToSync);
        
        console.log(`[Firestore] Syncing change to path: shared-profiles/${user.uid}`);
        
        // Optimistically update ref to prevent immediate loopback echo
        lastCloudDataRef.current = dataToSaveStr;
        
        await saveProfile(db, user.uid, profileToSync);
        markSynced(syncTimestamp);
      } catch (error) {
        console.error("[Firestore] Sync failed:", error);
      }
    }, 2000); // 2s debounce for performance

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
            <p className="text-sm text-muted-foreground animate-pulse">Syncing your secure records...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <DashboardLayout>{children}</DashboardLayout>;
}