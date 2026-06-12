import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  badge,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("mb-8 text-center", className)}>
      {badge && <div className="mb-4 flex justify-center">{badge}</div>}
      {Icon && (
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-pitch/10 ring-1 ring-pitch/25">
          <Icon className="h-7 w-7 text-pitch-light" strokeWidth={2} />
        </div>
      )}
      <h1 className="font-display text-3xl leading-none tracking-wide text-foreground sm:text-4xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mx-auto mt-3 max-w-sm text-base leading-relaxed text-muted-foreground">
          {subtitle}
        </p>
      )}
    </header>
  );
}
