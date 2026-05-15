
"use client";

import React from "react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider, 
  SidebarTrigger,
  SidebarInset,
  useSidebar
} from "@/components/ui/sidebar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  User, 
  GraduationCap, 
  Briefcase, 
  Link as LinkIcon, 
  Sparkles, 
  LayoutDashboard, 
  Settings, 
  LogOut,
  Database,
  Files,
  FolderCode,
  Share2,
  Building2,
  CloudCheck,
  CloudOff
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useProfileStore } from "@/lib/store";

const NAV_ITEMS = [
  { name: "overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Personal profile", href: "/dashboard/profile", icon: User },
  { name: "Education", href: "/dashboard/education", icon: GraduationCap },
  { name: "Projects", href: "/dashboard/projects", icon: FolderCode },
  { name: "Experience", href: "/dashboard/experience", icon: Briefcase },
  { name: "Job", href: "/dashboard/job", icon: Building2 },
  { name: "Resumes", href: "/dashboard/resumes", icon: Files },
  { name: "Portfolios & Links", href: "/dashboard/links", icon: LinkIcon },
  { name: "Ai Summary", href: "/dashboard/ai-summary", icon: Sparkles },
  { name: "Portfolio Link", href: "/dashboard/share", icon: Share2 },
];

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const { profile } = useProfileStore();
  const { setOpen, isMobile, state } = useSidebar();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Signed out", description: "Come back soon!" });
      router.push("/");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Logout Failed", description: error.message });
    }
  };

  const isSynced = !!profile.lastSyncedAt;

  return (
    <div className="flex min-h-screen w-full bg-background overflow-hidden">
      <Sidebar 
        collapsible="icon" 
        className="border-r border-border/50 group-data-[state=collapsed]:hover:w-[16rem] transition-all duration-300 ease-in-out z-50"
        onMouseEnter={() => !isMobile && setOpen(true)}
        onMouseLeave={() => !isMobile && setOpen(false)}
      >
        <SidebarHeader className="h-20 flex items-center px-6 border-b border-border/50">
          <Link href="/dashboard" className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
              <Database className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className={cn(
              "font-headline font-bold text-xl tracking-tighter transition-all duration-300",
              state === "collapsed" ? "opacity-0 w-0 scale-95" : "opacity-100 scale-100"
            )}>
              ProfileVault
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent className="py-6 px-3">
          <SidebarMenu className="gap-2">
            {NAV_ITEMS.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton 
                  asChild 
                  isActive={pathname === item.href}
                  tooltip={item.name}
                  className={cn(
                    "transition-smooth h-12 px-4 rounded-xl",
                    pathname === item.href 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                      : "hover:bg-primary/10 hover:text-primary"
                  )}
                >
                  <Link href={item.href}>
                    <item.icon className="w-5 h-5" />
                    <span className="font-semibold">{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="border-t border-border/50 p-4">
          <SidebarMenu className="gap-2">
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={pathname === "/dashboard/settings"}
                tooltip="Settings"
                className={cn(
                  "h-11 px-4 transition-smooth rounded-xl",
                  pathname === "/dashboard/settings" ? "bg-accent/10 text-accent" : "hover:bg-accent/10 hover:text-accent"
                )}
              >
                <Link href="/dashboard/settings">
                  <Settings className="w-5 h-5" />
                  <span className="font-semibold">Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={handleLogout}
                className="h-11 px-4 text-destructive hover:bg-destructive/10 transition-smooth rounded-xl"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-semibold">Log out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="relative">
        <header className="h-20 flex items-center justify-between px-8 border-b border-border/50 sticky top-0 z-40 bg-background/80 backdrop-blur-xl">
          <div className="flex items-center gap-6">
            <SidebarTrigger className="hover:bg-primary/10 hover:text-primary transition-smooth h-10 w-10" />
            <div className="h-8 w-px bg-border/50 hidden md:block" />
            <h2 className="font-headline font-black text-xl tracking-tight text-foreground hidden sm:block">
              {NAV_ITEMS.find(item => item.href === pathname)?.name || 
               (pathname === "/dashboard/settings" ? "Settings" : "Dashboard")}
            </h2>
          </div>
          <div className="flex items-center gap-6">
             <div className="hidden lg:flex flex-col items-end gap-0.5">
               <span className="text-sm font-bold text-foreground leading-none">{profile.name || "New User"}</span>
               <div className="flex items-center gap-1.5">
                 {isSynced ? (
                   <span className="text-[10px] text-accent font-bold uppercase tracking-wider flex items-center gap-1">
                     <CloudCheck className="w-3 h-3" /> Vault Synced
                   </span>
                 ) : (
                   <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1">
                     <CloudOff className="w-3 h-3" /> Local Only
                   </span>
                 )}
               </div>
             </div>
             <Link href="/dashboard/profile" className="transition-smooth hover:scale-110 active:scale-95">
               <Avatar className="w-10 h-10 border-2 border-primary/20 hover:border-primary transition-smooth shadow-lg">
                  <AvatarImage src={profile.avatarUrl} className="object-cover" />
                  <AvatarFallback className="bg-primary/20 text-primary text-sm font-black">
                    {profile.name?.charAt(0) || "U"}
                  </AvatarFallback>
               </Avatar>
             </Link>
          </div>
        </header>
        <main className="flex-1 p-8 max-w-7xl mx-auto w-full animate-fade-in">
          {children}
        </main>
      </SidebarInset>
    </div>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={false}>
      <DashboardLayoutInner>
        {children}
      </DashboardLayoutInner>
    </SidebarProvider>
  );
}
