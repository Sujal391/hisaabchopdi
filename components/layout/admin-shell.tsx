"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { useApp } from "@/contexts/app-context";
import { ADMIN_NAV } from "@/constants/navigation";

/**
 * AdminShell — wraps all /admin/* pages.
 * Sidebar handles desktop fixed panel + mobile Sheet (same component).
 * Client boundary: needs useState for mobile drawer state.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, setCurrentUser } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      router.push("/login");
    }
  }, [currentUser, router]);

  function handleLogout() {
    setCurrentUser(null);
    router.push("/login");
  }

  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground animate-pulse">Loading session…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        navItems={ADMIN_NAV}
        currentUser={currentUser}
        onLogout={handleLogout}
        mobileOpen={sidebarOpen}
        onMobileOpenChange={setSidebarOpen}
      />

      {/* Main content column */}
      <div className="flex flex-1 flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="content-area flex-1 flex flex-col p-4 sm:p-6 bg-muted/30">
          <div className="page-container flex-1 bg-card border rounded-xl shadow-sm p-4 sm:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
