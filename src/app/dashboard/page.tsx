
"use client";

import { useProfileStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";

export default function DashboardOverview() {
  const { profile } = useProfileStore();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="p-4 bg-primary/10 rounded-full border border-primary/20">
        <User className="w-12 h-12 text-primary" />
      </div>
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-headline font-bold tracking-tight">
          Welcome, <span className="text-primary">{profile.name}</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          It's great to see you back in your ProfileVault.
        </p>
      </div>
      
      <Card className="glass-card max-w-md w-full border-primary/20">
        <CardContent className="p-6 text-center italic text-muted-foreground leading-relaxed">
          "Your professional journey is unique. Use the sidebar to manage your identity and achievements."
        </CardContent>
      </Card>
    </div>
  );
}
