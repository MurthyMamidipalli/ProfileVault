
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useProfileStore } from "@/lib/store";
import { 
  User, 
  GraduationCap, 
  Briefcase, 
  Link as LinkIcon, 
  ChevronRight,
  TrendingUp,
  Mail,
  Phone,
  MapPin
} from "lucide-react";
import Link from "next/link";

export default function DashboardOverview() {
  const { profile } = useProfileStore();

  const completionPercent = 75; // Mock calculation

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-headline font-bold">Profile Overview</h1>
        <p className="text-muted-foreground">Keep your professional identity up to date across all sections.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold">Profile Strength</CardTitle>
              <CardDescription>Overall completeness of your ProfileVault</CardDescription>
            </div>
            <div className="p-3 bg-accent/20 rounded-xl">
              <TrendingUp className="w-6 h-6 text-accent" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">75% Completed</span>
              <span className="text-xs text-accent font-semibold px-2 py-0.5 bg-accent/10 rounded-full">Good</span>
            </div>
            <Progress value={completionPercent} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              Add your <Link href="/dashboard/ai-summary" className="text-primary hover:underline">AI Professional Summary</Link> to reach 100%.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Quick Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Mail className="w-4 h-4" />
              </div>
              <span className="text-sm truncate">{profile.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Phone className="w-4 h-4" />
              </div>
              <span className="text-sm">{profile.phone}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="text-sm">{profile.address}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Education", count: profile.education.length, icon: GraduationCap, href: "/dashboard/education" },
          { label: "Experience", count: profile.experience.length, icon: Briefcase, href: "/dashboard/experience" },
          { label: "Links", count: profile.portfolioLinks.length, icon: LinkIcon, href: "/dashboard/links" },
          { label: "Details", count: "Verified", icon: User, href: "/dashboard/profile" },
        ].map((stat) => (
          <Link href={stat.href} key={stat.label}>
            <Card className="glass-card hover:border-primary/50 transition-smooth group cursor-pointer">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="p-3 bg-secondary rounded-xl group-hover:scale-110 transition-smooth">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.count}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Experience</CardTitle>
            <Link href="/dashboard/experience" className="text-xs text-primary hover:underline flex items-center">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.experience.slice(0, 2).map((exp) => (
              <div key={exp.id} className="flex gap-4 p-3 rounded-lg hover:bg-white/5 transition-smooth">
                <div className="w-10 h-10 rounded bg-accent/20 flex items-center justify-center text-accent shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{exp.title}</h4>
                  <p className="text-xs text-muted-foreground">{exp.company} • {exp.startDate} - {exp.endDate || 'Present'}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Latest Education</CardTitle>
            <Link href="/dashboard/education" className="text-xs text-primary hover:underline flex items-center">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.education.slice(0, 2).map((edu) => (
              <div key={edu.id} className="flex gap-4 p-3 rounded-lg hover:bg-white/5 transition-smooth">
                <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center text-primary shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{edu.degree}</h4>
                  <p className="text-xs text-muted-foreground">{edu.institution} • {edu.startDate} - {edu.endDate || 'Present'}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
