"use client";

import { SHARE_MESSAGE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { hapticTap } from "@/utils/haptic";
import { Check, Copy, MessageCircle, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "./Button";
import { Card } from "./ui/Card";

interface ShareButtonsProps {
  inviteCode: string;
  leagueName: string;
}

export function ShareButtons({ inviteCode, leagueName }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const appUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL ?? "";
  const link = `${appUrl}/${inviteCode}`;
  const message = SHARE_MESSAGE.replace("{link}", link);

  function shareWhatsApp() {
    hapticTap();
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  }

  function shareTelegram() {
    hapticTap();
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(`Join ${leagueName} on CupLeague`)}`,
      "_blank"
    );
  }

  async function copyLink() {
    hapticTap();
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-center text-sm text-muted-foreground">
        Share your league — friends join with one tap
      </p>

      <button
        onClick={shareWhatsApp}
        className={cn(
          "flex h-14 items-center justify-center gap-3 rounded-2xl",
          "bg-[#25D366] text-base font-semibold text-white",
          "transition active:scale-[0.98] hover:brightness-110"
        )}
      >
        <MessageCircle className="h-5 w-5" />
        WhatsApp
      </button>

      <button
        onClick={shareTelegram}
        className={cn(
          "flex h-14 items-center justify-center gap-3 rounded-2xl",
          "bg-[#0088cc] text-base font-semibold text-white",
          "transition active:scale-[0.98] hover:brightness-110"
        )}
      >
        <Send className="h-5 w-5" />
        Telegram
      </button>

      <Button variant="outline" size="md" onClick={copyLink}>
        {copied ? (
          <>
            <Check className="h-4 w-4" /> Copied
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" /> Copy Link & Message
          </>
        )}
      </Button>

      <Card variant="gold" className="mt-2 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
          Invite Code
        </p>
        <p className="font-mono text-4xl font-bold tracking-[0.3em] text-trophy">
          {inviteCode}
        </p>
      </Card>
    </div>
  );
}
