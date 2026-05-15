
"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser, useFirestore } from "@/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useProfileStore, DEFAULT_PROFILE, UserProfile } from "@/lib/store";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { RefreshCw } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { profile, setProfile, replaceProfile, markSynced, _hasHydrated } = useProfileStore();
  const router = useRouter();
  const [cloudSyncDone, setCloudSyncDone] = useState(false);
  const lastSyncRef = useRef<string>("");

  // Auth Protection: Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Initial Cloud Hydration: Pull data from Firestore on first load/login
  useEffect(() => {
    if (user && _hasHydrated && !cloudSyncDone) {
      const fetchCloudProfile = async () => {
        try {
          const docRef = doc(db, "shared-profiles", user.uid);
          const docSnap = await getDoc(docRef);
          
          // Start with a clean slate for this specific user
          let profileToApply: UserProfile = { 
            ...DEFAULT_PROFILE, 
            sharedId: user.uid 
          };
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.profileData) {
              // Merge cloud data over defaults
              profileToApply = { 
                ...profileToApply, 
                ...data.profileData,
                sharedId: user.uid // Always enforce correct ID
              };
            }
          }
          
          // Apply the fetched (or fresh) profile to the local store
          replaceProfile(profileToApply);
          
          // Immediately update the ref to prevent the auto-sync effect from 
          // thinking this was a "change" made by the user.
          lastSyncRef.current = JSON.stringify(profileToApply);
          
        } catch (error) {
          console.error("Cloud hydration failed:", error);
        } finally {
          // Allow the dashboard to be displayed
          setCloudSyncDone(true);
        }
      };
      fetchCloudProfile();
    } else if (!user && !authLoading) {
      setCloudSyncDone(true);
    }
  }, [user, _hasHydrated, db, replaceProfile, authLoading, cloudSyncDone]);

  // Background Auto-Sync: Automatically save local changes to the cloud
  useEffect(() => {
    // Only start syncing AFTER initial hydration is done
    if (user && cloudSyncDone && _hasHydrated) {
      const currentProfileString = JSON.stringify(profile);
      
      // Stop if nothing has changed since the last sync or hydration
      if (currentProfileString === lastSyncRef.current) return;

      const timer = setTimeout(async () => {
        try {
          const profileRef = doc(db, "shared-profiles", user.uid);
          const syncTimestamp = new Date().toISOString();
          
          // Prepare the bundle for the cloud
          const updatedProfile = { ...profile, lastSyncedAt: syncTimestamp };
          const syncData = {
            profileData: updatedProfile,
            updatedAt: serverTimestamp(),
          };

          // Save to Firestore
          await setDoc(profileRef, syncData, { merge: true });
          
          // Update the reference point so we don't sync again immediately
          lastSyncRef.current = JSON.stringify(updatedProfile);
          
          // Mark as synced locally
          markSynced(syncTimestamp);
        } catch (error) {
          console.error("Auto-sync failed:", error);
        }
      }, 3000); // 3 second debounce to group rapid changes

      return () => clearTimeout(timer);
    }
  }, [profile, user, cloudSyncDone, _hasHydrated, db, markSynced]);

  // Loading Gate: Prevents "flickering" of default data while fetching cloud vault
  if (authLoading || !_hasHydrated || (user && !cloudSyncDone)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
            <div className="relative p-6 bg-card border border-primary/20 rounded-3xl shadow-2xl">
              <RefreshCw className="w-12 h-12 animate-spin text-primary" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-bold tracking-tight text-foreground">Accessing Your Vault</h3>
            <p className="text-sm text-muted-foreground">Synchronizing account data across devices...</p>
          </div>
        </div>
      </div>
    );
  }

  // Final check to prevent rendering children if user logged out during loading
  if (!user) {
    return null;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
