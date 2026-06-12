"use client";

import {
  applyTelegramTheme,
  initTelegramWebApp,
  isTelegramMiniApp,
} from "@/utils/telegram";
import { useEffect } from "react";

/** Initialises Telegram Mini App on mount (expand + theme) */
export function TelegramProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!isTelegramMiniApp()) return;
    const tg = initTelegramWebApp();
    if (tg) applyTelegramTheme(tg);
    document.body.classList.add("telegram-mini-app");
  }, []);

  return <>{children}</>;
}
