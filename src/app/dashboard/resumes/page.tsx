
"use client";

import React, { useState } from "react";
import { useProfileStore, ResumeDocument } from "@/lib/store";
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
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Upload, 
  Link as LinkIcon,
  FileSearch,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ResumesPage() {
  const { profile, addResume, removeResume } = useProfileStore();
  const { toast } = useToast();
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  
  const [linkData, setLinkData] = useState({ name: '', url: '' });
  const [uploadData, setUploadData] = useState({ name: '' });

  const maxDocuments = 10;
  const currentCount = profile.resumes.length;
  const isLimitReached = currentCount >= maxDocuments;

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLimitReached) return;
    addResume({
      name: linkData.name,
      url: linkData.url,
      type: 'link'
    });
    setLinkData({ name: '', url: '' });
    setIsLinkDialogOpen(false);
    toast({ title: "Link Added", description: "Your resume link has been saved." });
  };

  const handleMockUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLimitReached) return;
    // Mocking an upload by creating a data URL or just a placeholder
    addResume({
      name: uploadData.name || "Resume_Upload.pdf",
      url: "#", 
      type: 'file'
    });
    setUploadData({ name: '' });
    setIsUploadDialogOpen(false);
    toast({ title: "Document Uploaded", description: "Resume document added to your vault." });
  };

  return (
    <div className="max-w-5xl space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-headline font-bold">Resumes & Documents</h1>
          <p className="text-muted-foreground">Store multiple versions of your CV or links to online resumes.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Storage Usage</p>
            <p className={cn(
              "text-sm font-bold",
              isLimitReached ? "text-destructive" : "text-primary"
            )}>
              {currentCount} / {maxDocuments} slots used
            </p>
          </div>

          <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={isLimitReached} className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                Add Link
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle>Add Resume Link</DialogTitle>
                <DialogDescription>Link to a Google Drive, Dropbox, or personal site resume.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddLink} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Label / Name</Label>
                  <Input 
                    required 
                    placeholder="e.g. Modern Web Dev CV" 
                    value={linkData.name}
                    onChange={e => setLinkData({...linkData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL</Label>
                  <Input 
                    required 
                    type="url"
                    placeholder="https://drive.google.com/..." 
                    value={linkData.url}
                    onChange={e => setLinkData({...linkData, url: e.target.value})}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit">Save Link</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={isLimitReached} className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Doc
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle>Upload Resume Document</DialogTitle>
                <DialogDescription>Select a PDF or Word document from your device.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleMockUpload} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Document Name</Label>
                  <Input 
                    required 
                    placeholder="e.g. Senior_Engineer_2024.pdf" 
                    value={uploadData.name}
                    onChange={e => setUploadData({...uploadData, name: e.target.value})}
                  />
                </div>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-white/5 cursor-pointer hover:bg-white/10 transition-smooth">
                   <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                   <p className="text-sm text-muted-foreground">Drag and drop or click to select file</p>
                   <p className="text-xs text-muted-foreground/50 mt-1">PDF, DOCX up to 5MB</p>
                </div>
                <DialogFooter>
                  <Button type="submit">Complete Upload</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLimitReached && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          <AlertCircle className="w-4 h-4" />
          You have reached the maximum limit of {maxDocuments} documents. Remove old files to add new ones.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profile.resumes.map((doc) => (
          <Card key={doc.id} className="glass-card group hover:border-primary/40 transition-smooth">
            <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                {doc.type === 'file' ? <FileText className="w-6 h-6" /> : <LinkIcon className="w-6 h-6" />}
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-smooth"
                onClick={() => removeResume(doc.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              <div>
                <h3 className="font-bold truncate" title={doc.name}>{doc.name}</h3>
                <p className="text-xs text-muted-foreground">Added on {doc.uploadDate}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild variant="secondary" size="sm" className="w-full text-xs bg-white/5 hover:bg-white/10">
                  <a href={doc.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3 h-3 mr-2" />
                    {doc.type === 'file' ? 'View Document' : 'Open Link'}
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {profile.resumes.length === 0 && (
          <div className="col-span-full py-24 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-border rounded-xl bg-white/5">
            <div className="p-4 bg-secondary rounded-full">
              <FileSearch className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold">No Resumes Found</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Upload your first CV or link your LinkedIn/Indeed resume to get started.
              </p>
            </div>
            <div className="flex gap-2">
               <Button variant="outline" onClick={() => setIsLinkDialogOpen(true)}>Add Link</Button>
               <Button onClick={() => setIsUploadDialogOpen(true)}>Upload File</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
