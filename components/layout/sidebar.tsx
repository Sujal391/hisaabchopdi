"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Wrench } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/constants/navigation";
import type { SessionUser } from "@/types";

interface SidebarProps {
  navItems: NavItem[];
  currentUser: SessionUser;
  onLogout: () => void;
  /** Mobile sheet open state — undefined means desktop fixed mode */
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}

/** Nav list used in both desktop sidebar and mobile Sheet */
function NavList({
  items,
  currentPath,
  onNavigate,
}: {
  items: NavItem[];
  currentPath: string;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Main navigation">
      <ul className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentPath === item.href ||
            (item.href !== "/" && currentPath.startsWith(item.href));
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "nav-item flex items-center gap-3 px-3 py-2.5 text-sm w-full",
                  isActive ? "nav-item-active" : "text-muted-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Brand logo/wordmark */
function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2">
      <div className="flex size-7 items-center justify-center rounded-lg bg-primary">
        <Wrench className="size-4 text-primary-foreground" aria-hidden />
      </div>
      <span className="text-sm font-semibold text-foreground tracking-tight">
        EntryBook
      </span>
    </div>
  );
}

/**
 * Sidebar — single component that renders:
 *   • Desktop (≥ lg): fixed left panel, always visible
 *   • Mobile (< lg): shadcn Sheet drawer triggered from Header hamburger
 */
export function Sidebar({
  navItems,
  currentUser,
  onLogout,
  mobileOpen,
  onMobileOpenChange,
}: SidebarProps) {
  const pathname = usePathname();

  const content = (
    <div className="flex h-full flex-col gap-2">
      <Brand />
      <Separator />

      <div className="flex-1 overflow-y-auto px-2 py-2">
        <NavList
          items={navItems}
          currentPath={pathname}
          onNavigate={
            onMobileOpenChange ? () => onMobileOpenChange(false) : undefined
          }
        />
      </div>

      <Separator />

      {/* User + logout */}
      <div className="px-2 pb-3 pt-2 space-y-2">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-muted">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground truncate">
              {currentUser.name}
            </p>
            <p className="text-caption truncate capitalize">
              {currentUser.role.toLowerCase()}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="w-full justify-start text-muted-foreground"
          aria-label="Sign out"
        >
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop: fixed sidebar ──────────────────────────── */}
      <aside
        className="hidden lg:flex w-56 shrink-0 flex-col border-r bg-sidebar h-screen sticky top-0"
        aria-label="Sidebar navigation"
      >
        {content}
      </aside>

      {/* ── Mobile: Sheet drawer ────────────────────────────── */}
      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side="left" className="w-64 p-0 bg-sidebar">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation menu</SheetTitle>
          </SheetHeader>
          {content}
        </SheetContent>
      </Sheet>
    </>
  );
}
