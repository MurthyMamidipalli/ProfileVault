
"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser, useFirestore } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useProfileStore } from "@/lib/store";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Loader2 } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { profile, setProfile, _hasHydrated } = useProfileStore();
  const router = useRouter();
  const syncAttempted = useRef(false);

  // Auth Protection
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Background Cloud Sync to Local on mount
  useEffect(() => {
    if (user && _hasHydrated && profile.sharedId && !syncAttempted.current) {
      syncAttempted.current = true;
      const fetchCloudProfile = async () => {
        try {
          const docRef = doc(db, "shared-profiles", profile.sharedId!);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.profileData) {
              setProfile(data.profileData);
            }
          }
        } catch (error) {
          console.error("Cloud sync failed:", error);
        }
      };
      fetchCloudProfile();
    }
  }, [user, _hasHydrated, profile.sharedId, db, setProfile]);

  // Show a high-quality global loader while authenticating or waiting for initial local state hydration
  if (authLoading || !_hasHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
          <p className="text-sm font-medium text-muted-foreground animate-pulse tracking-tight">
            Synchronizing your Professional Vault...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
