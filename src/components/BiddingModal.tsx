import React, { useState } from 'react';
import { Card, Player, PlayerPosition } from '../types/game';
import { evaluateAiBid } from '../engine/ai';
import { sound } from '../engine/sound';
import { Sparkles } from 'lucide-react';

interface BiddingModalProps {
  isOpen: boolean;
  hand: Card[];
  currentTurn: PlayerPosition;
  userPosition: PlayerPosition;
  players: Player[];
  bids: Record<string, number>;
  onPlaceBid: (bid: number) => void;
}

export const BiddingModal: React.FC<BiddingModalProps> = ({
  isOpen,
  hand,
  currentTurn,
  userPosition,
  players,
  bids,
  onPlaceBid,
}) => {
  if (!isOpen) return null;

  const isUserTurn = currentTurn === userPosition;
  const recommendedBid = evaluateAiBid(hand, 'hard');
  const [selectedBid, setSelectedBid] = useState<number>(recommendedBid);
  const [showHint, setShowHint] = useState<boolean>(false);

  const handleSubmit = () => {
    sound.playBidPing();
    onPlaceBid(selectedBid);
  };

  const handleSelectNumber = (val: number) => {
    setSelectedBid(val);
    sound.playCardDeal();
  };

  const currentBidder = players.find((p) => p.position === currentTurn);

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-between p-2 pointer-events-none select-none">
      {/* Top spacer (leaves North seat and top bar visible) */}
      <div className="h-16 sm:h-20" />

      {/* Center Table Bidding Card (Matches reference design in Image 2) */}
      <div className="pointer-events-auto mx-auto w-full max-w-[310px] sm:max-w-xs rounded-2xl bg-[#093522] border-2 border-emerald-500/60 p-3 sm:p-4 shadow-[0_12px_40px_rgba(0,0,0,0.85)] flex flex-col items-center text-center animate-in zoom-in-95 duration-150">
        {/* Title */}
        <h2 className="text-base sm:text-lg font-black text-[#a3e635] tracking-wide mb-1 drop-shadow-sm">
          Make a Bid
        </h2>

        {/* Hint message if tapped */}
        {showHint && (
          <div className="mb-2 px-3 py-1 rounded-full bg-black/40 border border-amber-400/50 text-amber-300 text-[11px] font-semibold flex items-center gap-1.5 animate-fadeIn">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>Suggested Call: <strong className="text-white text-xs">{recommendedBid} Tricks</strong></span>
          </div>
        )}

        {/* Status of Opponents' Bids */}
        <div className="flex items-center justify-center gap-2 mb-3">
          {players
            .filter((p) => p.position !== userPosition)
            .map((p) => {
              const hasBid = typeof bids[p.id] === 'number';
              const isTurn = currentTurn === p.position;

              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border ${
                    isTurn
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold animate-pulse'
                      : hasBid
                      ? 'bg-emerald-950 border-emerald-500/40 text-emerald-200'
                      : 'bg-black/30 border-white/5 text-slate-400'
                  }`}
                >
                  <span>{p.avatar}</span>
                  <span className="font-semibold">{p.name.split(' ')[0]}:</span>
                  <span className="font-bold font-mono">
                    {hasBid ? bids[p.id] : isTurn ? '...' : '-'}
                  </span>
                </div>
              );
            })}
        </div>

        {/* Circular Number Selection Grid (Matching Image 2 Reference) */}
        {isUserTurn ? (
          <div className="w-full flex flex-col items-center">
            {/* Row 1: 1, 2, 3, 4, 5 */}
            <div className="flex items-center justify-center gap-2 sm:gap-2.5 mb-2">
              {[1, 2, 3, 4, 5].map((val) => {
                const isSelected = selectedBid === val;
                return (
                  <button
                    key={val}
                    onClick={() => handleSelectNumber(val)}
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full font-bold text-sm sm:text-base flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-[#84cc16] text-slate-950 font-black shadow-[0_0_12px_rgba(132,204,22,0.8)] scale-110 ring-2 ring-white'
                        : 'bg-[#0f4d30] hover:bg-[#14603c] text-emerald-100 border border-emerald-400/30'
                    }`}
                  >
                    {val}
                  </button>
                );
              })}
            </div>

            {/* Row 2: 6, 7, 8, 9, 10 */}
            <div className="flex items-center justify-center gap-2 sm:gap-2.5 mb-3">
              {[6, 7, 8, 9, 10].map((val) => {
                const isSelected = selectedBid === val;
                return (
                  <button
                    key={val}
                    onClick={() => handleSelectNumber(val)}
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full font-bold text-sm sm:text-base flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-[#84cc16] text-slate-950 font-black shadow-[0_0_12px_rgba(132,204,22,0.8)] scale-110 ring-2 ring-white'
                        : 'bg-[#0f4d30] hover:bg-[#14603c] text-emerald-100 border border-emerald-400/30'
                    }`}
                  >
                    {val}
                  </button>
                );
              })}
            </div>

            {/* Bottom Buttons: [ Hint ] and [ BID ] (Matching Image 2) */}
            <div className="w-full flex items-center gap-2">
              <button
                onClick={() => {
                  setShowHint(true);
                  setSelectedBid(recommendedBid);
                  sound.playBidPing();
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#854d0e] hover:bg-[#a16207] border border-amber-500/40 text-amber-100 font-bold text-xs uppercase tracking-wider shadow-md transition active:scale-95"
              >
                Hint
              </button>

              <button
                onClick={handleSubmit}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#eab308] via-[#ca8a04] to-[#a16207] hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition active:scale-95 ring-1 ring-amber-300"
              >
                BID ({selectedBid})
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full py-4 flex flex-col items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#a3e635] border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-xs text-emerald-200 font-medium">
              Waiting for {currentBidder?.name || 'opponent'} to bid...
            </p>
          </div>
        )}
      </div>

      {/* Bottom spacer (Keeps cards hand completely free and unobstructed!) */}
      <div className="h-28 sm:h-32" />
    </div>
  );
};
