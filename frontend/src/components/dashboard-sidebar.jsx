// Updated src/components/dashboard-sidebar.jsx
"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/components/auth-provider";
import {
  BookOpen,
  GraduationCap,
  Layout,
  Award,
  Settings,
  BarChart,
  Users,
  PlusCircle,
  FileText,
  Home,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  User,
  Heart,
  Wallet,
  LogOut,
  LayoutDashboard,
  PanelLeft,
  Wrench
} from "lucide-react";

export function DashboardSidebar({ className }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Load collapse state from localStorage on client side
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    if (savedState !== null) {
      setIsCollapsed(savedState === "true");
    }
  }, []);
  
  // Save collapse state to localStorage
  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", String(newState));
  };

  const isCreator = user?.role === "creator";
  const isAdmin = user?.role === "admin";

  const studentNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      active: pathname === "/dashboard"
    },
    {
      title: "My Courses",
      href: "/dashboard/courses",
      icon: <BookOpen className="h-5 w-5" />,
      active: pathname.startsWith("/dashboard/courses")
    },
    {
      title: "Browse Courses",
      href: "/courses",
      icon: <GraduationCap className="h-5 w-5" />,
      active: pathname === "/courses" && !pathname.includes("/dashboard")
    },
    {
      title: "Certificates",
      href: "/dashboard/certificates",
      icon: <Award className="h-5 w-5" />,
      active: pathname === "/dashboard/certificates"
    },
    {
      title: "Wishlist",
      href: "/dashboard/wishlist",
      icon: <Heart className="h-5 w-5" />,
      active: pathname === "/dashboard/wishlist"
    }
  ];

  const creatorNavItems = [
    {
      title: "Creator Dashboard",
      href: "/creator/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      active: pathname === "/creator/dashboard"
    },
    {
      title: "My Courses",
      href: "/creator/courses",
      icon: <FolderOpen className="h-5 w-5" />,
      active: pathname.startsWith("/creator/courses") && pathname !== "/creator/courses/new"
    },
    {
      title: "Create Course",
      href: "/creator/courses/new",
      icon: <PlusCircle className="h-5 w-5" />,
      active: pathname === "/creator/courses/new"
    },
    {
      title: "Analytics",
      href: "/creator/analytics",
      icon: <BarChart className="h-5 w-5" />,
      active: pathname === "/creator/analytics"
    },
    {
      title: "Earnings",
      href: "/creator/earnings",
      icon: <Wallet className="h-5 w-5" />,
      active: pathname === "/creator/earnings"
    },
    {
      title: "Creator Tools",
      href: "/creator/tools",
      icon: <Wrench className="h-5 w-5" />,
      active: pathname === "/creator/tools"
    }
  ];

  const adminNavItems = [
    {
      title: "Admin Dashboard",
      href: "/admin/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      active: pathname === "/admin/dashboard"
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: <Users className="h-5 w-5" />,
      active: pathname === "/admin/users" || pathname.startsWith("/admin/users/")
    },
    {
      title: "Courses",
      href: "/admin/courses",
      icon: <BookOpen className="h-5 w-5" />,
      active: pathname === "/admin/courses" || pathname.startsWith("/admin/courses/")
    },
    {
      title: "Reports",
      href: "/admin/reports",
      icon: <FileText className="h-5 w-5" />,
      active: pathname === "/admin/reports"
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
      active: pathname === "/admin/settings"
    }
  ];

  const commonNavItems = [
    {
      title: "Profile",
      href: "/profile",
      icon: <User className="h-5 w-5" />,
      active: pathname === "/profile"
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
      active: pathname === "/settings"
    },
    {
      title: "Home",
      href: "/",
      icon: <Home className="h-5 w-5" />,
      active: pathname === "/"
    }
  ];

  // Determine which nav items to show based on user role
  let navItems = [...studentNavItems, ...commonNavItems];
  
  if (isCreator) {
    navItems = [...creatorNavItems, ...commonNavItems];
  } else if (isAdmin) {
    navItems = [...adminNavItems, ...commonNavItems];
  }

  return (
    <div 
      className={cn(
        "border-r bg-background h-screen transition-all duration-300",
        isCollapsed ? "w-[70px]" : "w-64",
        className
      )}
    >
      <div className="space-y-4 py-4 h-full flex flex-col">
        <div className="px-3 py-2">
          <Button 
            variant="outline" 
            size="sm" 
            className={cn(
              "w-full justify-center",
              !isCollapsed && "justify-between"
            )}
            onClick={toggleCollapse}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <span>Collapse</span>
                <ChevronLeft className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
        
        <ScrollArea className="flex-1 px-3">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center py-2 px-3 text-sm font-medium rounded-md transition-colors",
                  item.active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  isCollapsed ? "justify-center" : ""
                )}
              >
                {item.icon}
                {!isCollapsed && <span className="ml-3">{item.title}</span>}
              </Link>
            ))}
          </div>
        </ScrollArea>
        
        <div className="border-t mt-auto px-3 py-4">
          <Button 
            variant="ghost" 
            className={cn(
              "w-full flex items-center text-sm font-medium",
              isCollapsed ? "justify-center" : "justify-start"
            )}
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span className="ml-3">Logout</span>}
          </Button>
        </div>
      </div>
    </div>
  );
}