/**
 * ============================================================
 *  CUP LEAGUE — EASY CONFIG
 *  Change text, pricing, and emojis here without touching code.
 * ============================================================
 */

/** Hero headline on the landing page */
export const HERO_TITLE = "Easiest World Cup Private Leagues";

/** Subtitle under the hero */
export const HERO_SUBTITLE =
  "Predict FIFA 2026 matches with friends. Free for one league — go unlimited for the whole tournament.";

/** Freemium: how many leagues a free user can create */
export const FREE_LEAGUE_LIMIT = 1;

/** One-time premium price in Indian Rupees (displayed on UI) */
export const PREMIUM_PRICE_INR = 499;

/** Premium price in paise (₹499 = 49900 paise) — used for Razorpay */
export const PREMIUM_PRICE_PAISE = PREMIUM_PRICE_INR * 100;

/** Upgrade modal copy */
export const UPGRADE_MODAL_TITLE = "Unlock Unlimited Leagues";
export const UPGRADE_MODAL_BODY = `Upgrade for ₹${PREMIUM_PRICE_INR} (one-time) to unlock unlimited leagues for the full FIFA 2026 tournament.`;

/** WhatsApp / Telegram share message template — {link} is replaced at runtime */
export const SHARE_MESSAGE =
  "Join my World Cup pool on CupLeague! {link}";

/** Quick reaction emojis shown below each leaderboard row */
export const REACTION_EMOJIS = ["🔥", "😂", "🇧🇷", "😱", "⚽", "🏆"] as const;

/** Bonus points awarded when someone reacts to a player */
export const REACTION_BONUS_POINTS = 5;

/** Example leagues shown on the landing page (decorative) */
export const EXAMPLE_LEAGUES = [
  {
    name: "Office FC",
    emoji: "🏢",
    members: 12,
    description: "Water cooler bragging rights",
  },
  {
    name: "Family World Cup",
    emoji: "👨‍👩‍👧‍👦",
    members: 8,
    description: "Uncle vs cousins showdown",
  },
  {
    name: "Telegram Crew",
    emoji: "✈️",
    members: 24,
    description: "Mini app legends only",
  },
] as const;

/** Telegram bot / mini-app link — update with your bot URL */
export const TELEGRAM_BOT_URL = "https://t.me/YourCupLeagueBot";

/** App branding */
export const APP_NAME = "CupLeague";
export const APP_TAGLINE = "FIFA 2026 Private Prediction Leagues";
