
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useProfileStore, ProjectEntry } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { useToast } from "@/hooks/use-toast";
import { 
  FolderCode, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Pencil, 
  Loader2, 
  Upload, 
  Image as ImageIcon,
  Calendar,
  X
} from "lucide-react";
import Image from "next/image";

export default function ProjectsPage() {
  const { profile, addProject, updateProject, removeProject, _hasHydrated } = useProfileStore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState<Omit<ProjectEntry, 'id'>>({
    title: '',
    description: '',
    url: '',
    imageUrl: '',
    date: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpen = (entry?: ProjectEntry) => {
    if (entry) {
      setEditingId(entry.id);
      setFormData({
        title: entry.title,
        description: entry.description,
        url: entry.url || '',
        imageUrl: entry.imageUrl || '',
        date: entry.date || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        url: '',
        imageUrl: '',
        date: ''
      });
    }
    setIsOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ 
          variant: "destructive", 
          title: "Invalid File Type", 
          description: "Please upload an image file." 
        });
        return;
      }
      
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({ ...formData, imageUrl: event.target?.result as string });
        setIsUploading(false);
      };
      reader.onerror = () => {
        toast({ variant: "destructive", title: "Error", description: "Could not read image file." });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateProject(editingId, formData);
      toast({ title: "Updated", description: "Project updated successfully." });
    } else {
      addProject(formData);
      toast({ title: "Added", description: "New project added to your vault." });
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

  const projects = profile.projects || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-headline font-bold">Projects</h1>
          <p className="text-muted-foreground">Showcase your best work, side projects, and open-source contributions.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpen()} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] glass-card max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit' : 'Add'} Project</DialogTitle>
              <DialogDescription>Provide details about your project and optionally upload a cover image.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>Project Title</Label>
                  <Input 
                    required 
                    placeholder="e.g. ProfileVault Dashboard" 
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Project Date (Optional)</Label>
                    <Input 
                      type="date"
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Project URL (Optional)</Label>
                    <Input 
                      type="url"
                      placeholder="https://github.com/..." 
                      value={formData.url}
                      onChange={e => setFormData({...formData, url: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    required
                    placeholder="Describe what you built, the technologies used, and your impact..." 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="resize-none h-32"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Cover Image (Optional)</Label>
                  <div className="flex flex-col gap-4">
                    {formData.imageUrl ? (
                      <div className="relative w-full h-40 rounded-lg overflow-hidden border border-border">
                        <Image 
                          src={formData.imageUrl} 
                          alt="Project Preview" 
                          fill 
                          className="object-cover" 
                        />
                        <Button 
                          type="button" 
                          size="icon" 
                          variant="destructive" 
                          className="absolute top-2 right-2 h-8 w-8"
                          onClick={() => setFormData({...formData, imageUrl: ''})}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-white/5 cursor-pointer hover:bg-white/10 transition-smooth"
                      >
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleFileChange} 
                          className="hidden" 
                          accept="image/*"
                        />
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm font-medium">Click to upload project cover image</p>
                        <p className="text-xs text-muted-foreground/50 mt-1">PNG, JPG, or WEBP supported.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {editingId ? 'Save Changes' : 'Add Project'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => (
          <Card key={proj.id} className="glass-card overflow-hidden group flex flex-col hover:border-accent/40 transition-smooth">
            {proj.imageUrl && (
              <div className="relative h-48 w-full border-b border-border">
                <Image 
                  src={proj.imageUrl} 
                  alt={proj.title} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-smooth" 
                />
              </div>
            )}
            <CardHeader className="p-5 pb-2">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold line-clamp-1">{proj.title}</CardTitle>
                  {proj.date && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(proj.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-smooth">
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={() => handleOpen(proj)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => removeProject(proj.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-2 flex-1 flex flex-col justify-between space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                {proj.description}
              </p>
              
              {proj.url && (
                <Button asChild variant="secondary" size="sm" className="w-full bg-white/5 hover:bg-white/10 mt-auto">
                  <a href={proj.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3.5 h-3.5 mr-2" />
                    View Live Project
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}

        {projects.length === 0 && (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-border rounded-xl bg-white/5">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-secondary rounded-full">
                <FolderCode className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-semibold">No Projects Found</p>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Start showcasing your work by adding your first project entry.
                </p>
              </div>
              <Button onClick={() => handleOpen()} variant="outline" className="mt-2">
                Add Project Now
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
