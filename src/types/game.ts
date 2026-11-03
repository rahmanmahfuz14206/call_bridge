export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';

export type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

export interface Card {
  id: string; // e.g. "spades-14"
  suit: Suit;
  rank: Rank;
}

export type PlayerPosition = 0 | 1 | 2 | 3; // 0: South (Human/Local), 1: West, 2: North, 3: East

export interface Player {
  id: string;
  name: string;
  avatar: string;
  isAi: boolean;
  aiDifficulty?: 'easy' | 'medium' | 'hard';
  position: PlayerPosition;
  isHost?: boolean;
  isReady?: boolean;
  connected?: boolean;
}

export interface PlayedCard {
  playerId: string;
  position: PlayerPosition;
  card: Card;
}

export interface Trick {
  trickNumber: number; // 1 to 13
  leadPlayer: PlayerPosition;
  cards: PlayedCard[];
  winnerPlayer?: PlayerPosition;
  winningCard?: Card;
}

export interface RoundScore {
  roundNumber: number;
  bids: Record<string, number>; // playerId -> bid
  tricksWon: Record<string, number>; // playerId -> won
  scores: Record<string, number>; // playerId -> round score
  cumulativeScores: Record<string, number>; // playerId -> cumulative score up to this round
}

export type GamePhase =
  | 'idle'
  | 'dealing'
  | 'bidding'
  | 'playing'
  | 'trick_completed'
  | 'round_end'
  | 'match_end';

export interface GameSettings {
  totalRounds: number; // 3 to 10
  aiDifficulty: 'easy' | 'medium' | 'hard';
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  fastAnimations: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  isQuickMsg?: boolean;
}

export interface RoomState {
  roomCode: string;
  hostId: string;
  roundsCount: number;
  players: (Player | null)[]; // 4 slots
  status: 'waiting' | 'in_game' | 'completed';
  allowAiFill: boolean;
}
