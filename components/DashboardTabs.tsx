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
import {
  calculateAccuracy,
  calculateStreak,
  sumReactionPoints,
} from "@/utils/points";
import { useCallback, useEffect, useState } from "react";
import { EmptyState } from "./EmptyState";
import { LeaderboardRow } from "./LeaderboardRow";
import { MatchCard } from "./MatchCard";
import { ShareButtons } from "./ShareButtons";

type Tab = "matches" | "leaderboard" | "invite";

interface DashboardTabsProps {
  league: League;
  initialMatches: Match[];
  initialPredictions: Prediction[];
  initialReactions: Reaction[];
  members: (Profile & { joined_at: string })[];
  currentUserId: string | null;
}

/**
 * Tabbed league dashboard: Matches | Leaderboard | Invite
 * Subscribes to Supabase Realtime for live leaderboard & reactions.
 */
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

  // Realtime subscriptions for live updates
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

  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: "matches", label: "Matches", emoji: "⚽" },
    { id: "leaderboard", label: "Leaderboard", emoji: "🏆" },
    { id: "invite", label: "Invite", emoji: "📨" },
  ];

  // Show upcoming matches first, then finished
  const sortedMatches = [...matches].sort((a, b) => {
    if (a.status !== b.status) return a.status === "upcoming" ? -1 : 1;
    return a.match_date.localeCompare(b.match_date);
  });

  const upcomingMatches = sortedMatches.filter(
    (m) => m.status === "upcoming"
  ).slice(0, 10);

  return (
    <div>
      {/* League header */}
      <div className="mb-6 text-center">
        <span className="text-5xl">{league.emoji}</span>
        <h1 className="mt-2 text-2xl font-black text-white">{league.name}</h1>
        {league.description && (
          <p className="text-pitch-muted-text">{league.description}</p>
        )}
      </div>

      {/* Tab bar */}
      <div className="mb-6 flex rounded-2xl bg-pitch-black p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-3 text-sm font-semibold transition ${
              tab === t.id
                ? "bg-pitch-green text-white"
                : "text-pitch-muted-text"
            }`}
          >
            <span>{t.emoji}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Matches tab */}
      {tab === "matches" && (
        <div className="flex flex-col gap-4">
          {upcomingMatches.length === 0 ? (
            <EmptyState
              emoji="📅"
              title="No upcoming matches"
              description="Check back soon — new fixtures are on the way!"
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

          {/* Finished matches with points */}
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

      {/* Leaderboard tab */}
      {tab === "leaderboard" && (
        <div className="flex flex-col gap-3">
          {leaderboard.length === 0 ? (
            <EmptyState
              emoji="🏆"
              title="No players yet"
              description="Invite friends to start competing!"
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

      {/* Invite tab */}
      {tab === "invite" && (
        <ShareButtons inviteCode={league.invite_code} leagueName={league.name} />
      )}
    </div>
  );
}
