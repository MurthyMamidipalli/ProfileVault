
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
  FolderCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export default function PublicProfileView() {
  const { id } = useParams();
  const db = useFirestore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !db) return;

    const profileRef = doc(db, "shared-profiles", id as string);

    const unsubscribe = onSnapshot(profileRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setProfile(data.profileData as UserProfile);
        setLoading(false);
      } else {
        setError("This professional vault profile could not be found.");
        setLoading(false);
      }
    }, async (err) => {
      const permissionError = new FirestorePermissionError({
        path: profileRef.path,
        operation: 'get',
      });
      errorEmitter.emit('permission-error', permissionError);
      setError("Unable to connect to ProfileVault servers.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id, db]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 animate-pulse">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
        <p className="text-muted-foreground font-bold tracking-widest text-xs uppercase animate-pulse">Accessing Vault Data</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="p-6 bg-destructive/10 rounded-3xl border border-destructive/20 shadow-2xl">
          <UserIcon className="w-12 h-12 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tighter">Vault Entry Denied</h1>
          <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
            {error || "This profile may have been removed or the link is expired."}
          </p>
        </div>
        <Button asChild size="lg" variant="outline" className="font-bold">
          <a href="/">Back to ProfileVault</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 selection:bg-primary selection:text-primary-foreground">
      {/* Dynamic Header */}
      <div className="relative h-72 md:h-96 bg-gradient-to-br from-primary/30 via-background to-accent/20 border-b border-border/50">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/vault-bg/1200/400')] bg-cover bg-center opacity-10 grayscale mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        
        <div className="max-w-5xl mx-auto px-6 h-full flex items-end pb-12 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end gap-8 w-full">
            <div className="relative shrink-0">
              <div className="w-32 h-32 md:w-44 md:h-44 rounded-3xl bg-card border-4 border-background shadow-2xl flex items-center justify-center overflow-hidden">
                <UserIcon className="w-16 h-16 md:w-24 md:h-24 text-primary/40" />
              </div>
              <Badge className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground px-4 py-1.5 text-xs font-black border-4 border-background shadow-xl">
                VERIFIED
              </Badge>
            </div>
            <div className="space-y-4 pb-2">
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter drop-shadow-sm">{profile.name}</h1>
              <div className="flex flex-wrap gap-y-3 gap-x-8 text-muted-foreground font-semibold">
                {profile.address && (
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" /> {profile.address}
                  </span>
                )}
                {profile.gender && profile.age && (
                  <span className="flex items-center gap-2 uppercase tracking-[0.2em] text-[10px] bg-white/5 px-3 py-1 rounded-full border border-white/5">
                    {profile.gender} • {profile.age} Years
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-16 mt-16">
        {/* Profile Sidebar */}
        <div className="lg:col-span-1 space-y-12">
          <section className="space-y-6">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary/80">Contact Information</h2>
            <Card className="glass-card border-primary/10 shadow-xl">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-4 text-sm group">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-smooth shadow-inner">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">Email</p>
                    <p className="font-bold truncate text-base">{profile.email}</p>
                  </div>
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-4 text-sm group">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-smooth shadow-inner">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">Direct</p>
                      <p className="font-bold truncate text-base">{profile.phone}</p>
                    </div>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center gap-4 text-sm group">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-smooth shadow-inner">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">Digital Hub</p>
                      <a href={profile.website} target="_blank" rel="noopener" className="font-bold truncate text-base text-primary hover:underline">
                        {profile.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          <section className="space-y-6">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary/80">Social Footprint</h2>
            <div className="grid grid-cols-1 gap-4">
              {profile.portfolioLinks.map((link) => (
                <a 
                  key={link.id} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener"
                  className="group flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/50 hover:bg-primary/10 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-lg bg-white/5 text-muted-foreground group-hover:text-primary transition-colors">
                      <LinkIcon className="w-5 h-5" />
                    </div>
                    <span className="font-black text-sm uppercase tracking-wider">{link.platform}</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </a>
              ))}
              {profile.portfolioLinks.length === 0 && (
                <p className="text-xs text-muted-foreground italic pl-2">No additional links provided.</p>
              )}
            </div>
          </section>

          {profile.resumes && profile.resumes.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary/80">Available Records</h2>
              <div className="space-y-4">
                {profile.resumes.map((res) => (
                  <Button key={res.id} asChild variant="outline" className="w-full justify-start h-12 bg-white/5 border-white/10 hover:bg-white/10 font-bold">
                    <a href={res.url} target="_blank" rel="noopener">
                      <LinkIcon className="w-4 h-4 mr-3 text-primary" />
                      {res.name}
                    </a>
                  </Button>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-2 space-y-16">
          {profile.bio && (
            <section className="space-y-8">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary/80">Executive Summary</h2>
              <p className="text-2xl md:text-3xl font-medium leading-relaxed text-foreground/90 italic font-serif">
                "{profile.bio}"
              </p>
            </section>
          )}

          <Separator className="bg-border/30" />

          {/* Projects Section */}
          {profile.projects && profile.projects.length > 0 && (
            <section className="space-y-12">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary/80">Featured Work</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {profile.projects.map((proj) => (
                  <Card key={proj.id} className="glass-card border-none bg-white/[0.03] overflow-hidden group hover:bg-white/[0.05] transition-smooth">
                    {proj.imageUrl && (
                      <div className="relative h-48 w-full border-b border-white/5">
                        <Image src={proj.imageUrl} alt={proj.title} fill className="object-cover group-hover:scale-105 transition-smooth" />
                      </div>
                    )}
                    <CardHeader className="p-6">
                      <div className="flex items-center justify-between gap-2 mb-2">
                         <h3 className="text-xl font-black tracking-tight">{proj.title}</h3>
                         {proj.url && (
                           <a href={proj.url} target="_blank" rel="noopener" className="text-primary hover:text-accent transition-colors">
                             <ExternalLink className="w-5 h-5" />
                           </a>
                         )}
                      </div>
                      {proj.date && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold mb-4">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(proj.date).getFullYear()}</span>
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                        {proj.description}
                      </p>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </section>
          )}

          <Separator className="bg-border/30" />

          {profile.experience && profile.experience.length > 0 && (
            <section className="space-y-12">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary/80">Professional Timeline</h2>
              <div className="space-y-16">
                {profile.experience.map((exp) => (
                  <div key={exp.id} className="relative pl-10 border-l-2 border-primary/20">
                    <div className="absolute top-0 left-[-11px] w-5 h-5 rounded-full bg-primary border-4 border-background shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <h3 className="text-3xl font-black tracking-tight">{exp.title}</h3>
                          <Badge variant="secondary" className="w-fit bg-primary/10 text-primary border-none font-black tracking-widest text-[10px]">
                            {exp.startDate} — {exp.endDate || 'PRESENT'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xl font-bold text-primary">
                          <span>{exp.company}</span>
                          {exp.location && (
                            <span className="text-muted-foreground font-medium text-sm">• {exp.location}</span>
                          )}
                        </div>
                      </div>
                      
                      {exp.description && (
                        <p className="text-muted-foreground leading-relaxed text-lg font-medium whitespace-pre-line">
                          {exp.description}
                        </p>
                      )}

                      {exp.projectLinks && exp.projectLinks.length > 0 && (
                        <div className="flex flex-wrap gap-3 pt-2">
                          {exp.projectLinks.map(link => (
                            <Badge key={link.id} variant="outline" className="px-4 py-1.5 bg-white/5 text-primary border-primary/20 hover:bg-primary hover:text-primary-foreground transition-smooth cursor-pointer">
                              <a href={link.url} target="_blank" rel="noopener" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                                {link.name} <ExternalLink className="w-3 h-3" />
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

          {profile.education && profile.education.length > 0 && (
            <section className="space-y-12 pt-8">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary/80">Academic Credentials</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {profile.education.map((edu) => (
                  <Card key={edu.id} className="glass-card border-none bg-white/[0.03] shadow-lg hover:bg-white/[0.05] transition-smooth group">
                    <CardHeader className="pb-4 flex flex-row items-center gap-5">
                      <div className="p-4 bg-primary/10 rounded-2xl text-primary shrink-0 group-hover:scale-110 transition-smooth">
                        <GraduationCap className="w-7 h-7" />
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-xl font-black">{edu.degree}</CardTitle>
                        <p className="text-sm text-muted-foreground font-bold">{edu.institution}</p>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-primary uppercase mb-4">
                        <Calendar className="w-3 h-3" />
                        {edu.startDate.split('-')[0]} — {edu.endDate ? edu.endDate.split('-')[0] : 'PRESENT'}
                      </div>
                      {edu.description && (
                        <p className="text-sm text-muted-foreground mt-4 italic leading-relaxed font-medium pl-4 border-l-2 border-primary/20">
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

      <footer className="mt-32 py-20 border-t border-border/50 text-center space-y-8 bg-white/[0.01]">
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs font-black uppercase tracking-[0.4em]">Verified Vault Signature</p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <FolderCode className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-headline font-black text-3xl tracking-tighter">
              Profile<span className="text-primary">Vault</span>
            </span>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-widest">
          &copy; 2024 ProfileVault Inc. Cloud Identity Infrastructure.
        </p>
      </footer>
    </div>
  );
}
