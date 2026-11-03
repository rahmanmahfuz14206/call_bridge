import React from 'react';
import { getPlayerProfile } from '../engine/storage';
import { BarChart3, Trophy, Flame, Target, X } from 'lucide-react';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const profile = getPlayerProfile();
  const winRate =
    profile.gamesPlayed > 0
      ? Math.round((profile.gamesWon / profile.gamesPlayed) * 100)
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-950 border border-amber-400/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 bg-black/40 border-b border-amber-400/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-amber-300">Player Career Statistics</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Hero Profile */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/10">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-3xl shadow-md border-2 border-amber-300">
              {profile.avatar}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">{profile.name}</h3>
              <p className="text-xs text-amber-400 font-medium">Call Bridge Master</p>
              <div className="flex items-center gap-1 text-[11px] text-emerald-300 mt-0.5">
                <Target className="w-3 h-3" />
                <span>Win Rate: {winRate}%</span>
              </div>
            </div>
          </div>

          {/* Stat Cards Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-black/30 border border-white/5 flex flex-col">
              <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                <Trophy className="w-3.5 h-3.5 text-amber-400" /> Matches Won
              </span>
              <span className="text-lg font-bold font-mono text-white mt-1">
                {profile.gamesWon} / {profile.gamesPlayed}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-black/30 border border-white/5 flex flex-col">
              <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                <Flame className="w-3.5 h-3.5 text-red-400" /> Tricks Won
              </span>
              <span className="text-lg font-bold font-mono text-amber-300 mt-1">
                {profile.totalTricksWon}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-black/30 border border-white/5 flex flex-col">
              <span className="text-slate-400 text-[11px]">Best Round Score</span>
              <span className="text-lg font-bold font-mono text-emerald-300 mt-1">
                {profile.highestRoundScore > 0 ? `+${profile.highestRoundScore}` : profile.highestRoundScore}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-black/30 border border-white/5 flex flex-col">
              <span className="text-slate-400 text-[11px]">Total Pts Earned</span>
              <span className="text-lg font-bold font-mono text-slate-200 mt-1">
                {profile.totalScoreAccumulated.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-black/40 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition active:scale-98"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
