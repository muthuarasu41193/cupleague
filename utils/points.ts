import type { Match, Prediction, PredictionResult } from "@/lib/types";
import { REACTION_BONUS_POINTS } from "@/lib/constants";

/**
 * ============================================================
 *  SCORING LOGIC — all point calculations live here
 * ============================================================
 *
 *  Per finished match:
 *    • 3 pts — correct winner (or draw)
 *    • +2 pts — correct goal difference
 *    • +1 pt  — exact score
 *    Maximum: 6 pts per match
 *
 *  Reactions: +5 bonus pts to the target user (see constants)
 */

/** Points for picking the correct match outcome */
export const POINTS_CORRECT_WINNER = 3;

/** Bonus for correct goal difference */
export const POINTS_GOAL_DIFFERENCE = 2;

/** Bonus for exact score */
export const POINTS_EXACT_SCORE = 1;

/** Derive 1X2 result from a scoreline */
export function getResultFromScore(
  home: number,
  away: number
): PredictionResult {
  if (home > away) return "1";
  if (home < away) return "2";
  return "X";
}

/** Derive 1X2 result from a prediction (score or quick-pick) */
export function getPredictedResult(prediction: Prediction): PredictionResult | null {
  if (
    prediction.predicted_home !== null &&
    prediction.predicted_away !== null
  ) {
    return getResultFromScore(
      prediction.predicted_home,
      prediction.predicted_away
    );
  }
  return prediction.predicted_result;
}

/**
 * Calculate points for a single prediction against a finished match.
 * Returns 0 if the match isn't finished or scores are missing.
 */
export function calculatePredictionPoints(
  prediction: Prediction,
  match: Match
): number {
  if (match.status !== "finished") return 0;
  if (match.home_score === null || match.away_score === null) return 0;

  const actualHome = match.home_score;
  const actualAway = match.away_score;
  const actualResult = getResultFromScore(actualHome, actualAway);

  const predictedResult = getPredictedResult(prediction);
  if (!predictedResult) return 0;

  let points = 0;

  // Correct winner / draw
  if (predictedResult === actualResult) {
    points += POINTS_CORRECT_WINNER;
  } else {
    return 0; // no bonus without correct winner
  }

  // Goal difference bonus (needs numeric prediction)
  if (
    prediction.predicted_home !== null &&
    prediction.predicted_away !== null
  ) {
    const predDiff = prediction.predicted_home - prediction.predicted_away;
    const actualDiff = actualHome - actualAway;
    if (predDiff === actualDiff) {
      points += POINTS_GOAL_DIFFERENCE;
    }

    // Exact score bonus
    if (
      prediction.predicted_home === actualHome &&
      prediction.predicted_away === actualAway
    ) {
      points += POINTS_EXACT_SCORE;
    }
  }

  return points;
}

/**
 * Current streak: consecutive finished matches (newest first)
 * where the user earned at least POINTS_CORRECT_WINNER (got winner right).
 */
export function calculateStreak(
  predictions: Prediction[],
  matches: Match[]
): number {
  const matchMap = new Map(matches.map((m) => [m.id, m]));

  const finished = predictions
    .filter((p) => {
      const m = matchMap.get(p.match_id);
      return m?.status === "finished";
    })
    .sort((a, b) => {
      const dateA = matchMap.get(a.match_id)?.match_date ?? "";
      const dateB = matchMap.get(b.match_id)?.match_date ?? "";
      return dateB.localeCompare(dateA);
    });

  let streak = 0;
  for (const pred of finished) {
    const match = matchMap.get(pred.match_id)!;
    const pts = calculatePredictionPoints(pred, match);
    if (pts >= POINTS_CORRECT_WINNER) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

/**
 * Accuracy = % of finished-match predictions where winner was correct.
 */
export function calculateAccuracy(
  predictions: Prediction[],
  matches: Match[]
): number {
  const matchMap = new Map(matches.map((m) => [m.id, m]));

  const finished = predictions.filter((p) => {
    const m = matchMap.get(p.match_id);
    return m?.status === "finished";
  });

  if (finished.length === 0) return 0;

  const correct = finished.filter((p) => {
    const match = matchMap.get(p.match_id)!;
    return calculatePredictionPoints(p, match) >= POINTS_CORRECT_WINNER;
  });

  return Math.round((correct.length / finished.length) * 100);
}

/** Sum reaction bonus points received by a user */
export function sumReactionPoints(
  reactions: { target_user_id: string; points_awarded: number }[],
  userId: string
): number {
  return reactions
    .filter((r) => r.target_user_id === userId)
    .reduce((sum, r) => sum + (r.points_awarded ?? REACTION_BONUS_POINTS), 0);
}

/** Total points = prediction points + reaction bonuses */
export function calculateTotalPoints(
  predictions: Prediction[],
  reactions: { target_user_id: string; points_awarded: number }[],
  userId: string
): number {
  const predPoints = predictions
    .filter((p) => p.user_id === userId)
    .reduce((sum, p) => sum + p.points_earned, 0);

  return predPoints + sumReactionPoints(reactions, userId);
}
