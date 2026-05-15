
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { useAuth, useUser } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Database, LogIn, Loader2, Mail, Lock, Eye, EyeOff, AlertTriangle, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { firebaseConfig } from "@/firebase/config";

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { user, loading } = useUser();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const isConfigMissing = !firebaseConfig.apiKey || firebaseConfig.apiKey === "PLACEHOLDER";

  useEffect(() => {
    if (user && !loading) {
      console.log(`[Auth] User already logged in (UID: ${user.uid}), redirecting to dashboard.`);
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isConfigMissing) {
      toast({
        variant: "destructive",
        title: "Setup Incomplete",
        description: "Firebase project is not yet configured.",
      });
      return;
    }

    setIsAuthenticating(true);
    console.log(`[Auth] Attempting LOGIN for: ${email}`);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log(`[Auth] LOGIN SUCCESS: ${userCredential.user.uid}`);
      toast({ title: "Welcome back!", description: "Accessing your professional vault." });
      router.push("/dashboard");
    } catch (error: any) {
      console.error(`[Auth] LOGIN ERROR:`, error);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "Incorrect email or password.",
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;

    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast({
        title: "Reset Email Sent",
        description: "Check your inbox for instructions.",
      });
      setIsResetDialogOpen(false);
      setResetEmail("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Reset Failed",
        description: error.message,
      });
    } finally {
      setIsResetting(false);
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
      <Card className="w-full max-w-md glass-card border-primary/20 relative z-10 overflow-hidden">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Database className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-headline font-bold">Log In</CardTitle>
            <CardDescription>Access your secure Professional Vault</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/50" 
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button 
                  type="button" 
                  onClick={() => setIsResetDialogOpen(true)}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background/50 pr-10" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button 
              type="submit"
              className="w-full h-11 font-bold"
              disabled={isAuthenticating}
            >
              {isAuthenticating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <LogIn className="w-4 h-4 mr-2" />}
              Sign In
            </Button>
          </form>
          
          <div className="relative my-6 text-center">
            <span className="text-xs text-muted-foreground uppercase tracking-widest">or</span>
          </div>
          
          <p className="text-center text-sm text-muted-foreground">
            New to ProfileVault?{" "}
            <Link href="/signup" className="text-primary hover:underline font-bold">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>

      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>We'll send a link to your email.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordReset} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input required type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} />
            </div>
            <Button type="submit" disabled={isResetting} className="w-full">
              {isResetting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <KeyRound className="w-4 h-4 mr-2" />}
              Send Reset Link
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
