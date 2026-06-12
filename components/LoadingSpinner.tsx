import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
}

/** Centered loading state with football-themed spinner */
export function LoadingSpinner({
  message = "Loading...",
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="relative">
        <Loader2 className="h-12 w-12 animate-spin text-pitch-green" />
        <span className="absolute inset-0 flex items-center justify-center text-lg">
          ⚽
        </span>
      </div>
      <p className="text-pitch-muted-text text-lg">{message}</p>
    </div>
  );
}
