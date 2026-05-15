
'use client';

import React, { useState, useEffect } from "react";
import { useProfileStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/firebase";
import { Share2, Globe, Copy, ExternalLink, Loader2, CheckCircle2, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SharePage() {
  const { profile, _hasHydrated } = useProfileStore();
  const { toast } = useToast();
  const { user, loading: authLoading } = useUser();
  
  const [mounted, setMounted] = useState(false);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const shareUrl = typeof window !== 'undefined' && user?.uid 
    ? `${window.location.origin}/view/${user.uid}` 
    : '';

  const handleCopy = () => {
    if (!shareUrl) return;
    setCopying(true);
    navigator.clipboard.writeText(shareUrl);
    toast({ title: "Copied", description: "Portfolio link copied to clipboard." });
    setTimeout(() => setCopying(false), 2000);
  };

  if (!mounted || !_hasHydrated || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isSynced = !!profile.lastSyncedAt;

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-headline font-bold flex items-center gap-3 text-foreground">
          Portfolio Link
          <Share2 className="w-6 h-6 text-primary" />
        </h1>
        <p className="text-muted-foreground">Your Professional Vault is now automatically synchronized with the cloud.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="p-6 bg-accent/10 border border-accent/20 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-accent/20 rounded-full">
            <Zap className="w-6 h-6 text-accent animate-pulse" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-accent">Real-Time Sync Active</p>
            <p className="text-xs text-muted-foreground">Every edit you make in the dashboard is instantly mirrored to your public portfolio link.</p>
          </div>
          {isSynced && (
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase font-black">Last Cloud Save</p>
              <p className="text-xs font-bold text-foreground">{new Date(profile.lastSyncedAt!).toLocaleTimeString()}</p>
            </div>
          )}
        </div>

        <Card className="glass-card border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 -mr-8 -mt-8 bg-primary/10 rounded-full blur-3xl" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Globe className="w-5 h-5 text-accent" />
              Your Portfolio URL
            </CardTitle>
            <CardDescription>
              Share this secure address with recruiters and clients to showcase your achievements.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className={cn(
              "p-6 border rounded-xl space-y-5 transition-smooth",
              isSynced ? "bg-accent/5 border-accent/20" : "bg-muted/50 border-border"
            )}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Cloud Status</span>
                <span className={cn(
                  "flex items-center gap-1.5 text-xs font-bold",
                  isSynced ? "text-accent" : "text-muted-foreground"
                )}>
                  {isSynced ? (
                    <><CheckCircle2 className="w-4 h-4" /> LIVE & SYNCHRONIZED</>
                  ) : (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> ESTABLISHING CONNECTION...</>
                  )}
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 bg-background/50 border border-border p-4 rounded-lg font-mono text-sm truncate select-all text-foreground">
                  {shareUrl || "Generating Secure Link..."}
                </div>
                <Button 
                  onClick={handleCopy} 
                  size="lg" 
                  variant="secondary" 
                  className="bg-accent/20 text-accent hover:bg-accent/30 font-bold shrink-0"
                  disabled={!shareUrl}
                >
                  {copying ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copying ? 'Copied' : 'Copy URL'}
                </Button>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild variant="outline" size="lg" className="font-medium" disabled={!isSynced}>
                  <a href={shareUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Preview Portfolio
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-white/5 border-t border-border/50 p-6 text-xs text-muted-foreground">
            <Shield className="w-4 h-4 mr-2 inline" />
            Your data is mirrored across all browsers you sign into. Auto-sync protects your changes from browser crashes or device failures.
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
