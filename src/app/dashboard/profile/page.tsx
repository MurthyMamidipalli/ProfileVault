
"use client";

import React, { useEffect, useState, useRef } from "react";
import { useProfileStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Save, User, Mail, Phone, MapPin, Globe, Loader2, Cake, Users, Camera, Trash2, AlertCircle } from "lucide-react";

const MAX_FILE_SIZE = 1024 * 1024; // 1MB

export default function ProfilePage() {
  const { profile, setProfile, _hasHydrated } = useProfileStore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profile Updated",
      description: "Your personal details have been saved successfully.",
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ variant: "destructive", title: "Invalid File", description: "Please upload an image." });
        return;
      }
      
      if (file.size > MAX_FILE_SIZE) {
        toast({ 
          variant: "destructive", 
          title: "File Too Large", 
          description: "Please select an image smaller than 1MB to ensure smooth performance." 
        });
        return;
      }

      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          setProfile({ avatarUrl: event.target?.result as string });
          toast({ title: "Avatar Updated", description: "Your profile picture has been updated locally." });
        } catch (err) {
          toast({ 
            variant: "destructive", 
            title: "Storage Error", 
            description: "The image is still too large for local storage. Please try an even smaller image." 
          });
        } finally {
          setIsUploading(false);
        }
      };
      reader.onerror = () => {
        toast({ variant: "destructive", title: "Upload Failed", description: "Could not read the file." });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setProfile({ avatarUrl: '' });
    toast({ title: "Avatar Removed", description: "Profile picture has been cleared." });
  };

  if (!mounted || !_hasHydrated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-headline font-bold">Personal Profile</h1>
        <p className="text-muted-foreground">Manage your basic identity and contact information.</p>
      </div>

      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          <strong>Tip:</strong> Large images and documents are stored in memory and cleared on refresh unless you <strong>Sync</strong> them to the cloud in the <strong>Portfolio Link</strong> section.
        </p>
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
          <CardContent className="p-6 space-y-8">
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-border/50">
              <div className="relative group">
                <Avatar className="w-28 h-28 border-2 border-primary/20 shadow-xl group-hover:border-primary/50 transition-smooth">
                  <AvatarImage src={profile.avatarUrl} className="object-cover" />
                  <AvatarFallback className="bg-secondary text-secondary-foreground text-2xl font-bold">
                    {profile.name?.charAt(0) || <User className="w-10 h-10" />}
                  </AvatarFallback>
                </Avatar>
                {isUploading && (
                  <div className="absolute inset-0 bg-background/60 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                )}
              </div>
              <div className="space-y-3 text-center sm:text-left">
                <h4 className="font-bold">Profile Picture</h4>
                <p className="text-sm text-muted-foreground">Upload a professional headshot (Max 1MB).</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="image/*" 
                  />
                  <Button 
                    type="button" 
                    size="sm" 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Change Photo
                  </Button>
                  {profile.avatarUrl && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={removeAvatar}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <Label htmlFor="email">Primary Email Address</Label>
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
                <Label htmlFor="secondaryEmail">Secondary Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="secondaryEmail" 
                    type="email" 
                    placeholder="e.g. backup@example.com"
                    value={profile.secondaryEmail || ''} 
                    onChange={(e) => setProfile({ secondaryEmail: e.target.value })}
                    className="pl-10 bg-background/50" 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 w-4 h-4 text-muted-foreground z-10" />
                  <Select 
                    value={profile.gender || "Prefer not to say"} 
                    onValueChange={(value) => setProfile({ gender: value })}
                  >
                    <SelectTrigger className="pl-10 bg-background/50">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Non-binary">Non-binary</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                      <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <div className="relative">
                  <Cake className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="age" 
                    type="number"
                    placeholder="e.g. 25"
                    value={profile.age || ""} 
                    onChange={(e) => setProfile({ age: e.target.value })}
                    className="pl-10 bg-background/50" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Primary Phone Number</Label>
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
                <Label htmlFor="secondaryPhone">Secondary Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="secondaryPhone" 
                    placeholder="e.g. +1 (555) 000-0000"
                    value={profile.secondaryPhone || ''} 
                    onChange={(e) => setProfile({ secondaryPhone: e.target.value })}
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
