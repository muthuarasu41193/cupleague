"use client";

import type { Match, Prediction, PredictionResult } from "@/lib/types";
import { getTeamMeta } from "@/lib/teams";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Clock, Target, Trophy } from "lucide-react";
import { useState } from "react";
import { Button } from "./Button";
import { Badge } from "./ui/Badge";
import { Card } from "./ui/Card";

interface MatchCardProps {
  match: Match;
  prediction?: Prediction | null;
  onSubmit: (data: {
    predicted_result?: PredictionResult;
    predicted_home?: number;
    predicted_away?: number;
  }) => Promise<void>;
}

export function MatchCard({ match, prediction, onSubmit }: MatchCardProps) {
  const [mode, setMode] = useState<"quick" | "exact">("quick");
  const [quickPick, setQuickPick] = useState<PredictionResult | null>(
    prediction?.predicted_result ?? null
  );
  const [homeScore, setHomeScore] = useState(
    prediction?.predicted_home?.toString() ?? ""
  );
  const [awayScore, setAwayScore] = useState(
    prediction?.predicted_away?.toString() ?? ""
  );
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const home = getTeamMeta(match.home_team);
  const away = getTeamMeta(match.away_team);
  const isFinished = match.status === "finished";
  const canPredict = !isFinished;

  async function handleSubmit() {
    setLoading(true);
    try {
      if (mode === "quick" && quickPick) {
        await onSubmit({ predicted_result: quickPick });
      } else if (mode === "exact" && homeScore !== "" && awayScore !== "") {
        await onSubmit({
          predicted_home: parseInt(homeScore, 10),
          predicted_away: parseInt(awayScore, 10),
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setLoading(false);
    }
  }

  const hasValidPrediction =
    mode === "quick" ? !!quickPick : homeScore !== "" && awayScore !== "";

  return (
    <Card variant="elevated" padding="none" className="card-shine overflow-hidden">
      {/* Fixture header bar */}
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-4 py-2.5">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {format(new Date(match.match_date), "EEE d MMM · HH:mm")}
        </span>
        {isFinished ? (
          <Badge variant="muted">Full Time</Badge>
        ) : (
          <Badge variant="default" dot>
            Upcoming
          </Badge>
        )}
      </div>

      {/* Scoreboard */}
      <div className="flex items-stretch px-4 py-5">
        {/* Home */}
        <div className="flex flex-1 flex-col items-center gap-2">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ring-1 ring-border"
            style={{ backgroundColor: `${home.color}18` }}
          >
            {home.flag}
          </div>
          <p className="text-center text-sm font-bold leading-tight text-foreground">
            {match.home_team}
          </p>
          <span className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
            {home.abbr}
          </span>
          {isFinished && (
            <p className="font-display text-4xl text-trophy">{match.home_score}</p>
          )}
        </div>

        {/* Divider */}
        <div className="flex flex-col items-center justify-center px-3">
          <div className="scoreboard-divider h-16 w-px" />
          <span className="my-2 font-display text-lg text-muted-foreground">VS</span>
          <div className="scoreboard-divider h-16 w-px" />
        </div>

        {/* Away */}
        <div className="flex flex-1 flex-col items-center gap-2">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ring-1 ring-border"
            style={{ backgroundColor: `${away.color}18` }}
          >
            {away.flag}
          </div>
          <p className="text-center text-sm font-bold leading-tight text-foreground">
            {match.away_team}
          </p>
          <span className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
            {away.abbr}
          </span>
          {isFinished && (
            <p className="font-display text-4xl text-trophy">{match.away_score}</p>
          )}
        </div>
      </div>

      {isFinished && prediction && (
        <div className="mx-4 mb-4 flex items-center justify-center gap-2 rounded-xl bg-gold/10 py-2.5 ring-1 ring-gold/20">
          <Trophy className="h-4 w-4 text-gold" />
          <span className="text-sm font-bold text-gold-light">
            +{prediction.points_earned} points earned
          </span>
        </div>
      )}

      {canPredict && (
        <div className="border-t border-border/60 bg-surface/50 px-4 py-4">
          {/* Mode switch */}
          <div className="mb-3 flex rounded-xl bg-muted p-1">
            {(["quick", "exact"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold uppercase tracking-wide transition",
                  mode === m
                    ? "bg-pitch text-white tab-active-glow"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {m === "quick" ? (
                  <>
                    <Target className="h-3.5 w-3.5" /> 1 · X · 2
                  </>
                ) : (
                  "Exact Score"
                )}
              </button>
            ))}
          </div>

          {mode === "quick" ? (
            <div className="mb-4 grid grid-cols-3 gap-2">
              {(
                [
                  { value: "1" as const, label: "1", sub: home.abbr },
                  { value: "X" as const, label: "X", sub: "Draw" },
                  { value: "2" as const, label: "2", sub: away.abbr },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setQuickPick(opt.value)}
                  className={cn(
                    "flex min-h-[4.5rem] flex-col items-center justify-center rounded-xl transition active:scale-95",
                    quickPick === opt.value
                      ? "bg-pitch/20 ring-2 ring-pitch text-foreground"
                      : "bg-muted text-muted-foreground ring-1 ring-border hover:text-foreground"
                  )}
                >
                  <span className="font-display text-2xl">{opt.label}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider">
                    {opt.sub}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="mb-4 flex items-center justify-center gap-4">
              <div className="text-center">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {home.abbr}
                </p>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={homeScore}
                  onChange={(e) => setHomeScore(e.target.value)}
                  className="w-16 rounded-xl border border-border bg-background py-3 text-center font-display text-3xl text-foreground focus:border-pitch focus:outline-none"
                  placeholder="0"
                />
              </div>
              <span className="font-display text-2xl text-muted-foreground">:</span>
              <div className="text-center">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {away.abbr}
                </p>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value)}
                  className="w-16 rounded-xl border border-border bg-background py-3 text-center font-display text-3xl text-foreground focus:border-pitch focus:outline-none"
                  placeholder="0"
                />
              </div>
            </div>
          )}

          <Button
            size="md"
            onClick={handleSubmit}
            loading={loading}
            disabled={!hasValidPrediction}
            variant={saved ? "secondary" : "primary"}
          >
            {saved ? "Prediction Saved" : "Lock In Prediction"}
          </Button>

          {prediction && !saved && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Updating replaces your previous pick
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
