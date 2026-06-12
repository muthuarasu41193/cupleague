"use client";

import { hapticTap } from "@/utils/haptic";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "gold" | "ghost" | "danger" | "outline";
type Size = "md" | "lg" | "sm";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-pitch text-white hover:bg-pitch-light shadow-lg shadow-pitch/25 ring-1 ring-pitch/40",
  secondary:
    "bg-muted text-foreground hover:bg-border/40 ring-1 ring-border",
  gold:
    "bg-gradient-to-r from-gold-dark via-gold to-gold-light text-background font-bold shadow-lg shadow-gold/20 ring-1 ring-gold/50",
  ghost: "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
  danger: "bg-danger/90 text-white hover:bg-danger ring-1 ring-danger/50",
  outline:
    "bg-transparent border border-border text-foreground hover:border-pitch/50 hover:bg-pitch/5",
};

const sizeClasses: Record<Size, string> = {
  sm: "min-h-10 px-4 py-2 text-sm rounded-xl",
  md: "min-h-12 px-5 py-3 text-base rounded-xl",
  lg: "min-h-14 px-6 py-4 text-base rounded-2xl",
};

export function Button({
  variant = "primary",
  size = "lg",
  loading = false,
  disabled,
  children,
  className = "",
  type = "button",
  onClick,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 font-semibold",
        "transition-all duration-200 active:scale-[0.98]",
        "disabled:cursor-not-allowed disabled:opacity-45",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      onClick={(e) => {
        hapticTap();
        onClick?.(e);
      }}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
