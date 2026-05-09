
"use client";

import React, { useState, useEffect } from "react";
import { useProfileStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseApp } from "@/firebase/provider";
import { Share2, Globe, Copy, ExternalLink, Loader2, RefreshCw, CheckCircle2, Shield } from "lucide-react";

export default function SharePage() {
  const { profile, setProfile, _hasHydrated } = useProfileStore();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const app = getFirebaseApp();
      const db = getFirestore(app);
      
      // Generate a permanent share ID if we don't have one
      const shareId = profile.sharedId || Math.random().toString(36).substring(2, 12);
      
      const profileRef = doc(db, "shared-profiles", shareId);
      
      await setDoc(profileRef, {
        profileData: profile,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp() // Simplified for now
      }, { merge: true });

      setProfile({ sharedId: shareId });
      
      toast({
        title: "Profile Published",
        description: "Your profile is now live and shareable.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Publication Failed",
        description: "Could not publish your profile at this time.",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/view/${profile.sharedId}` : '';

  const handleCopy = () => {
    setCopying(true);
    navigator.clipboard.writeText(shareUrl);
    toast({ title: "Link Copied", description: "URL copied to clipboard." });
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
        <p className="text-muted-foreground">Turn your professional data into a beautiful public landing page.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="glass-card border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 -mr-8 -mt-8 bg-primary/10 rounded-full blur-3xl" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-accent" />
              Web Hosting
            </CardTitle>
            <CardDescription>
              Publish your profile to a secure, permanent URL. Anyone with the link can view your credentials.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!profile.sharedId ? (
              <div className="p-8 text-center bg-white/5 rounded-xl border border-dashed border-border flex flex-col items-center gap-4">
                <div className="p-4 bg-secondary rounded-full">
                  <Globe className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-lg">Your profile isn't public yet</p>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Publish your identity to the cloud to start sharing your profile with recruiters and partners.
                  </p>
                </div>
                <Button onClick={handlePublish} disabled={isPublishing} size="lg" className="mt-2 font-bold px-8">
                  {isPublishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                  Publish My Profile
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-6 bg-accent/5 border border-accent/20 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-accent">Live URL</span>
                    <span className="flex items-center gap-1 text-xs text-green-400 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      Active & Secure
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 bg-background/50 border border-border p-3 rounded-md font-mono text-sm truncate select-all">
                      {shareUrl}
                    </div>
                    <Button onClick={handleCopy} variant="secondary" className="bg-accent/20 text-accent hover:bg-accent/30">
                      {copying ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                      Copy
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button asChild variant="outline">
                      <a href={shareUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Public Profile
                      </a>
                    </Button>
                    <Button onClick={handlePublish} disabled={isPublishing} variant="ghost" className="text-muted-foreground hover:text-foreground">
                      {isPublishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                      Update Public Version
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-white/5 border-t border-border/50 p-6">
            <div className="flex gap-4">
              <Shield className="w-8 h-8 text-primary shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-bold">Privacy & Security</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  When published, your profile data is stored securely in ProfileVault's global database. You can update the public version at any time by clicking "Update Public Version".
                </p>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
