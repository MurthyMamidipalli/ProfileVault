
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useAuth, useUser } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Vault, LogIn, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { user, loading } = useUser();
  const { toast } = useToast();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast({ title: "Welcome back!", description: "Successfully signed in." });
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign In Failed",
        description: error.message || "Could not authenticate with Google.",
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
      <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      
      <Card className="w-full max-w-md glass-card border-primary/20 relative z-10 overflow-hidden">
        <div className="absolute top-0 right-0 p-8 -mr-4 -mt-4 bg-primary/10 rounded-full blur-2xl" />
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Vault className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-headline font-bold">Sign In</CardTitle>
            <CardDescription>Access your secure Professional Vault</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            variant="outline" 
            className="w-full h-12 text-base font-bold flex items-center justify-center gap-3 bg-white/5 border-border hover:bg-white/10"
            onClick={handleGoogleSignIn}
            disabled={isAuthenticating}
          >
            {isAuthenticating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Continue with Google
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/50"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or</span></div>
          </div>
          
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline font-bold">
              Sign up
            </Link>
          </p>
        </CardContent>
        <CardFooter className="bg-white/5 p-4 flex justify-center">
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            <LogIn className="w-3 h-3" /> Back to Home
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
