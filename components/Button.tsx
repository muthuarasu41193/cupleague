"use client";

import { hapticTap } from "@/utils/haptic";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "gold" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-pitch-green text-white hover:bg-pitch-green-light shadow-lg shadow-pitch-green/20",
  secondary:
    "bg-pitch-card border border-pitch-border text-white hover:bg-pitch-muted",
  gold: "bg-pitch-gold text-pitch-black hover:bg-pitch-gold-light font-bold shadow-lg shadow-pitch-gold/20",
  ghost: "bg-transparent text-pitch-gold hover:bg-pitch-muted",
  danger: "bg-red-600 text-white hover:bg-red-500",
};

/**
 * Large, touch-friendly button with Telegram haptic feedback on tap.
 */
export function Button({
  variant = "primary",
  loading = false,
  disabled,
  children,
  className = "",
  onClick,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={`
        inline-flex min-h-14 w-full items-center justify-center gap-2
        rounded-2xl px-6 py-4 text-lg font-semibold
        transition-all active:scale-[0.98]
        disabled:cursor-not-allowed disabled:opacity-50
        ${variantClasses[variant]} ${className}
      `}
      onClick={(e) => {
        hapticTap();
        onClick?.(e);
      }}
      {...props}
    >
      {loading && <Loader2 className="h-5 w-5 animate-spin" />}
      {children}
    </button>
  );
}
