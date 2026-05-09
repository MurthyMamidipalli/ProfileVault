
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
  User as UserIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

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
        setProfile(snapshot.data().profileData as UserProfile);
        setLoading(false);
      } else {
        setError("Profile not found.");
        setLoading(false);
      }
    }, async (err) => {
      const permissionError = new FirestorePermissionError({
        path: profileRef.path,
        operation: 'get',
      });
      errorEmitter.emit('permission-error', permissionError);
      setError("Failed to load profile.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id, db]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium animate-pulse">Retrieving vault data...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="p-4 bg-destructive/10 rounded-full border border-destructive/20">
          <UserIcon className="w-12 h-12 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Profile Unavailable</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            {error || "This profile may have been removed or the link is incorrect."}
          </p>
        </div>
        <Button asChild>
          <a href="/">Back to ProfileVault</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 selection:bg-primary selection:text-primary-foreground">
      {/* Hero Header */}
      <div className="relative h-64 md:h-80 bg-gradient-to-br from-primary/20 via-background to-accent/10 border-b border-border/50">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/vault-bg/1200/400')] bg-cover bg-center opacity-10 grayscale mix-blend-overlay" />
        <div className="max-w-5xl mx-auto px-6 h-full flex items-end pb-12">
          <div className="flex flex-col md:flex-row md:items-end gap-8 w-full">
            <div className="relative shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-card border-4 border-background shadow-2xl flex items-center justify-center overflow-hidden">
                <UserIcon className="w-16 h-16 md:w-20 md:h-20 text-primary/40" />
              </div>
              <Badge className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold border-2 border-background">
                VERIFIED
              </Badge>
            </div>
            <div className="space-y-3 pb-2">
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter">{profile.name}</h1>
              <div className="flex flex-wrap gap-y-2 gap-x-6 text-muted-foreground font-medium">
                {profile.address && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary" /> {profile.address}
                  </span>
                )}
                {profile.gender && profile.age && (
                  <span className="flex items-center gap-1.5 uppercase tracking-widest text-xs opacity-80">
                    {profile.gender} • {profile.age} Years Old
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
        {/* Left Column: Details & Links */}
        <div className="lg:col-span-1 space-y-8">
          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Contact Details</h2>
            <Card className="glass-card">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-4 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-primary shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium truncate">{profile.email}</p>
                  </div>
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-4 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-primary shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="font-medium truncate">{profile.phone}</p>
                    </div>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center gap-4 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-primary shrink-0">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">Website</p>
                      <a href={profile.website} target="_blank" rel="noopener" className="font-medium truncate text-primary hover:underline">
                        {profile.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Portfolio & Socials</h2>
            <div className="grid grid-cols-1 gap-3">
              {profile.portfolioLinks.map((link) => (
                <a 
                  key={link.id} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener"
                  className="group flex items-center justify-between p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/5 text-muted-foreground group-hover:text-primary transition-colors">
                      <LinkIcon className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm">{link.platform}</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary" />
                </a>
              ))}
            </div>
          </section>

          {profile.resumes && profile.resumes.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Active Documents</h2>
              <div className="space-y-3">
                {profile.resumes.map((res) => (
                  <Button key={res.id} asChild variant="outline" className="w-full justify-start bg-white/5 hover:bg-white/10">
                    <a href={res.url} target="_blank" rel="noopener">
                      <LinkIcon className="w-4 h-4 mr-2" />
                      {res.name}
                    </a>
                  </Button>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Bio, Exp, Edu */}
        <div className="lg:col-span-2 space-y-12">
          {profile.bio && (
            <section className="space-y-6">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary">About</h2>
              <p className="text-xl md:text-2xl font-medium leading-relaxed text-foreground/90">
                "{profile.bio}"
              </p>
            </section>
          )}

          <Separator className="bg-border/50" />

          {profile.experience && profile.experience.length > 0 && (
            <section className="space-y-8">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Professional Journey</h2>
              <div className="space-y-12">
                {profile.experience.map((exp) => (
                  <div key={exp.id} className="relative pl-8 border-l-2 border-primary/20">
                    <div className="absolute top-0 left-[-9px] w-4 h-4 rounded-full bg-primary border-4 border-background" />
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <h3 className="text-2xl font-bold">{exp.title}</h3>
                        <div className="flex items-center gap-2 text-primary font-bold">
                          <span>{exp.company}</span>
                          {exp.location && (
                            <span className="text-muted-foreground font-normal">• {exp.location}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {exp.startDate} — {exp.endDate || 'Present'}
                        </div>
                      </div>
                      
                      {exp.description && (
                        <p className="text-muted-foreground leading-relaxed">
                          {exp.description}
                        </p>
                      )}

                      {exp.projectLinks && exp.projectLinks.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {exp.projectLinks.map(link => (
                            <Badge key={link.id} variant="secondary" className="bg-primary/10 text-primary border-transparent hover:bg-primary/20">
                              <a href={link.url} target="_blank" rel="noopener" className="flex items-center gap-1.5">
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
            <section className="space-y-8 pt-4">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Academic Background</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile.education.map((edu) => (
                  <Card key={edu.id} className="glass-card border-none bg-white/5">
                    <CardHeader className="pb-2 flex flex-row items-center gap-4">
                      <div className="p-3 bg-primary/20 rounded-xl text-primary shrink-0">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{edu.degree}</CardTitle>
                        <p className="text-sm text-muted-foreground font-medium">{edu.institution}</p>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <p className="text-xs text-primary font-bold tracking-widest uppercase">
                        {edu.startDate.split('-')[0]} — {edu.endDate ? edu.endDate.split('-')[0] : 'PRESENT'}
                      </p>
                      {edu.description && (
                        <p className="text-sm text-muted-foreground mt-3 italic leading-relaxed">
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

      <footer className="mt-20 py-12 border-t border-border/50 text-center space-y-4 bg-white/[0.02]">
        <p className="text-muted-foreground text-sm font-medium">Verified professional identity hosted on</p>
        <div className="flex items-center justify-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-headline font-black text-xl tracking-tighter">
            Profile<span className="text-primary">Vault</span>
          </span>
        </div>
        <p className="text-xs text-muted-foreground/50">Copyright &copy; 2024 ProfileVault Inc. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
