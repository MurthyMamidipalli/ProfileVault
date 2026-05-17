
'use client';

import React, { useState, useEffect } from "react";
import { useProfileStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore } from "@/firebase";
import { Share2, Globe, Copy, ExternalLink, Loader2, CheckCircle2, Shield, Zap, RefreshCw, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { forceMirrorAll } from "@/firebase/services";

export default function SharePage() {
  const { profile, isCloudLoaded } = useProfileStore();
  const { toast } = useToast();
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  
  const [mounted, setMounted] = useState(false);
  const [copying, setCopying] = useState(false);
  const [syncing, setSyncing] = useState(false);

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
    toast({ title: "Link Copied", description: "Your secure portfolio link is ready to share." });
    setTimeout(() => setCopying(false), 2000);
  };

  const handleForceSync = async () => {
    if (!user || !db) return;
    setSyncing(true);
    try {
      await forceMirrorAll(db, user.uid, profile);
      toast({ 
        title: "Vault Deep Sync Complete", 
        description: "All professional records are now mirrored to your public vault." 
      });
    } catch (err) {
      toast({ 
        variant: "destructive", 
        title: "Sync Failed", 
        description: "Could not mirror data to the public vault." 
      });
    } finally {
      setSyncing(false);
    }
  };

  if (!mounted || !isCloudLoaded || authLoading) {
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
        <h1 className="text-3xl font-headline font-bold flex items-center gap-3">
          Professional Vault Mirror
          <Share2 className="w-6 h-6 text-primary" />
        </h1>
        <p className="text-muted-foreground">Your dashboard is mirrored in real-time to your public identity vault.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="p-6 bg-accent/5 border border-accent/20 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-accent/20 rounded-full">
            <Zap className="w-6 h-6 text-accent animate-pulse" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-accent">Real-Time Sync Active</p>
            <p className="text-xs text-muted-foreground">Every edit you make is instantly saved and shared via your unique UID-based link.</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleForceSync} 
            disabled={syncing}
            className="border-accent/20 hover:bg-accent/10"
          >
            {syncing ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Database className="w-4 h-4 mr-2" />}
            {syncing ? "Syncing..." : "Force Sync All"}
          </Button>
        </div>

        <Card className="glass-card border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 -mr-8 -mt-8 bg-primary/10 rounded-full blur-3xl" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Globe className="w-5 h-5 text-accent" />
              Your Secure URL
            </CardTitle>
            <CardDescription>
              This link is pinned to your account. It never changes, even if you update your profile content.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className={cn(
              "p-6 border rounded-xl space-y-5 transition-smooth",
              isSynced ? "bg-accent/5 border-accent/20" : "bg-muted/50 border-border"
            )}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Vault Status</span>
                <span className={cn(
                  "flex items-center gap-1.5 text-xs font-bold",
                  isSynced ? "text-accent" : "text-muted-foreground"
                )}>
                  {isSynced ? (
                    <><CheckCircle2 className="w-4 h-4" /> LIVE & PERSISTENT</>
                  ) : (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> SYNCING...</>
                  )}
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 bg-background/50 border border-border p-4 rounded-lg font-mono text-sm truncate select-all text-foreground">
                  {shareUrl || "Connecting to Cloud..."}
                </div>
                <div className="flex gap-2">
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
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild variant="outline" size="lg" className="font-medium" disabled={!isSynced}>
                  <a href={shareUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Preview Public Vault
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-white/5 border-t border-border/50 p-6 text-xs text-muted-foreground">
            <Shield className="w-4 h-4 mr-2 inline" />
            Your data is secured by Firebase Authentication. Only you can edit this information, but anyone with the link can view your professional achievements.
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
