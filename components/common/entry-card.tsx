"use client";

import Link from "next/link";
import { CalendarDays, Phone, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./status-badge";
import { formatRelative, formatDeviceType } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ServiceEntry } from "@/types";

interface EntryCardProps {
  entry: ServiceEntry;
  /** Base path for the detail link, e.g. "/admin" or "/employee" */
  basePath?: string;
  /** Show the Take Work button for NOT_STARTED entries */
  showTakeWork?: boolean;
  onTakeWork?: (entryId: string) => void;
  onView?: (entryId: string) => void;
  className?: string;
}

/**
 * EntryCard — mobile-first card for a service entry.
 * Used in employee dashboard available-work list and all mobile list views.
 */
export function EntryCard({
  entry,
  basePath,
  showTakeWork = false,
  onTakeWork,
  onView,
  className,
}: EntryCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4 space-y-3",
        className
      )}
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-mono text-sm font-semibold shrink-0">
            {entry.entryNumber}
          </span>
          <span className="text-caption truncate">
            {entry.deviceType === "OTHER" && entry.customDeviceType ? entry.customDeviceType : formatDeviceType(entry.deviceType)}
          </span>
        </div>
        <StatusBadge status={entry.status} />
      </div>

      {/* Customer & device */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground truncate">
          {entry.customerName}
        </p>
        <p className="text-caption truncate">
          {entry.brand} {entry.model}
        </p>
      </div>

      {/* Complaint */}
      <p className="text-sm text-muted-foreground line-clamp-2">
        {entry.complaint}
      </p>

      {/* Footer row */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-1 text-caption">
          <CalendarDays className="size-3 shrink-0" aria-hidden />
          <span>{formatRelative(entry.createdAt)}</span>
        </div>

        {/* Assignment info */}
        {entry.assignedToName && entry.status !== "NOT_STARTED" && (
          <span className="text-caption truncate">
            {entry.assignedToName}
          </span>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {showTakeWork && entry.status === "NOT_STARTED" && onTakeWork && (
            <Button
              size="sm"
              onClick={() => onTakeWork(entry.id)}
              aria-label={`Take work for entry ${entry.entryNumber}`}
            >
              Take Work
            </Button>
          )}
          {onView ? (
            <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onView(entry.id); }}>
              <Wrench className="size-3.5" aria-hidden />
              View
            </Button>
          ) : (
            <Button size="sm" variant="outline" asChild>
              <Link href={`${basePath}/entries/${entry.id}`}>
                <Wrench className="size-3.5" aria-hidden />
                View
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* In-progress by label */}
      {entry.status === "IN_PROGRESS" && entry.assignedToName && (
        <div className="flex items-center gap-1.5 rounded-md bg-status-in-progress-bg px-3 py-1.5">
          <span className="text-xs font-medium text-status-in-progress-fg">
            Working by: {entry.assignedToName}
          </span>
        </div>
      )}

      {/* Waiting reason */}
      {entry.status === "WAITING" && (
        <div className="flex items-center gap-1.5 rounded-md bg-status-waiting-bg px-3 py-1.5">
          <span className="text-xs font-medium text-status-waiting-fg">
            Waiting — {entry.assignedToName ?? "unassigned"}
          </span>
        </div>
      )}
    </div>
  );
}
