/** Database row types — mirrors Supabase schema */

export interface Profile {
  id: string;
  email: string;
  username: string;
  is_premium: boolean;
  leagues_created: number;
  created_at: string;
}

export interface League {
  id: string;
  name: string;
  description: string | null;
  emoji: string;
  invite_code: string;
  creator_id: string;
  created_at: string;
}

export interface LeagueMember {
  id: string;
  league_id: string;
  user_id: string;
  joined_at: string;
}

export interface Match {
  id: string;
  home_team: string;
  away_team: string;
  match_date: string;
  home_score: number | null;
  away_score: number | null;
  status: "upcoming" | "finished";
  created_at: string;
}

export interface Prediction {
  id: string;
  user_id: string;
  match_id: string;
  league_id: string;
  predicted_home: number | null;
  predicted_away: number | null;
  predicted_result: "1" | "X" | "2" | null;
  points_earned: number;
  created_at: string;
}

export interface Reaction {
  id: string;
  league_id: string;
  target_user_id: string;
  reactor_id: string;
  emoji: string;
  points_awarded: number;
  created_at: string;
}

export type PredictionResult = "1" | "X" | "2";

/** Leaderboard row computed client-side */
export interface LeaderboardEntry {
  userId: string;
  username: string;
  totalPoints: number;
  streak: number;
  accuracy: number;
  predictionPoints: number;
  reactionPoints: number;
}

/** Telegram WebApp types (subset we use) */
export interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  themeParams: {
    bg_color?: string;
    text_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
  HapticFeedback: {
    impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
  };
  openTelegramLink: (url: string) => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}
