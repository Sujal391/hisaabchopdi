"use client";

import { useState } from "react";
import { Menu, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useApp } from "@/contexts/app-context";

interface HeaderProps {
  title?: string;
  onMenuClick: () => void;
}

/**
 * Header — top bar with hamburger (mobile only) and page title.
 * Shown inside the admin/employee shells.
 */
export function Header({ title, onMenuClick }: HeaderProps) {
  const { currentUser } = useApp();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <>
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

        {/* View Profile Button at Header Right End */}
        {currentUser && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setProfileOpen(true)}
            className="shrink-0 gap-2 px-2.5 rounded-md hover:bg-muted cursor-pointer"
            aria-label="View Profile"
          >
            <div className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-medium text-foreground hidden sm:inline-block">
              {currentUser.name}
            </span>
          </Button>
        )}
      </header>

      {/* Profile Dialog */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>My Profile</DialogTitle>
          </DialogHeader>
          {currentUser && (
            <div className="py-4 flex flex-col items-center gap-3 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">{currentUser.name}</p>
                <p className="text-sm text-muted-foreground capitalize">{currentUser.role.toLowerCase()}</p>
                {currentUser.employeeId && (
                  <p className="text-xs text-muted-foreground mt-1">ID: <span className="font-mono">{currentUser.employeeId}</span></p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
