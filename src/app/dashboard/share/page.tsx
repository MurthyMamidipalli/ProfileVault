
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
  const [isPublishing, setIsPublishing] = useState(false);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (_hasHydrated && !profile.sharedId) {
      const newId = Math.random().toString(36).substring(2, 12);
      setProfile({ sharedId: newId });
    }
  }, [_hasHydrated, profile.sharedId, setProfile]);

  const handleSync = async () => {
    if (!db || !profile.sharedId) {
      toast({
        variant: "destructive",
        title: "Sync Error",
        description: "Firestore is not initialized or shared ID is missing."
      });
      return;
    }

    setIsPublishing(true);
    
    const profileRef = doc(db, "shared-profiles", profile.sharedId);
    
    // We create a clean object for Firestore
    const data = {
      profileData: JSON.parse(JSON.stringify(profile)), // Ensure no non-serializable data
      updatedAt: serverTimestamp(),
      createdAt: profile.lastSyncedAt ? null : serverTimestamp() 
    };

    // Remove the createdAt field if it's already synced to avoid overwriting with serverTimestamp
    if (profile.lastSyncedAt) {
      delete data.createdAt;
    }

    setDoc(profileRef, data, { merge: true })
      .then(() => {
        markSynced();
        toast({
          title: "Vault Synced",
          description: "Your public profile is now live and updated.",
        });
      })
      .catch(async (err) => {
        console.error("Firestore sync error:", err);
        const permissionError = new FirestorePermissionError({
          path: profileRef.path,
          operation: 'write',
          requestResourceData: data
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
          variant: "destructive",
          title: "Sync Failed",
          description: err.message || "You might not have permission to write to this path."
        });
      })
      .finally(() => {
        setIsPublishing(false);
      });
  };

  const shareUrl = typeof window !== 'undefined' && profile.sharedId 
    ? `${window.location.origin}/view/${profile.sharedId}` 
    : '';

  const handleCopy = () => {
    if (!shareUrl) return;
    setCopying(true);
    navigator.clipboard.writeText(shareUrl);
    toast({ title: "Link Copied", description: "Profile URL copied to clipboard." });
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
        <h1 className="text-3xl font-headline font-bold flex items-center gap-3">
          Portfolio Link
          <Share2 className="w-6 h-6 text-primary" />
        </h1>
        <p className="text-muted-foreground">Sync your professional vault to the cloud and share your unique portfolio link with the world.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {!isSynced && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-500">Action Required: Profile Not Synced</p>
              <p className="text-xs text-amber-500/80">Your public link exists, but it will show an error until you sync your data for the first time.</p>
            </div>
            <Button size="sm" onClick={handleSync} disabled={isPublishing} className="bg-amber-500 hover:bg-amber-600 text-white border-none shadow-lg">
              {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sync Now"}
            </Button>
          </div>
        )}

        <Card className="glass-card border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 -mr-8 -mt-8 bg-primary/10 rounded-full blur-3xl" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-accent" />
              Public Hosting
            </CardTitle>
            <CardDescription>
              Your professional identity is hosted at a secure, permanent URL.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className={cn(
                "p-6 border rounded-xl space-y-5 transition-smooth",
                isSynced ? "bg-accent/5 border-accent/20" : "bg-muted/50 border-border"
              )}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Share Link Status</span>
                  <span className={cn(
                    "flex items-center gap-1.5 text-xs font-bold",
                    isSynced ? "text-green-400" : "text-muted-foreground"
                  )}>
                    {isSynced ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        LIVE & ACCESSIBLE
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        AWAITING FIRST SYNC
                      </>
                    )}
                  </span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 bg-background/50 border border-border p-4 rounded-lg font-mono text-sm truncate select-all">
                    {shareUrl || "Generating link..."}
                  </div>
                  <Button 
                    onClick={handleCopy} 
                    size="lg" 
                    variant="secondary" 
                    className="bg-accent/20 text-accent hover:bg-accent/30 font-bold shrink-0"
                    disabled={!shareUrl}
                  >
                    {copying ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copying ? 'Copied' : 'Copy Link'}
                  </Button>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button asChild variant="outline" size="lg" className="font-medium" disabled={!isSynced}>
                    <a href={shareUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Preview Public Page
                    </a>
                  </Button>
                  <Button 
                    onClick={handleSync} 
                    disabled={isPublishing || !shareUrl} 
                    variant={isSynced ? "ghost" : "default"}
                    className={cn(
                      !isSynced && "bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20",
                      isSynced && "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {isPublishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                    {isSynced ? 'Update Public Profile' : 'Sync Profile Now'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-white/5 border-t border-border/50 p-6">
            <div className="flex gap-4 items-start">
              <Shield className="w-8 h-8 text-primary shrink-0 mt-1" />
              <div className="space-y-1">
                <p className="text-sm font-bold">Privacy & Security</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {profile.lastSyncedAt 
                    ? `Last synced on ${new Date(profile.lastSyncedAt).toLocaleString()}. `
                    : "Your profile has not been synced to the cloud yet. "}
                  Only the data you manually sync is visible publicly. Use the sync button to push updates.
                </p>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
