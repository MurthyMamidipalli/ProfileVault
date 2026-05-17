
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { doc, onSnapshot, collection, Timestamp } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { UserProfile, JobEntry, ExperienceEntry, ProjectEntry, SocialLink, EducationEntry } from "@/lib/store";
import { 
  Loader2, 
  MapPin, 
  Mail, 
  Phone,
  GraduationCap, 
  ExternalLink,
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
 * @fileOverview Professional Vault Public Mirror (Optimized Identity Alignment)
 * Implements strict object-top alignment for identity photos to prevent hair clipping.
 * Name size adjusted to "middle size" (text-2xl md:text-4xl).
 * Layout tightened to reduce space between identity and experience.
 */

export default function PublicProfileView() {
  const params = useParams();
  const id = params?.id as string;
  const db = useFirestore();
  
  const [profile, setProfile] = useState<Partial<UserProfile> | null>(null);
  const [jobs, setJobs] = useState<JobEntry[]>([]);
  const [experience, setExperience] = useState<ExperienceEntry[]>([]);
  const [education, setEducation] = useState<EducationEntry[]>([]);
  const [projects, setProjects] = useState<ProjectEntry[]>([]);
  const [links, setLinks] = useState<SocialLink[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!id || !db || !mounted) return;

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
    }, () => {
      setError("Secure access denied.");
      setLoading(false);
    });

    const fetchCollection = (type: string, setter: (data: any[]) => void) => {
      const q = collection(db, "shared-profiles", id, type);
      return onSnapshot(q, (snap) => {
        const docs = snap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        docs.sort((a: any, b: any) => {
          const getTime = (val: any) => {
            if (val instanceof Timestamp) return val.toMillis();
            if (val?.seconds) return val.seconds * 1000;
            return 0;
          };
          return getTime(b) - getTime(a);
        });
        setter(docs);
      });
    };

    const unsubJobs = fetchCollection('jobs', setJobs);
    const unsubExp = fetchCollection('experience', setExperience);
    const unsubEdu = fetchCollection('education', setEducation);
    const unsubProj = fetchCollection('projects', setProjects);
    const unsubLinks = fetchCollection('portfolioLinks', setLinks);

    return () => {
      unsubProfile();
      unsubJobs();
      unsubExp();
      unsubEdu();
      unsubProj();
      unsubLinks();
    };
  }, [id, db, mounted]);

  const uniqueJobs = useMemo(() => Array.from(new Map(jobs.map(item => [item.id, item])).values()), [jobs]);
  const uniqueExperience = useMemo(() => Array.from(new Map(experience.map(item => [item.id, item])).values()), [experience]);
  const uniqueEducation = useMemo(() => Array.from(new Map(education.map(item => [item.id, item])).values()), [education]);
  const uniqueProjectsList = useMemo(() => Array.from(new Map(projects.map(item => [item.id, item])).values()), [projects]);
  const uniqueLinks = useMemo(() => Array.from(new Map(links.map(item => [item.id, item])).values()), [links]);

  const projectsOnly = uniqueProjectsList.filter(p => p.category === 'project');
  const productsOnly = uniqueProjectsList.filter(p => p.category === 'product');

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

  const p = profile!;
  const fullName = p.fullName || "Vault Owner";

  return (
    <div className="min-h-screen bg-background pb-32 selection:bg-primary/30">
      {/* Hero Banner (Optimized for full identity visibility with headroom) */}
      <div className="relative min-h-[400px] md:min-h-[350px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="max-w-6xl mx-auto px-6 h-full flex flex-col justify-start md:justify-end pb-8 pt-16 md:pt-0 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8 w-full text-center md:text-left">
            <div className="relative shrink-0 transition-smooth hover:scale-105">
              <div className="w-40 h-40 md:w-48 md:h-48 rounded-3xl md:rounded-[2.5rem] bg-card border-4 border-background shadow-2xl overflow-hidden relative">
                {p.avatarUrl ? (
                  <Image 
                    src={p.avatarUrl} 
                    alt={fullName} 
                    fill 
                    className="object-cover object-top" 
                    priority 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary">
                    <UserIcon className="w-20 h-20 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <Badge className="absolute -bottom-2 -right-2 bg-primary px-3 py-1 font-black text-[9px] border-2 border-background shadow-xl">
                <ShieldCheck className="w-3 h-3 mr-1" /> VERIFIED VAULT
              </Badge>
            </div>
            <div className="space-y-2 pb-2">
              <h1 className="text-2xl md:text-4xl font-black tracking-tighter text-foreground leading-tight">{fullName}</h1>
              <div className="flex flex-col justify-center md:justify-start gap-y-1.5 text-muted-foreground font-semibold text-sm">
                {uniqueJobs.length > 0 && (
                  <span className="flex items-center justify-center md:justify-start gap-2">
                    <Building2 className="w-4 h-4 text-primary" /> {uniqueJobs[0].role} @ {uniqueJobs[0].company}
                  </span>
                )}
                {p.address && (
                  <span className="flex items-center justify-center md:justify-start gap-2 text-xs leading-relaxed max-w-2xl opacity-80">
                    <MapPin className="w-4 h-4 text-accent shrink-0" /> {p.address}
                  </span>
                )}
                {p.phone && (
                  <span className="flex items-center justify-center md:justify-start gap-2">
                    <Phone className="w-4 h-4 text-primary" /> {p.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 mt-4 md:mt-6">
        <div className="lg:col-span-4 space-y-8">
          <Card className="glass-card border-none bg-white/[0.02]">
            <CardHeader className="pb-2 border-b border-white/5">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Contact Hub</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {p.email && (
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Email</p>
                  <p className="text-sm font-bold flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-primary" /> {p.email}
                  </p>
                </div>
              )}
              {p.phone && (
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Phone</p>
                  <p className="text-sm font-bold flex items-center gap-2 truncate">
                    <Phone className="w-3.5 h-3.5 text-accent" /> {p.phone}
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
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-4">Networks</p>
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

        <div className="lg:col-span-8 space-y-10 md:space-y-16">
          {p.bio && (
            <section className="space-y-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Summary</h2>
              <p className="text-lg md:text-xl font-medium leading-relaxed italic text-foreground opacity-90">
                "{p.bio}"
              </p>
            </section>
          )}

          {uniqueExperience.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Professional Experience</h2>
              <div className="space-y-8">
                {uniqueExperience.map((exp) => (
                  <div key={exp.id} className="relative pl-8 border-l-2 border-primary/20">
                    <div className="absolute top-0 left-[-7px] w-3 h-3 rounded-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
                    <div className="space-y-3">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <h3 className="text-xl font-bold">{exp.title}</h3>
                        <Badge variant="outline" className="w-fit border-primary/30 text-[10px] font-black">
                          {exp.startDate} — {exp.endDate || 'PRESENT'}
                        </Badge>
                      </div>
                      <p className="text-primary text-xs font-black uppercase tracking-widest">{exp.company}</p>
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

          {uniqueEducation.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Academic Background</h2>
              <div className="space-y-8">
                {uniqueEducation.map((edu) => (
                  <div key={edu.id} className="relative pl-8 border-l-2 border-accent/20">
                    <div className="absolute top-0 left-[-7px] w-3 h-3 rounded-full bg-accent" />
                    <div className="space-y-2">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                        <div className="space-y-1">
                          <h3 className="text-lg font-bold">{edu.institution}</h3>
                          <div className="flex items-center gap-2 text-accent font-bold text-sm">
                            <GraduationCap className="w-4 h-4" />
                            <span>{edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""}</span>
                          </div>
                        </div>
                        {(edu.cgpa || edu.percentage) && (
                          <div className="flex flex-wrap gap-2">
                            {edu.cgpa && (
                              <Badge className="bg-accent/10 text-accent border-accent/20 font-black text-[10px]">
                                CGPA: {edu.cgpa}
                              </Badge>
                            )}
                            {edu.percentage && (
                              <Badge className="bg-primary/10 text-primary border-primary/20 font-black text-[10px]">
                                SCORE: {edu.percentage}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                        {edu.startDate} — {edu.endDate || 'PRESENT'}
                      </p>
                      {edu.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed italic opacity-80 pt-1">
                          "{edu.description}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {projectsOnly.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Technical Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projectsOnly.map((proj) => (
                  <Card key={proj.id} className="glass-card overflow-hidden group hover:border-primary/40 transition-smooth flex flex-col">
                    <div className="relative h-44 w-full border-b border-white/5">
                      {proj.imageUrl ? (
                        <Image src={proj.imageUrl} alt={proj.title} fill className="object-cover object-top group-hover:scale-105 transition-smooth" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/5">
                          <FolderCode className="w-10 h-10 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <CardHeader className="p-5 pb-2">
                      <CardTitle className="text-lg font-bold">{proj.title}</CardTitle>
                      {proj.date && <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{new Date(proj.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}</p>}
                    </CardHeader>
                    <CardContent className="p-5 pt-2 space-y-4 flex-1 flex flex-col">
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed flex-1">
                        {proj.description}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {proj.url && (
                          <Button asChild size="sm" variant="outline" className="h-7 text-xs font-bold border-primary/20 hover:bg-primary/10">
                            <a href={proj.url} target="_blank" rel="noopener"><ExternalLink className="w-3 h-3 mr-2" /> Live Demo</a>
                          </Button>
                        )}
                        {proj.documentUrl && (
                          <Button asChild size="sm" variant="secondary" className="h-7 text-xs font-bold bg-white/5 hover:bg-white/10">
                            <a href={proj.documentUrl} target="_blank" rel="noopener"><Globe className="w-3 h-3 mr-2" /> Docs</a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {productsOnly.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Digital Products</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {productsOnly.map((prod) => (
                  <Card key={prod.id} className="glass-card overflow-hidden group hover:border-accent/40 transition-smooth flex flex-col">
                    <div className="relative h-44 w-full border-b border-white/5">
                      {prod.imageUrl ? (
                        <Image src={prod.imageUrl} alt={prod.title} fill className="object-cover object-top group-hover:scale-105 transition-smooth" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/5">
                          <Package className="w-10 h-10 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <CardHeader className="p-5 pb-2">
                      <CardTitle className="text-lg font-bold">{prod.title}</CardTitle>
                      {prod.date && <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{new Date(prod.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}</p>}
                    </CardHeader>
                    <CardContent className="p-5 pt-2 space-y-4 flex-1 flex flex-col">
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed flex-1">
                        {prod.description}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {prod.url && (
                          <Button asChild size="sm" variant="outline" className="h-7 text-xs font-bold border-accent/20 hover:bg-accent/10">
                            <a href={prod.url} target="_blank" rel="noopener"><Globe className="w-3 h-3 mr-2" /> Site</a>
                          </Button>
                        )}
                        {prod.documentUrl && (
                          <Button asChild size="sm" variant="secondary" className="h-7 text-xs font-bold bg-white/5 hover:bg-white/10">
                            <a href={prod.documentUrl} target="_blank" rel="noopener"><Globe className="w-3 h-3 mr-2" /> Tech Specs</a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>

      <footer className="mt-20 pt-16 border-t border-white/5 text-center opacity-20">
        <FolderCode className="w-6 h-6 mx-auto mb-4" />
        <span className="font-black text-[10px] uppercase tracking-[0.4em]">PROFILEVAULT SECURE DISTRIBUTED MIRROR</span>
      </footer>
    </div>
  );
}
