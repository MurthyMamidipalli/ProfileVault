
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useProfileStore, ProjectEntry } from "@/lib/store";
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
  FolderCode, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Pencil, 
  Loader2, 
  Image as ImageIcon,
  Calendar,
  FileText,
  Paperclip
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useUser, useFirestore } from "@/firebase";
import { addProject, updateProject, deleteProject } from "@/firebase/services";

export default function ProjectsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { profile } = useProfileStore();
  const { toast } = useToast();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState<Omit<ProjectEntry, 'id'>>({
    title: '',
    description: '',
    url: '',
    imageUrl: '',
    documentUrl: '',
    documentName: '',
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
        documentUrl: entry.documentUrl || '',
        documentName: entry.documentName || '',
        date: entry.date || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        url: '',
        imageUrl: '',
        documentUrl: '',
        documentName: '',
        date: ''
      });
    }
    setIsOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ variant: "destructive", title: "Invalid File", description: "Please upload an image." });
        return;
      }
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({ ...formData, imageUrl: event.target?.result as string });
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({ variant: "destructive", title: "Invalid File", description: "Please upload a PDF document." });
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast({ variant: "destructive", title: "File too large", description: "PDF must be under 2MB for storage limits." });
        return;
      }
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({ 
          ...formData, 
          documentUrl: event.target?.result as string,
          documentName: file.name
        });
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db) return;
    setIsProcessing(true);
    try {
      if (editingId) {
        await updateProject(db, user.uid, editingId, formData);
        toast({ title: "Updated", description: "Project updated successfully." });
      } else {
        await addProject(db, user.uid, formData);
        toast({ title: "Added", description: "New project added to your vault." });
      }
      setIsOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Save Failed", description: "Could not persist changes." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user || !db) return;
    try {
      await deleteProject(db, user.uid, id);
      toast({ title: "Deleted", description: "Project removed." });
    } catch (error) {
      toast({ variant: "destructive", title: "Delete Failed", description: "Could not remove project." });
    }
  };

  if (!mounted) {
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
          <DialogContent className="sm:max-w-[650px] glass-card max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit' : 'Add'} Project</DialogTitle>
              <DialogDescription>Provide details about your project, upload a cover image, or attach a PDF document.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-6 pt-4">
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
                    <Label>Live URL (Optional)</Label>
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
                    placeholder="Describe what you built and the impact it had..." 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="resize-none h-24"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Cover Image</Label>
                    <div 
                      onClick={() => imageInputRef.current?.click()}
                      className={cn(
                        "relative border-2 border-dashed border-border rounded-lg h-32 flex flex-col items-center justify-center bg-white/5 cursor-pointer hover:bg-white/10 transition-smooth overflow-hidden",
                        formData.imageUrl && "border-primary/50"
                      )}
                    >
                      <input type="file" ref={imageInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                      {formData.imageUrl ? (
                        <Image src={formData.imageUrl} alt="Preview" fill className="object-cover opacity-50" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-muted-foreground mb-1" />
                      )}
                      <span className="text-xs font-medium z-10">{formData.imageUrl ? "Change Image" : "Upload Image"}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Project Document (PDF)</Label>
                    <div 
                      onClick={() => docInputRef.current?.click()}
                      className={cn(
                        "border-2 border-dashed border-border rounded-lg h-32 flex flex-col items-center justify-center bg-white/5 cursor-pointer hover:bg-white/10 transition-smooth",
                        formData.documentUrl && "border-accent/50 bg-accent/5"
                      )}
                    >
                      <input type="file" ref={docInputRef} onChange={handleDocChange} className="hidden" accept=".pdf" />
                      {formData.documentUrl ? (
                        <>
                          <FileText className="w-6 h-6 text-accent mb-1" />
                          <span className="text-[10px] text-accent font-bold truncate max-w-[120px]">{formData.documentName}</span>
                        </>
                      ) : (
                        <Paperclip className="w-6 h-6 text-muted-foreground mb-1" />
                      )}
                      <span className="text-xs font-medium">{formData.documentUrl ? "Change PDF" : "Attach PDF"}</span>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isProcessing}>
                  {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
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
            <div className="relative h-48 w-full border-b border-border bg-muted/20">
              {proj.imageUrl ? (
                <Image 
                  src={proj.imageUrl} 
                  alt={proj.title} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-smooth" 
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <FolderCode className="w-12 h-12 text-muted-foreground/30" />
                </div>
              )}
            </div>
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
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(proj.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-2 flex-1 flex flex-col justify-between space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                {proj.description}
              </p>
              
              <div className="space-y-2 mt-auto">
                {proj.url && (
                  <Button asChild variant="secondary" size="sm" className="w-full bg-white/5 hover:bg-white/10">
                    <a href={proj.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3.5 h-3.5 mr-2" />
                      View Live Project
                    </a>
                  </Button>
                )}
                {proj.documentUrl && (
                  <Button asChild variant="outline" size="sm" className="w-full border-accent/20 text-accent hover:bg-accent/5">
                    <a href={proj.documentUrl} target="_blank" rel="noopener noreferrer">
                      <FileText className="w-3.5 h-3.5 mr-2" />
                      View Project PDF
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {projects.length === 0 && (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-border rounded-xl bg-white/5">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-secondary rounded-full">
                <FolderCode className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-semibold">No Projects Found</p>
              <Button onClick={() => handleOpen()} variant="outline">Add Project Now</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
