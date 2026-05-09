
"use client";

import React, { useEffect, useState, useMemo } from "react";
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
  Laptop,
  Clock,
  CheckCircle2,
  ShieldCheck
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
          setError("Vault data structure is invalid.");
        }
      } else {
        setError("Professional vault not found. The profile may be private or not yet synced.");
      }
      setLoading(false);
    }, async (err) => {
      const permissionError = new FirestorePermissionError({
        path: profileRef.path,
        operation: 'get',
      });
      errorEmitter.emit('permission-error', permissionError);
      setError("Secure access denied. Check your network or permissions.");
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
          <p className="text-muted-foreground font-black tracking-widest text-[10px] uppercase animate-pulse">Accessing Secure Vault</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-8 animate-fade-in">
        <div className="p-8 bg-destructive/5 rounded-full border border-destructive/10">
          <AlertCircle className="w-16 h-16 text-destructive/50" />
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-black tracking-tighter text-foreground">Vault Inaccessible</h1>
          <p className="text-muted-foreground max-w-md mx-auto text-lg leading-relaxed">
            {error}
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

  const jobs = profile.jobs || [];

  return (
    <div className="min-h-screen bg-background pb-20 selection:bg-primary selection:text-primary-foreground">
      {/* Hero Section with Glassmorphism Overlay */}
      <div className="relative h-[450px] md:h-[550px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-background to-accent/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(var(--accent-rgb),0.1),transparent)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        
        <div className="max-w-6xl mx-auto px-6 h-full flex items-end pb-12 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end gap-10 w-full animate-fade-in">
            <div className="relative shrink-0">
              <div className="w-44 h-44 md:w-60 md:h-60 rounded-[2.5rem] bg-card border-4 border-background shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden transition-smooth hover:scale-[1.03]">
                {profile.avatarUrl ? (
                  <Image src={profile.avatarUrl} alt={profile.name} fill className="object-cover" />
                ) : (
                  <UserIcon className="w-24 h-24 text-primary/20" />
                )}
              </div>
              <Badge className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground px-6 py-2.5 text-[9px] font-black border-4 border-background shadow-2xl tracking-[0.2em] flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED VAULT
              </Badge>
            </div>
            <div className="space-y-6 pb-4">
              <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-foreground leading-[0.85]">{profile.name}</h1>
              <div className="flex flex-wrap gap-y-3 gap-x-12 text-muted-foreground font-bold text-sm md:text-lg">
                {jobs.length > 0 && (
                  <span className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-accent" /> {jobs[0].role} @ {jobs[0].company}
                  </span>
                )}
                {profile.address && (
                  <span className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-primary" /> {profile.address}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-20 mt-24">
        {/* Left Sidebar */}
        <div className="lg:col-span-4 space-y-16 animate-fade-in">
          <section className="space-y-8">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/60">Contact Network</h2>
            <Card className="glass-card overflow-hidden">
              <CardContent className="p-8 space-y-10">
                <div className="group">
                  <p className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground/40 mb-3 group-hover:text-primary transition-smooth">Direct Email</p>
                  <p className="font-bold text-lg text-foreground truncate">{profile.email}</p>
                </div>
                {profile.secondaryEmail && (
                  <div className="group opacity-70">
                    <p className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground/40 mb-3">Backup Email</p>
                    <p className="font-bold text-lg text-foreground truncate">{profile.secondaryEmail}</p>
                  </div>
                )}
                <div className="group">
                  <p className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground/40 mb-3 group-hover:text-primary transition-smooth">Phone Line</p>
                  <p className="font-bold text-lg text-foreground">{profile.phone}</p>
                </div>
                {profile.website && (
                  <div className="group">
                    <p className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground/40 mb-3 group-hover:text-accent transition-smooth">Digital HQ</p>
                    <a href={profile.website} target="_blank" rel="noopener" className="font-bold text-lg text-accent hover:underline block truncate">
                      {profile.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {jobs.length > 0 && (
            <section className="space-y-8">
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/60">Active Roles</h2>
              <div className="space-y-5">
                {jobs.map((job) => (
                  <Card key={job.id} className="glass-card group hover:border-primary/30 transition-smooth">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-primary" />
                            {job.role}
                          </h4>
                          <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5" />
                            {job.company}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">
                        <Clock className="w-3 h-3" />
                        {new Date(job.joiningDate).getFullYear()} — {job.endDate ? new Date(job.endDate).getFullYear() : 'PRESENT'}
                      </div>
                      <div className="flex gap-2">
                        {job.employmentType && <Badge variant="secondary" className="text-[8px] h-4 uppercase font-black">{job.employmentType}</Badge>}
                        {job.workSetting && <Badge variant="outline" className="text-[8px] h-4 uppercase font-black border-accent/20 text-accent">{job.workSetting}</Badge>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          <section className="space-y-8">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/60">Portfolio Index</h2>
            <div className="grid grid-cols-1 gap-4">
              {profile.portfolioLinks?.map((link) => (
                <a 
                  key={link.id} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener"
                  className="group flex items-center justify-between p-6 rounded-2xl bg-white/[0.01] border border-white/5 hover:border-accent/40 hover:bg-accent/5 transition-all"
                >
                  <div className="flex items-center gap-5">
                    <div className="p-3 rounded-xl bg-white/5 text-muted-foreground group-hover:text-accent transition-smooth">
                      <LinkIcon className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-xs uppercase tracking-widest text-foreground">{link.platform}</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground/20 group-hover:text-accent transition-smooth" />
                </a>
              ))}
            </div>
          </section>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-24 animate-fade-in [animation-delay:200ms]">
          {profile.bio && (
            <section className="space-y-10">
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/60">Executive Summary</h2>
              <p className="text-4xl md:text-6xl font-medium leading-[1.2] text-foreground/90 italic font-serif tracking-tight">
                "{profile.bio}"
              </p>
            </section>
          )}

          <Separator className="opacity-5" />

          {profile.projects && profile.projects.length > 0 && (
            <section className="space-y-14">
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/60">Signature Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {profile.projects.map((proj) => (
                  <Card key={proj.id} className="glass-card border-none bg-white/[0.01] overflow-hidden group hover:bg-white/[0.03] transition-smooth">
                    {proj.imageUrl && (
                      <div className="relative h-64 w-full border-b border-white/5 overflow-hidden">
                        <Image src={proj.imageUrl} alt={proj.title} fill className="object-cover group-hover:scale-110 transition-smooth duration-1000" />
                      </div>
                    )}
                    <CardHeader className="p-8 space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-black tracking-tight text-foreground">{proj.title}</h3>
                        {proj.date && (
                          <div className="flex items-center gap-2 text-[9px] text-muted-foreground font-black tracking-[0.2em] uppercase">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(proj.date).getFullYear()}
                          </div>
                        )}
                      </div>
                      <p className="text-muted-foreground leading-relaxed text-sm font-medium line-clamp-4">
                        {proj.description}
                      </p>
                      <div className="flex flex-wrap gap-4 pt-4">
                         {proj.url && (
                           <Button asChild size="sm" variant="secondary" className="h-9 bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground font-bold">
                             <a href={proj.url} target="_blank" rel="noopener">
                               <ExternalLink className="w-4 h-4 mr-2" /> Live Project
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

          <Separator className="opacity-5" />

          {profile.experience && profile.experience.length > 0 && (
            <section className="space-y-16">
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/60">Career Timeline</h2>
              <div className="space-y-20">
                {profile.experience.map((exp) => (
                  <div key={exp.id} className="relative pl-14 border-l-4 border-primary/10 group">
                    <div className="absolute top-0 left-[-12px] w-5 h-5 rounded-full bg-primary border-4 border-background shadow-[0_0_30px_rgba(var(--primary),0.8)] group-hover:scale-125 transition-smooth" />
                    <div className="space-y-10">
                      <div className="space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                          <h3 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground">{exp.title}</h3>
                          <Badge className="w-fit bg-primary/10 text-primary border-none font-black tracking-[0.2em] text-[10px] px-5 py-2">
                            {exp.startDate.split('-')[0]} — {exp.endDate ? exp.endDate.split('-')[0] : 'PRESENT'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-5 text-2xl font-bold text-accent">
                          <span>{exp.company}</span>
                          {exp.location && (
                            <span className="text-muted-foreground text-xs font-black tracking-[0.3em] uppercase opacity-40">/ {exp.location}</span>
                          )}
                        </div>
                      </div>
                      
                      {exp.description && (
                        <p className="text-muted-foreground leading-relaxed text-xl font-medium whitespace-pre-line max-w-4xl opacity-80">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <Separator className="opacity-5" />

          {profile.education && profile.education.length > 0 && (
            <section className="space-y-14">
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/60">Academic Pedigree</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {profile.education.map((edu) => (
                  <Card key={edu.id} className="glass-card border-none bg-white/[0.01] shadow-2xl hover:bg-white/[0.03] transition-smooth group p-10">
                    <CardHeader className="p-0 pb-10 flex flex-row items-center gap-8">
                      <div className="p-6 bg-primary/10 rounded-3xl text-primary shrink-0 group-hover:scale-110 transition-smooth">
                        <GraduationCap className="w-10 h-10" />
                      </div>
                      <div className="space-y-2">
                        <CardTitle className="text-2xl font-black tracking-tight text-foreground leading-tight">{edu.degree}</CardTitle>
                        <p className="text-sm text-primary font-bold tracking-widest uppercase">{edu.institution}</p>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0 space-y-8">
                      <div className="text-[9px] font-black tracking-[0.4em] text-muted-foreground/40 uppercase flex items-center gap-4">
                        <Calendar className="w-4 h-4" />
                        {edu.startDate.split('-')[0]} — {edu.endDate ? edu.endDate.split('-')[0] : 'PRESENT'}
                      </div>
                      {edu.description && (
                        <p className="text-muted-foreground italic leading-relaxed font-medium pl-8 border-l-2 border-primary/20 text-sm opacity-70">
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

      <footer className="mt-48 py-32 border-t border-border/50 text-center space-y-12 bg-white/[0.01]">
        <div className="space-y-6">
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.6em] opacity-30">Encrypted Profile Infrastructure</p>
          <div className="flex items-center justify-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-[0_10px_40px_rgba(var(--primary),0.4)]">
              <FolderCode className="w-8 h-8 text-primary-foreground" />
            </div>
            <span className="font-headline font-black text-5xl tracking-tighter text-foreground">
              Profile<span className="text-primary">Vault</span>
            </span>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground/20 font-bold uppercase tracking-[0.3em]">
          &copy; {new Date().getFullYear()} ProfileVault Core Infrastructure • Securing Identity
        </p>
      </footer>
    </div>
  );
}
