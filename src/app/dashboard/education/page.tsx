
"use client";

import React, { useState, useEffect } from "react";
import { useProfileStore, EducationEntry } from "@/lib/store";
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
import { GraduationCap, Plus, Trash2, Calendar, Pencil, Loader2, Award } from "lucide-react";
import { useUser, useFirestore } from "@/firebase";
import { addEducation, updateEducation, deleteEducation } from "@/firebase/services";

export default function EducationPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { profile } = useProfileStore();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<Omit<EducationEntry, 'id'>>({
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    description: '',
    cgpa: '',
    percentage: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpen = (entry?: EducationEntry) => {
    if (entry) {
      setEditingId(entry.id);
      setFormData({
        institution: entry.institution,
        degree: entry.degree,
        fieldOfStudy: entry.fieldOfStudy || '',
        startDate: entry.startDate,
        endDate: entry.endDate || '',
        description: entry.description || '',
        cgpa: entry.cgpa || '',
        percentage: entry.percentage || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        institution: '',
        degree: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
        description: '',
        cgpa: '',
        percentage: ''
      });
    }
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db) return;
    setIsSaving(true);
    try {
      if (editingId) {
        await updateEducation(db, user.uid, editingId, formData);
        toast({ title: "Updated", description: "Education record updated." });
      } else {
        await addEducation(db, user.uid, formData);
        toast({ title: "Added", description: "New education record added." });
      }
      setIsOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Save Failed", description: "Could not persist changes." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user || !db) return;
    try {
      await deleteEducation(db, user.uid, id);
      toast({ title: "Deleted", description: "Education record removed." });
    } catch (error) {
      toast({ variant: "destructive", title: "Delete Failed", description: "Could not remove record." });
    }
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const educationList = profile.education || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-headline font-bold">Education</h1>
          <p className="text-muted-foreground">Manage your academic qualifications and achievements.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpen()} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Qualification
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] glass-card">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit' : 'Add'} Education</DialogTitle>
              <DialogDescription>Enter the details of your educational institution and degree.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label>Institution</Label>
                  <Input 
                    required 
                    placeholder="e.g. Stanford University" 
                    value={formData.institution}
                    onChange={e => setFormData({...formData, institution: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Degree</Label>
                  <Input 
                    required 
                    placeholder="e.g. Bachelor of Science" 
                    value={formData.degree}
                    onChange={e => setFormData({...formData, degree: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Field of Study (Optional)</Label>
                  <Input 
                    placeholder="e.g. Computer Science" 
                    value={formData.fieldOfStudy}
                    onChange={e => setFormData({...formData, fieldOfStudy: e.target.value})}
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
                <div className="space-y-2">
                  <Label>CGPA (Optional)</Label>
                  <Input 
                    placeholder="e.g. 3.8/4.0" 
                    value={formData.cgpa}
                    onChange={e => setFormData({...formData, cgpa: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Percentage (Optional)</Label>
                  <Input 
                    placeholder="e.g. 92%" 
                    value={formData.percentage}
                    onChange={e => setFormData({...formData, percentage: e.target.value})}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Achievements / Description (Optional)</Label>
                  <Textarea 
                    placeholder="Describe your major accomplishments..." 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="resize-none h-24"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : (editingId ? 'Save Changes' : 'Add Record')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {educationList.map((edu) => (
          <Card key={edu.id} className="glass-card overflow-hidden group hover:border-primary/50 transition-smooth">
            <CardHeader className="bg-white/5 flex flex-row items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/20 rounded-xl text-primary">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-lg">{edu.institution}</CardTitle>
                  <p className="text-sm text-muted-foreground font-medium">{edu.degree}</p>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-smooth">
                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={() => handleOpen(edu)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(edu.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{edu.startDate} — {edu.endDate || 'Present'}</span>
                </div>
                {(edu.cgpa || edu.percentage) && (
                  <div className="flex flex-wrap gap-3">
                    {edu.cgpa && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
                        <Award className="w-3.5 h-3.5" />
                        CGPA: {edu.cgpa}
                      </div>
                    )}
                    {edu.percentage && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-accent bg-accent/10 px-2 py-1 rounded-md">
                        <Award className="w-3.5 h-3.5" />
                        Score: {edu.percentage}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {edu.fieldOfStudy && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Major: </span>
                  <span className="font-medium">{edu.fieldOfStudy}</span>
                </div>
              )}
              {edu.description && (
                <p className="text-sm text-muted-foreground italic border-l-2 border-primary/20 pl-4 py-1">
                  "{edu.description}"
                </p>
              )}
            </CardContent>
          </Card>
        ))}
        {educationList.length === 0 && (
          <div className="md:col-span-2 py-20 text-center border-2 border-dashed border-border rounded-xl bg-white/5">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-secondary rounded-full">
                <GraduationCap className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-semibold">No Education Records</p>
                <p className="text-sm text-muted-foreground">Start by adding your first academic qualification.</p>
              </div>
              <Button onClick={() => handleOpen()} variant="outline" className="mt-2">
                Add Record Now
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
