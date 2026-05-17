
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { doc, onSnapshot, collection, query, DocumentData } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { UserProfile, JobEntry, ExperienceEntry, ProjectEntry, SocialLink, EducationEntry } from "@/lib/store";
import { 
  Loader2, 
  MapPin, 
  Mail, 
  Phone, 
  GraduationCap, 
  Briefcase, 
  Link as LinkIcon, 
  ExternalLink,
  Calendar,
  User as UserIcon,
  Building2,
  ShieldCheck,
  AlertCircle,
  Globe,
  FolderCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export default function PublicProfileView() {
  const params = useParams();
  const id = params?.id as string;
  const db = useFirestore();
  
  const [profile, setProfile] = useState<Partial<UserProfile> | null>(null);
  const [jobs, setJobs] = useState<JobEntry[]>([]);
  const [experience, setExperience] = useState<ExperienceEntry[]>([]);
  const [projects, setProjects] = useState<ProjectEntry[]>([]);
  const [education, setEducation] = useState<EducationEntry[]>([]);
  const [links, setLinks] = useState<SocialLink[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!id || !db || !mounted) return;

    console.log(`[PublicView] Synchronizing distributed mirror for UID: ${id}`);
    
    // 1. Fetch root profile (Basic metadata)
    const profileRef = doc(db, "shared-profiles", id);
    const unsubProfile = onSnapshot(profileRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && data.profileData) {
          setProfile(data.profileData);
          setError(null);
        }
      } else {
        setError("Vault mirror not found or is strictly private.");
      }
      setLoading(false);
    }, (err) => {
      setError("Secure access denied.");
      setLoading(false);
    });

    // 2. Fetch distributed sub-collections
    // CRITICAL: We fetch without orderBy to avoid index requirement errors, sorting client-side instead.
    const fetchCollection = (type: string, setter: (data: any[]) => void) => {
      const q = query(collection(db, "shared-profiles", id, type));
      return onSnapshot(q, (snap) => {
        const docs = snap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        // Deterministic client-side sort by updatedAt timestamp
        docs.sort((a: any, b: any) => {
          const timeA = a.updatedAt?.seconds || 0;
          const timeB = b.updatedAt?.seconds || 0;
          return timeB - timeA;
        });
        setter(docs);
      }, (err) => {
        console.warn(`[PublicView] Could not load ${type}:`, err);
      });
    };

    const unsubJobs = fetchCollection('jobs', setJobs);
    const unsubExp = fetchCollection('experience', setExperience);
    const unsubProj = fetchCollection('projects', setProjects);
    const unsubEdu = fetchCollection('education', setEducation);
    const unsubLinks = fetchCollection('portfolioLinks', setLinks);

    return () => {
      unsubProfile();
      unsubJobs();
      unsubExp();
      unsubProj();
      unsubEdu();
      unsubLinks();
    };
  }, [id, db, mounted]);

  if (!mounted) return null;

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse">Establishing Distributed Link...</p>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="p-6 bg-destructive/10 rounded-full border border-destructive/20">
          <AlertCircle className="w-12 h-12 text-destructive" />
        </div>
        <h1 className="text-3xl font-bold">Vault Mirror Restricted</h1>
        <p className="text-muted-foreground max-w-sm mx-auto">{error}</p>
        <Button asChild variant="outline">
          <a href="/">Return Home</a>
        </Button>
      </div>
    );
  }

  const p = profile!;
  const fullName = p.fullName || p.name || "Vault Owner";
  const bio = p.bio || "";
  const avatarUrl = p.avatarUrl || "";

  return (
    <div className="min-h-screen bg-background pb-20 selection:bg-primary/30">
      <div className="relative h-[350px] md:h-[450px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="max-w-6xl mx-auto px-6 h-full flex items-end pb-12 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end gap-8 w-full">
            <div className="relative shrink-0">
              <div className="w-32 h-32 md:w-48 md:h-48 rounded-[2.5rem] bg-card border-4 border-background shadow-2xl overflow-hidden relative">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt={fullName} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary">
                    <UserIcon className="w-16 h-16 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <Badge className="absolute -bottom-2 -right-2 bg-primary px-3 py-1 font-black text-[9px] border-2 border-background shadow-xl">
                <ShieldCheck className="w-3 h-3 mr-1" /> VERIFIED VAULT
              </Badge>
            </div>
            <div className="space-y-4 pb-2">
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground">{fullName}</h1>
              <div className="flex flex-wrap gap-x-8 gap-y-3 text-muted-foreground font-semibold text-sm">
                {jobs.length > 0 && (
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" /> {jobs[0].role} @ {jobs[0].company}
                  </span>
                )}
                {p.address && (
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-accent" /> {p.address}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 mt-16">
        <div className="lg:col-span-4 space-y-12">
          <Card className="glass-card">
            <CardHeader className="pb-2 border-b border-white/5">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Identity Hub</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
              {p.email && (
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Primary Email</p>
                  <p className="text-sm font-bold flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-primary" /> {p.email}
                  </p>
                </div>
              )}
              {p.website && (
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Professional Site</p>
                  <a href={p.website} target="_blank" rel="noopener" className="text-sm font-bold text-accent hover:underline flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5" /> {p.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              {p.phone && (
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Contact Number</p>
                  <p className="text-sm font-bold flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" /> {p.phone}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {links.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground pl-1">Global Presence</h3>
              <div className="grid grid-cols-1 gap-3">
                {links.map((link) => (
                  <a 
                    key={link.id} 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener"
                    className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/40 hover:bg-primary/5 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <LinkIcon className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                      <span className="text-xs font-bold uppercase tracking-widest">{link.platform}</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-8 space-y-16">
          {bio && (
            <section className="space-y-8">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Executive Summary</h2>
              <p className="text-2xl md:text-3xl font-medium leading-relaxed italic text-foreground opacity-90">
                "{bio}"
              </p>
            </section>
          )}

          <Separator className="opacity-10" />

          {experience.length > 0 && (
            <section className="space-y-10">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Professional Journey</h2>
              <div className="space-y-12">
                {experience.map((exp) => (
                  <div key={exp.id} className="relative pl-10 border-l-2 border-primary/20">
                    <div className="absolute top-0 left-[-7px] w-3 h-3 rounded-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
                    <div className="space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <h3 className="text-2xl font-bold">{exp.title}</h3>
                        <Badge variant="outline" className="w-fit border-primary/30 text-[10px] font-black uppercase">
                          {exp.startDate} — {exp.endDate || 'PRESENT'}
                        </Badge>
                      </div>
                      <p className="text-primary text-sm font-black uppercase tracking-[0.1em]">{exp.company}</p>
                      {exp.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line opacity-80 max-w-2xl">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {education.length > 0 && (
            <section className="space-y-10">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Academic Background</h2>
              <div className="space-y-12">
                {education.map((edu) => (
                  <div key={edu.id} className="relative pl-10 border-l-2 border-accent/20">
                    <div className="absolute top-0 left-[-7px] w-3 h-3 rounded-full bg-accent" />
                    <div className="space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <h3 className="text-2xl font-bold">{edu.institution}</h3>
                        <Badge variant="outline" className="w-fit border-accent/30 text-accent text-[10px] font-black">
                          {edu.startDate} — {edu.endDate || 'PRESENT'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <GraduationCap className="w-5 h-5 text-accent" />
                        <p className="text-lg font-bold opacity-90">
                          {edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""}
                        </p>
                      </div>
                      {edu.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed italic border-l-2 border-white/5 pl-6 py-2">
                          {edu.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {projects.length > 0 && (
            <section className="space-y-10">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Featured Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {projects.map((proj) => (
                  <Card key={proj.id} className="glass-card border-none bg-white/[0.02] overflow-hidden group hover:bg-white/[0.04] transition-all duration-500">
                    {proj.imageUrl && (
                      <div className="relative h-56 w-full border-b border-white/5 overflow-hidden">
                        <Image src={proj.imageUrl} alt={proj.title} fill className="object-cover group-hover:scale-110 transition-all duration-700" />
                      </div>
                    )}
                    <CardHeader className="p-6 space-y-4">
                      <h3 className="text-xl font-bold">{proj.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                        {proj.description}
                      </p>
                      {proj.url && (
                        <Button asChild size="sm" variant="secondary" className="w-fit h-8 text-[10px] font-black mt-2">
                          <a href={proj.url} target="_blank" rel="noopener">
                            <ExternalLink className="w-3.5 h-3.5 mr-2" /> LIVE PREVIEW
                          </a>
                        </Button>
                      )}
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <footer className="mt-32 pt-16 border-t border-white/5 text-center">
        <div className="flex flex-col items-center gap-4 opacity-20">
          <FolderCode className="w-6 h-6" />
          <span className="font-black text-[10px] uppercase tracking-[0.4em]">PROFILEVAULT SECURE DISTRIBUTED MIRROR</span>
        </div>
      </footer>
    </div>
  );
}
