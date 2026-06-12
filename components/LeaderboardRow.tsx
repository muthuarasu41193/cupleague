"use client";

import { REACTION_EMOJIS } from "@/lib/constants";
import type { LeaderboardEntry } from "@/lib/types";
import { useSupabase } from "@/lib/hooks/useSupabase";
import { cn } from "@/lib/utils";
import { hapticTap } from "@/utils/haptic";
import { Flame, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Card } from "./ui/Card";

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  position: number;
  leagueId: string;
  currentUserId: string | null;
  onReactionAdded: () => void;
}

const podiumStyles: Record<number, string> = {
  1: "ring-gold/40 bg-gradient-to-r from-gold/10 to-card",
  2: "ring-white/20 bg-gradient-to-r from-white/5 to-card",
  3: "ring-amber-700/30 bg-gradient-to-r from-amber-900/10 to-card",
};

export function LeaderboardRow({
  entry,
  position,
  leagueId,
  currentUserId,
  onReactionAdded,
}: LeaderboardRowProps) {
  const [reacting, setReacting] = useState<string | null>(null);
  const supabase = useSupabase();
  const isYou = entry.userId === currentUserId;
  const isPodium = position <= 3;

  async function handleReaction(emoji: string) {
    if (!currentUserId || isYou || !supabase) return;
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
    <Card
      variant="default"
      padding="sm"
      className={cn(
        "card-shine ring-1 ring-border/60 transition",
        isPodium && podiumStyles[position],
        isYou && "ring-pitch/40"
      )}
    >
      <div className="flex items-center gap-3">
        {/* Rank */}
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-display text-xl",
            position === 1 && "bg-gold/20 text-gold-light",
            position === 2 && "bg-white/10 text-foreground",
            position === 3 && "bg-amber-900/20 text-amber-400",
            position > 3 && "bg-muted text-muted-foreground"
          )}
        >
          {position}
        </div>

        {/* Player */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold text-foreground">
              {entry.username}
            </p>
            {isYou && (
              <span className="shrink-0 rounded-md bg-pitch/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-pitch-light">
                You
              </span>
            )}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {entry.accuracy}% accuracy
            </span>
            {entry.streak > 0 && (
              <span className="flex items-center gap-1 text-orange-400">
                <Flame className="h-3 w-3" />
                {entry.streak} streak
              </span>
            )}
          </div>
        </div>

        {/* Points */}
        <div className="shrink-0 text-right">
          <p className="font-display text-3xl leading-none text-trophy">
            {entry.totalPoints}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            pts
          </p>
        </div>
      </div>

      {/* Reactions */}
      <div className="mt-3 flex justify-between gap-1 border-t border-border/50 pt-3">
        {REACTION_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleReaction(emoji)}
            disabled={!currentUserId || isYou || reacting === emoji}
            className={cn(
              "flex h-10 flex-1 items-center justify-center rounded-lg text-lg transition active:scale-90",
              isYou
                ? "cursor-not-allowed opacity-30"
                : "bg-muted/60 hover:bg-muted",
              reacting === emoji && "animate-pulse ring-1 ring-pitch/40"
            )}
            title={`+5 pts`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </Card>
  );
}
