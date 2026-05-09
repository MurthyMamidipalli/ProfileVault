
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useFirestore } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useProfileStore } from "@/lib/store";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Loader2 } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const db = useFirestore();
  const { profile, setProfile, _hasHydrated } = useProfileStore();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  // Auth Protection
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Cloud Sync to Local on mount
  useEffect(() => {
    if (user && _hasHydrated && profile.sharedId && !isReady) {
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
        } finally {
          setIsReady(true);
        }
      };
      fetchCloudProfile();
    } else if (_hasHydrated) {
      setIsReady(true);
    }
  }, [user, _hasHydrated, profile.sharedId, db, setProfile, isReady]);

  if (loading || !isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            Synchronizing your Professional Vault...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
