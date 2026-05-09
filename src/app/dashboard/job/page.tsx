
"use client";

import React, { useState, useEffect } from "react";
import { useProfileStore, JobEntry } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Briefcase, 
  Calendar, 
  Building2, 
  Plus, 
  Loader2, 
  Award, 
  Globe, 
  Laptop, 
  Users, 
  Trash2, 
  Pencil,
  Clock,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function JobPage() {
  const { profile, addJob, updateJob, removeJob, _hasHydrated } = useProfileStore();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<JobEntry, 'id'>>({
    company: '',
    role: '',
    joiningDate: '',
    endDate: '',
    employmentType: 'Full-time',
    workSetting: 'Remote'
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpen = (job?: JobEntry) => {
    if (job) {
      setEditingId(job.id);
      setFormData({
        company: job.company,
        role: job.role,
        joiningDate: job.joiningDate,
        endDate: job.endDate || '',
        employmentType: job.employmentType || 'Full-time',
        workSetting: job.workSetting || 'Remote'
      });
    } else {
      setEditingId(null);
      setFormData({
        company: '',
        role: '',
        joiningDate: '',
        endDate: '',
        employmentType: 'Full-time',
        workSetting: 'Remote'
      });
    }
    setIsOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateJob(editingId, formData);
      toast({ title: "Job Updated", description: "The job details have been saved." });
    } else {
      addJob(formData);
      toast({ title: "Job Added", description: "A new job role has been added to your profile." });
    }
    setIsOpen(false);
  };

  if (!mounted || !_hasHydrated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const jobs = profile.jobs || [];

  return (
    <div className="max-w-6xl space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-headline font-bold flex items-center gap-3">
            Jobs
            <Briefcase className="w-7 h-7 text-primary" />
          </h1>
          <p className="text-muted-foreground">Manage your current and past professional roles.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpen()} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Job Role
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] glass-card">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit' : 'Add'} Job Role</DialogTitle>
              <DialogDescription>Enter details about your professional position.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-6 pt-4">
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
                  <Label htmlFor="endDate">End Date (Optional / Last Date)</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="endDate" 
                      type="date"
                      value={formData.endDate}
                      onChange={e => setFormData({ ...formData, endDate: e.target.value })}
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
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit">
                  {editingId ? 'Update Job' : 'Add Job'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <Card key={job.id} className="glass-card group overflow-hidden hover:border-primary/50 transition-smooth">
            <div className="h-2 bg-primary/20 w-full" />
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-xl font-bold line-clamp-1">
                  {job.role || "Untitled Role"}
                </CardTitle>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-smooth">
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={() => handleOpen(job)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => removeJob(job.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardDescription className="text-primary font-semibold flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                {job.company || "Unknown Company"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 pt-1">
                {job.employmentType && (
                  <div className="px-2 py-0.5 rounded-full bg-secondary text-[10px] font-bold uppercase tracking-wider border border-border">
                    {job.employmentType}
                  </div>
                )}
                {job.workSetting && (
                  <div className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-wider border border-accent/20">
                    {job.workSetting}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white/5 p-2 rounded-lg border border-border/50">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {job.joiningDate ? new Date(job.joiningDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : "Join"} — {job.endDate ? new Date(job.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : "Present"}
                </span>
              </div>
              
              <div className="pt-4 border-t border-border/50">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                  <div className={cn("w-2 h-2 rounded-full", job.endDate ? "bg-muted-foreground/30" : "bg-accent animate-pulse")} />
                  {job.endDate ? "Concluded" : "Currently Active"}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {jobs.length === 0 && (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-border rounded-xl bg-white/5 flex flex-col items-center gap-4">
            <div className="p-4 bg-secondary rounded-full">
              <Briefcase className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-lg font-semibold">No Job Roles Added</p>
              <p className="text-sm text-muted-foreground">Add your professional roles to display them on your profile.</p>
            </div>
            <Button onClick={() => handleOpen()} variant="outline" className="mt-2">
              Add Your First Job
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
