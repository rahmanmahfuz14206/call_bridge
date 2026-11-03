import { Card, PlayedCard, PlayerPosition, Suit } from '../types/game';

export const TRUMP_SUIT: Suit = 'spades';

/**
 * Validates whether a specific card is allowed to be played by Bangladeshi Call Bridge rules:
 * 1. If player is leading the trick (no cards played yet), ANY card in hand is valid.
 * 2. If a suit has been led:
 *    a. If player holds cards in the led suit, player MUST play a card of the led suit.
 *    b. If player has NO cards in the led suit (void in led suit):
 *       - Player MUST play a trump card (Spade) if they hold any Spades.
 *       - Only if player is also void in Spades (no led suit AND no Spades), they may discard any card.
 */
export function isMoveValid(
  card: Card,
  playerHand: Card[],
  ledSuit: Suit | null
): boolean {
  // If no suit led yet, leading player can play any card
  if (!ledSuit) {
    return true;
  }

  // Check if player has the led suit in hand
  const hasLedSuit = playerHand.some((c) => c.suit === ledSuit);
  if (hasLedSuit) {
    return card.suit === ledSuit;
  }

  // Player is void in led suit:
  // Must play trump (spades) if they have any trump
  const hasTrump = playerHand.some((c) => c.suit === TRUMP_SUIT);
  if (hasTrump) {
    return card.suit === TRUMP_SUIT;
  }

  // Player has neither led suit nor trump: can play any card
  return true;
}

/**
 * Returns all playable cards from player's hand given current trick state
 */
export function getPlayableCards(
  playerHand: Card[],
  ledSuit: Suit | null
): Card[] {
  return playerHand.filter((card) => isMoveValid(card, playerHand, ledSuit));
}

/**
 * Determines the winner of a completed or in-progress trick.
 * In Call Bridge:
 * - If trump cards (Spades) are played, the highest trump card wins.
 * - Otherwise, the highest card of the led suit wins.
 */
export function evaluateTrickWinner(playedCards: PlayedCard[]): PlayedCard {
  if (playedCards.length === 0) {
    throw new Error('Cannot evaluate empty trick');
  }

  const ledSuit = playedCards[0].card.suit;

  // Filter trump cards (spades)
  const trumpPlays = playedCards.filter((p) => p.card.suit === TRUMP_SUIT);
  if (trumpPlays.length > 0) {
    // Highest rank among trumps
    return trumpPlays.reduce((highest, current) =>
      current.card.rank > highest.card.rank ? current : highest
    );
  }

  // No trumps played: highest rank of the led suit wins
  const ledSuitPlays = playedCards.filter((p) => p.card.suit === ledSuit);
  return ledSuitPlays.reduce((highest, current) =>
    current.card.rank > highest.card.rank ? current : highest
  );
}

/**
 * Compare two cards under current trick context to check if cardA beats cardB
 */
export function doesCardBeat(
  cardA: Card,
  cardB: Card,
  ledSuit: Suit
): boolean {
  if (cardA.suit === TRUMP_SUIT && cardB.suit !== TRUMP_SUIT) return true;
  if (cardA.suit !== TRUMP_SUIT && cardB.suit === TRUMP_SUIT) return false;
  if (cardA.suit === TRUMP_SUIT && cardB.suit === TRUMP_SUIT) {
    return cardA.rank > cardB.rank;
  }
  if (cardA.suit === ledSuit && cardB.suit === ledSuit) {
    return cardA.rank > cardB.rank;
  }
  if (cardA.suit === ledSuit && cardB.suit !== ledSuit) return true;
  return false;
}

/**
 * In Bangladeshi Call Bridge, turns and distributor rotation proceed ANTI-CLOCKWISE:
 * South (0, Bottom) -> East (3, Right) -> North (2, Top) -> West (1, Left) -> South (0, Bottom)
 */
export function getNextAntiClockwisePlayer(position: PlayerPosition): PlayerPosition {
  return ((position - 1 + 4) % 4) as PlayerPosition;
}

