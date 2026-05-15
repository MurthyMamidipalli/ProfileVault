
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useFirestore } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useProfileStore } from "@/lib/store";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Loader2, CloudSync } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { setProfile, _hasHydrated } = useProfileStore();
  const router = useRouter();
  const syncAttempted = useRef(false);
  const [cloudSyncDone, setCloudSyncDone] = useState(false);

  // Auth Protection
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Background Cloud Sync to Local on mount
  // This ensures data follows the account across devices
  useEffect(() => {
    if (user && _hasHydrated && !syncAttempted.current) {
      syncAttempted.current = true;
      const fetchCloudProfile = async () => {
        try {
          const docRef = doc(db, "shared-profiles", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.profileData) {
              // Successfully found cloud data, hydrate the local store
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
  }, [user, _hasHydrated, db, setProfile, authLoading]);

  // Show a high-quality global loader while authenticating or waiting for cloud sync
  // We wait for cloudSyncDone specifically to prevent showing default local data
  if (authLoading || !_hasHydrated || (user && !cloudSyncDone)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
            <div className="relative p-6 bg-card border border-primary/20 rounded-3xl shadow-2xl">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-bold tracking-tight text-foreground">Accessing Your Vault</h3>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <CloudSync className="w-4 h-4 animate-bounce" />
              Synchronizing account data...
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
