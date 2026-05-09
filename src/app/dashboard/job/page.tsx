
"use client";

import React, { useState, useEffect } from "react";
import { useProfileStore, CurrentJob } from "@/lib/store";
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
  
  // Local state for the form so it doesn't update the store instantly
  const [formData, setFormData] = useState<CurrentJob>({
    company: '',
    role: '',
    joiningDate: ''
  });

  useEffect(() => {
    setMounted(true);
    if (_hasHydrated && profile.currentJob) {
      setFormData(profile.currentJob);
    }
  }, [_hasHydrated, profile.currentJob]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Update the global store
    updateCurrentJob(formData);
    
    // Feedback delay
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Job Details Updated",
        description: "Your job information has been saved successfully.",
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
          Job
          <Briefcase className="w-7 h-7 text-primary" />
        </h1>
        <p className="text-muted-foreground">Manage your current professional status and primary role.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Job Details</CardTitle>
            <CardDescription>Enter information about your current position. This will be displayed on your public portfolio.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="company" 
                      required
                      placeholder="e.g. Acme Corp" 
                      value={formData.company}
                      onChange={e => setFormData({ ...formData, company: e.target.value })}
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
                      value={formData.role}
                      onChange={e => setFormData({ ...formData, role: e.target.value })}
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
                      value={formData.joiningDate}
                      onChange={e => setFormData({ ...formData, joiningDate: e.target.value })}
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
    </div>
  );
}
