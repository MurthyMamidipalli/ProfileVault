
'use client';

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser, useFirestore } from "@/firebase";
import { useProfileStore, DEFAULT_PROFILE } from "@/lib/store";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { RefreshCw, ShieldCheck } from "lucide-react";
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
  
  // Track the actual cloud state to prevent echo-loops
  const lastCloudDataRef = useRef<string | null>(null);
  // Track current local state in a ref to avoid stale closures in the listener
  const currentLocalRef = useRef(profile);

  // Keep the ref in sync with the state
  useEffect(() => {
    currentLocalRef.current = profile;
  }, [profile]);

  // 1. Auth Protection
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // 2. Real-time Subscription (Strict Hydration)
  useEffect(() => {
    if (!user || !db) return;

    const unsubscribe = subscribeToProfile(
      db, 
      user.uid, 
      (cloudData) => {
        if (cloudData) {
          const cloudDataStr = JSON.stringify(cloudData);
          const activeLocalStr = JSON.stringify(currentLocalRef.current);
          
          // ONLY apply if the cloud is truly different from what the user is currently seeing/typing
          if (cloudDataStr !== activeLocalStr) {
            console.log(`[Sync] CLOUD -> BROWSER: Applying update from vault`);
            lastCloudDataRef.current = cloudDataStr;
            replaceProfile(cloudData);
          } else {
            // Data is the same, just update the ref to prevent echo
            lastCloudDataRef.current = cloudDataStr;
          }
        } else {
          console.log('[Sync] New User: Initializing default vault');
          lastCloudDataRef.current = JSON.stringify(DEFAULT_PROFILE);
        }
        setIsCloudLoaded(true);
      },
      (err) => {
        console.error('[Sync] Subscription Error:', err);
        setIsCloudLoaded(true); 
      }
    );

    return () => unsubscribe();
  }, [user, db, replaceProfile, setIsCloudLoaded]);

  // 3. Intelligent Auto-Save (Debounced)
  useEffect(() => {
    if (!user || !db || !isCloudLoaded) return;

    const currentProfileStr = JSON.stringify(profile);

    // If local matches cloud, do nothing.
    if (currentProfileStr === lastCloudDataRef.current) return;

    const timer = setTimeout(async () => {
      try {
        const syncTimestamp = new Date().toISOString();
        const profileToSync = { ...profile, sharedId: user.uid, lastSyncedAt: syncTimestamp };
        
        console.log('[Sync] BROWSER -> CLOUD: Mirroring changes to vault...');
        await saveProfile(db, user.uid, profileToSync);
        
        // Update ref so we don't trigger an echo back from the listener
        lastCloudDataRef.current = JSON.stringify(profileToSync);
        markSynced(syncTimestamp);
      } catch (error) {
        console.error("[Sync] Auto-Save Failed:", error);
      }
    }, 2000); // 2 second debounce to ensure typing isn't interrupted

    return () => clearTimeout(timer);
  }, [profile, user, db, isCloudLoaded, markSynced]);

  // 4. Cleanup on logout
  useEffect(() => {
    if (!authLoading && !user) {
      reset();
      lastCloudDataRef.current = null;
    }
  }, [user, authLoading, reset]);

  if (authLoading || (user && !isCloudLoaded)) {
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
            <h3 className="text-lg font-bold tracking-tight">Accessing Professional Vault</h3>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-accent" />
              Verifying identity...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <DashboardLayout>{children}</DashboardLayout>;
}
