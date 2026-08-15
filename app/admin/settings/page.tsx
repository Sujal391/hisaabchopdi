"use client";

import { Wrench } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/common/page-header";
import { useApp } from "@/contexts/app-context";

export default function SettingsPage() {
  const { currentUser } = useApp();

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Settings" description="Manage your shop and account settings." />

      {/* Shop info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Shop Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary">
              <Wrench className="size-6 text-primary-foreground" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">EntryBook Demo Shop</p>
              <p className="text-caption">Service & Repair Management</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name</span>
            <span className="text-foreground">{currentUser?.name ?? "—"}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Role</span>
            <span className="text-foreground capitalize">{currentUser?.role?.toLowerCase() ?? "—"}</span>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Version</span>
            <span className="text-mono">1.0.0-demo</span>
          </div>
          <Separator />
          <p className="text-caption">
            EntryBook is a demo service management system. All data is stored in memory
            and resets on page refresh. Backend integration can be added by replacing
            the context mutation functions with API calls.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
