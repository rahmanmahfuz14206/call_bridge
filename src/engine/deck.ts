import { Card, Rank, Suit } from '../types/game';

export const SUITS: Suit[] = ['spades', 'hearts', 'clubs', 'diamonds'];
export const RANKS: Rank[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

export const RANK_NAMES: Record<Rank, string> = {
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: '10',
  11: 'J',
  12: 'Q',
  13: 'K',
  14: 'A',
};

export const SUIT_SYMBOLS: Record<Suit, string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
};

export const SUIT_COLORS: Record<Suit, string> = {
  spades: '#1e293b', // deep slate/black
  hearts: '#dc2626', // rich crimson
  diamonds: '#dc2626', // rich crimson
  clubs: '#1e293b', // deep slate/black
};

/**
 * Creates a standard pristine 52-card deck
 */
export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: `${suit}-${rank}`,
        suit,
        rank,
      });
    }
  }
  return deck;
}

/**
 * Fisher-Yates shuffle
 */
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Deal 52 cards to 4 players (13 cards each)
 */
export function dealHands(deck?: Card[]): [Card[], Card[], Card[], Card[]] {
  const shuffled = shuffleDeck(deck || createDeck());
  const hands: [Card[], Card[], Card[], Card[]] = [[], [], [], []];

  for (let i = 0; i < 52; i++) {
    hands[i % 4].push(shuffled[i]);
  }

  // Sort each hand by suit and rank for clean UX
  return [
    sortHand(hands[0]),
    sortHand(hands[1]),
    sortHand(hands[2]),
    sortHand(hands[3]),
  ];
}

/**
 * Sort hand: Hearts, Clubs, Diamonds, Spades (Trumps).
 * Within suit, ascending (2, 3 ... 10, J, Q, K, A) matching authentic card games
 */
export function sortHand(hand: Card[]): Card[] {
  const suitOrder: Record<Suit, number> = {
    hearts: 0,
    clubs: 1,
    diamonds: 2,
    spades: 3, // Spades (Trump) grouped together
  };

  return [...hand].sort((a, b) => {
    if (suitOrder[a.suit] !== suitOrder[b.suit]) {
      return suitOrder[a.suit] - suitOrder[b.suit];
    }
    return a.rank - b.rank; // 2, 3, 4 ... 10, J, Q, K, A
  });
}
