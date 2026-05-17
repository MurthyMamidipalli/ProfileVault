
"use client";

import React, { useState, useRef, useEffect } from "react";
import { useProfileStore, ResumeDocument } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Upload, 
  Link as LinkIcon,
  FileSearch,
  Loader2,
  ScrollText,
  FolderOpen,
  Trash2,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser, useFirestore } from "@/firebase";
import { addResume, deleteResume, addCoverLetter, deleteCoverLetter } from "@/firebase/services";

export default function DocumentsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { profile } = useProfileStore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [mounted, setMounted] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("resumes");
  
  const [linkData, setLinkData] = useState({ name: '', url: '' });
  const [uploadData, setUploadData] = useState({ name: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const resumesList = profile?.resumes || [];
  const coverLettersList = profile?.coverLetters || [];

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db || !linkData.name || !linkData.url) return;
    setIsProcessing(true);

    try {
      const payload = {
        name: linkData.name,
        url: linkData.url,
        type: 'link' as const
      };

      if (activeTab === "resumes") {
        await addResume(db, user.uid, payload);
      } else {
        await addCoverLetter(db, user.uid, payload);
      }

      setLinkData({ name: '', url: '' });
      setIsLinkDialogOpen(false);
      toast({ title: "Link Saved", description: "Document added to your secure vault." });
    } catch (error) {
      toast({ variant: "destructive", title: "Save Failed", description: "Could not add document link." });
    } finally {
      setIsProcessing(true);
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({ variant: "destructive", title: "Invalid File", description: "Please upload a PDF document." });
        return;
      }
      setSelectedFile(file);
      if (!uploadData.name) {
        setUploadData({ name: file.name });
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db || !selectedFile) return;

    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const payload = {
          name: uploadData.name || selectedFile.name,
          url: event.target?.result as string,
          type: 'file' as const
        };

        if (activeTab === "resumes") {
          await addResume(db, user.uid, payload);
        } else {
          await addCoverLetter(db, user.uid, payload);
        }

        toast({ title: "Upload Success", description: `${selectedFile.name} stored safely.` });
        setIsUploadDialogOpen(false);
        setUploadData({ name: '' });
        setSelectedFile(null);
      } catch (error) {
        toast({ variant: "destructive", title: "Upload Failed", description: "Error storing file in vault." });
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      toast({ variant: "destructive", title: "Upload Failed", description: "Error reading file." });
      setIsProcessing(false);
    };

    reader.readAsDataURL(selectedFile);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = async (id: string) => {
    if (!user || !db) return;
    try {
      if (activeTab === "resumes") {
        await deleteResume(db, user.uid, id);
      } else {
        await deleteCoverLetter(db, user.uid, id);
      }
      toast({ title: "Removed", description: "Document deleted from cloud." });
    } catch (error) {
      toast({ variant: "destructive", title: "Delete Failed", description: "Could not remove document." });
    }
  };

  return (
    <div className="max-w-6xl space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-headline font-bold flex items-center gap-3">
            Documents
            <FolderOpen className="w-7 h-7 text-primary" />
          </h1>
          <p className="text-muted-foreground">Manage your professional CVs and targeted cover letters in secure cloud folders.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                Add Link
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle>Add {activeTab === 'resumes' ? 'Resume' : 'Cover Letter'} Link</DialogTitle>
                <DialogDescription>Link to an externally hosted document (e.g., Google Drive, Personal Site).</DialogDescription>
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
                  <Button type="submit" disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Save Link'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload PDF
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle>Upload {activeTab === 'resumes' ? 'Resume' : 'Cover Letter'} PDF</DialogTitle>
                <DialogDescription>Your file will be base64 encoded and stored in your cloud vault.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUploadSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Document Name</Label>
                  <Input 
                    required 
                    placeholder="e.g. Senior_Engineer_2024.pdf" 
                    value={uploadData.name}
                    onChange={e => setUploadData({...uploadData, name: e.target.value})}
                  />
                </div>
                <div 
                  onClick={triggerFileSelect}
                  className={cn(
                    "border-2 border-dashed border-border rounded-lg p-8 text-center bg-white/5 cursor-pointer hover:bg-white/10 transition-smooth",
                    selectedFile && "border-primary/50 bg-primary/5"
                  )}
                >
                   <input 
                     type="file" 
                     ref={fileInputRef} 
                     onChange={handleFileChange} 
                     className="hidden" 
                     accept=".pdf"
                   />
                   {selectedFile ? (
                     <FileText className="w-8 h-8 mx-auto text-primary mb-2" />
                   ) : (
                     <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                   )}
                   <p className="text-sm font-medium">{selectedFile ? selectedFile.name : "Select PDF"}</p>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={!selectedFile || isProcessing}>
                    {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Store in Vault'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="resumes" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-[400px] h-12 bg-white/5 border border-white/5 p-1 rounded-xl">
          <TabsTrigger value="resumes" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold flex items-center gap-2 transition-all">
            <FileText className="w-4 h-4" />
            Resumes
          </TabsTrigger>
          <TabsTrigger value="cover_letters" className="rounded-lg data-[state=active]:bg-accent data-[state=active]:text-accent-foreground font-bold flex items-center gap-2 transition-all">
            <ScrollText className="w-4 h-4" />
            Cover Letters
          </TabsTrigger>
        </TabsList>

        <div className="pt-8">
          <TabsContent value="resumes" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resumesList.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} onRemove={() => handleRemove(doc.id)} />
              ))}
              {resumesList.length === 0 && <EmptyState type="resumes" />}
            </div>
          </TabsContent>

          <TabsContent value="cover_letters" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coverLettersList.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} onRemove={() => handleRemove(doc.id)} isAccent />
              ))}
              {coverLettersList.length === 0 && <EmptyState type="cover letters" />}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function DocumentCard({ doc, onRemove, isAccent = false }: { doc: ResumeDocument, onRemove: () => void, isAccent?: boolean }) {
  return (
    <Card className={cn(
      "glass-card group hover:border-primary/40 transition-smooth overflow-hidden",
      isAccent && "hover:border-accent/40"
    )}>
      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
        <div className={cn(
          "p-2.5 rounded-xl bg-primary/10 text-primary",
          isAccent && "bg-accent/10 text-accent"
        )}>
          {doc.type === 'file' ? <FileText className="w-6 h-6" /> : <LinkIcon className="w-6 h-6" />}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-smooth"
          onClick={onRemove}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-4">
        <div className="space-y-1">
          <h3 className="font-bold truncate" title={doc.name}>{doc.name}</h3>
          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Added {doc.uploadDate}</p>
        </div>
        <Button asChild variant="secondary" size="sm" className="w-full text-xs bg-white/5 hover:bg-white/10 font-bold">
          <a href={doc.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-3 h-3 mr-2" />
            {doc.type === 'file' ? 'View PDF' : 'Open Link'}
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

function EmptyState({ type }: { type: string }) {
  return (
    <div className="col-span-full py-24 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-border rounded-xl bg-white/5">
      <div className="p-4 bg-secondary rounded-full">
        <FileSearch className="w-8 h-8 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="text-lg font-semibold">No {type} found</p>
        <p className="text-sm text-muted-foreground">Upload your first {type.slice(0, -1)} to your secure vault.</p>
      </div>
    </div>
  );
}
