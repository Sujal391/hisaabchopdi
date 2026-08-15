import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

interface MoneyDisplayProps {
  amount: number | undefined | null;
  className?: string;
  /** Show "—" for zero or undefined amounts */
  showDash?: boolean;
  /** Apply green text for positive context (income) */
  variant?: "default" | "income" | "expense" | "muted";
}

const VARIANT_CLASSES = {
  default: "text-foreground",
  income:  "text-status-completed-fg",
  expense: "text-status-cancelled-fg",
  muted:   "text-muted-foreground",
};

/**
 * MoneyDisplay — formats a number as INR (₹2,500) using Intl.NumberFormat.
 * All colour variants come from globals.css tokens.
 */
export function MoneyDisplay({
  amount,
  className,
  showDash = false,
  variant = "default",
}: MoneyDisplayProps) {
  if (showDash && (amount === undefined || amount === null || amount === 0)) {
    return (
      <span className={cn("text-muted-foreground", className)} aria-label="Not set">
        —
      </span>
    );
  }

  return (
    <span
      className={cn("font-medium tabular-nums", VARIANT_CLASSES[variant], className)}
      aria-label={`₹${amount}`}
    >
      {formatINR(amount ?? 0)}
    </span>
  );
}
