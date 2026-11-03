import React from 'react';
import { Player, RoundScore } from '../types/game';
import { computeRankings, formatScore } from '../engine/scoring';
import { Trophy, X } from 'lucide-react';

interface ScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  roundScores: RoundScore[];
  cumulativeScores: Record<string, number>;
  totalRounds: number;
  currentRound: number;
}

export const ScoreModal: React.FC<ScoreModalProps> = ({
  isOpen,
  onClose,
  players,
  roundScores,
  cumulativeScores,
  totalRounds,
  currentRound,
}) => {
  if (!isOpen) return null;

  // Compute player rankings
  const rankings = computeRankings(cumulativeScores);

  const getRankBadge = (playerId: string) => {
    const item = rankings.find((r) => r.playerId === playerId);
    if (!item) return null;
    if (item.rank === 1) return <span className="text-amber-400 font-bold">🥇 1st</span>;
    if (item.rank === 2) return <span className="text-slate-300 font-bold">🥈 2nd</span>;
    if (item.rank === 3) return <span className="text-amber-600 font-bold">🥉 3rd</span>;
    return <span className="text-slate-400 font-medium">4th</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-950 border border-amber-400/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-4 py-3 bg-black/40 border-b border-amber-400/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-base sm:text-lg font-bold text-amber-300 tracking-wide">
              Match Score Sheet
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Round {Math.min(currentRound, totalRounds)} / {totalRounds}
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="p-3 sm:p-4 overflow-y-auto flex-1">
          {/* Rankings summary banner */}
          <div className="grid grid-cols-4 gap-1.5 mb-3 p-2 rounded-xl bg-black/40 border border-white/10">
            {players.map((p) => {
              const totalScore = cumulativeScores[p.id] || 0;
              return (
                <div key={p.id} className="flex flex-col items-center text-center">
                  <span className="text-lg">{p.avatar}</span>
                  <span className="text-xs font-semibold text-slate-200 truncate w-full">
                    {p.name}
                  </span>
                  <div className="text-[11px] mt-0.5">{getRankBadge(p.id)}</div>
                  <span
                    className={`text-xs font-mono font-bold mt-0.5 ${
                      totalScore >= 0 ? 'text-amber-300' : 'text-red-400'
                    }`}
                  >
                    {formatScore(totalScore)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Detailed round breakdown */}
          <div className="border border-white/10 rounded-xl overflow-hidden bg-black/30">
            <table className="w-full text-left text-xs">
              <thead className="bg-emerald-950/80 text-amber-200/90 border-b border-white/10 text-[11px]">
                <tr>
                  <th className="py-2 px-2 text-center w-12">Rnd</th>
                  {players.map((p) => (
                    <th key={p.id} className="py-2 px-1 text-center truncate">
                      {p.name.split(' ')[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {roundScores.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-6 text-center text-slate-400 text-xs italic"
                    >
                      No completed rounds yet. Scores will be tallied after Trick 13!
                    </td>
                  </tr>
                ) : (
                  roundScores.map((r) => (
                    <tr key={r.roundNumber} className="hover:bg-white/5 transition-colors">
                      <td className="py-2 px-2 text-center font-bold text-amber-400/90">
                        R{r.roundNumber}
                      </td>
                      {players.map((p) => {
                        const bid = r.bids[p.id] || 0;
                        const won = r.tricksWon[p.id] || 0;
                        const score = r.scores[p.id] || 0;
                        const isPenalty = score < 0;

                        return (
                          <td key={p.id} className="py-1.5 px-1 text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-[10px] text-slate-400">
                                {bid} ➔ {won}
                              </span>
                              <span
                                className={`font-mono font-bold ${
                                  isPenalty ? 'text-red-400' : 'text-emerald-300'
                                }`}
                              >
                                {formatScore(score)}
                              </span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
              {/* Grand Total Row */}
              <tfoot className="bg-amber-950/40 border-t border-amber-400/30 text-amber-300 font-bold">
                <tr>
                  <td className="py-2.5 px-2 text-center">Total</td>
                  {players.map((p) => {
                    const total = cumulativeScores[p.id] || 0;
                    return (
                      <td key={p.id} className="py-2.5 px-1 text-center font-mono text-sm">
                        <span className={total >= 0 ? 'text-amber-300' : 'text-red-400'}>
                          {formatScore(total)}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Scoring rule brief hint */}
          <div className="mt-3 p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-[11px] text-emerald-200/80 leading-relaxed">
            <span className="font-bold text-amber-400">Rule:</span> Reach exact bid = bid pts • Extra tricks = +0.1 pt each (e.g. Bid 3, Won 4 = 3.1) • Failed bid = -bid penalty.
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-black/40 border-t border-white/10 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg transition active:scale-98"
          >
            Close Sheet
          </button>
        </div>
      </div>
    </div>
  );
};
