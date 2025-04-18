// frontend/src/components/dashboard-sidebar.jsx
import { useState } from "react";
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
  FolderOpen
} from "lucide-react";

export function DashboardSidebar({ className }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isCreator = user?.role === "creator";
  const isAdmin = user?.role === "admin";

  const studentNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <Layout className="h-5 w-5" />,
      active: pathname === "/dashboard"
    },
    {
      title: "My Courses",
      href: "/dashboard/courses",
      icon: <BookOpen className="h-5 w-5" />,
      active: pathname === "/dashboard/courses" || pathname.startsWith("/dashboard/courses/")
    },
    {
      title: "Certificates",
      href: "/dashboard/certificates",
      icon: <Award className="h-5 w-5" />,
      active: pathname === "/dashboard/certificates"
    }
  ];

  const creatorNavItems = [
    {
      title: "Creator Dashboard",
      href: "/creator/dashboard",
      icon: <BarChart className="h-5 w-5" />,
      active: pathname === "/creator/dashboard"
    },
    {
      title: "My Courses",
      href: "/creator/courses",
      icon: <FolderOpen className="h-5 w-5" />,
      active: pathname === "/creator/courses" && !pathname.includes("/new")
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
    }
  ];

  const adminNavItems = [
    {
      title: "Admin Dashboard",
      href: "/admin/dashboard",
      icon: <BarChart className="h-5 w-5" />,
      active: pathname === "/admin/dashboard"
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: <Users className="h-5 w-5" />,
      active: pathname === "/admin/users"
    },
    {
      title: "Courses",
      href: "/admin/courses",
      icon: <BookOpen className="h-5 w-5" />,
      active: pathname === "/admin/courses"
    },
    {
      title: "Reports",
      href: "/admin/reports",
      icon: <FileText className="h-5 w-5" />,
      active: pathname === "/admin/reports"
    }
  ];

  const commonNavItems = [
    {
      title: "Browse Courses",
      href: "/courses",
      icon: <GraduationCap className="h-5 w-5" />,
      active: pathname === "/courses" && !pathname.includes("/dashboard")
    },
    {
      title: "Settings",
      href: "/profile",
      icon: <Settings className="h-5 w-5" />,
      active: pathname === "/profile"
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
    <div className={cn("pb-12 border-r bg-background h-full", className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <span className={cn("ml-2", isCollapsed ? "sr-only" : "")}>
              {isCollapsed ? "Expand" : "Collapse"}
            </span>
          </Button>
        </div>
        <div className="px-3">
          <h2 className={cn("mb-2 px-4 text-lg font-semibold tracking-tight", 
            isCollapsed ? "sr-only" : "")}>
            Navigation
          </h2>
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center py-2 px-3 text-sm font-medium rounded-md",
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
        </div>
      </div>
    </div>
  );
}