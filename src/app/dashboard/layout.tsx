
'use client';

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser, useFirestore } from "@/firebase";
import { useProfileStore, DEFAULT_PROFILE } from "@/lib/store";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Loader2 } from "lucide-react";
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
      console.log("[Auth] No session found, redirecting to login.");
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // 2. Atomic Hydration (Read Path)
  useEffect(() => {
    if (!user || !db) return;

    console.log(`[Sync] Initializing vault for UID: ${user.uid}`);

    const unsubscribe = subscribeToProfile(
      db, 
      user.uid, 
      (cloudData) => {
        const cloudDataStr = cloudData ? JSON.stringify(cloudData) : JSON.stringify(DEFAULT_PROFILE);
        const localDataStr = JSON.stringify(currentLocalRef.current);
        
        // ECHO-LOOP SUPPRESSION:
        // 1. Initial Load: Apply cloud data to local state.
        // 2. Cross-Device Update: If Cloud changed AND user isn't mid-type (local matches last known cloud).
        if (!isCloudLoaded || (cloudDataStr !== lastCloudDataRef.current && localDataStr === lastCloudDataRef.current)) {
          console.log(`[Sync] Applying Cloud -> Local update (Path: shared-profiles/${user.uid})`);
          lastCloudDataRef.current = cloudDataStr;
          replaceProfile(cloudData || DEFAULT_PROFILE);
        } else if (cloudDataStr !== lastCloudDataRef.current) {
          // Acknowledge update but don't overwrite UI to prevent clearing inputs while typing
          lastCloudDataRef.current = cloudDataStr;
          console.log(`[Sync] Cloud change acknowledged but suppressed (Active user typing)`);
        }
        
        setIsCloudLoaded(true);
      },
      (err) => {
        console.error('[Sync] Vault access error:', err);
        setIsCloudLoaded(true); // Prevent infinite loading loop on error
      }
    );

    return () => unsubscribe();
  }, [user, db, isCloudLoaded, replaceProfile, setIsCloudLoaded]);

  // 3. Debounced Auto-Save (Write Path)
  useEffect(() => {
    if (!user || !db || !isCloudLoaded) return;

    const currentLocalStr = JSON.stringify(profile);

    // If local state hasn't changed from the last known cloud state, skip save
    if (currentLocalStr === lastCloudDataRef.current) return;

    const timer = setTimeout(async () => {
      try {
        const syncTimestamp = new Date().toISOString();
        const profileToSync = { ...profile, lastSyncedAt: syncTimestamp };
        const dataToSaveStr = JSON.stringify(profileToSync);
        
        console.log(`[Sync] Pushing updates to: shared-profiles/${user.uid}`);
        // Optimistically update ref to suppress immediate echo
        lastCloudDataRef.current = dataToSaveStr;
        
        await saveProfile(db, user.uid, profileToSync);
        markSynced(syncTimestamp);
      } catch (error) {
        console.error("[Sync] Auto-save failed:", error);
      }
    }, 2500); // 2.5s debounce for stability

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
            <h3 className="text-lg font-bold">Opening Secure Vault</h3>
            <p className="text-sm text-muted-foreground">Synchronizing your professional identity...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <DashboardLayout>{children}</DashboardLayout>;
}
