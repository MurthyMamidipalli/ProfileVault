
"use client";

import React, { useState, useEffect } from "react";
import { useProfileStore, ExperienceEntry, ProjectLink } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Briefcase, 
  Plus, 
  Trash2, 
  Calendar, 
  Pencil, 
  MapPin, 
  Loader2, 
  Github, 
  ExternalLink,
  Link as LinkIcon
} from "lucide-react";

export default function ExperiencePage() {
  const { profile, addExperience, removeExperience, updateExperience } = useProfileStore();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<ExperienceEntry, 'id'>>({
    company: '',
    title: '',
    location: '',
    startDate: '',
    endDate: '',
    description: '',
    projectLinks: []
  });

  const [newLink, setNewLink] = useState({ name: '', url: '' });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpen = (entry?: ExperienceEntry) => {
    if (entry) {
      setEditingId(entry.id);
      setFormData({
        company: entry.company,
        title: entry.title,
        location: entry.location || '',
        startDate: entry.startDate,
        endDate: entry.endDate || '',
        description: entry.description || '',
        projectLinks: entry.projectLinks || []
      });
    } else {
      setEditingId(null);
      setFormData({
        company: '',
        title: '',
        location: '',
        startDate: '',
        endDate: '',
        description: '',
        projectLinks: []
      });
    }
    setIsOpen(true);
  };

  const handleAddProjectLink = () => {
    if (!newLink.name || !newLink.url) return;
    const link: ProjectLink = {
      id: Math.random().toString(36).substring(2, 9),
      name: newLink.name,
      url: newLink.url
    };
    setFormData({
      ...formData,
      projectLinks: [...(formData.projectLinks || []), link]
    });
    setNewLink({ name: '', url: '' });
  };

  const handleRemoveProjectLink = (linkId: string) => {
    setFormData({
      ...formData,
      projectLinks: (formData.projectLinks || []).filter(l => l.id !== linkId)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateExperience(editingId, formData);
      toast({ title: "Updated", description: "Experience record updated." });
    } else {
      addExperience(formData);
      toast({ title: "Added", description: "New work experience added." });
    }
    setIsOpen(false);
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const experienceList = profile.experience || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-headline font-bold">Experience</h1>
          <p className="text-muted-foreground">Document your professional career and showcase your projects.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpen()} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Experience
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] glass-card max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit' : 'Add'} Work Experience</DialogTitle>
              <DialogDescription>Enter the details of your role and add links to projects you worked on.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input 
                    required 
                    placeholder="e.g. Acme Corp" 
                    value={formData.company}
                    onChange={e => setFormData({...formData, company: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Job Title</Label>
                  <Input 
                    required 
                    placeholder="e.g. Senior Software Engineer" 
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Location (Optional)</Label>
                  <Input 
                    placeholder="e.g. Remote / New York, NY" 
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input 
                    required 
                    type="date" 
                    value={formData.startDate}
                    onChange={e => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date (Optional)</Label>
                  <Input 
                    type="date" 
                    value={formData.endDate}
                    onChange={e => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Responsibilities & Achievements</Label>
                  <Textarea 
                    placeholder="List your key contributions and impact..." 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="resize-none h-32"
                  />
                </div>

                <div className="col-span-2 space-y-4 pt-4 border-t border-border/50">
                  <Label className="text-base font-bold">Project Links</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Project Name</Label>
                      <Input 
                        placeholder="e.g. GitHub Repo / Demo" 
                        value={newLink.name}
                        onChange={e => setNewLink({...newLink, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Project URL</Label>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="https://..." 
                          value={newLink.url}
                          onChange={e => setNewLink({...newLink, url: e.target.value})}
                        />
                        <Button type="button" size="icon" variant="secondary" onClick={handleAddProjectLink}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {(formData.projectLinks || []).map((link) => (
                      <div key={link.id} className="flex items-center justify-between p-2 rounded-md bg-white/5 border border-border/30">
                        <div className="flex items-center gap-3">
                          <LinkIcon className="w-4 h-4 text-primary" />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{link.name}</span>
                            <span className="text-xs text-muted-foreground truncate max-w-[200px]">{link.url}</span>
                          </div>
                        </div>
                        <Button size="icon" variant="ghost" type="button" className="h-8 w-8 text-destructive" onClick={() => handleRemoveProjectLink(link.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit">{editingId ? 'Save Changes' : 'Add Record'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {experienceList.map((exp) => (
          <Card key={exp.id} className="glass-card overflow-hidden group hover:border-accent/50 transition-smooth">
            <div className="flex flex-col">
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-foreground">{exp.title}</h3>
                    <div className="flex items-center gap-2 text-primary font-medium">
                      <span>{exp.company}</span>
                      {exp.location && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <span className="flex items-center gap-1 text-muted-foreground text-sm">
                            <MapPin className="w-3 h-3" />
                            {exp.location}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-smooth">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={() => handleOpen(exp)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => removeExperience(exp.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white/5 w-fit px-3 py-1 rounded-full border border-white/5">
                  <Calendar className="w-4 h-4" />
                  <span>{exp.startDate} — {exp.endDate || 'Present'}</span>
                </div>
                {exp.description && (
                  <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {exp.description}
                  </div>
                )}
                
                {exp.projectLinks && exp.projectLinks.length > 0 && (
                  <div className="pt-4 border-t border-border/50">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Project Links</p>
                    <div className="flex flex-wrap gap-3">
                      {exp.projectLinks.map((link) => (
                        <Button key={link.id} variant="outline" size="sm" asChild className="bg-white/5 hover:bg-white/10 h-8">
                          <a href={link.url} target="_blank" rel="noopener noreferrer">
                            {link.name.toLowerCase().includes('github') ? (
                              <Github className="w-3.5 h-3.5 mr-2" />
                            ) : (
                              <ExternalLink className="w-3.5 h-3.5 mr-2" />
                            )}
                            {link.name}
                          </a>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
        {experienceList.length === 0 && (
          <div className="py-20 text-center border-2 border-dashed border-border rounded-xl bg-white/5">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-secondary rounded-full">
                <Briefcase className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-semibold">No Professional History</p>
              <Button onClick={() => handleOpen()} variant="outline">
                Add Your Experience
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
