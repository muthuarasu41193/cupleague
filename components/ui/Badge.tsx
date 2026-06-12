import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type BadgeVariant = "default" | "live" | "gold" | "host" | "muted";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

const styles: Record<BadgeVariant, string> = {
  default: "bg-pitch/15 text-pitch-light border-pitch/30",
  live: "bg-red-500/15 text-red-400 border-red-500/30",
  gold: "bg-gold/15 text-gold-light border-gold/30",
  host: "bg-accent/15 text-accent-light border-accent/30",
  muted: "bg-muted text-muted-foreground border-border",
};

export function Badge({
  children,
  variant = "default",
  className,
  dot,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5",
        "text-[11px] font-bold uppercase tracking-widest",
        styles[variant],
        className
      )}
    >
      {dot && (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
      )}
      {children}
    </span>
  );
}
