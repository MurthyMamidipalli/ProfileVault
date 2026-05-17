'use client';

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useFirestore } from "@/firebase";
import { useProfileStore, DEFAULT_PROFILE, UserProfile } from "@/lib/store";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Loader2, ShieldCheck } from "lucide-react";
import { subscribeToProfile, saveProfile } from "@/firebase/services";

/**
 * Stable, Order-Independent Hashing for State Comparison
 */
function getDeterministicHash(obj: any): string {
  if (!obj) return "null";
  
  // Strip volatile fields that shouldn't trigger sync logic
  const cleaned = { ...obj, lastSyncedAt: undefined };
  
  // Sort keys deeply to ensure JSON.stringify is deterministic
  const sortObject = (o: any): any => {
    if (Array.isArray(o)) return o.map(sortObject);
    if (o !== null && typeof o === 'object') {
      return Object.keys(o).sort().reduce((acc: any, key) => {
        acc[key] = sortObject(o[key]);
        return acc;
      }, {});
    }
    return o;
  };

  return JSON.stringify(sortObject(cleaned));
}

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
        const cloudHash = getDeterministicHash(cloudData || DEFAULT_PROFILE);
        const localHash = getDeterministicHash(currentProfileRef.current);

        // SYNC LOGIC:
        // We only overwrite local state if:
        // A) This is the very first load (isCloudLoaded is false)
        // B) The cloud hash genuinely changed from what we last thought the cloud looked like 
        //    AND our local state hasn't moved past that baseline yet.
        const isExternalChange = cloudHash !== lastCloudHashRef.current && localHash === lastCloudHashRef.current;

        if (!isCloudLoaded || isExternalChange) {
          console.log(`[Sync] Cloud -> Local: Update applying`);
          lastCloudHashRef.current = cloudHash;
          replaceProfile(cloudData || DEFAULT_PROFILE);
        } else if (cloudHash !== localHash) {
          console.log(`[Sync] Local state is 'Ahead' of Cloud Snapshot. Ignoring echo.`);
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

    const localHash = getDeterministicHash(profile);

    // If local state hasn't changed from the last known cloud state, do nothing.
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
        
        // Update baseline immediately to prevent echo from the snapshot listener
        lastCloudHashRef.current = getDeterministicHash(profileToSync);
        markSynced(syncTimestamp);
        setSyncStatus('synced');
      } catch (error) {
        console.error("[Sync] Save failed:", error);
        setSyncStatus('error');
      }
    }, 400); // 400ms pulse for high-integrity mirroring

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
              Initializing Professional Vault
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
