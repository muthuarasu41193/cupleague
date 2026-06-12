/** Map Supabase auth errors to user-friendly messages */
export function getAuthErrorMessage(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("rate limit") || lower.includes("too many")) {
    return "Too many login emails sent. Wait about 1 hour, or check your inbox for an earlier magic link — it may still work.";
  }

  if (lower.includes("invalid email")) {
    return "Please enter a valid email address.";
  }

  if (lower.includes("signup") && lower.includes("disabled")) {
    return "New sign-ups are temporarily disabled. Contact support.";
  }

  if (lower.includes("redirect") || lower.includes("url")) {
    return "Login redirect misconfigured. Add this site URL in Supabase Auth settings.";
  }

  return message;
}

/** Seconds to wait before allowing another magic-link request (client-side guard) */
export const MAGIC_LINK_COOLDOWN_SEC = 60;

const COOLDOWN_KEY = "cupleague_magic_link_cooldown";

export function getMagicLinkCooldownRemaining(): number {
  if (typeof window === "undefined") return 0;
  const until = Number(sessionStorage.getItem(COOLDOWN_KEY) ?? 0);
  return Math.max(0, Math.ceil((until - Date.now()) / 1000));
}

export function setMagicLinkCooldown(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(
    COOLDOWN_KEY,
    String(Date.now() + MAGIC_LINK_COOLDOWN_SEC * 1000)
  );
}
