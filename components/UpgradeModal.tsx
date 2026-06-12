"use client";

import {
  PREMIUM_PRICE_INR,
  UPGRADE_MODAL_BODY,
  UPGRADE_MODAL_TITLE,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Crown, X } from "lucide-react";
import { Button } from "./Button";
import { Badge } from "./ui/Badge";
import { Card } from "./ui/Card";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  onPay: () => void;
  loading?: boolean;
}

export function UpgradeModal({
  open,
  onClose,
  onPay,
  loading,
}: UpgradeModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 p-4 backdrop-blur-sm sm:items-center">
      <Card
        variant="gold"
        className={cn(
          "w-full max-w-md animate-fade-up shadow-2xl shadow-black/60",
          "border-gold/30"
        )}
      >
        <div className="mb-5 flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/20 ring-1 ring-gold/40">
            <Crown className="h-6 w-6 text-gold-light" />
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <Badge variant="gold" className="mb-3">
          Tournament Pass
        </Badge>
        <h2 className="font-display text-3xl tracking-wide text-foreground">
          {UPGRADE_MODAL_TITLE.toUpperCase()}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {UPGRADE_MODAL_BODY}
        </p>

        <div className="my-6 rounded-2xl bg-background/60 py-5 text-center ring-1 ring-border">
          <span className="font-display text-5xl text-trophy">
            ₹{PREMIUM_PRICE_INR}
          </span>
          <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
            one-time · entire FIFA 2026
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <Button variant="gold" onClick={onPay} loading={loading}>
            Unlock Unlimited Leagues
          </Button>
          <Button variant="ghost" size="md" onClick={onClose}>
            Not now
          </Button>
        </div>
      </Card>
    </div>
  );
}
