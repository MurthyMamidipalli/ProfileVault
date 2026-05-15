
"use client";

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
  
  // Ref to track the data we last saw from the cloud to prevent write-loops
  const lastCloudDataRef = useRef<string | null>(null);

  // 1. Auth Protection
  useEffect(() => {
    if (!authLoading) {
      console.log(`[Auth] State change: ${user ? 'Authenticated (' + user.uid + ')' : 'Unauthenticated'}`);
      if (!user) {
        router.push("/login");
      }
    }
  }, [user, authLoading, router]);

  // 2. Real-time Subscription (Loading from Cloud)
  useEffect(() => {
    if (!user || !db) return;

    const unsubscribe = subscribeToProfile(
      db, 
      user.uid, 
      (cloudData) => {
        if (cloudData) {
          const cloudDataStr = JSON.stringify(cloudData);
          
          // Only update local store if data is actually different
          if (cloudDataStr !== JSON.stringify(profile)) {
            console.log('[Sync] Updating local store with cloud data');
            lastCloudDataRef.current = cloudDataStr;
            replaceProfile(cloudData);
          }
        } else {
          console.log('[Sync] No existing cloud profile found for this user');
          lastCloudDataRef.current = JSON.stringify(DEFAULT_PROFILE);
        }
        setIsCloudLoaded(true);
      },
      (err) => {
        console.error('[Sync] Subscription error:', err);
        setIsCloudLoaded(true); // Allow local fallback even on error
      }
    );

    return () => unsubscribe();
  }, [user, db, replaceProfile, setIsCloudLoaded]);

  // 3. Auto-Save (Pushing to Cloud)
  useEffect(() => {
    // SECURITY: Only save if we have successfully loaded from the cloud once.
    // This prevents a blank local session from overwriting an existing cloud profile
    // during the initial "race" when logging in.
    if (!user || !db || !isCloudLoaded) return;

    const currentProfileStr = JSON.stringify(profile);

    // If local matches cloud, don't write
    if (currentProfileStr === lastCloudDataRef.current) return;

    console.log('[Sync] Change detected in local profile. Queueing auto-save...');

    const timer = setTimeout(async () => {
      try {
        const syncTimestamp = new Date().toISOString();
        const profileToSync = { ...profile, sharedId: user.uid, lastSyncedAt: syncTimestamp };
        
        await saveProfile(db, user.uid, profileToSync);
        
        // Update ref so we don't sync the sync
        lastCloudDataRef.current = JSON.stringify(profileToSync);
        markSynced(syncTimestamp);
        
      } catch (error) {
        console.error("[Sync] Auto-save error:", error);
      }
    }, 1500); // 1.5s debounce

    return () => clearTimeout(timer);
  }, [profile, user, db, isCloudLoaded, markSynced]);

  // 4. Cleanup on logout
  useEffect(() => {
    if (!authLoading && !user) {
      reset();
      lastCloudDataRef.current = null;
    }
  }, [user, authLoading, reset]);

  // Loading Gate: Don't show dashboard until we know WHO the user is and WHAT their data is.
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
