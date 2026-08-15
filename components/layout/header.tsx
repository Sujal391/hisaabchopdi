"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface HeaderProps {
  title?: string;
  onMenuClick: () => void;
}

/**
 * Header — top bar with hamburger (mobile only) and page title.
 * Shown inside the admin/employee shells.
 */
export function Header({ title, onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background px-4 sm:px-6">
      {/* Hamburger — only visible on mobile (< lg), hidden on desktop since sidebar is always shown */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onMenuClick}
        className="lg:hidden shrink-0"
        aria-label="Open navigation menu"
      >
        <Menu className="size-5" aria-hidden />
      </Button>

      <Separator orientation="vertical" className="h-5 lg:hidden" />

      {/* App name — shown on mobile; sidebar brand covers desktop */}
      <span className="text-sm font-semibold text-foreground lg:hidden">
        EntryBook
      </span>

      {/* Spacer */}
      <div className="flex-1" />
    </header>
  );
}
