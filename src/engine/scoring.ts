export interface ScoringConfig {
  overtrickMultiplier: number; // default 0.1: each trick over bid earns 0.1
  failedBidPenalty: 'negative_bid' | 'negative_difference'; // 'negative_bid' default: score = -bid
  exactBidBonus?: number; // optional bonus if needed
}

export const DEFAULT_SCORING_CONFIG: ScoringConfig = {
  overtrickMultiplier: 0.1,
  failedBidPenalty: 'negative_bid',
  exactBidBonus: 0,
};

/**
 * Calculates a player's score for a single round based on Call Bridge rules.
 *
 * Rules:
 * - If tricksWon === bid: score = bid
 * - If tricksWon > bid: score = bid + (tricksWon - bid) * 0.1
 *   (e.g., bid 3, won 4 => 3.1; bid 4, won 6 => 4.2)
 * - If tricksWon < bid: score = -bid
 *   (e.g., bid 3, won 2 => -3)
 */
export function calculateRoundScore(
  bid: number,
  tricksWon: number,
  config: ScoringConfig = DEFAULT_SCORING_CONFIG
): number {
  if (bid <= 0) return 0;

  if (tricksWon >= bid) {
    const extraTricks = tricksWon - bid;
    const baseScore = bid + (config.exactBidBonus || 0);
    const score = baseScore + extraTricks * config.overtrickMultiplier;
    // Round to 1 decimal place to prevent floating-point artifacts like 3.1000000000000005
    return Math.round(score * 10) / 10;
  } else {
    if (config.failedBidPenalty === 'negative_bid') {
      return -bid;
    } else {
      return -(bid - tricksWon);
    }
  }
}

/**
 * Format score cleanly for UI display (e.g., 3.1, -3, 0)
 */
export function formatScore(score: number): string {
  if (score === 0) return '0';
  if (Number.isInteger(score)) {
    return score > 0 ? `+${score}` : `${score}`;
  }
  return score > 0 ? `+${score.toFixed(1)}` : `${score.toFixed(1)}`;
}

export interface PlayerRankResult {
  playerId: string;
  totalScore: number;
  totalTricks: number;
  totalBids: number;
  rank: 1 | 2 | 3 | 4;
}

/**
 * Computes rankings given cumulative scores for each player
 */
export function computeRankings(
  cumulativeScores: Record<string, number>,
  totalTricksWon: Record<string, number> = {},
  totalBidsPlaced: Record<string, number> = {}
): PlayerRankResult[] {
  const entries = Object.entries(cumulativeScores).map(([playerId, totalScore]) => ({
    playerId,
    totalScore: Math.round(totalScore * 10) / 10,
    totalTricks: totalTricksWon[playerId] || 0,
    totalBids: totalBidsPlaced[playerId] || 0,
  }));

  // Sort descending by score; if tied, sort by tricks won
  entries.sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    return b.totalTricks - a.totalTricks;
  });

  return entries.map((entry, index) => ({
    ...entry,
    rank: (index + 1) as 1 | 2 | 3 | 4,
  }));
}
