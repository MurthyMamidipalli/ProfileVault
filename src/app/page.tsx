
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Vault, ChevronRight, User, Shield, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-12">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full" />
        <div className="relative space-y-4">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/20 animate-bounce">
            <Vault className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-5xl md:text-7xl font-headline font-black tracking-tighter">
            Profile<span className="text-primary">Vault</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed">
            The ultimate professional ERP dashboard for managing your identity, achievements, and professional digital presence.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl w-full">
        {[
          { title: "Personal ERP", icon: User, desc: "Centralized identity management" },
          { title: "AI-Powered", icon: Zap, desc: "Smart summaries and bios" },
          { title: "Secure Vault", icon: Shield, desc: "Private professional data" }
        ].map(feature => (
          <div key={feature.title} className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center gap-3">
            <feature.icon className="w-8 h-8 text-accent" />
            <h3 className="font-bold">{feature.title}</h3>
            <p className="text-xs text-muted-foreground">{feature.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild size="lg" className="h-14 px-10 text-lg font-bold group">
          <Link href="/dashboard">
            Enter Dashboard
            <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-smooth" />
          </Link>
        </Button>
        <Button variant="outline" size="lg" className="h-14 px-10 text-lg font-bold">
          Learn More
        </Button>
      </div>

      <footer className="pt-12 text-sm text-muted-foreground">
        &copy; 2024 ProfileVault Inc. Professional Identity Solutions.
      </footer>
    </div>
  );
}
