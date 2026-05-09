
"use client";

import React, { useState, useEffect } from "react";
import { useProfileStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { Share2, Globe, Copy, ExternalLink, Loader2, RefreshCw, CheckCircle2, Shield, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SharePage() {
  const { profile, setProfile, markSynced, _hasHydrated } = useProfileStore();
  const { toast } = useToast();
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Ensure a stable sharedId is generated once and saved to the store
    if (_hasHydrated && !profile.sharedId) {
      const newId = Math.random().toString(36).substring(2, 12);
      setProfile({ sharedId: newId });
    }
  }, [_hasHydrated, profile.sharedId, setProfile]);

  const handleSync = async () => {
    if (!db) {
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Firestore is not initialized. Please check your connection."
      });
      return;
    }

    // Ensure we have an ID before syncing
    let currentId = profile.sharedId;
    if (!currentId) {
      currentId = Math.random().toString(36).substring(2, 12);
      setProfile({ sharedId: currentId });
    }

    setIsSyncing(true);
    
    const profileRef = doc(db, "shared-profiles", currentId);
    
    // Create a clean, serializable object for sync
    const syncData = {
      profileData: JSON.parse(JSON.stringify({
        ...profile,
        sharedId: currentId // Ensure the ID is inside the payload too
      })),
      updatedAt: serverTimestamp(),
      publicId: currentId
    };

    setDoc(profileRef, syncData, { merge: true })
      .then(() => {
        markSynced();
        toast({
          title: "Profile Synced",
          description: "Your professional vault is now live and updated in the cloud.",
        });
      })
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: profileRef.path,
          operation: 'write',
          requestResourceData: syncData
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsSyncing(false);
      });
  };

  const shareUrl = typeof window !== 'undefined' && profile.sharedId 
    ? `${window.location.origin}/view/${profile.sharedId}` 
    : '';

  const handleCopy = () => {
    if (!shareUrl) return;
    setCopying(true);
    navigator.clipboard.writeText(shareUrl);
    toast({ title: "Copied", description: "Link copied to clipboard." });
    setTimeout(() => setCopying(false), 2000);
  };

  if (!mounted || !_hasHydrated) {
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
        <p className="text-muted-foreground">Host your professional vault in the cloud and share your unique portfolio link with recruiters and peers.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {!isSynced && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-500">Not Synced to Cloud</p>
              <p className="text-xs text-muted-foreground">Your public URL exists, but it currently leads to an empty page. Click "Sync" to go live.</p>
            </div>
            <Button size="sm" onClick={handleSync} disabled={isSyncing} className="bg-amber-500 hover:bg-amber-600 text-white border-none">
              {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sync Now"}
            </Button>
          </div>
        )}

        <Card className="glass-card border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 -mr-8 -mt-8 bg-primary/10 rounded-full blur-3xl" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Globe className="w-5 h-5 text-accent" />
              Public Portfolio URL
            </CardTitle>
            <CardDescription>
              Your identity is hosted at a permanent, shareable address.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className={cn(
              "p-6 border rounded-xl space-y-5 transition-smooth",
              isSynced ? "bg-accent/5 border-accent/20" : "bg-muted/50 border-border"
            )}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</span>
                <span className={cn(
                  "flex items-center gap-1.5 text-xs font-bold",
                  isSynced ? "text-accent" : "text-muted-foreground"
                )}>
                  {isSynced ? (
                    <><CheckCircle2 className="w-4 h-4" /> LIVE & UPDATED</>
                  ) : (
                    <><RefreshCw className="w-4 h-4" /> AWAITING INITIAL SYNC</>
                  )}
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 bg-background/50 border border-border p-4 rounded-lg font-mono text-sm truncate select-all text-foreground">
                  {shareUrl || "Preparing link..."}
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
                <Button 
                  onClick={handleSync} 
                  disabled={isSyncing || !shareUrl} 
                  variant={isSynced ? "ghost" : "default"}
                  className={cn(
                    !isSynced && "bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:bg-primary/90",
                    isSynced && "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isSyncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                  {isSynced ? 'Push Latest Changes' : 'Sync Profile Now'}
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-white/5 border-t border-border/50 p-6">
            <div className="flex gap-4 items-start">
              <Shield className="w-8 h-8 text-primary shrink-0 mt-1" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground">Cloud Sync Security</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your public profile is only updated when you click Sync. This gives you full control over when changes become visible to the public. 
                  {profile.lastSyncedAt && ` Last synced: ${new Date(profile.lastSyncedAt).toLocaleString()}`}
                </p>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
