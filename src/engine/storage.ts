export interface PlayerProfile {
  id: string;
  name: string;
  avatar: string;
  gamesPlayed: number;
  gamesWon: number;
  totalTricksWon: number;
  totalScoreAccumulated: number;
  highestRoundScore: number;
}

const DEFAULT_AVATARS = [
  '👑', // Crown / Kingpin
  '🐯', // Royal Bengal Tiger
  '🦅', // Eagle
  '♠️', // Master of Spades
  '💎', // Diamond High Roller
  '🦁', // Lion
  '⚡', // Thunderbolt
  '🎩', // Classic Gentleman
];

export { DEFAULT_AVATARS };

const STORAGE_KEY = 'call_bridge_player_profile';

export function getPlayerProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Ignore fallback
  }

  // Generate default player
  const defaultProfile: PlayerProfile = {
    id: 'user_' + Math.random().toString(36).substring(2, 9),
    name: 'Champion',
    avatar: '🐯',
    gamesPlayed: 0,
    gamesWon: 0,
    totalTricksWon: 0,
    totalScoreAccumulated: 0,
    highestRoundScore: 0,
  };

  savePlayerProfile(defaultProfile);
  return defaultProfile;
}

export function savePlayerProfile(profile: PlayerProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore
  }
}

export function recordGameStats(won: boolean, tricksWon: number, finalScore: number, roundScores: number[]): void {
  const profile = getPlayerProfile();
  profile.gamesPlayed += 1;
  if (won) profile.gamesWon += 1;
  profile.totalTricksWon += tricksWon;
  profile.totalScoreAccumulated += Math.round(finalScore * 10) / 10;
  
  if (roundScores.length > 0) {
    const maxRound = Math.max(...roundScores);
    if (maxRound > profile.highestRoundScore) {
      profile.highestRoundScore = maxRound;
    }
  }

  savePlayerProfile(profile);
}
