
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
  
  // Ref to track the data we last saw from the cloud to prevent write-loops
  const lastCloudDataRef = useRef<string | null>(null);

  // 1. Auth Protection
  useEffect(() => {
    if (!authLoading) {
      console.log(`[Auth] State changed: ${user ? 'Authenticated (' + user.uid + ')' : 'Unauthenticated'}`);
      if (!user) {
        router.push("/login");
      }
    }
  }, [user, authLoading, router]);

  // 2. Real-time Subscription (Loading from Cloud)
  // This ensures that Browser B updates automatically when Browser A saves.
  useEffect(() => {
    if (!user || !db) return;

    const unsubscribe = subscribeToProfile(
      db, 
      user.uid, 
      (cloudData) => {
        if (cloudData) {
          const cloudDataStr = JSON.stringify(cloudData);
          const currentLocalStr = JSON.stringify(profile);
          
          // Only update local store if data is actually different from what we currently have
          if (cloudDataStr !== currentLocalStr) {
            console.log('[Sync] Applying cloud data to local store...');
            lastCloudDataRef.current = cloudDataStr;
            replaceProfile(cloudData);
          } else {
            console.log('[Sync] Cloud and local are already in sync');
          }
        } else {
          console.log('[Sync] No profile found in cloud, using local default');
          lastCloudDataRef.current = JSON.stringify(DEFAULT_PROFILE);
        }
        setIsCloudLoaded(true);
      },
      (err) => {
        console.error('[Sync] Subscription error:', err);
        setIsCloudLoaded(true); 
      }
    );

    return () => unsubscribe();
  }, [user, db, replaceProfile, setIsCloudLoaded]);

  // 3. Auto-Save (Pushing to Cloud)
  // Detects local edits and mirrors them to Firestore
  useEffect(() => {
    // Only save if we have successfully connected to the cloud and have a user
    if (!user || !db || !isCloudLoaded) return;

    const currentProfileStr = JSON.stringify(profile);

    // If local state matches what we last got from the cloud, don't write it back
    if (currentProfileStr === lastCloudDataRef.current) return;

    console.log('[Sync] Local edit detected. Scheduling auto-save...');

    const timer = setTimeout(async () => {
      try {
        const syncTimestamp = new Date().toISOString();
        const profileToSync = { ...profile, sharedId: user.uid, lastSyncedAt: syncTimestamp };
        
        await saveProfile(db, user.uid, profileToSync);
        
        // Update ref so we don't trigger another sync immediately
        lastCloudDataRef.current = JSON.stringify(profileToSync);
        markSynced(syncTimestamp);
        
      } catch (error) {
        console.error("[Sync] Auto-save failed:", error);
      }
    }, 1000); // 1s debounce

    return () => clearTimeout(timer);
  }, [profile, user, db, isCloudLoaded, markSynced]);

  // 4. Cleanup on logout
  useEffect(() => {
    if (!authLoading && !user) {
      reset();
      lastCloudDataRef.current = null;
    }
  }, [user, authLoading, reset]);

  // Loading Screen: Prevent user from seeing a "blank" profile while vault is opening
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
              Verifying credentials and loading profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <DashboardLayout>{children}</DashboardLayout>;
}
