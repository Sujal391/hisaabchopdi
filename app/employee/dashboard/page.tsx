"use client";

import { useState } from "react";
import Link from "next/link";
import { ClipboardList, CircleCheck, Clock, Circle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { EntryCard } from "@/components/common/entry-card";
import { EmptyState } from "@/components/common/empty-state";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { useApp } from "@/contexts/app-context";
import { useToast } from "@/components/common/toast-provider";
import { isToday } from "date-fns";

export default function EmployeeDashboardPage() {
  const { entries, currentUser, takeWork } = useApp();
  const { toast } = useToast();
  const [confirmEntryId, setConfirmEntryId] = useState<string | null>(null);

  if (!currentUser) return null;

  const myEntries = entries.filter(
    (e) => e.assignedToId === currentUser.id || e.assignedToId === currentUser.employeeId
  );
  const available = entries.filter((e) => e.status === "NOT_STARTED");
  const myInProgress = myEntries.filter((e) => e.status === "IN_PROGRESS");
  const myWaiting = myEntries.filter((e) => e.status === "WAITING");
  const myCompletedToday = myEntries.filter(
    (e) => e.status === "COMPLETED" && e.completedAt && isToday(new Date(e.completedAt))
  );

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  function handleTakeWork(entryId: string) {
    setConfirmEntryId(entryId);
  }

  function confirmTakeWork() {
    if (!confirmEntryId || !currentUser) return;
    takeWork(confirmEntryId, currentUser);
    toast(`You took the work. Good luck!`);
    setConfirmEntryId(null);
  }

  const confirmEntry = entries.find((e) => e.id === confirmEntryId);

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <PageHeader
        title={`${greeting}, ${currentUser.name}`}
        description="Your work for today."
      />

      {/* Summary cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">Available</CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-status-not-started-bg">
              <Circle className="size-4 text-status-not-started-fg" aria-hidden />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{available.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">My Work</CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-status-in-progress-bg">
              <ClipboardList className="size-4 text-status-in-progress-fg" aria-hidden />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{myInProgress.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">Waiting</CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-status-waiting-bg">
              <Clock className="size-4 text-status-waiting-fg" aria-hidden />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{myWaiting.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">Done Today</CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-status-completed-bg">
              <CircleCheck className="size-4 text-status-completed-fg" aria-hidden />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{myCompletedToday.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Two columns */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Available work */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              Available Work
              {available.length > 0 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({available.length})
                </span>
              )}
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/employee/entries">View all</Link>
            </Button>
          </div>
          {available.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No available work"
              description="All entries are assigned. Check back later."
            />
          ) : (
            <div className="space-y-3">
              {available.slice(0, 4).map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  basePath="/employee"
                  showTakeWork
                  onTakeWork={handleTakeWork}
                />
              ))}
            </div>
          )}
        </div>

        {/* My active work */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">My Active Work</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/employee/my-work">View all</Link>
            </Button>
          </div>
          {myInProgress.length === 0 && myWaiting.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No active work"
              description="Take a job from Available Work to get started."
            />
          ) : (
            <div className="space-y-3">
              {[...myInProgress, ...myWaiting].slice(0, 4).map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  basePath="/employee"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Take Work confirmation dialog */}
      <ConfirmDialog
        open={!!confirmEntryId}
        onOpenChange={(open) => !open && setConfirmEntryId(null)}
        title="Take this work?"
        description={
          confirmEntry
            ? `You will become responsible for ${confirmEntry.entryNumber} — ${confirmEntry.brand} ${confirmEntry.model} (${confirmEntry.customerName}).`
            : "You will become responsible for this service entry."
        }
        confirmLabel="Take Work"
        onConfirm={confirmTakeWork}
      />
    </div>
  );
}
