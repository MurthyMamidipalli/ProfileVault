
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Loader2 } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
