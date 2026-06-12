import type { ReactNode } from "react";

interface EmptyStateProps {
  emoji?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

/** Friendly empty state for lists and tabs */
export function EmptyState({
  emoji = "⚽",
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-pitch-border bg-pitch-card/50 px-6 py-12 text-center">
      <span className="text-5xl">{emoji}</span>
      <h3 className="text-xl font-bold text-white">{title}</h3>
      {description && (
        <p className="max-w-sm text-pitch-muted-text">{description}</p>
      )}
      {action && <div className="mt-2 w-full max-w-xs">{action}</div>}
    </div>
  );
}
