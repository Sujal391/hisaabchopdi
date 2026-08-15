import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";

/**
 * Format a number as Indian Rupee currency.
 * e.g. 2500 → "₹2,500"
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format an ISO date string as a readable date.
 * e.g. "2026-08-15T10:30:00" → "15 Aug 2026"
 */
export function formatDate(isoString: string): string {
  return format(new Date(isoString), "d MMM yyyy");
}

/**
 * Format an ISO date string with time.
 * e.g. "2026-08-15T10:30:00" → "15 Aug 2026, 10:30 AM"
 */
export function formatDateTime(isoString: string): string {
  return format(new Date(isoString), "d MMM yyyy, h:mm a");
}

/**
 * Format an ISO date string as a short date.
 * e.g. "2026-08-15T10:30:00" → "15 Aug"
 */
export function formatShortDate(isoString: string): string {
  return format(new Date(isoString), "d MMM");
}

/**
 * Format an ISO date string as a relative time.
 * e.g. → "10 minutes ago", "2 hours ago"
 * Falls back to the full date for older entries.
 */
export function formatRelative(isoString: string): string {
  const date = new Date(isoString);
  if (isToday(date)) {
    return formatDistanceToNow(date, { addSuffix: true });
  }
  if (isYesterday(date)) {
    return `Yesterday, ${format(date, "h:mm a")}`;
  }
  return formatDate(isoString);
}

/**
 * Format a time-only string.
 * e.g. "2026-08-15T10:30:00" → "10:30 AM"
 */
export function formatTime(isoString: string): string {
  return format(new Date(isoString), "h:mm a");
}

/**
 * Generate initials from a full name for avatar fallback.
 * e.g. "Amit Kumar" → "AK"
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

/**
 * Format payment mode for display.
 */
export function formatPaymentMode(mode: string): string {
  const map: Record<string, string> = {
    CASH: "Cash",
    UPI: "UPI",
    CARD: "Card",
    BANK_TRANSFER: "Bank Transfer",
    OTHER: "Other",
  };
  return map[mode] ?? mode;
}

/**
 * Format device type for display.
 */
export function formatDeviceType(type: string): string {
  const map: Record<string, string> = {
    LAPTOP: "Laptop",
    DESKTOP: "Desktop",
    PRINTER: "Printer",
    MOBILE: "Mobile",
    TABLET: "Tablet",
    OTHER: "Other",
  };
  return map[type] ?? type;
}
