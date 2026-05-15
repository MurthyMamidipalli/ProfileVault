
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useFirestore } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useProfileStore } from "@/lib/store";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Loader2, RefreshCw, CloudCheck } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { setProfile, _hasHydrated } = useProfileStore();
  const router = useRouter();
  const [cloudSyncDone, setCloudSyncDone] = useState(false);

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
              // Replace local state with cloud state on first login/refresh
              setProfile(data.profileData);
            }
          }
        } catch (error) {
          console.error("Cloud sync failed:", error);
        } finally {
          setCloudSyncDone(true);
        }
      };
      fetchCloudProfile();
    } else if (!user && !authLoading) {
      setCloudSyncDone(true);
    }
  }, [user, _hasHydrated, db, setProfile, authLoading, cloudSyncDone]);

  // If sync is done but we have a user, ensure the local sharedId is correct
  useEffect(() => {
    if (user && cloudSyncDone) {
      // Just a safety check to ensure sharedId matches UID
      setProfile({ sharedId: user.uid });
    }
  }, [user, cloudSyncDone, setProfile]);

  // Global loader while authenticating or waiting for the initial cloud sync
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
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              Synchronizing account data across devices...
            </p>
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
