
"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { UserProfile } from "@/lib/store";
import { 
  Loader2, 
  MapPin, 
  Globe, 
  Mail, 
  Phone, 
  GraduationCap, 
  Briefcase, 
  Link as LinkIcon, 
  Github, 
  ExternalLink,
  Calendar,
  User as UserIcon,
  FolderCode,
  FileText,
  AlertCircle,
  Building2,
  Laptop
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";

export default function PublicProfileView() {
  const params = useParams();
  const id = params?.id as string;
  const db = useFirestore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !db) return;

    const profileRef = doc(db, "shared-profiles", id);

    const unsubscribe = onSnapshot(profileRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && data.profileData) {
          setProfile(data.profileData as UserProfile);
          setError(null);
        } else {
          setError("This vault document exists but the data is corrupt or empty.");
        }
        setLoading(false);
      } else {
        setError("Professional vault not found. The profile owner may not have synced their data to the cloud yet.");
        setLoading(false);
      }
    }, async (err) => {
      const permissionError = new FirestorePermissionError({
        path: profileRef.path,
        operation: 'get',
      });
      errorEmitter.emit('permission-error', permissionError);
      setError("Unable to access the vault server. This could be due to restricted permissions or network issues.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id, db]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-6 p-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 animate-pulse">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-muted-foreground font-black tracking-widest text-xs uppercase animate-pulse">Accessing Vault</p>
          <p className="text-[10px] text-muted-foreground/50">Verifying secure cloud connection...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-8 animate-in fade-in duration-500">
        <div className="p-8 bg-destructive/5 rounded-full border border-destructive/10">
          <AlertCircle className="w-16 h-16 text-destructive/50" />
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-black tracking-tighter text-foreground">Vault Inaccessible</h1>
          <p className="text-muted-foreground max-w-md mx-auto text-lg leading-relaxed">
            {error || "The requested professional profile is currently offline or inaccessible."}
          </p>
        </div>
        <div className="flex flex-col gap-3 min-w-[240px]">
          <Button onClick={() => window.location.reload()} size="lg" className="font-bold">
            Retry Connection
          </Button>
          <Button asChild variant="ghost" className="text-muted-foreground">
            <a href="/">Go to Home</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 selection:bg-primary selection:text-primary-foreground">
      <div className="relative h-[400px] md:h-[500px] overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        
        <div className="max-w-6xl mx-auto px-6 h-full flex items-end pb-16 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end gap-8 w-full">
            <div className="relative shrink-0 group">
              <div className="w-40 h-40 md:w-52 md:h-52 rounded-3xl bg-card border-4 border-background shadow-2xl flex items-center justify-center overflow-hidden transition-smooth group-hover:scale-[1.02]">
                {profile.avatarUrl ? (
                  <Image 
                    src={profile.avatarUrl} 
                    alt={profile.name} 
                    fill 
                    className="object-cover"
                  />
                ) : (
                  <UserIcon className="w-20 h-20 md:w-28 md:h-28 text-primary/30" />
                )}
              </div>
              <Badge className="absolute -bottom-3 -right-3 bg-primary text-primary-foreground px-5 py-2 text-[10px] font-black border-4 border-background shadow-2xl tracking-[0.2em]">
                VERIFIED VAULT
              </Badge>
            </div>
            <div className="space-y-5 pb-2">
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-foreground drop-shadow-sm leading-[0.9]">{profile.name}</h1>
              <div className="flex flex-wrap gap-y-4 gap-x-10 text-muted-foreground font-bold text-sm md:text-base">
                {profile.currentJob && profile.currentJob.company && (
                  <div className="flex flex-col gap-2">
                    <span className="flex items-center gap-2.5">
                      <Building2 className="w-5 h-5 text-accent" /> {profile.currentJob.role} at {profile.currentJob.company}
                    </span>
                    <div className="flex gap-2">
                      {profile.currentJob.employmentType && (
                        <Badge variant="outline" className="text-[10px] border-primary/20 text-primary font-black uppercase tracking-widest">{profile.currentJob.employmentType}</Badge>
                      )}
                      {profile.currentJob.workSetting && (
                        <Badge variant="outline" className="text-[10px] border-accent/20 text-accent font-black uppercase tracking-widest flex gap-1 items-center">
                          <Laptop className="w-3 h-3" /> {profile.currentJob.workSetting}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                {profile.address && (
                  <span className="flex items-center gap-2.5">
                    <MapPin className="w-5 h-5 text-primary" /> {profile.address}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 mt-20">
        <div className="lg:col-span-4 space-y-12">
          <section className="space-y-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Identity & Contact</h2>
            <Card className="glass-card border-white/5 shadow-2xl overflow-hidden">
              <CardContent className="p-8 space-y-8">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/50 mb-2">Primary Email</p>
                  <p className="font-bold text-lg text-foreground truncate">{profile.email}</p>
                </div>
                {profile.secondaryEmail && (
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/50 mb-2">Secondary Email</p>
                    <p className="font-bold text-lg text-foreground truncate opacity-70">{profile.secondaryEmail}</p>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/50 mb-2">Primary Phone</p>
                  <p className="font-bold text-lg text-foreground">{profile.phone}</p>
                </div>
                {profile.secondaryPhone && (
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/50 mb-2">Secondary Phone</p>
                    <p className="font-bold text-lg text-foreground opacity-70">{profile.secondaryPhone}</p>
                  </div>
                )}
                {profile.website && (
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/50 mb-2">Professional HQ</p>
                    <a href={profile.website} target="_blank" rel="noopener" className="font-bold text-lg text-primary hover:underline block truncate">
                      {profile.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          <section className="space-y-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">External Portfolios</h2>
            <div className="grid grid-cols-1 gap-4">
              {profile.portfolioLinks?.map((link) => (
                <a 
                  key={link.id} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener"
                  className="group flex items-center justify-between p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary/40 hover:bg-primary/5 transition-all shadow-xl"
                >
                  <div className="flex items-center gap-5">
                    <div className="p-3 rounded-xl bg-white/5 text-muted-foreground group-hover:text-primary transition-smooth">
                      <LinkIcon className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-sm uppercase tracking-widest text-foreground">{link.platform}</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-smooth" />
                </a>
              ))}
            </div>
          </section>

          {profile.resumes && profile.resumes.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Credentials</h2>
              <div className="space-y-3">
                {profile.resumes.map((res) => (
                  <Button key={res.id} asChild variant="outline" className="w-full justify-start h-14 bg-white/5 border-white/5 hover:bg-white/10 font-bold group">
                    <a href={res.url} target="_blank" rel="noopener">
                      <FileText className="w-5 h-5 mr-4 text-primary group-hover:scale-110 transition-smooth" />
                      {res.name}
                    </a>
                  </Button>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="lg:col-span-8 space-y-24">
          {profile.bio && (
            <section className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Executive Summary</h2>
              <p className="text-3xl md:text-5xl font-medium leading-[1.3] text-foreground/90 italic font-serif">
                "{profile.bio}"
              </p>
            </section>
          )}

          <Separator className="opacity-10" />

          {profile.projects && profile.projects.length > 0 && (
            <section className="space-y-12">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Featured Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {profile.projects.map((proj) => (
                  <Card key={proj.id} className="glass-card border-none bg-white/[0.02] overflow-hidden group hover:bg-white/[0.04] transition-smooth shadow-2xl">
                    {proj.imageUrl && (
                      <div className="relative h-60 w-full border-b border-white/5 overflow-hidden">
                        <Image src={proj.imageUrl} alt={proj.title} fill className="object-cover group-hover:scale-110 transition-smooth duration-700" />
                      </div>
                    )}
                    <CardHeader className="p-8 space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-black tracking-tight text-foreground">{proj.title}</h3>
                        {proj.date && (
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-black tracking-[0.2em] uppercase">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(proj.date).getFullYear()}
                          </div>
                        )}
                      </div>
                      <p className="text-muted-foreground leading-relaxed text-sm font-medium">
                        {proj.description}
                      </p>
                      <div className="flex flex-wrap gap-3 pt-4">
                         {proj.url && (
                           <Button asChild size="sm" variant="secondary" className="h-9 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground font-bold">
                             <a href={proj.url} target="_blank" rel="noopener">
                               <ExternalLink className="w-4 h-4 mr-2" />
                               Live Demo
                             </a>
                           </Button>
                         )}
                         {proj.documentUrl && (
                           <Button asChild size="sm" variant="outline" className="h-9 border-accent/20 text-accent hover:bg-accent hover:text-accent-foreground font-bold">
                             <a href={proj.documentUrl} target="_blank" rel="noopener">
                               <FileText className="w-4 h-4 mr-2" />
                               View PDF
                             </a>
                           </Button>
                         )}
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </section>
          )}

          <Separator className="opacity-10" />

          {profile.experience && profile.experience.length > 0 && (
            <section className="space-y-12">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Career Trajectory</h2>
              <div className="space-y-16">
                {profile.experience.map((exp) => (
                  <div key={exp.id} className="relative pl-12 border-l-4 border-primary/10">
                    <div className="absolute top-0 left-[-11px] w-5 h-5 rounded-full bg-primary border-4 border-background shadow-[0_0_20px_rgba(var(--primary),0.6)]" />
                    <div className="space-y-8">
                      <div className="space-y-3">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <h3 className="text-4xl font-black tracking-tighter text-foreground">{exp.title}</h3>
                          <Badge variant="secondary" className="w-fit bg-primary/10 text-primary border-none font-black tracking-widest text-[10px] px-4 py-1.5">
                            {exp.startDate.split('-')[0]} — {exp.endDate ? exp.endDate.split('-')[0] : 'PRESENT'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-2xl font-bold text-primary">
                          <span>{exp.company}</span>
                          {exp.location && (
                            <span className="text-muted-foreground text-sm font-medium tracking-widest uppercase">/ {exp.location}</span>
                          )}
                        </div>
                      </div>
                      
                      {exp.description && (
                        <p className="text-muted-foreground leading-relaxed text-xl font-medium whitespace-pre-line max-w-3xl">
                          {exp.description}
                        </p>
                      )}

                      {exp.projectLinks && exp.projectLinks.length > 0 && (
                        <div className="flex flex-wrap gap-4 pt-4">
                          {exp.projectLinks.map(link => (
                            <Badge key={link.id} variant="outline" className="px-5 py-2 bg-white/5 text-primary border-primary/20 hover:bg-primary hover:text-primary-foreground transition-smooth cursor-pointer">
                              <a href={link.url} target="_blank" rel="noopener" className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.2em]">
                                {link.name} <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <Separator className="opacity-10" />

          {profile.education && profile.education.length > 0 && (
            <section className="space-y-12">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Academic History</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {profile.education.map((edu) => (
                  <Card key={edu.id} className="glass-card border-none bg-white/[0.02] shadow-2xl hover:bg-white/[0.04] transition-smooth group p-8">
                    <CardHeader className="p-0 pb-8 flex flex-row items-center gap-6">
                      <div className="p-5 bg-primary/10 rounded-2xl text-primary shrink-0 group-hover:scale-110 transition-smooth">
                        <GraduationCap className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-2xl font-black tracking-tight text-foreground leading-tight">{edu.degree}</CardTitle>
                        <p className="text-sm text-primary font-bold tracking-wider">{edu.institution}</p>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0 space-y-6">
                      <div className="text-[10px] font-black tracking-[0.3em] text-muted-foreground uppercase flex items-center gap-3">
                        <Calendar className="w-4 h-4" />
                        {edu.startDate.split('-')[0]} — {edu.endDate ? edu.endDate.split('-')[0] : 'PRESENT'}
                      </div>
                      {edu.description && (
                        <p className="text-muted-foreground italic leading-relaxed font-medium pl-6 border-l-2 border-primary/20 text-sm">
                          {edu.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <footer className="mt-40 py-24 border-t border-border/50 text-center space-y-10 bg-white/[0.01]">
        <div className="space-y-4">
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.5em]">Authentic Profile Vault</p>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/30">
              <FolderCode className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="font-headline font-black text-4xl tracking-tighter text-foreground">
              Profile<span className="text-primary">Vault</span>
            </span>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground/30 font-bold uppercase tracking-widest">
          &copy; {new Date().getFullYear()} ProfileVault Infrastructure • All Rights Reserved
        </p>
      </footer>
    </div>
  );
}
