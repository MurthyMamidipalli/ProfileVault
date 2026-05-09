
"use client";

import React, { useState, useEffect } from "react";
import { useProfileStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useFirestore, useAuth, useUser } from "@/firebase";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";
import { Share2, Globe, Copy, ExternalLink, Loader2, RefreshCw, CheckCircle2, Shield, AlertTriangle, LogIn, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { firebaseConfig } from "@/firebase/config";

export default function SharePage() {
  const { profile, setProfile, markSynced, _hasHydrated } = useProfileStore();
  const { toast } = useToast();
  const db = useFirestore();
  const auth = useAuth();
  const { user, loading: authLoading } = useUser();
  
  const [mounted, setMounted] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copying, setCopying] = useState(false);

  const isConfigMissing = !firebaseConfig.apiKey || firebaseConfig.apiKey === "PLACEHOLDER";

  useEffect(() => {
    setMounted(true);
    if (_hasHydrated && !profile.sharedId) {
      const newId = Math.random().toString(36).substring(2, 12);
      setProfile({ sharedId: newId });
    }
  }, [_hasHydrated, profile.sharedId, setProfile]);

  const handleSignIn = async () => {
    if (isConfigMissing) {
      toast({
        variant: "destructive",
        title: "Configuration Required",
        description: "Your Firebase project is still being provisioned."
      });
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast({ title: "Authenticated", description: "You can now sync your profile." });
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Sign In Failed", 
        description: error.message || "Could not authenticate with Google." 
      });
    }
  };

  const handleSync = () => {
    if (isConfigMissing) {
      toast({
        variant: "destructive",
        title: "Configuration Missing",
        description: "Firebase project is not fully configured yet."
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in with Google to sync your profile."
      });
      return;
    }

    if (!db) return;

    setIsSyncing(true);
    
    const currentId = profile.sharedId || Math.random().toString(36).substring(2, 12);
    if (!profile.sharedId) setProfile({ sharedId: currentId });

    const profileRef = doc(db, "shared-profiles", currentId);
    
    const syncData = {
      profileData: JSON.parse(JSON.stringify({
        ...profile,
        sharedId: currentId,
        ownerId: user.uid
      })),
      updatedAt: serverTimestamp(),
      createdAt: profile.lastSyncedAt ? undefined : serverTimestamp(),
    };

    // Non-blocking mutation as per guidelines
    setDoc(profileRef, syncData, { merge: true })
      .then(() => {
        markSynced();
        toast({
          title: "Profile Synced",
          description: "Your portfolio is now live and updated.",
        });
        setIsSyncing(false);
      })
      .catch(async (err: any) => {
        const permissionError = new FirestorePermissionError({
          path: profileRef.path,
          operation: 'write',
          requestResourceData: syncData
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
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
        <p className="text-muted-foreground">Host your professional vault in the cloud and share your unique portfolio link with the world.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {isConfigMissing && (
          <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Settings className="w-8 h-8 text-destructive animate-spin" />
              <div>
                <p className="font-bold text-foreground">System Setup in Progress</p>
                <p className="text-sm text-muted-foreground">We are provisioning your cloud infrastructure. This usually takes a moment.</p>
              </div>
            </div>
            <Button disabled className="opacity-50">Waiting for setup...</Button>
          </div>
        )}

        {!isConfigMissing && !user && (
          <div className="p-6 bg-primary/10 border border-primary/20 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Shield className="w-8 h-8 text-primary" />
              <div>
                <p className="font-bold text-foreground">Secure Synchronization</p>
                <p className="text-sm text-muted-foreground">Sign in to securely own and update your public portfolio link.</p>
              </div>
            </div>
            <Button onClick={handleSignIn} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
              <LogIn className="w-4 h-4 mr-2" />
              Sign in with Google
            </Button>
          </div>
        )}

        {user && !isSynced && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-500">Action Required</p>
              <p className="text-xs text-muted-foreground">Your profile is not yet live. Click sync to publish it.</p>
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
              Your professional identity address. Share this with recruiters.
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
                    <><CheckCircle2 className="w-4 h-4" /> LIVE</>
                  ) : (
                    <><RefreshCw className="w-4 h-4" /> AWAITING SYNC</>
                  )}
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 bg-background/50 border border-border p-4 rounded-lg font-mono text-sm truncate select-all text-foreground">
                  {shareUrl || "Generating ID..."}
                </div>
                <Button 
                  onClick={handleCopy} 
                  size="lg" 
                  variant="secondary" 
                  className="bg-accent/20 text-accent hover:bg-accent/30 font-bold shrink-0"
                  disabled={!shareUrl || isConfigMissing}
                >
                  {copying ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copying ? 'Copied' : 'Copy URL'}
                </Button>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild variant="outline" size="lg" className="font-medium" disabled={!isSynced || isConfigMissing}>
                  <a href={shareUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Preview
                  </a>
                </Button>
                <Button 
                  onClick={handleSync} 
                  disabled={isSyncing || !shareUrl || !user || isConfigMissing} 
                  variant={isSynced ? "ghost" : "default"}
                  className={cn(
                    !isSynced && "bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:bg-primary/90",
                    isSynced && "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isSyncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                  {isSynced ? 'Sync Changes' : 'Sync Profile Now'}
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-white/5 border-t border-border/50 p-6 text-xs text-muted-foreground">
            <Shield className="w-4 h-4 mr-2 inline" />
            Authenticated writes only. Public read access allowed for anyone with the unique link.
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
