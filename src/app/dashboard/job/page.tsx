
"use client";

import React, { useState, useEffect } from "react";
import { useProfileStore, CurrentJob } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, Calendar, Building2, Save, Loader2, Award, CheckCircle2, Globe, Laptop, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export default function JobPage() {
  const { profile, updateCurrentJob, _hasHydrated } = useProfileStore();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState<CurrentJob>({
    company: '',
    role: '',
    joiningDate: '',
    employmentType: 'Full-time',
    workSetting: 'Remote'
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
    
    updateCurrentJob(formData);
    
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

  const hasJobData = profile.currentJob?.company || profile.currentJob?.role;

  return (
    <div className="max-w-6xl space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-headline font-bold flex items-center gap-3">
          Job Management
          <Briefcase className="w-7 h-7 text-primary" />
        </h1>
        <p className="text-muted-foreground">Manage your current professional status and primary role.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Edit Job Details
              </CardTitle>
              <CardDescription>Enter information about your current position. These options help define your professional standing.</CardDescription>
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
                        value={formData.joiningDate}
                        onChange={e => setFormData({ ...formData, joiningDate: e.target.value })}
                        className="pl-10 bg-background/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Employment Type</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-3 w-4 h-4 text-muted-foreground z-10" />
                      <Select 
                        value={formData.employmentType} 
                        onValueChange={(value) => setFormData({ ...formData, employmentType: value })}
                      >
                        <SelectTrigger className="pl-10 bg-background/50">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Full-time">Full-time</SelectItem>
                          <SelectItem value="Part-time">Part-time</SelectItem>
                          <SelectItem value="Contract">Contract</SelectItem>
                          <SelectItem value="Freelance">Freelance</SelectItem>
                          <SelectItem value="Internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Work Setting</Label>
                    <div className="relative">
                      <Laptop className="absolute left-3 top-3 w-4 h-4 text-muted-foreground z-10" />
                      <Select 
                        value={formData.workSetting} 
                        onValueChange={(value) => setFormData({ ...formData, workSetting: value })}
                      >
                        <SelectTrigger className="pl-10 bg-background/50">
                          <SelectValue placeholder="Select setting" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Remote">Remote</SelectItem>
                          <SelectItem value="Hybrid">Hybrid</SelectItem>
                          <SelectItem value="On-site">On-site</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isSaving} className="min-w-[140px] font-bold">
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Job Info
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center gap-2 px-1">
            <Globe className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Live Preview</h3>
          </div>
          
          <Card className={cn(
            "glass-card border-dashed overflow-hidden transition-all duration-500",
            hasJobData ? "border-primary/50 opacity-100 scale-100" : "border-border/50 opacity-50 scale-95"
          )}>
            <div className="h-2 bg-primary/20 w-full" />
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold flex items-center justify-between">
                {profile.currentJob?.role || "Position Title"}
                {hasJobData && <CheckCircle2 className="w-5 h-5 text-accent animate-in zoom-in" />}
              </CardTitle>
              <CardDescription className="text-primary font-semibold flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                {profile.currentJob?.company || "Company Name"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 pt-1">
                {profile.currentJob?.employmentType && (
                  <div className="px-2 py-0.5 rounded-full bg-secondary text-[10px] font-bold uppercase tracking-wider border border-border">
                    {profile.currentJob.employmentType}
                  </div>
                )}
                {profile.currentJob?.workSetting && (
                  <div className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-wider border border-accent/20">
                    {profile.currentJob.workSetting}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Joined {profile.currentJob?.joiningDate ? new Date(profile.currentJob.joiningDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "Join Date"}</span>
              </div>
              
              <div className="pt-4 border-t border-border/50">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  Currently Active
                </div>
              </div>
            </CardContent>
          </Card>

          {!hasJobData && (
            <p className="text-xs text-center text-muted-foreground italic px-4">
              Enter and save your job details to see your professional status card.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
