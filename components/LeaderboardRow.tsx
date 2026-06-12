"use client";

import { REACTION_EMOJIS } from "@/lib/constants";
import type { LeaderboardEntry } from "@/lib/types";
import { useSupabase } from "@/lib/hooks/useSupabase";
import { hapticTap } from "@/utils/haptic";
import { Medal } from "lucide-react";
import { useState } from "react";

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  position: number;
  leagueId: string;
  currentUserId: string | null;
  onReactionAdded: () => void;
}

const medalColors = ["text-yellow-400", "text-gray-300", "text-amber-600"];

/**
 * Single leaderboard row with live reaction emoji buttons (+5 pts each).
 */
export function LeaderboardRow({
  entry,
  position,
  leagueId,
  currentUserId,
  onReactionAdded,
}: LeaderboardRowProps) {
  const [reacting, setReacting] = useState<string | null>(null);
  const supabase = useSupabase();

  async function handleReaction(emoji: string) {
    if (!currentUserId || currentUserId === entry.userId || !supabase) return;
    setReacting(emoji);
    hapticTap();

    await supabase.from("reactions").insert({
      league_id: leagueId,
      target_user_id: entry.userId,
      reactor_id: currentUserId,
      emoji,
      points_awarded: 5,
    });

    setReacting(null);
    onReactionAdded();
  }

  return (
    <div className="rounded-2xl border border-pitch-border bg-pitch-card p-4">
      <div className="flex items-center gap-3">
        {/* Position */}
        <div className="flex w-10 flex-shrink-0 flex-col items-center">
          {position <= 3 ? (
            <Medal className={`h-6 w-6 ${medalColors[position - 1]}`} />
          ) : (
            <span className="text-lg font-bold text-pitch-muted-text">
              {position}
            </span>
          )}
        </div>

        {/* User info */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold text-white">
            {entry.username}
            {entry.userId === currentUserId && (
              <span className="ml-2 text-sm text-pitch-green">(you)</span>
            )}
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-pitch-muted-text">
            <span>{entry.accuracy}% accuracy</span>
            {entry.streak > 0 && (
              <span className="text-orange-400">
                {entry.streak}🔥 streak
              </span>
            )}
          </div>
        </div>

        {/* Points */}
        <div className="text-right">
          <p className="text-2xl font-black text-pitch-gold">
            {entry.totalPoints}
          </p>
          <p className="text-xs text-pitch-muted-text">pts</p>
        </div>
      </div>

      {/* Reaction emojis */}
      <div className="mt-3 flex justify-center gap-2 border-t border-pitch-border pt-3">
        {REACTION_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleReaction(emoji)}
            disabled={
              !currentUserId ||
              currentUserId === entry.userId ||
              reacting === emoji
            }
            className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl transition active:scale-90 ${
              currentUserId === entry.userId
                ? "cursor-not-allowed opacity-40"
                : "bg-pitch-black hover:bg-pitch-muted"
            } ${reacting === emoji ? "animate-pulse" : ""}`}
            title={`Send ${emoji} (+5 pts)`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
