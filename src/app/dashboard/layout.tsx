'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useFirestore } from "@/firebase";
import { useProfileStore } from "@/lib/store";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Loader2, ShieldCheck } from "lucide-react";
import { 
  subscribeToProfileInfo, 
  subscribeToJobs, 
  subscribeToExperience, 
  subscribeToProjects,
  subscribeToResumes,
  subscribeToCoverLetters,
  publishToPublicVault
} from "@/firebase/services";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { 
    profile,
    setProfile, 
    setJobs, 
    setExperience, 
    setProjects,
    setResumes,
    setCoverLetters,
    setIsCloudLoaded, 
    isCloudLoaded,
    markSynced,
    reset 
  } = useProfileStore();
  const router = useRouter();
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');

  // 1. Auth Guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // 2. Real-Time Sync (Listeners)
  useEffect(() => {
    if (!user || !db) return;

    setSyncStatus('syncing');

    const unsubProfile = subscribeToProfileInfo(db, user.uid, (data) => {
      if (data) setProfile(data);
    });

    const unsubJobs = subscribeToJobs(db, user.uid, (data) => {
      setJobs(data || []);
    });

    const unsubExp = subscribeToExperience(db, user.uid, (data) => {
      setExperience(data || []);
    });

    const unsubProjects = subscribeToProjects(db, user.uid, (data) => {
      setProjects(data || []);
    });

    const unsubResumes = subscribeToResumes(db, user.uid, (data) => {
      setResumes(data || []);
    });

    const unsubCoverLetters = subscribeToCoverLetters(db, user.uid, (data) => {
      setCoverLetters(data || []);
    });

    // Mark as loaded once initial listeners have likely fired
    const timer = setTimeout(() => {
      setIsCloudLoaded(true);
      setSyncStatus('synced');
      markSynced();
    }, 1200);

    return () => {
      unsubProfile();
      unsubJobs();
      unsubExp();
      unsubProjects();
      unsubResumes();
      unsubCoverLetters();
      clearTimeout(timer);
    };
  }, [user, db, setProfile, setJobs, setExperience, setProjects, setResumes, setCoverLetters, setIsCloudLoaded, markSynced]);

  // 3. Auto-Mirror to Public Vault
  useEffect(() => {
    if (!user || !db || !isCloudLoaded) return;
    
    const timer = setTimeout(() => {
      publishToPublicVault(db, user.uid, profile).catch(err => {
        console.error("Auto-mirror failed", err);
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [profile, user, db, isCloudLoaded]);

  // 4. Cleanup on Logout
  useEffect(() => {
    if (!authLoading && !user) {
      reset();
    }
  }, [user, authLoading, reset]);

  if (authLoading || (user && !isCloudLoaded)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div className="flex flex-col items-center gap-6">
          <div className="relative p-8 bg-card border border-primary/20 rounded-3xl shadow-2xl">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5 text-accent" />
              Initializing Professional Vault
            </h3>
            <p className="text-sm text-muted-foreground animate-pulse">Establishing cloud mirror...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <DashboardLayout syncStatus={syncStatus}>
      {children}
    </DashboardLayout>
  );
}
