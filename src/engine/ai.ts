import { Card, PlayedCard, Player, Suit } from '../types/game';
import { TRUMP_SUIT, evaluateTrickWinner, getPlayableCards } from './rules';

export interface AiEvaluation {
  bid: number;
  confidence: number;
  trumpCount: number;
  highCardPoints: number;
}

/**
 * Evaluates hand strength and estimates realistic Call Bridge bid
 */
export function evaluateAiBid(
  hand: Card[],
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): number {
  const suits: Record<Suit, Card[]> = {
    spades: hand.filter((c) => c.suit === 'spades'),
    hearts: hand.filter((c) => c.suit === 'hearts'),
    clubs: hand.filter((c) => c.suit === 'clubs'),
    diamonds: hand.filter((c) => c.suit === 'diamonds'),
  };

  let estimatedTricks = 0;

  // 1. Spades (Trump) evaluation
  const spades = suits.spades;
  const spadeCount = spades.length;

  const hasSpadeAce = spades.some((c) => c.rank === 14);
  const hasSpadeKing = spades.some((c) => c.rank === 13);
  const hasSpadeQueen = spades.some((c) => c.rank === 12);
  const hasSpadeJack = spades.some((c) => c.rank === 11);

  if (hasSpadeAce) estimatedTricks += 1.0;
  if (hasSpadeKing) {
    estimatedTricks += spadeCount >= 2 ? 0.9 : 0.6;
  }
  if (hasSpadeQueen) {
    estimatedTricks += spadeCount >= 3 ? 0.7 : 0.3;
  }
  if (hasSpadeJack && spadeCount >= 4) {
    estimatedTricks += 0.4;
  }

  // Length trump tricks (long trump hand usually wins tricks once plain suits run out)
  if (spadeCount >= 5) {
    estimatedTricks += (spadeCount - 4) * 0.8;
  }

  // 2. Plain suits (Hearts, Clubs, Diamonds) evaluation
  const nonTrumpSuits: Suit[] = ['hearts', 'clubs', 'diamonds'];
  let shortSuitsCount = 0;

  for (const suit of nonTrumpSuits) {
    const cards = suits[suit];
    const len = cards.length;

    const hasAce = cards.some((c) => c.rank === 14);
    const hasKing = cards.some((c) => c.rank === 13);
    const hasQueen = cards.some((c) => c.rank === 12);

    if (hasAce) {
      estimatedTricks += 0.9;
    }
    if (hasKing) {
      if (hasAce) {
        estimatedTricks += 0.7; // A-K sequence
      } else if (len >= 2) {
        estimatedTricks += 0.6; // Guarded King
      } else {
        estimatedTricks += 0.25; // Singleton King prone to getting ruffed/taken by Ace
      }
    }
    if (hasQueen && hasAce && hasKing) {
      estimatedTricks += 0.5;
    } else if (hasQueen && len >= 3) {
      estimatedTricks += 0.3;
    }

    if (len <= 1) {
      shortSuitsCount++;
    }
  }

  // 3. Ruffing potential: Short plain suit with spare trumps
  if (spadeCount >= 3 && shortSuitsCount > 0) {
    estimatedTricks += Math.min(shortSuitsCount * 0.6, spadeCount - 2);
  }

  let finalBid = Math.round(estimatedTricks);

  // Difficulty adjustment
  if (difficulty === 'easy') {
    // Easy AI adds slight erratic offset (-1 to +1)
    const offset = Math.floor(Math.random() * 3) - 1;
    finalBid += offset;
  } else if (difficulty === 'hard') {
    // Hard AI is disciplined: bidding too high carries heavy negative penalty,
    // so it prefers a solid attainable call unless cards are rock-solid
    if (estimatedTricks - Math.floor(estimatedTricks) < 0.35) {
      finalBid = Math.floor(estimatedTricks);
    }
  }

  // Clamp bid between 1 and 13 (Standard Call Bridge requires min 1 bid)
  return Math.max(1, Math.min(10, finalBid));
}

/**
 * Selects the smartest move for an AI player
 */
export function chooseAiCard(
  hand: Card[],
  currentTrickCards: PlayedCard[],
  aiPlayer: Player,
  bid: number,
  tricksWon: number,
  cardsPlayedSoFar: Card[] = []
): Card {
  const ledSuit = currentTrickCards.length > 0 ? currentTrickCards[0].card.suit : null;
  const playable = getPlayableCards(hand, ledSuit);

  if (playable.length === 1) {
    return playable[0];
  }

  const difficulty = aiPlayer.aiDifficulty || 'medium';
  const tricksNeeded = Math.max(0, bid - tricksWon);
  const wantsTrick = tricksNeeded > 0;

  // Easy mode has a 25% chance to make a naive legal play
  if (difficulty === 'easy' && Math.random() < 0.25) {
    return playable[Math.floor(Math.random() * playable.length)];
  }

  // Case 1: AI is Leading the trick
  if (!ledSuit) {
    if (wantsTrick) {
      // Cash side aces (guaranteed winners early before opponents get voids)
      const sideAces = playable.filter((c) => c.suit !== TRUMP_SUIT && c.rank === 14);
      if (sideAces.length > 0) {
        return sideAces[0];
      }

      // Strong sequence: King where AI also holds Queen
      const strongKings = playable.filter((c) => {
        if (c.rank !== 13) return false;
        return hand.some((other) => other.suit === c.suit && other.rank === 12);
      });
      if (strongKings.length > 0) {
        return strongKings[0];
      }

      // Lead high spade if AI holds dominant trump to pull trumps
      const spadeAces = playable.filter((c) => c.suit === TRUMP_SUIT && c.rank === 14);
      if (spadeAces.length > 0 && hand.filter((c) => c.suit === TRUMP_SUIT).length >= 4) {
        return spadeAces[0];
      }

      // Lead low card from longest suit to establish it
      const sortedByLength = [...playable].sort((a, b) => {
        const lenA = hand.filter((c) => c.suit === a.suit).length;
        const lenB = hand.filter((c) => c.suit === b.suit).length;
        return lenB - lenA;
      });
      return sortedByLength[sortedByLength.length - 1];
    } else {
      // AI already made its bid, wants to avoid excess tricks:
      // Lead lowest card from non-trump suit
      const nonTrumps = playable.filter((c) => c.suit !== TRUMP_SUIT);
      if (nonTrumps.length > 0) {
        nonTrumps.sort((a, b) => a.rank - b.rank);
        return nonTrumps[0];
      }
      // Only trumps left: lead lowest trump
      const sortedTrumps = [...playable].sort((a, b) => a.rank - b.rank);
      return sortedTrumps[0];
    }
  }

  // Case 2: AI is following the trick (cards already played)
  const currentWinningPlay = evaluateTrickWinner(currentTrickCards);
  const currentWinningCard = currentWinningPlay.card;
  const isWinningTrump = currentWinningCard.suit === TRUMP_SUIT;

  // Subcase 2A: Playing the led suit
  if (playable[0].suit === ledSuit) {
    // Separate winning cards from losing cards
    let winningCards: Card[] = [];
    if (!isWinningTrump) {
      winningCards = playable.filter((c) => c.rank > currentWinningCard.rank);
    } // if trump was already played, no led-suit card can win

    if (wantsTrick && winningCards.length > 0) {
      // If AI is last to play in trick (4th player), win as cheaply as possible
      const isLastPlayer = currentTrickCards.length === 3;
      if (isLastPlayer) {
        winningCards.sort((a, b) => a.rank - b.rank);
        return winningCards[0]; // Lowest winning card
      }

      // 2nd or 3rd player:
      // If AI has the Ace, take it
      const ace = winningCards.find((c) => c.rank === 14);
      if (ace) return ace;

      // Otherwise win with lowest winner
      winningCards.sort((a, b) => a.rank - b.rank);
      return winningCards[0];
    } else {
      // Cannot win, or does NOT want trick: dump lowest card
      const losingCards = [...playable].sort((a, b) => a.rank - b.rank);
      return losingCards[0];
    }
  }

  // Subcase 2B: Player is VOID in led suit!
  // Under Bangladeshi Call Bridge rules: if player has Spades (trump), MUST play a Spade
  const trumpCards = playable.filter((c) => c.suit === TRUMP_SUIT);
  if (trumpCards.length > 0) {
    // Must play trump
    if (isWinningTrump) {
      // Trump already played by earlier player: can we beat it?
      const higherTrumps = trumpCards.filter((c) => c.rank > currentWinningCard.rank);
      if (wantsTrick && higherTrumps.length > 0) {
        // Overtrump with lowest winning trump
        higherTrumps.sort((a, b) => a.rank - b.rank);
        return higherTrumps[0];
      } else {
        // Can't beat or doesn't want: play lowest trump
        trumpCards.sort((a, b) => a.rank - b.rank);
        return trumpCards[0];
      }
    } else {
      // First trump in this trick!
      if (wantsTrick) {
        // Ruff with lowest trump
        trumpCards.sort((a, b) => a.rank - b.rank);
        return trumpCards[0];
      } else {
        // Forced to trump even if doesn't want trick: play lowest trump
        trumpCards.sort((a, b) => a.rank - b.rank);
        return trumpCards[0];
      }
    }
  }

  // Subcase 2C: Void in led suit AND void in trump
  // Can discard any card: dump lowest card or sluff unwanted high card
  const discards = [...playable].sort((a, b) => a.rank - b.rank);
  return discards[0];
}
