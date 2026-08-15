import { STATUS_CONFIG } from "@/constants/statuses";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { StatusHistory } from "@/types";

interface EntryStatusTimelineProps {
  history: StatusHistory[];
  className?: string;
}

/**
 * EntryStatusTimeline — vertical timeline of all status changes and notes.
 * Colours come from globals.css status tokens. Reusable on any detail page.
 */
export function EntryStatusTimeline({
  history,
  className,
}: EntryStatusTimelineProps) {
  // Show most recent first
  const sorted = [...history].reverse();

  return (
    <ol
      className={cn("relative space-y-0", className)}
      aria-label="Entry history"
    >
      {sorted.map((item, idx) => {
        const config = STATUS_CONFIG[item.toStatus];
        const Icon = config.icon;
        const isLast = idx === sorted.length - 1;

        return (
          <li key={item.id} className="relative flex gap-4">
            {/* Vertical line */}
            {!isLast && (
              <div
                className="absolute left-[15px] top-8 bottom-0 w-px bg-border"
                aria-hidden
              />
            )}

            {/* Icon dot */}
            <div
              className={cn(
                "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-background",
                `bg-status-${item.toStatus.toLowerCase().replace("_", "-")}-bg`
              )}
              aria-hidden
            >
              <Icon
                className={cn(
                  "size-3.5",
                  `text-status-${item.toStatus.toLowerCase().replace("_", "-")}-fg`
                )}
              />
            </div>

            {/* Content */}
            <div className="flex-1 pb-6 min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="text-sm font-medium text-foreground">
                  {config.label}
                </span>
                <span className="text-caption">by {item.changedBy}</span>
              </div>
              {item.note && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.note}
                </p>
              )}
              <time
                dateTime={item.timestamp}
                className="mt-0.5 block text-caption"
              >
                {formatDateTime(item.timestamp)}
              </time>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
