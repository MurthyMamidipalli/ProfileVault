
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
  LayoutDashboard, 
  Settings, 
  LogOut,
  Database,
  Files,
  FolderCode,
  Share2,
  Building2,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Package,
  Layers
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useProfileStore } from "@/lib/store";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

const NAV_ITEMS = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Personal Profile", href: "/dashboard/profile", icon: User },
  { name: "Education", href: "/dashboard/education", icon: GraduationCap },
  { name: "Projects & Products", href: "/dashboard/projects", icon: Layers },
  { name: "Experience", href: "/dashboard/experience", icon: Briefcase },
  { name: "Current Job", href: "/dashboard/job", icon: Building2 },
  { name: "Documents", href: "/dashboard/resumes", icon: Files },
  { name: "Portfolios & Links", href: "/dashboard/links", icon: LinkIcon },
  { name: "Public Share", href: "/dashboard/share", icon: Share2 },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  syncStatus?: 'synced' | 'syncing' | 'error';
}

function DashboardLayoutInner({ children, syncStatus = 'synced' }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const { profile } = useProfileStore();
  const { setOpen, isMobile, state, openMobile, setOpenMobile } = useSidebar();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Signed out", description: "Come back soon!" });
      router.push("/");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Logout Failed", description: error.message });
    }
  };

  const displayName = profile.fullName || "Vault Owner";

  const SIDEBAR_WIDTH_MOBILE = "18rem";

  return (
    <div className="flex min-h-screen w-full bg-background overflow-hidden">
      {isMobile ? (
        <Sheet open={openMobile} onOpenChange={setOpenMobile}>
          <SheetContent
            data-sidebar="sidebar"
            data-mobile="true"
            className="w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
              } as React.CSSProperties
            }
            side="left"
          >
            {/* Mobile Accessibility Fixed: Adding required Title and Description for screen readers */}
            <div className="sr-only">
              <SheetHeader>
                <SheetTitle>Navigation Menu</SheetTitle>
                <SheetDescription>Main navigation for the professional vault dashboard.</SheetDescription>
              </SheetHeader>
            </div>
            
            <div className="flex h-full w-full flex-col">
              <div className="h-20 flex items-center px-6 border-b border-border/50">
                <Link href="/dashboard" className="flex items-center gap-4" onClick={() => setOpenMobile(false)}>
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                    <Database className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <span className="font-headline font-bold text-xl tracking-tighter transition-all duration-300">
                    ProfileVault
                  </span>
                </Link>
              </div>
              <div className="flex-1 overflow-auto py-6 px-3">
                <nav className="flex flex-col gap-2">
                  {NAV_ITEMS.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setOpenMobile(false)}
                      className={cn(
                        "flex items-center gap-3 h-12 px-4 rounded-xl transition-smooth font-semibold",
                        pathname === item.href 
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                          : "hover:bg-primary/10 hover:text-primary"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </nav>
              </div>
              <div className="border-t border-border/50 p-4 flex flex-col gap-2">
                <Link
                  href="/dashboard/settings"
                  onClick={() => setOpenMobile(false)}
                  className={cn(
                    "flex items-center gap-3 h-11 px-4 transition-smooth rounded-xl font-semibold",
                    pathname === "/dashboard/settings" ? "bg-accent/10 text-accent" : "hover:bg-accent/10 hover:text-accent"
                  )}
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 h-11 px-4 text-destructive hover:bg-destructive/10 transition-smooth rounded-xl font-semibold w-full text-left"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      ) : (
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
      )}
      
      <SidebarInset className="relative">
        <header className="h-20 flex items-center justify-between px-8 border-b border-border/50 sticky top-0 z-40 bg-background/80 backdrop-blur-xl">
          <div className="flex items-center gap-6">
            <SidebarTrigger className="hover:bg-primary/10 hover:text-primary transition-smooth h-10 w-10" />
            <div className="h-8 w-px bg-border/50 hidden md:block" />
            <h2 className="font-headline font-black text-xl tracking-tight text-foreground hidden sm:block">
              {NAV_ITEMS.find(item => item.href === pathname)?.name || "Dashboard"}
            </h2>
          </div>
          <div className="flex items-center gap-6">
             <div className="hidden lg:flex flex-col items-end gap-1">
               <span className="text-sm font-bold text-foreground leading-none">{displayName}</span>
               <div className="flex items-center gap-1.5">
                 {syncStatus === 'synced' && (
                   <span className="text-[10px] text-accent font-bold uppercase tracking-wider flex items-center gap-1">
                     <CheckCircle2 className="w-3 h-3" /> Cloud Synced
                   </span>
                 )}
                 {syncStatus === 'syncing' && (
                   <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider flex items-center gap-1">
                     <RefreshCw className="w-3 h-3 animate-spin" /> Syncing...
                   </span>
                 )}
                 {syncStatus === 'error' && (
                   <span className="text-[10px] text-destructive font-bold uppercase tracking-wider flex items-center gap-1">
                     <AlertCircle className="w-3 h-3" /> Sync Error
                   </span>
                 )}
               </div>
             </div>
             <Link href="/dashboard/profile" className="transition-smooth hover:scale-110 active:scale-95">
               <Avatar className="w-10 h-10 border-2 border-primary/20 hover:border-primary transition-smooth shadow-lg">
                  {/* Fixed Header Avatar: Object-top prioritized to prevent hair clipping */}
                  <AvatarImage src={profile.avatarUrl} className="object-cover object-top" />
                  <AvatarFallback className="bg-primary/20 text-primary text-sm font-black">
                    {displayName.charAt(0)}
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

export function DashboardLayout({ children, syncStatus }: DashboardLayoutProps) {
  return (
    <SidebarProvider defaultOpen={false}>
      <DashboardLayoutInner syncStatus={syncStatus}>
        {children}
      </DashboardLayoutInner>
    </SidebarProvider>
  );
}
