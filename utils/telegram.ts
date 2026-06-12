import type { TelegramWebApp } from "@/lib/types";

/** Returns the Telegram WebApp instance if running inside Telegram */
export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window === "undefined") return null;
  return window.Telegram?.WebApp ?? null;
}

/** True when the app is opened as a Telegram Mini App */
export function isTelegramMiniApp(): boolean {
  return getTelegramWebApp() !== null;
}

/** Initialise Telegram Mini App: ready + full-screen expand */
export function initTelegramWebApp(): TelegramWebApp | null {
  const tg = getTelegramWebApp();
  if (!tg) return null;
  tg.ready();
  tg.expand();
  return tg;
}

/** Apply Telegram theme CSS variables to the document root */
export function applyTelegramTheme(tg: TelegramWebApp): void {
  const p = tg.themeParams;
  const root = document.documentElement;
  if (p.bg_color) root.style.setProperty("--tg-bg", p.bg_color);
  if (p.text_color) root.style.setProperty("--tg-text", p.text_color);
  if (p.button_color) root.style.setProperty("--tg-button", p.button_color);
  if (p.button_text_color)
    root.style.setProperty("--tg-button-text", p.button_text_color);
  if (p.secondary_bg_color)
    root.style.setProperty("--tg-secondary-bg", p.secondary_bg_color);
}
