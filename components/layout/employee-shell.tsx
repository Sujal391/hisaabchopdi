"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { useApp } from "@/contexts/app-context";
import { EMPLOYEE_NAV } from "@/constants/navigation";

/**
 * EmployeeShell — wraps all /employee/* pages.
 * Same sidebar component; employee nav has fewer items.
 */
export function EmployeeShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, setCurrentUser } = useApp();
  const router = useRouter();

  function handleLogout() {
    setCurrentUser(null);
    router.push("/login");
  }

  if (!currentUser) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        navItems={EMPLOYEE_NAV}
        currentUser={currentUser}
        onLogout={handleLogout}
        mobileOpen={sidebarOpen}
        onMobileOpenChange={setSidebarOpen}
      />

      <div className="flex flex-1 flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="content-area">
          <div className="page-container">{children}</div>
        </main>
      </div>
    </div>
  );
}
