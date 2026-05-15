
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
          
          let profileToApply: UserProfile = { 
            ...DEFAULT_PROFILE, 
            sharedId: user.uid 
          };
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.profileData) {
              profileToApply = { 
                ...profileToApply, 
                ...data.profileData,
                sharedId: user.uid
              };
            }
          }
          
          replaceProfile(profileToApply);
          lastSyncRef.current = JSON.stringify(profileToApply);
          
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

  // Background Auto-Sync: Automatically save local changes to the cloud
  useEffect(() => {
    if (user && cloudSyncDone && _hasHydrated) {
      const currentProfileString = JSON.stringify(profile);
      if (currentProfileString === lastSyncRef.current) return;

      const timer = setTimeout(async () => {
        try {
          const profileRef = doc(db, "shared-profiles", user.uid);
          const syncTimestamp = new Date().toISOString();
          const updatedProfile = { ...profile, lastSyncedAt: syncTimestamp };
          const syncData = {
            profileData: updatedProfile,
            updatedAt: serverTimestamp(),
          };

          await setDoc(profileRef, syncData, { merge: true });
          lastSyncRef.current = JSON.stringify(updatedProfile);
          markSynced(syncTimestamp);
        } catch (error) {
          console.error("Auto-sync failed:", error);
        }
      }, 2000); // 2 second debounce

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

  if (!user) return null;

  return <DashboardLayout>{children}</DashboardLayout>;
}
