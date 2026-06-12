"use client";

import type {
  League,
  LeaderboardEntry,
  Match,
  Prediction,
  Profile,
  Reaction,
} from "@/lib/types";
import { useSupabase } from "@/lib/hooks/useSupabase";
import { cn } from "@/lib/utils";
import {
  calculateAccuracy,
  calculateStreak,
  sumReactionPoints,
} from "@/utils/points";
import { CalendarDays, Share2, Trophy } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { EmptyState } from "./EmptyState";
import { LeaderboardRow } from "./LeaderboardRow";
import { MatchCard } from "./MatchCard";
import { ShareButtons } from "./ShareButtons";
import { Badge } from "./ui/Badge";
import { Card } from "./ui/Card";

type Tab = "matches" | "leaderboard" | "invite";

interface DashboardTabsProps {
  league: League;
  initialMatches: Match[];
  initialPredictions: Prediction[];
  initialReactions: Reaction[];
  members: (Profile & { joined_at: string })[];
  currentUserId: string | null;
}

const TABS: { id: Tab; label: string; icon: typeof CalendarDays }[] = [
  { id: "matches", label: "Fixtures", icon: CalendarDays },
  { id: "leaderboard", label: "Standings", icon: Trophy },
  { id: "invite", label: "Invite", icon: Share2 },
];

export function DashboardTabs({
  league,
  initialMatches,
  initialPredictions,
  initialReactions,
  members,
  currentUserId,
}: DashboardTabsProps) {
  const [tab, setTab] = useState<Tab>("matches");
  const [matches, setMatches] = useState(initialMatches);
  const [predictions, setPredictions] = useState(initialPredictions);
  const [reactions, setReactions] = useState(initialReactions);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const supabase = useSupabase();

  const rebuildLeaderboard = useCallback(() => {
    const entries: LeaderboardEntry[] = members.map((member) => {
      const userPreds = predictions.filter((p) => p.user_id === member.id);
      const predPoints = userPreds.reduce((s, p) => s + p.points_earned, 0);
      const reactPoints = sumReactionPoints(reactions, member.id);

      return {
        userId: member.id,
        username: member.username,
        totalPoints: predPoints + reactPoints,
        streak: calculateStreak(userPreds, matches),
        accuracy: calculateAccuracy(userPreds, matches),
        predictionPoints: predPoints,
        reactionPoints: reactPoints,
      };
    });

    entries.sort((a, b) => b.totalPoints - a.totalPoints);
    setLeaderboard(entries);
  }, [members, predictions, reactions, matches]);

  useEffect(() => {
    rebuildLeaderboard();
  }, [rebuildLeaderboard]);

  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel(`league-${league.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "predictions",
          filter: `league_id=eq.${league.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setPredictions((prev) => [...prev, payload.new as Prediction]);
          } else if (payload.eventType === "UPDATE") {
            setPredictions((prev) =>
              prev.map((p) =>
                p.id === (payload.new as Prediction).id
                  ? (payload.new as Prediction)
                  : p
              )
            );
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reactions",
          filter: `league_id=eq.${league.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setReactions((prev) => [...prev, payload.new as Reaction]);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "matches",
        },
        (payload) => {
          setMatches((prev) =>
            prev.map((m) =>
              m.id === (payload.new as Match).id
                ? (payload.new as Match)
                : m
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [league.id, supabase]);

  async function handlePrediction(
    matchId: string,
    data: {
      predicted_result?: "1" | "X" | "2";
      predicted_home?: number;
      predicted_away?: number;
    }
  ) {
    if (!currentUserId || !supabase) return;

    const existing = predictions.find(
      (p) => p.match_id === matchId && p.user_id === currentUserId
    );

    const payload = {
      user_id: currentUserId,
      match_id: matchId,
      league_id: league.id,
      predicted_result: data.predicted_result ?? null,
      predicted_home: data.predicted_home ?? null,
      predicted_away: data.predicted_away ?? null,
    };

    if (existing) {
      await supabase
        .from("predictions")
        .update(payload)
        .eq("id", existing.id);
    } else {
      await supabase.from("predictions").insert(payload);
    }
  }

  const sortedMatches = [...matches].sort((a, b) => {
    if (a.status !== b.status) return a.status === "upcoming" ? -1 : 1;
    return a.match_date.localeCompare(b.match_date);
  });

  const upcomingMatches = sortedMatches
    .filter((m) => m.status === "upcoming")
    .slice(0, 10);

  return (
    <div>
      {/* League banner */}
      <Card variant="glass" className="card-shine mb-6 text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-4xl ring-1 ring-border">
          {league.emoji}
        </div>
        <h1 className="font-display text-3xl tracking-wide text-foreground">
          {league.name.toUpperCase()}
        </h1>
        {league.description && (
          <p className="mt-1.5 text-sm text-muted-foreground">
            {league.description}
          </p>
        )}
        <div className="mt-3 flex justify-center gap-2">
          <Badge variant="default">{members.length} players</Badge>
          <Badge variant="host">FIFA 2026</Badge>
        </div>
      </Card>

      {/* Tab bar */}
      <div className="mb-6 flex gap-1 rounded-2xl bg-muted p-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-xl py-2.5 text-[11px] font-semibold uppercase tracking-wide transition",
                active
                  ? "bg-pitch text-white tab-active-glow"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={active ? 2.5 : 2} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "matches" && (
        <div className="flex flex-col gap-4">
          {upcomingMatches.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="No fixtures yet"
              description="Match schedule will appear here once published."
            />
          ) : (
            upcomingMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                prediction={predictions.find(
                  (p) =>
                    p.match_id === match.id && p.user_id === currentUserId
                )}
                onSubmit={(data) => handlePrediction(match.id, data)}
              />
            ))
          )}

          {sortedMatches
            .filter((m) => m.status === "finished")
            .map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                prediction={predictions.find(
                  (p) =>
                    p.match_id === match.id && p.user_id === currentUserId
                )}
                onSubmit={async () => {}}
              />
            ))}
        </div>
      )}

      {tab === "leaderboard" && (
        <div className="flex flex-col gap-2.5">
          {leaderboard.length === 0 ? (
            <EmptyState
              icon={Trophy}
              title="Standings empty"
              description="Invite friends to start the competition."
            />
          ) : (
            leaderboard.map((entry, i) => (
              <LeaderboardRow
                key={entry.userId}
                entry={entry}
                position={i + 1}
                leagueId={league.id}
                currentUserId={currentUserId}
                onReactionAdded={rebuildLeaderboard}
              />
            ))
          )}
        </div>
      )}

      {tab === "invite" && (
        <ShareButtons inviteCode={league.invite_code} leagueName={league.name} />
      )}
    </div>
  );
}
