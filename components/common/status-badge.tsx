"use client";

import { cn } from "@/lib/utils";
import { STATUS_CONFIG } from "@/constants/statuses";
import type { EntryStatus } from "@/types";

interface StatusBadgeProps {
  status: EntryStatus;
  className?: string;
  showIcon?: boolean;
}

/**
 * StatusBadge — renders a coloured pill for any EntryStatus.
 * Colours come entirely from globals.css `.status-*` classes.
 * No inline styles, no hardcoded colours.
 */
export function StatusBadge({
  status,
  className,
  showIcon = true,
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <span
      className={cn("status-badge", config.cssClass, className)}
      aria-label={`Status: ${config.label}`}
    >
      {showIcon && (
        <Icon
          className="size-3 shrink-0"
          aria-hidden
        />
      )}
      {config.label}
    </span>
  );
}
