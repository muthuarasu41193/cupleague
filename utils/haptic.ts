import { getTelegramWebApp } from "@/utils/telegram";

/** Trigger medium haptic feedback in Telegram Mini App (no-op elsewhere) */
export function hapticTap(): void {
  const tg = getTelegramWebApp();
  tg?.HapticFeedback?.impactOccurred("medium");
}
