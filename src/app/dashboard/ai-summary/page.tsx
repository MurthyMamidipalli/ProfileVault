
"use client";

import React, { useState, useEffect } from "react";
import { useProfileStore } from "@/lib/store";
import { generateProfessionalSummary } from "@/ai/flows/generate-professional-summary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2, Copy, RefreshCw, CheckCircle2 } from "lucide-react";

export default function AISummaryPage() {
  const { profile, setProfile, _hasHydrated } = useProfileStore();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState('');

  useEffect(() => {
    setMounted(true);
    if (_hasHydrated) {
      setGeneratedSummary(profile.bio || '');
    }
  }, [_hasHydrated, profile.bio]);

  const handleGenerate = async () => {
    if (profile.education.length === 0 && profile.experience.length === 0 && (profile.projects || []).length === 0) {
      toast({
        variant: "destructive",
        title: "Incomplete Profile",
        description: "Please add some education, experience, or projects first so the AI can summarize them."
      });
      return;
    }

    setLoading(true);
    try {
      const result = await generateProfessionalSummary({
        education: profile.education.map(e => ({
          institution: e.institution,
          degree: e.degree,
          fieldOfStudy: e.fieldOfStudy,
          startDate: e.startDate,
          endDate: e.endDate,
          description: e.description
        })),
        experience: profile.experience.map(e => ({
          company: e.company,
          title: e.title,
          location: e.location,
          startDate: e.startDate,
          endDate: e.endDate,
          description: e.description
        })),
        projects: (profile.projects || []).map(p => ({
          title: p.title,
          description: p.description,
          url: p.url
        }))
      });
      setGeneratedSummary(result.summary);
      toast({ title: "Summary Generated", description: "AI has drafted a new bio for you." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Generation Failed", description: "Could not generate summary at this time." });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    setProfile({ bio: generatedSummary });
    toast({ title: "Applied to Profile", description: "Your profile bio has been updated." });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedSummary);
    toast({ title: "Copied", description: "Copied to clipboard." });
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
          AI Profile Summary
          <div className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-bold border border-accent/20">BETA</div>
        </h1>
        <p className="text-muted-foreground">Leverage advanced AI to create a compelling professional story based on your data.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="glass-card border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 -mr-8 -mt-8 bg-primary/10 rounded-full blur-3xl" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent animate-pulse" />
              Generator
            </CardTitle>
            <CardDescription>
              Our AI will analyze your {profile.education.length} education, {profile.experience.length} experience, and {(profile.projects || []).length} project entries to craft the perfect bio.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative">
              <Textarea 
                value={generatedSummary}
                onChange={e => setGeneratedSummary(e.target.value)}
                placeholder="Click generate to let AI write your summary..."
                className="min-h-[250px] bg-background/50 resize-none font-body leading-relaxed p-6 text-lg"
              />
              {loading && (
                <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center rounded-md">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm font-medium animate-pulse">Analyzing profile data...</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={handleGenerate} disabled={loading} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
                {generatedSummary ? <RefreshCw className="w-4 h-4 mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                {generatedSummary ? 'Regenerate Summary' : 'Generate Summary'}
              </Button>
              {generatedSummary && (
                <>
                  <Button variant="outline" onClick={handleCopy}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Text
                  </Button>
                  <Button variant="secondary" onClick={handleApply} className="bg-accent/20 text-accent hover:bg-accent/30">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Apply to Profile
                  </Button>
                </>
              )}
            </div>
          </CardContent>
          <CardFooter className="bg-white/5 border-t border-border/50 p-4">
            <p className="text-xs text-muted-foreground italic">
              Tip: The more detailed your experience and project descriptions are, the better the AI can summarize your unique skills.
            </p>
          </CardFooter>
        </Card>

        {generatedSummary && (
          <Card className="glass-card bg-accent/5 border-accent/20">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-widest text-accent font-bold">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-6 bg-background/40 rounded-lg border border-white/5">
                <p className="italic text-muted-foreground leading-relaxed">
                  {generatedSummary}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
