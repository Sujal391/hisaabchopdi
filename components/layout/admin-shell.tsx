"use client";

import { useState } from "react";
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

  function handleLogout() {
    setCurrentUser(null);
    router.push("/login");
  }

  if (!currentUser) return null;

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
        <main className="content-area">
          <div className="page-container">{children}</div>
        </main>
      </div>
    </div>
  );
}
