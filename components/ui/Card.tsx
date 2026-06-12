import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "default" | "elevated" | "glass" | "gold";
  padding?: "none" | "sm" | "md" | "lg";
}

const variants = {
  default: "bg-card border border-border/80",
  elevated: "bg-card border border-border/60 shadow-xl shadow-black/40",
  glass: "bg-card/70 border border-white/8 backdrop-blur-xl",
  gold: "bg-gradient-to-br from-gold/12 to-card border border-gold/25",
};

const paddings = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export function Card({
  children,
  variant = "default",
  padding = "md",
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl",
        variants[variant],
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
