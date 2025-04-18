// Updated src/components/dashboard-layout.jsx
"use client"

import { usePathname } from "next/navigation";
import { MainNav } from "@/components/main-nav";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export function DashboardLayout({ children }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  
  return (
    <div className="flex flex-col min-h-screen">
      <MainNav />
      <div className="flex-1 flex">
        {!isHomePage && (
          <DashboardSidebar className="hidden md:block" />
        )}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}