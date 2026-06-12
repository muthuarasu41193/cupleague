import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = "Loading..." }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-20">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <div className="absolute inset-0 rounded-2xl bg-pitch/10 ring-1 ring-pitch/20" />
        <Loader2 className="h-8 w-8 animate-spin text-pitch-light" />
      </div>
      <p className={cn("text-sm font-medium uppercase tracking-widest text-muted-foreground")}>
        {message}
      </p>
    </div>
  );
}
