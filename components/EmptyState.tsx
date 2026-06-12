import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: LucideIcon;
  emoji?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  emoji,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-2xl",
        "border border-dashed border-border/60 bg-muted/30 px-6 py-14 text-center"
      )}
    >
      {Icon ? (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted ring-1 ring-border">
          <Icon className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
        </div>
      ) : (
        <span className="text-4xl">{emoji ?? "⚽"}</span>
      )}
      <div>
        <h3 className="font-display text-xl tracking-wide text-foreground">
          {title.toUpperCase()}
        </h3>
        {description && (
          <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-1 w-full max-w-xs">{action}</div>}
    </div>
  );
}
