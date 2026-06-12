"use client";

import type { Match, Prediction, PredictionResult } from "@/lib/types";
import { format } from "date-fns";
import { Calendar, Trophy } from "lucide-react";
import { useState } from "react";
import { Button } from "./Button";

interface MatchCardProps {
  match: Match;
  prediction?: Prediction | null;
  onSubmit: (data: {
    predicted_result?: PredictionResult;
    predicted_home?: number;
    predicted_away?: number;
  }) => Promise<void>;
}

/**
 * Match prediction card — supports quick 1X2 buttons OR exact score inputs.
 */
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
    <div className="rounded-2xl border border-pitch-border bg-pitch-card p-4">
      {/* Match header */}
      <div className="mb-3 flex items-center justify-between text-sm text-pitch-muted-text">
        <span className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {format(new Date(match.match_date), "EEE, MMM d · HH:mm")}
        </span>
        {isFinished && (
          <span className="rounded-full bg-pitch-green/20 px-2 py-0.5 text-xs font-semibold text-pitch-green">
            FT
          </span>
        )}
      </div>

      {/* Teams */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex-1 text-center">
          <p className="text-lg font-bold text-white">{match.home_team}</p>
          {isFinished && (
            <p className="text-3xl font-black text-pitch-gold">
              {match.home_score}
            </p>
          )}
        </div>
        <span className="text-2xl text-pitch-muted-text">vs</span>
        <div className="flex-1 text-center">
          <p className="text-lg font-bold text-white">{match.away_team}</p>
          {isFinished && (
            <p className="text-3xl font-black text-pitch-gold">
              {match.away_score}
            </p>
          )}
        </div>
      </div>

      {/* Points earned after match finished */}
      {isFinished && prediction && (
        <div className="mb-4 flex items-center justify-center gap-2 rounded-xl bg-pitch-gold/10 py-2">
          <Trophy className="h-4 w-4 text-pitch-gold" />
          <span className="font-bold text-pitch-gold">
            {prediction.points_earned} pts earned
          </span>
        </div>
      )}

      {/* Prediction UI */}
      {canPredict && (
        <>
          {/* Mode toggle */}
          <div className="mb-3 flex rounded-xl bg-pitch-black p-1">
            {(["quick", "exact"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                  mode === m
                    ? "bg-pitch-green text-white"
                    : "text-pitch-muted-text"
                }`}
              >
                {m === "quick" ? "1 · X · 2" : "Exact Score"}
              </button>
            ))}
          </div>

          {mode === "quick" ? (
            <div className="mb-4 grid grid-cols-3 gap-2">
              {(
                [
                  { value: "1" as const, label: "1", sub: "Home" },
                  { value: "X" as const, label: "X", sub: "Draw" },
                  { value: "2" as const, label: "2", sub: "Away" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setQuickPick(opt.value)}
                  className={`flex min-h-16 flex-col items-center justify-center rounded-xl border-2 transition active:scale-95 ${
                    quickPick === opt.value
                      ? "border-pitch-green bg-pitch-green/20 text-white"
                      : "border-pitch-border bg-pitch-black text-pitch-muted-text"
                  }`}
                >
                  <span className="text-2xl font-black">{opt.label}</span>
                  <span className="text-xs">{opt.sub}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="mb-4 flex items-center justify-center gap-3">
              <input
                type="number"
                min={0}
                max={20}
                value={homeScore}
                onChange={(e) => setHomeScore(e.target.value)}
                className="w-20 rounded-xl border border-pitch-border bg-pitch-black py-3 text-center text-2xl font-bold text-white focus:border-pitch-green focus:outline-none"
                placeholder="0"
              />
              <span className="text-xl text-pitch-muted-text">-</span>
              <input
                type="number"
                min={0}
                max={20}
                value={awayScore}
                onChange={(e) => setAwayScore(e.target.value)}
                className="w-20 rounded-xl border border-pitch-border bg-pitch-black py-3 text-center text-2xl font-bold text-white focus:border-pitch-green focus:outline-none"
                placeholder="0"
              />
            </div>
          )}

          <Button
            onClick={handleSubmit}
            loading={loading}
            disabled={!hasValidPrediction}
            variant={saved ? "secondary" : "primary"}
          >
            {saved ? "Saved ✓" : "Submit Prediction"}
          </Button>
        </>
      )}

      {/* Show existing prediction for upcoming matches */}
      {canPredict && prediction && !saved && (
        <p className="mt-2 text-center text-sm text-pitch-muted-text">
          You already predicted — submit again to update
        </p>
      )}
    </div>
  );
}
