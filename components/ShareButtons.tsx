"use client";

import { SHARE_MESSAGE } from "@/lib/constants";
import { hapticTap } from "@/utils/haptic";
import { Check, Copy, MessageCircle, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "./Button";

interface ShareButtonsProps {
  inviteCode: string;
  leagueName: string;
}

/** WhatsApp, Telegram, and copy-link share buttons for the Invite tab */
export function ShareButtons({ inviteCode, leagueName }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const appUrl = typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL ?? "";
  const link = `${appUrl}/${inviteCode}`;
  const message = SHARE_MESSAGE.replace("{link}", link);

  function shareWhatsApp() {
    hapticTap();
    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  }

  function shareTelegram() {
    hapticTap();
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(`Join ${leagueName} on CupLeague!`)}`,
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
      <p className="text-center text-pitch-muted-text">
        Share with friends — they join with one tap ⚽
      </p>

      <button
        onClick={shareWhatsApp}
        className="flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-[#25D366] text-lg font-semibold text-white transition active:scale-[0.98]"
      >
        <MessageCircle className="h-6 w-6" />
        Share on WhatsApp
      </button>

      <button
        onClick={shareTelegram}
        className="flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-[#0088cc] text-lg font-semibold text-white transition active:scale-[0.98]"
      >
        <Send className="h-6 w-6" />
        Share on Telegram
      </button>

      <Button variant="secondary" onClick={copyLink}>
        {copied ? (
          <>
            <Check className="h-5 w-5" /> Copied!
          </>
        ) : (
          <>
            <Copy className="h-5 w-5" /> Copy Link & Message
          </>
        )}
      </Button>

      <div className="mt-4 rounded-2xl bg-pitch-black p-4 text-center">
        <p className="text-sm text-pitch-muted-text">Invite code</p>
        <p className="font-mono text-3xl font-black tracking-widest text-pitch-gold">
          {inviteCode}
        </p>
      </div>
    </div>
  );
}
