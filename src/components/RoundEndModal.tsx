import React from 'react';
import { Player, RoundScore } from '../types/game';
import { formatScore } from '../engine/scoring';
import { Award, ArrowRight } from 'lucide-react';

interface RoundEndModalProps {
  isOpen: boolean;
  roundScore: RoundScore | null;
  players: Player[];
  cumulativeScores: Record<string, number>;
  currentRound: number;
  totalRounds: number;
  onNextRound: () => void;
  isHost?: boolean;
}

export const RoundEndModal: React.FC<RoundEndModalProps> = ({
  isOpen,
  roundScore,
  players,
  cumulativeScores,
  currentRound,
  totalRounds,
  onNextRound,
  isHost = true,
}) => {
  if (!isOpen || !roundScore) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-2xl bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-950 border border-amber-400/50 p-4 shadow-2xl flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-amber-400/20 border border-amber-400 flex items-center justify-center mb-2">
          <Award className="w-6 h-6 text-amber-400" />
        </div>

        <h2 className="text-xl font-black text-amber-300 tracking-wide uppercase">
          Round {currentRound} Complete!
        </h2>
        <p className="text-xs text-emerald-200/80 mb-3">
          Scores calculated for this round
        </p>

        {/* Players results breakdown */}
        <div className="w-full space-y-2 mb-4">
          {players.map((p) => {
            const bid = roundScore.bids[p.id] || 0;
            const won = roundScore.tricksWon[p.id] || 0;
            const score = roundScore.scores[p.id] || 0;
            const total = cumulativeScores[p.id] || 0;
            const success = won >= bid;

            return (
              <div
                key={p.id}
                className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/10 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{p.avatar}</span>
                  <div className="text-left">
                    <span className="font-bold text-slate-100 block">{p.name}</span>
                    <span className="text-[10px] text-slate-400">
                      Bid: {bid} • Won: {won}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`font-mono font-bold ${
                      success ? 'text-emerald-300' : 'text-red-400'
                    }`}
                  >
                    {formatScore(score)}
                  </div>
                  <div className="text-[10px] text-amber-300/80">
                    Total: {formatScore(total)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Next Round CTA */}
        {isHost ? (
          <button
            onClick={onNextRound}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition active:scale-98"
          >
            <span>{currentRound >= totalRounds ? 'View Final Results' : 'Next Round'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="py-2 text-xs text-amber-300/80 animate-pulse">
            Waiting for host to begin next round...
          </div>
        )}
      </div>
    </div>
  );
};
