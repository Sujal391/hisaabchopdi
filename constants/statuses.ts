import type { EntryStatus } from "@/types";
import {
  Circle,
  LoaderCircle,
  Clock,
  CircleCheck,
  XCircle,
  RotateCcw,
} from "lucide-react";

export interface StatusConfig {
  label: string;
  /** CSS component class defined in globals.css — never hardcode colours */
  cssClass: string;
  /** Lucide icon component */
  icon: React.ElementType;
}

export const STATUS_CONFIG: Record<EntryStatus, StatusConfig> = {
  NOT_STARTED: {
    label: "Not Started",
    cssClass: "status-not-started",
    icon: Circle,
  },
  IN_PROGRESS: {
    label: "In Progress",
    cssClass: "status-in-progress",
    icon: LoaderCircle,
  },
  WAITING: {
    label: "Waiting",
    cssClass: "status-waiting",
    icon: Clock,
  },
  COMPLETED: {
    label: "Completed",
    cssClass: "status-completed",
    icon: CircleCheck,
  },
  CANCELLED: {
    label: "Cancelled",
    cssClass: "status-cancelled",
    icon: XCircle,
  },
  REOPENED: {
    label: "Reopened",
    cssClass: "status-reopened",
    icon: RotateCcw,
  },
};

/** Ordered list for filter tabs */
export const STATUS_LIST: EntryStatus[] = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "WAITING",
  "COMPLETED",
  "CANCELLED",
  "REOPENED",
];

/** Statuses an employee can transition to while working */
export const EMPLOYEE_ALLOWED_TRANSITIONS: Partial<Record<EntryStatus, EntryStatus[]>> = {
  IN_PROGRESS: ["WAITING", "COMPLETED"],
  WAITING: ["IN_PROGRESS"],
};

/** Statuses admin can transition to */
export const ADMIN_ALLOWED_TRANSITIONS: Partial<Record<EntryStatus, EntryStatus[]>> = {
  NOT_STARTED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["WAITING", "COMPLETED", "CANCELLED"],
  WAITING: ["IN_PROGRESS", "CANCELLED"],
  COMPLETED: ["REOPENED"],
  CANCELLED: ["REOPENED"],
  REOPENED: ["IN_PROGRESS", "CANCELLED"],
};
