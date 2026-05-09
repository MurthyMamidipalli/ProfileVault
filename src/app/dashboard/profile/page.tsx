
"use client";

import { useProfileStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, User, Mail, Phone, MapPin, Globe } from "lucide-react";

export default function ProfilePage() {
  const { profile, setProfile } = useProfileStore();
  const { toast } = useToast();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profile Updated",
      description: "Your personal details have been saved successfully.",
    });
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-headline font-bold">Personal Profile</h1>
        <p className="text-muted-foreground">Manage your basic identity and contact information.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="glass-card overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-white/5">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Identity Details
            </CardTitle>
            <CardDescription>How you appear in your professional network</CardDescription>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={profile.name} 
                onChange={(e) => setProfile({ name: e.target.value })}
                className="bg-background/50" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  value={profile.email} 
                  onChange={(e) => setProfile({ email: e.target.value })}
                  className="pl-10 bg-background/50" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="phone" 
                  value={profile.phone} 
                  onChange={(e) => setProfile({ phone: e.target.value })}
                  className="pl-10 bg-background/50" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Personal Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="website" 
                  placeholder="https://yourportfolio.com" 
                  value={profile.website} 
                  onChange={(e) => setProfile({ website: e.target.value })}
                  className="pl-10 bg-background/50" 
                />
              </div>
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="address">Full Address / Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="address" 
                  value={profile.address} 
                  onChange={(e) => setProfile({ address: e.target.value })}
                  className="pl-10 bg-background/50" 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="border-b border-border/50 bg-white/5">
            <CardTitle className="text-lg">About You</CardTitle>
            <CardDescription>A brief personal biography or mission statement</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-2">
              <Label htmlFor="bio">Biography</Label>
              <Textarea 
                id="bio" 
                rows={5} 
                placeholder="Write a little bit about your professional journey..." 
                value={profile.bio} 
                onChange={(e) => setProfile({ bio: e.target.value })}
                className="bg-background/50 resize-none"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" className="px-8 flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
