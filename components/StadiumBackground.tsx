import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface StadiumBackgroundProps {
  children: ReactNode;
  className?: string;
}

/** Full-page stadium atmosphere — pitch stripes + vignette */
export function StadiumBackground({ children, className }: StadiumBackgroundProps) {
  return (
    <div className={cn("relative min-h-full", className)}>
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-0 bg-stadium-glow opacity-80" />
        <div className="absolute inset-0 bg-pitch-stripes opacity-[0.035]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,166,81,0.08),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,0,0,0.6),transparent_70%)]" />
      </div>
      {children}
    </div>
  );
}
