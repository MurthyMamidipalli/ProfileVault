
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
  SidebarInset
} from "@/components/ui/sidebar";
import { 
  User, 
  GraduationCap, 
  Briefcase, 
  Link as LinkIcon, 
  Sparkles, 
  LayoutDashboard, 
  Settings, 
  LogOut,
  Vault,
  Files,
  Share2,
  FolderCode
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Personal Profile", href: "/dashboard/profile", icon: User },
  { name: "Resumes", href: "/dashboard/resumes", icon: Files },
  { name: "Projects", href: "/dashboard/projects", icon: FolderCode },
  { name: "Education", href: "/dashboard/education", icon: GraduationCap },
  { name: "Experience", href: "/dashboard/experience", icon: Briefcase },
  { name: "Portfolio & Links", href: "/dashboard/links", icon: LinkIcon },
  { name: "AI Summary", href: "/dashboard/ai-summary", icon: Sparkles },
  { name: "Share & Public Profile", href: "/dashboard/share", icon: Share2 },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar collapsible="icon" className="border-r border-border/50">
          <SidebarHeader className="h-16 flex items-center px-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Vault className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-headline font-bold text-lg tracking-tight group-data-[collapsible=icon]:hidden">
                ProfileVault
              </span>
            </div>
          </SidebarHeader>
          <SidebarContent className="py-4">
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.href}
                    tooltip={item.name}
                    className={cn(
                      "transition-smooth h-11 px-4",
                      pathname === item.href ? "bg-primary/10 text-primary" : "hover:bg-accent/10 hover:text-accent"
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t border-border/50 p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="h-10 px-4 transition-smooth">
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="h-10 px-4 text-destructive hover:bg-destructive/10 transition-smooth">
                  <LogOut className="w-5 h-5" />
                  <span>Log out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="h-16 flex items-center justify-between px-6 border-b border-border/50 sticky top-0 z-10 bg-background/80 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="h-6 w-px bg-border/50" />
              <h2 className="font-headline font-semibold text-foreground">
                {NAV_ITEMS.find(item => item.href === pathname)?.name || "Dashboard"}
              </h2>
            </div>
            <div className="flex items-center gap-4">
               <div className="text-sm font-medium text-muted-foreground hidden sm:block">
                 Welcome back
               </div>
               <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border border-border">
                 <User className="w-4 h-4 text-primary" />
               </div>
            </div>
          </header>
          <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
