
"use client";

import React, { useState, useEffect } from "react";
import { useProfileStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, Calendar, Building2, Save, Loader2, Award } from "lucide-react";

export default function JobPage() {
  const { profile, updateCurrentJob, _hasHydrated } = useProfileStore();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Local update is instant, we just add a small delay for feedback
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Employment Details Updated",
        description: "Your current job information has been saved.",
      });
    }, 500);
  };

  if (!mounted || !_hasHydrated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-headline font-bold flex items-center gap-3">
          Present Employment
          <Briefcase className="w-7 h-7 text-primary" />
        </h1>
        <p className="text-muted-foreground">Manage your current professional status and primary role.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Job Details</CardTitle>
              <CardDescription>Enter information about your current position.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="company" 
                        required
                        placeholder="e.g. Acme Corp" 
                        value={profile.currentJob.company}
                        onChange={e => updateCurrentJob({ company: e.target.value })}
                        className="pl-10 bg-background/50"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Your Role / Title</Label>
                    <div className="relative">
                      <Award className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="role" 
                        required
                        placeholder="e.g. Senior Software Engineer" 
                        value={profile.currentJob.role}
                        onChange={e => updateCurrentJob({ role: e.target.value })}
                        className="pl-10 bg-background/50"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="joiningDate">Joining Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="joiningDate" 
                        type="date"
                        required
                        value={profile.currentJob.joiningDate}
                        onChange={e => updateCurrentJob({ joiningDate: e.target.value })}
                        className="pl-10 bg-background/50"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isSaving} className="min-w-[140px]">
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Details
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glass-card bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Summary Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-background/40 border border-white/5 space-y-2">
                <p className="text-xs text-muted-foreground font-medium uppercase">Current Status</p>
                <div className="space-y-1">
                  <p className="font-bold text-foreground">{profile.currentJob.role || "N/A"}</p>
                  <p className="text-sm text-primary font-medium">{profile.currentJob.company || "N/A"}</p>
                </div>
                <div className="pt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>Joined {profile.currentJob.joiningDate ? new Date(profile.currentJob.joiningDate).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground italic leading-relaxed">
                This information is highlighted on your public portfolio to show recruiters your current engagement.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
