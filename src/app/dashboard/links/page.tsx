
"use client";

import React, { useState } from "react";
import { useProfileStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  Link as LinkIcon, 
  Plus, 
  Trash2, 
  Globe, 
  Github, 
  Twitter, 
  Linkedin, 
  ExternalLink,
  Code
} from "lucide-react";

const PLATFORM_ICONS: Record<string, any> = {
  Github: Github,
  Twitter: Twitter,
  LinkedIn: Linkedin,
  Portfolio: Code,
  Default: LinkIcon
};

export default function LinksPage() {
  const { profile, addPortfolioLink, removePortfolioLink } = useProfileStore();
  const { toast } = useToast();
  const [platform, setPlatform] = useState('');
  const [url, setUrl] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!platform || !url) return;
    addPortfolioLink({ platform, url });
    setPlatform('');
    setUrl('');
    toast({ title: "Link Added", description: `Saved your ${platform} link.` });
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-headline font-bold">Portfolio & Social Links</h1>
        <p className="text-muted-foreground">Centralize your online presence and professional portfolios.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="glass-card self-start">
          <CardHeader>
            <CardTitle className="text-lg">Add New Link</CardTitle>
            <CardDescription>Share your projects, social profiles, or blog.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platform">Platform / Label</Label>
                <Input 
                  id="platform" 
                  placeholder="e.g. GitHub, LinkedIn, Personal Blog" 
                  value={platform}
                  onChange={e => setPlatform(e.target.value)}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input 
                  id="url" 
                  placeholder="https://..." 
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  className="bg-background/50"
                />
              </div>
              <Button type="submit" className="w-full flex items-center gap-2" disabled={!platform || !url}>
                <Plus className="w-4 h-4" />
                Add Link
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="font-headline font-semibold flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-primary" />
            Active Links ({profile.portfolioLinks.length})
          </h3>
          <div className="space-y-3">
            {profile.portfolioLinks.map((link) => {
              const Icon = PLATFORM_ICONS[link.platform] || PLATFORM_ICONS.Default;
              return (
                <Card key={link.id} className="glass-card hover:border-primary/30 transition-smooth group">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 rounded-lg bg-white/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-smooth">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="max-w-[150px] sm:max-w-none">
                        <p className="font-semibold text-sm">{link.platform}</p>
                        <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button asChild size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-accent">
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-smooth" onClick={() => removePortfolioLink(link.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {profile.portfolioLinks.length === 0 && (
              <div className="py-12 text-center bg-white/5 border border-dashed border-border rounded-xl">
                <p className="text-sm text-muted-foreground">No links added yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
