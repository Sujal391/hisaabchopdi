import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/format";
import { cn } from "@/lib/utils";

interface CustomerAvatarProps {
  name: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASSES = {
  sm: "size-7 text-xs",
  md: "size-9 text-sm",
  lg: "size-11 text-base",
};

/**
 * CustomerAvatar — shadcn Avatar with auto-generated initials fallback.
 * Colours from globals.css via bg-muted / text-muted-foreground.
 */
export function CustomerAvatar({
  name,
  className,
  size = "md",
}: CustomerAvatarProps) {
  return (
    <Avatar className={cn(SIZE_CLASSES[size], className)}>
      <AvatarFallback className="bg-muted text-muted-foreground font-medium">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
