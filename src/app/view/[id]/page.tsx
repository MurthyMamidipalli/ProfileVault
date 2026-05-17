
"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { UserProfile } from "@/lib/store";
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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!id || !db || !mounted) return;

    console.log(`[View] Accessing vault: shared-profiles/${id}`);
    const profileRef = doc(db, "shared-profiles", id);

    const unsubscribe = onSnapshot(profileRef, (snapshot) => {
      console.log(`[View] Snapshot triggered for: ${id}`);
      if (snapshot.exists()) {
        const data = snapshot.data();
        console.log("[View] Full Document Data:", data);
        
        if (data && data.profileData) {
          console.log("[View] profileData found:", data.profileData);
          setProfile(data.profileData as UserProfile);
          setError(null);
        } else {
          console.warn("[View] Document exists but 'profileData' field is missing.");
          setError("This vault is currently empty or incorrectly formatted.");
        }
      } else {
        console.warn("[View] Vault document does not exist at path:", profileRef.path);
        setError("Professional vault not found. Ensure the user has published their profile.");
      }
      setLoading(false);
    }, (err) => {
      console.error(`[View] Firebase Error:`, err);
      setError("Secure access restricted or profile is private.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id, db, mounted]);

  if (!mounted) return null;

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Vault...</p>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="p-6 bg-destructive/10 rounded-full border border-destructive/20">
          <AlertCircle className="w-12 h-12 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Vault Inaccessible</h1>
          <p className="text-muted-foreground max-w-sm mx-auto">{error}</p>
        </div>
        <Button asChild variant="outline">
          <a href="/">Return Home</a>
        </Button>
      </div>
    );
  }

  // Unified data mapping
  const pData = profile;
  const fullName = pData?.fullName || pData?.name || "Vault Owner";
  const bio = pData?.bio || "";
  const avatarUrl = pData?.avatarUrl || "";
  const email = pData?.email || "N/A";
  const phone = pData?.phone || "";
  const website = pData?.website || "";
  const address = pData?.address || "";
  const jobs = pData?.jobs || [];
  const projects = pData?.projects || [];
  const experience = pData?.experience || [];
  const education = pData?.education || [];
  const portfolioLinks = pData?.portfolioLinks || [];

  return (
    <div className="min-h-screen bg-background pb-20 selection:bg-primary/30">
      {/* Hero Banner */}
      <div className="relative h-[350px] md:h-[400px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="max-w-6xl mx-auto px-6 h-full flex items-end pb-12 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end gap-6 w-full animate-fade-in">
            <div className="relative shrink-0">
              <div className="w-32 h-32 md:w-44 md:h-44 rounded-[2rem] bg-card border-4 border-background shadow-2xl overflow-hidden">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt={fullName} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary">
                    <UserIcon className="w-16 h-16 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <Badge className="absolute -bottom-2 -right-2 bg-primary px-3 py-1 font-black text-[9px] border-2 border-background">
                <ShieldCheck className="w-3 h-3 mr-1" /> VERIFIED
              </Badge>
            </div>
            <div className="space-y-3 pb-2">
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter">{fullName}</h1>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground font-semibold text-sm">
                {jobs.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-primary" /> {jobs[0].role} @ {jobs[0].company}
                  </span>
                )}
                {address && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-accent" /> {address}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 mt-12">
        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-10 animate-fade-in">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Identity Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-primary/60">Primary Email</p>
                <p className="text-sm font-bold break-all">{email}</p>
              </div>
              {website && (
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-primary/60">Professional Site</p>
                  <a href={website} target="_blank" rel="noopener" className="text-sm font-bold text-accent hover:underline flex items-center gap-2">
                    {website.replace(/^https?:\/\//, '')}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
              {phone && (
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-primary/60">Phone Line</p>
                  <p className="text-sm font-bold">{phone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {portfolioLinks.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground pl-1">Network Links</h3>
              <div className="grid grid-cols-1 gap-2">
                {portfolioLinks.map((link) => (
                  <a 
                    key={link.id} 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener"
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/40 hover:bg-primary/5 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <LinkIcon className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                      <span className="text-xs font-bold uppercase tracking-widest">{link.platform}</span>
                    </div>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Feed */}
        <div className="lg:col-span-8 space-y-12 animate-fade-in [animation-delay:200ms]">
          {bio && (
            <section className="space-y-6">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Executive Summary</h2>
              <p className="text-xl md:text-2xl font-medium leading-relaxed italic opacity-90">
                "{bio}"
              </p>
            </section>
          )}

          <Separator className="opacity-10" />

          {projects.length > 0 && (
            <section className="space-y-8">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Signature Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((proj) => (
                  <Card key={proj.id} className="glass-card border-none bg-white/[0.02] overflow-hidden group hover:bg-white/[0.04] transition-all">
                    {proj.imageUrl && (
                      <div className="relative h-48 w-full border-b border-white/5 overflow-hidden">
                        <Image src={proj.imageUrl} alt={proj.title} fill className="object-cover group-hover:scale-105 transition-all duration-700" />
                      </div>
                    )}
                    <CardHeader className="p-5 space-y-3">
                      <h3 className="text-lg font-bold">{proj.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                        {proj.description}
                      </p>
                      {proj.url && (
                        <Button asChild size="sm" variant="secondary" className="w-fit h-7 text-[10px] font-bold mt-2">
                          <a href={proj.url} target="_blank" rel="noopener">
                            <ExternalLink className="w-3 h-3 mr-1.5" /> View Project
                          </a>
                        </Button>
                      )}
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {experience.length > 0 && (
            <section className="space-y-8">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Career History</h2>
              <div className="space-y-10">
                {experience.map((exp) => (
                  <div key={exp.id} className="relative pl-8 border-l-2 border-primary/20">
                    <div className="absolute top-0 left-[-6px] w-2.5 h-2.5 rounded-full bg-primary" />
                    <div className="space-y-3">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <h3 className="text-xl font-bold">{exp.title}</h3>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-white/5 px-2 py-1 rounded">
                          {exp.startDate.split('-')[0]} — {exp.endDate ? exp.endDate.split('-')[0] : 'PRESENT'}
                        </span>
                      </div>
                      <p className="text-primary text-sm font-bold uppercase tracking-wider">{exp.company}</p>
                      {exp.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line opacity-80">
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
            <section className="space-y-8">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Academic Background</h2>
              <div className="space-y-10">
                {education.map((edu) => (
                  <div key={edu.id} className="relative pl-8 border-l-2 border-accent/20">
                    <div className="absolute top-0 left-[-6px] w-2.5 h-2.5 rounded-full bg-accent" />
                    <div className="space-y-2">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <h3 className="text-xl font-bold">{edu.institution}</h3>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-white/5 px-2 py-1 rounded">
                          {edu.startDate.split('-')[0]} — {edu.endDate ? edu.endDate.split('-')[0] : 'PRESENT'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-accent" />
                        <p className="text-sm font-bold text-foreground opacity-90">
                          {edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""}
                        </p>
                      </div>
                      {edu.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed opacity-70 italic border-l border-white/10 pl-4 py-1">
                          {edu.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <footer className="mt-24 pt-12 border-t border-border/50 text-center">
        <div className="flex items-center justify-center gap-3 opacity-30">
          <FolderCode className="w-5 h-5" />
          <span className="font-black text-xs uppercase tracking-[0.3em]">ProfileVault Core</span>
        </div>
      </footer>
    </div>
  );
}
