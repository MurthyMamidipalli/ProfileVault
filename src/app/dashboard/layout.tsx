
'use client';

import React, { useEffect, useState, useRef } from "react";
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
  
  // Tracks the last stringified version that exists in the Cloud to prevent echo-loops
  const lastCloudDataRef = useRef<string | null>(null);
  // Tracks current local state to avoid stale closure issues
  const currentLocalRef = useRef(profile);

  useEffect(() => {
    currentLocalRef.current = profile;
  }, [profile]);

  // 1. Auth Guard: Strictly redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      console.log("[Auth] Session expired or not found, redirecting to login.");
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // 2. Atomic Hydration (Read Path): Open the vault strictly via UID
  useEffect(() => {
    if (!user || !db) return;

    console.log(`[Sync] OPENING VAULT for UID: ${user.uid} at path shared-profiles/${user.uid}`);

    const unsubscribe = subscribeToProfile(
      db, 
      user.uid, 
      (cloudData) => {
        const cloudDataStr = cloudData ? JSON.stringify(cloudData) : JSON.stringify(DEFAULT_PROFILE);
        const localDataStr = JSON.stringify(currentLocalRef.current);
        
        // HYDRATION LOGIC:
        // 1. Initial Load: Apply cloud data to local state if we haven't loaded yet.
        // 2. Cross-Device Update: If Cloud changed AND the user isn't currently typing (local matches last known cloud).
        if (!isCloudLoaded || (cloudDataStr !== lastCloudDataRef.current && localDataStr === lastCloudDataRef.current)) {
          console.log(`[Sync] Realtime update received: Cloud -> Local applied (shared-profiles/${user.uid})`);
          lastCloudDataRef.current = cloudDataStr;
          replaceProfile(cloudData || DEFAULT_PROFILE);
        } else if (cloudDataStr !== lastCloudDataRef.current) {
          // Acknowledge update but suppress overwrite to avoid clearing user's active typing
          lastCloudDataRef.current = cloudDataStr;
          console.log(`[Sync] Realtime update received: Cloud change acknowledged (Background sync suppressed while typing)`);
        }
        
        setIsCloudLoaded(true);
      },
      (err) => {
        console.error('[Sync] Vault access error:', err);
        setIsCloudLoaded(true); // Stop spinner on error
      }
    );

    return () => unsubscribe();
  }, [user, db, isCloudLoaded, replaceProfile, setIsCloudLoaded]);

  // 3. Debounced Auto-Save (Write Path): Push changes ONLY after cloud has been loaded
  useEffect(() => {
    // CRITICAL: NEVER save until isCloudLoaded is true to prevent blank overwrites
    if (!user || !db || !isCloudLoaded) return;

    const currentLocalStr = JSON.stringify(profile);

    // If local state is identical to what we just got from the cloud, skip saving
    if (currentLocalStr === lastCloudDataRef.current) return;

    const timer = setTimeout(async () => {
      try {
        const syncTimestamp = new Date().toISOString();
        const profileToSync = { ...profile, lastSyncedAt: syncTimestamp };
        const dataToSaveStr = JSON.stringify(profileToSync);
        
        console.log(`[Firestore] Pushing update to path: shared-profiles/${user.uid}`);
        
        // Optimistically update ref to prevent immediate loopback echo
        lastCloudDataRef.current = dataToSaveStr;
        
        await saveProfile(db, user.uid, profileToSync);
        console.log(`[Firestore] Write success: shared-profiles/${user.uid}`);
        markSynced(syncTimestamp);
      } catch (error) {
        console.error("[Firestore] Write failed:", error);
      }
    }, 2500); // 2.5s debounce for UI stability

    return () => clearTimeout(timer);
  }, [profile, user, db, isCloudLoaded, markSynced]);

  // 4. Logout Cleanup
  useEffect(() => {
    if (!authLoading && !user) {
      console.log("[Auth] Session ended, clearing local vault cache.");
      reset();
      lastCloudDataRef.current = null;
    }
  }, [user, authLoading, reset]);

  // Show loading state until Auth and Firestore are confirmed
  if (authLoading || (user && !isCloudLoaded)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-6">
          <div className="relative p-8 bg-card border border-primary/20 rounded-3xl shadow-2xl">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5 text-accent" />
              Opening Secure Vault
            </h3>
            <p className="text-sm text-muted-foreground animate-pulse">Synchronizing your professional identity...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <DashboardLayout>{children}</DashboardLayout>;
}
