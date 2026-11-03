import React from 'react';
import { BookOpen, X, ShieldAlert, Award, Layers } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md max-h-[85vh] bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-950 border border-amber-400/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 bg-black/40 border-b border-amber-400/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-amber-300">How to Play Call Bridge</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs text-slate-200 leading-relaxed">
          {/* Section 1: Overview */}
          <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Layers className="w-4 h-4" />
              <span>Game Overview</span>
            </div>
            <p>
              Call Bridge is a renowned 4-player trick-taking game played with a standard 52-card deck. Each player is dealt <strong>13 cards</strong>.
            </p>
            <p className="text-amber-300/90 font-medium">
              ♠️ <strong>Spades are ALWAYS the permanent trump suit!</strong>
            </p>
          </div>

          {/* Section 2: Bidding Phase */}
          <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1.5">
            <div className="text-amber-400 font-bold text-sm">1. Bidding (Calling)</div>
            <p>
              Before playing, each player inspects their 13 cards and calls the number of tricks (from 1 to 13) they anticipate winning.
            </p>
            <p className="text-slate-400">
              Tip: Count your high cards (Aces, Kings) and trump length carefully. Underbidding slightly is safer than suffering negative penalties!
            </p>
          </div>

          {/* Section 3: Trick Rules & Mandatory Ruffing */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/30 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>2. Bangladeshi Trick Rules (Crucial!)</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-slate-300">
              <li>
                <strong>Follow Suit:</strong> You <em>must</em> play a card of the led suit if you have one.
              </li>
              <li>
                <strong>Mandatory Trumping:</strong> If you are void in the led suit, you <strong>MUST</strong> play a Trump (Spade) if you have any!
              </li>
              <li>
                <strong>Discard:</strong> Only if you have neither the led suit NOR any Spades may you discard any other card.
              </li>
              <li>
                <strong>Winner:</strong> Highest Spade played takes the trick. If no Spades are played, the highest card of the led suit wins. Winner leads the next trick.
              </li>
            </ul>
          </div>

          {/* Section 4: Authentic Scoring Engine */}
          <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>3. Authentic Scoring System</span>
            </div>
            <ul className="space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">🎯 Exact Bid:</span>
                <span>If you win exactly your bid, you get that score (e.g. Bid 3, Won 3 = <strong>3.0 pts</strong>).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✨ Extra Tricks:</span>
                <span>You get +0.1 for every extra trick over your bid (e.g. Bid 3, Won 4 = <strong>3.1 pts</strong>; Bid 4, Won 6 = <strong>4.2 pts</strong>).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">⚠️ Failed Bid:</span>
                <span>If you fall short of your bid, you lose your entire bid value (e.g. Bid 3, Won 2 = <strong>-3.0 pts</strong>).</span>
              </li>
            </ul>
          </div>

          {/* Section 5: Match Conclusion */}
          <div className="p-3 rounded-xl bg-black/30 border border-white/5">
            <span className="text-amber-400 font-bold">Match Winning:</span> A full match runs for 3 to 10 sets/rounds. The player with the highest cumulative total score wins 1st place!
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-black/40 border-t border-white/10 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition active:scale-98"
          >
            Got It, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};
