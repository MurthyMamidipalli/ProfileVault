
"use client";

import { useProfileStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, CheckCircle2, Cloud, ShieldCheck, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardOverview() {
  const { profile } = useProfileStore();

  const isProfileEmpty = !profile.name && !profile.bio && (profile.jobs || []).length === 0;
  const isSynced = !!profile.lastSyncedAt;

  return (
    <div className="flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="flex flex-col items-center justify-center space-y-6 pt-12 text-center">
        <div className="p-4 bg-primary/10 rounded-full border border-primary/20 relative">
          <User className="w-12 h-12 text-primary" />
          {isSynced && (
            <div className="absolute -bottom-1 -right-1 bg-accent text-accent-foreground rounded-full p-1 border-2 border-background">
              <Cloud className="w-4 h-4" />
            </div>
          )}
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-headline font-bold tracking-tight">
            Welcome, <span className="text-primary">{profile.name || "Vault Owner"}</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            {isProfileEmpty 
              ? "Your vault is currently empty. Start building your professional identity."
              : "Your professional journey is securely stored and ready for the world."}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
        <Card className={cn(
          "glass-card border-l-4",
          isSynced ? "border-l-accent" : "border-l-amber-500"
        )}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Sync Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isSynced ? (
              <>
                <div className="flex items-center gap-2 text-accent font-bold">
                  <Cloud className="w-5 h-5" />
                  Cloud Synchronized
                </div>
                <p className="text-xs text-muted-foreground">
                  Your profile was last synced on {new Date(profile.lastSyncedAt!).toLocaleString()}. It is available on all your devices.
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-amber-500 font-bold">
                  <AlertCircle className="w-5 h-5" />
                  Local Changes Only
                </div>
                <p className="text-xs text-muted-foreground">
                  Your latest updates are only stored in this browser. Visit the "Portfolio Link" page to push them to the cloud.
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Identity Integrity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-primary font-bold">
              <ShieldCheck className="w-5 h-5" />
              Vault Secure
            </div>
            <p className="text-xs text-muted-foreground">
              All personal data is encrypted and accessible only to you. Your public portfolio link only displays information you choose to share.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-md mx-auto w-full pt-4">
        <Card className="glass-card border-none bg-white/[0.02]">
          <CardContent className="p-6 text-center italic text-muted-foreground text-sm leading-relaxed">
            "Your professional vault is a living record of your achievements. Keep it updated to ensure you're always ready for the next opportunity."
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
