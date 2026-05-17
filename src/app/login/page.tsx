
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useAuth, useUser } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Database, LogIn, Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { user, loading } = useUser();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    
    // Mobile resilience: trim whitespace and lowercase email
    const cleanEmail = email.trim().toLowerCase();
    
    try {
      await signInWithEmailAndPassword(auth, cleanEmail, password);
      toast({ title: "Welcome back!", description: "Opening your professional vault." });
      router.push("/dashboard");
    } catch (error: any) {
      // We skip console.error to avoid triggering the white dev error overlay on mobile
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "The email or password you entered is incorrect. Please try again.",
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md glass-card border-primary/20 relative z-10 overflow-hidden shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Database className="w-7 h-7 text-primary-foreground" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-headline font-black tracking-tight">Log In</CardTitle>
            <CardDescription className="font-medium text-muted-foreground">Access your verified identity vault</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-background/50 h-11" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Security Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-background/50 pr-10 h-11" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button 
              type="submit"
              className="w-full h-12 font-black uppercase tracking-widest text-xs shadow-xl hover:translate-y-[-1px] transition-all"
              disabled={isAuthenticating}
            >
              {isAuthenticating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <LogIn className="w-4 h-4 mr-2" />}
              Open Vault
            </Button>
          </form>
          
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/50"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-4 text-muted-foreground font-black tracking-widest">New Identity?</span></div>
          </div>
          
          <p className="text-center text-sm text-muted-foreground">
            Don't have a vault yet?{" "}
            <Link href="/signup" className="text-primary hover:underline font-black">
              Create Account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
