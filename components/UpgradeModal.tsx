"use client";

import {
  PREMIUM_PRICE_INR,
  UPGRADE_MODAL_BODY,
  UPGRADE_MODAL_TITLE,
} from "@/lib/constants";
import { Crown, X } from "lucide-react";
import { Button } from "./Button";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  onPay: () => void;
  loading?: boolean;
}

/** Freemium paywall — shown when free users try to create a 2nd league */
export function UpgradeModal({
  open,
  onClose,
  onPay,
  loading,
}: UpgradeModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-4 sm:items-center">
      <div className="w-full max-w-md animate-in rounded-3xl border border-pitch-gold/30 bg-pitch-card p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pitch-gold/20">
            <Crown className="h-6 w-6 text-pitch-gold" />
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-pitch-muted-text hover:bg-pitch-muted"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <h2 className="mb-2 text-2xl font-bold text-white">
          {UPGRADE_MODAL_TITLE}
        </h2>
        <p className="mb-6 text-pitch-muted-text">{UPGRADE_MODAL_BODY}</p>

        <div className="mb-6 rounded-2xl bg-pitch-black p-4 text-center">
          <span className="text-4xl font-black text-pitch-gold">
            ₹{PREMIUM_PRICE_INR}
          </span>
          <p className="text-sm text-pitch-muted-text">one-time · full tournament</p>
        </div>

        <div className="flex flex-col gap-3">
          <Button variant="gold" onClick={onPay} loading={loading}>
            Pay ₹{PREMIUM_PRICE_INR}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Maybe later
          </Button>
        </div>
      </div>
    </div>
  );
}
