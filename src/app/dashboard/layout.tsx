
"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser, useFirestore } from "@/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useProfileStore, DEFAULT_PROFILE } from "@/lib/store";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { RefreshCw } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { profile, setProfile, replaceProfile, markSynced, _hasHydrated } = useProfileStore();
  const router = useRouter();
  const [cloudSyncDone, setCloudSyncDone] = useState(false);
  const lastSyncRef = useRef<string>("");

  // Auth Protection
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Initial Cloud Hydration
  useEffect(() => {
    if (user && _hasHydrated && !cloudSyncDone) {
      const fetchCloudProfile = async () => {
        try {
          const docRef = doc(db, "shared-profiles", user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.profileData) {
              const cloudDataString = JSON.stringify(data.profileData);
              // Update local store if cloud data is different
              if (cloudDataString !== JSON.stringify(profile)) {
                replaceProfile({ ...DEFAULT_PROFILE, ...data.profileData });
                lastSyncRef.current = cloudDataString;
              }
            }
          }
        } catch (error) {
          console.error("Cloud hydration failed:", error);
        } finally {
          setCloudSyncDone(true);
        }
      };
      fetchCloudProfile();
    } else if (!user && !authLoading) {
      setCloudSyncDone(true);
    }
  }, [user, _hasHydrated, db, replaceProfile, authLoading, cloudSyncDone]);

  // Background Auto-Sync
  useEffect(() => {
    if (user && cloudSyncDone && _hasHydrated) {
      const currentProfileString = JSON.stringify(profile);
      
      // Prevent sync if nothing has changed since last sync
      if (currentProfileString === lastSyncRef.current) return;

      const timer = setTimeout(async () => {
        try {
          const profileRef = doc(db, "shared-profiles", user.uid);
          const syncTimestamp = new Date().toISOString();
          
          // Prepare data with the new timestamp included in the profile
          const updatedProfile = { ...profile, lastSyncedAt: syncTimestamp };
          const syncData = {
            profileData: updatedProfile,
            updatedAt: serverTimestamp(),
          };

          await setDoc(profileRef, syncData, { merge: true });
          
          // Update local state and ref to prevent loops
          lastSyncRef.current = JSON.stringify(updatedProfile);
          markSynced(syncTimestamp);
        } catch (error) {
          console.error("Auto-sync failed:", error);
        }
      }, 3000); // 3 second debounce for stability

      return () => clearTimeout(timer);
    }
  }, [profile, user, cloudSyncDone, _hasHydrated, db, markSynced]);

  // Ensure sharedId is always synced with user UID
  useEffect(() => {
    if (user && cloudSyncDone) {
      if (profile.sharedId !== user.uid) {
        setProfile({ sharedId: user.uid });
      }
    }
  }, [user, cloudSyncDone, profile.sharedId, setProfile]);

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

  if (!user) {
    return null;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
