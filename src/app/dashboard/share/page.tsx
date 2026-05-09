
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
import { Share2, Globe, Copy, ExternalLink, Loader2, RefreshCw, CheckCircle2, Shield } from "lucide-react";

export default function SharePage() {
  const { profile, setProfile, _hasHydrated } = useProfileStore();
  const { toast } = useToast();
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Auto-generate a sharedId if it doesn't exist when the user visits this page
    if (_hasHydrated && !profile.sharedId) {
      const newId = Math.random().toString(36).substring(2, 12);
      setProfile({ sharedId: newId });
    }
  }, [_hasHydrated, profile.sharedId, setProfile]);

  const handleSync = async () => {
    if (!db || !profile.sharedId) return;
    setIsPublishing(true);
    
    const profileRef = doc(db, "shared-profiles", profile.sharedId);
    
    const data = {
      profileData: profile,
      updatedAt: serverTimestamp(),
      // In a real app we'd track the actual creation date, 
      // but for this prototype we'll use the sync timestamp.
      createdAt: serverTimestamp() 
    };

    setDoc(profileRef, data, { merge: true })
      .then(() => {
        toast({
          title: "Vault Synced",
          description: "Your public profile is now up to date with your latest changes.",
        });
      })
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: profileRef.path,
          operation: 'write',
          requestResourceData: data
        });
        errorEmitter.emit('permission-error', permissionError);
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

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-headline font-bold flex items-center gap-3">
          Share & Public Profile
          <Share2 className="w-6 h-6 text-primary" />
        </h1>
        <p className="text-muted-foreground">Manage your public presence and share your professional vault with the world.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="glass-card border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 -mr-8 -mt-8 bg-primary/10 rounded-full blur-3xl" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-accent" />
              Public Hosting
            </CardTitle>
            <CardDescription>
              Your identity is hosted at a secure, permanent URL. Sync your data to make your latest achievements visible.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="p-6 bg-accent/5 border border-accent/20 rounded-xl space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-accent">Active Share Link</span>
                  <span className="flex items-center gap-1.5 text-xs text-green-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    LIVE & ACCESSIBLE
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
                  <Button asChild variant="outline" size="lg" className="font-medium" disabled={!shareUrl}>
                    <a href={shareUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Preview Public Page
                    </a>
                  </Button>
                  <Button 
                    onClick={handleSync} 
                    disabled={isPublishing || !shareUrl} 
                    variant="ghost" 
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {isPublishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                    Sync Data to Public Version
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-white/5 border-t border-border/50 p-6">
            <div className="flex gap-4 items-start">
              <Shield className="w-8 h-8 text-primary shrink-0 mt-1" />
              <div className="space-y-1">
                <p className="text-sm font-bold">Privacy Note</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Only the data you sync to the cloud is visible on your public page. Private documents are only accessible if they are specifically included in your public portfolio.
                </p>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
