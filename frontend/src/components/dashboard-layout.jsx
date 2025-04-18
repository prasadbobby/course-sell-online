// frontend/src/components/dashboard-layout.jsx
import { MainNav } from "@/components/main-nav";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export function DashboardLayout({ children, showSidebar = true }) {
  return (
    <div className="flex flex-col min-h-screen">
      <MainNav />
      <div className="flex-1 flex">
        {showSidebar && (
          <DashboardSidebar className="w-64 hidden md:block" />
        )}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}