import React, { useEffect } from 'react';
import { Player, RoundScore } from '../types/game';
import { computeRankings, formatScore } from '../engine/scoring';
import { recordGameStats } from '../engine/storage';
import { sound } from '../engine/sound';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Home, Sparkles } from 'lucide-react';

interface MatchEndModalProps {
  isOpen: boolean;
  players: Player[];
  cumulativeScores: Record<string, number>;
  roundScores: RoundScore[];
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export const MatchEndModal: React.FC<MatchEndModalProps> = ({
  isOpen,
  players,
  cumulativeScores,
  roundScores,
  onPlayAgain,
  onGoHome,
}) => {
  if (!isOpen) return null;

  const rankings = computeRankings(cumulativeScores);
  const userPlayer = players[0]; // South
  const userRankItem = rankings.find((r) => r.playerId === userPlayer.id);
  const isUserWinner = userRankItem?.rank === 1;

  useEffect(() => {
    sound.playVictory();
    // Fire celebratory confetti!
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#10b981', '#38bdf8', '#f43f5e', '#a855f7'],
      });
    } catch {
      // Ignore if canvas unavailable
    }

    // Save user stats to profile
    if (userRankItem) {
      const userRoundScores = roundScores.map((r) => r.scores[userPlayer.id] || 0);
      const totalTricks = roundScores.reduce((sum, r) => sum + (r.tricksWon[userPlayer.id] || 0), 0);
      recordGameStats(
        isUserWinner,
        totalTricks,
        userRankItem.totalScore,
        userRoundScores
      );
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in zoom-in-95 duration-200">
      <div className="w-full max-w-sm rounded-2xl bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-950 border border-amber-400/60 p-5 shadow-2xl flex flex-col items-center text-center">
        {/* Crown & Trophy */}
        <div className="relative mb-2">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-[0_0_25px_rgba(251,191,36,0.8)] animate-pulse">
            <Trophy className="w-9 h-9 text-slate-950" />
          </div>
          <Sparkles className="w-5 h-5 text-amber-300 absolute -top-1 -right-1 animate-spin" />
        </div>

        <h2 className="text-2xl font-black text-amber-300 tracking-wide uppercase">
          Match Finished!
        </h2>
        <p className="text-xs text-emerald-200/90 mb-4 font-medium">
          {isUserWinner
            ? '🏆 Outstanding Victory! You took 1st place!'
            : `Great game! You finished in #${userRankItem?.rank || 4} place.`}
        </p>

        {/* Podium list (1st, 2nd, 3rd, 4th) */}
        <div className="w-full space-y-2 mb-5">
          {rankings.map((rankItem) => {
            const player = players.find((p) => p.id === rankItem.playerId);
            if (!player) return null;

            const isUser = player.id === userPlayer.id;
            const medals: Record<number, string> = {
              1: '🥇 1st Place',
              2: '🥈 2nd Place',
              3: '🥉 3rd Place',
              4: '4th Place',
            };

            return (
              <div
                key={player.id}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                  rankItem.rank === 1
                    ? 'bg-amber-500/15 border-amber-400/70 shadow-[0_0_15px_rgba(251,191,36,0.2)]'
                    : 'bg-black/40 border-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{player.avatar}</span>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-100 text-xs">
                        {player.name}
                      </span>
                      {isUser && (
                        <span className="text-[9px] px-1 rounded bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-amber-400">
                      {medals[rankItem.rank]}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`font-mono font-bold text-sm ${
                      rankItem.totalScore >= 0 ? 'text-amber-300' : 'text-red-400'
                    }`}
                  >
                    {formatScore(rankItem.totalScore)} pts
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-2">
          <button
            onClick={onPlayAgain}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition active:scale-98"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Another Match</span>
          </button>

          <button
            onClick={onGoHome}
            className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 border border-white/10 transition active:scale-98"
          >
            <Home className="w-4 h-4 text-slate-400" />
            <span>Return to Lobby</span>
          </button>
        </div>
      </div>
    </div>
  );
};
