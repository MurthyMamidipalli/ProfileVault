
"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, onSnapshot, collection, query, Timestamp } from "firebase/firestore";
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
  FolderCode,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

/**
 * @fileOverview Professional Vault Public Mirror (Hardened & De-duplicated)
 * Implements strict ID-based filtering to ensure zero duplication of professional records.
 */

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

    // 1. Root Profile Listener (Basic Metadata only)
    const profileRef = doc(db, "shared-profiles", id);
    const unsubProfile = onSnapshot(profileRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && data.profileData) {
          setProfile(data.profileData);
          setError(null);
        }
      } else {
        setError("Vault mirror not found.");
      }
      setLoading(false);
    }, (err) => {
      setError("Secure access denied.");
      setLoading(false);
    });

    // 2. Specialized Collection Fetcher (Atomic state updates)
    const fetchCollection = (type: string, setter: (data: any[]) => void) => {
      const q = collection(db, "shared-profiles", id, type);
      return onSnapshot(q, (snap) => {
        const docs = snap.docs.map(doc => {
          const data = doc.data();
          return { ...data, id: doc.id };
        });

        // Manual sort by timestamp (newest first)
        docs.sort((a: any, b: any) => {
          const getTime = (val: any) => {
            if (val instanceof Timestamp) return val.toMillis();
            if (val?.seconds) return val.seconds * 1000;
            if (val?.updatedAt?.seconds) return val.updatedAt.seconds * 1000;
            if (val?.createdAt?.seconds) return val.createdAt.seconds * 1000;
            return 0;
          };
          return getTime(b) - getTime(a);
        });
        
        // Strict replacement - never use prev => [...prev, ...data] to avoid duplicates
        setter(docs);
      }, (err) => {
        console.warn(`[Sync Warning] Failed to fetch ${type} sub-collection`);
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
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Synchronizing Mirror...</p>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="p-6 bg-destructive/10 rounded-full border border-destructive/20">
          <AlertCircle className="w-12 h-12 text-destructive" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Access Restricted</h1>
        <p className="text-muted-foreground">{error}</p>
        <Button asChild variant="outline">
          <a href="/">Return Home</a>
        </Button>
      </div>
    );
  }

  // --- STRICT DE-DUPLICATION (RENDER TIME LOCK) ---
  const uniqueJobs = Array.from(new Map(jobs.map(item => [item.id, item])).values());
  const uniqueExperience = Array.from(new Map(experience.map(item => [item.id, item])).values());
  const uniqueProjectsAndProducts = Array.from(new Map(projects.map(item => [item.id, item])).values());
  const uniqueEducation = Array.from(new Map(education.map(item => [item.id, item])).values());
  const uniqueLinks = Array.from(new Map(links.map(item => [item.id, item])).values());

  const p = profile!;
  const fullName = p.fullName || "Vault Owner";

  return (
    <div className="min-h-screen bg-background pb-32 selection:bg-primary/30">
      {/* Hero Banner Section */}
      <div className="relative h-[350px] md:h-[450px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="max-w-6xl mx-auto px-6 h-full flex items-end pb-12 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end gap-8 w-full">
            <div className="relative shrink-0">
              <div className="w-32 h-32 md:w-44 md:h-44 rounded-[2.5rem] bg-card border-4 border-background shadow-2xl overflow-hidden relative">
                {p.avatarUrl ? (
                  <Image src={p.avatarUrl} alt={fullName} fill className="object-cover" />
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
                {uniqueJobs.length > 0 && (
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" /> {uniqueJobs[0].role} @ {uniqueJobs[0].company}
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
        {/* Identity Hub Sidebar */}
        <div className="lg:col-span-4 space-y-12">
          <Card className="glass-card border-none bg-white/[0.02]">
            <CardHeader className="pb-2 border-b border-white/5">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Contact & Reach</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
              {p.email && (
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Email</p>
                  <p className="text-sm font-bold flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-primary" /> {p.email}
                  </p>
                </div>
              )}
              {p.website && (
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Website</p>
                  <a href={p.website} target="_blank" rel="noopener" className="text-sm font-bold text-accent hover:underline flex items-center gap-2 truncate">
                    <Globe className="w-3.5 h-3.5" /> {p.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              {uniqueLinks.length > 0 && (
                <div className="pt-4 border-t border-white/5 space-y-3">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-4">Professional Networks</p>
                  {uniqueLinks.map((link) => (
                    <a key={link.id} href={link.url} target="_blank" rel="noopener" className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-primary/5 transition-smooth group">
                      <span className="text-xs font-bold uppercase tracking-widest">{link.platform}</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-smooth" />
                    </a>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Professional Feed */}
        <div className="lg:col-span-8 space-y-24">
          {p.bio && (
            <section className="space-y-8">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Executive Summary</h2>
              <p className="text-2xl md:text-3xl font-medium leading-relaxed italic text-foreground opacity-90">
                "{p.bio}"
              </p>
            </section>
          )}

          {uniqueExperience.length > 0 && (
            <section className="space-y-10">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Experience</h2>
              <div className="space-y-12">
                {uniqueExperience.map((exp) => (
                  <div key={exp.id} className="relative pl-10 border-l-2 border-primary/20">
                    <div className="absolute top-0 left-[-7px] w-3 h-3 rounded-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
                    <div className="space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <h3 className="text-2xl font-bold">{exp.title}</h3>
                        <Badge variant="outline" className="w-fit border-primary/30 text-[10px] font-black">
                          {exp.startDate} — {exp.endDate || 'PRESENT'}
                        </Badge>
                      </div>
                      <p className="text-primary text-sm font-black uppercase tracking-widest">{exp.company}</p>
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

          {uniqueProjectsAndProducts.length > 0 && (
            <section className="space-y-10">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Featured Projects & Products</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {uniqueProjectsAndProducts.map((proj) => (
                  <Card key={proj.id} className="glass-card border-none bg-white/[0.02] overflow-hidden group hover:bg-white/[0.04] transition-smooth h-full flex flex-col">
                    <div className="relative h-52 w-full border-b border-white/5 bg-white/5">
                      {proj.imageUrl ? (
                        <Image src={proj.imageUrl} alt={proj.title} fill className="object-cover group-hover:scale-105 transition-smooth" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center opacity-20">
                          <Package className="w-12 h-12" />
                        </div>
                      )}
                    </div>
                    <CardHeader className="p-6 space-y-4 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xl font-bold line-clamp-1">{proj.title}</h3>
                        <Badge className="text-[9px] font-black uppercase shrink-0">
                          {proj.category || 'PROJECT'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                        {proj.description}
                      </p>
                    </CardHeader>
                    <div className="p-6 pt-0 mt-auto">
                      {proj.url && (
                        <Button asChild size="sm" variant="secondary" className="w-full text-[10px] font-black">
                          <a href={proj.url} target="_blank" rel="noopener">
                            <ExternalLink className="w-3.5 h-3.5 mr-2" /> LIVE PREVIEW
                          </a>
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {uniqueEducation.length > 0 && (
            <section className="space-y-10">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Education</h2>
              <div className="space-y-12">
                {uniqueEducation.map((edu) => (
                  <div key={edu.id} className="relative pl-10 border-l-2 border-accent/20">
                    <div className="absolute top-0 left-[-7px] w-3 h-3 rounded-full bg-accent" />
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold">{edu.institution}</h3>
                      <div className="flex items-center gap-3 text-accent font-bold">
                        <GraduationCap className="w-4 h-4" />
                        <span>{edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""}</span>
                      </div>
                      <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">
                        {edu.startDate} — {edu.endDate || 'PRESENT'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <footer className="mt-40 pt-16 border-t border-white/5 text-center opacity-20">
        <FolderCode className="w-6 h-6 mx-auto mb-4" />
        <span className="font-black text-[10px] uppercase tracking-[0.4em]">PROFILEVAULT SECURE DISTRIBUTED MIRROR</span>
      </footer>
    </div>
  );
}
