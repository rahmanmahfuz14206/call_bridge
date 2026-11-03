import React from 'react';
import { Player, PlayerPosition } from '../types/game';
import { PlayingCard } from './PlayingCard';

interface PlayerSeatProps {
  player?: Player | null;
  position: PlayerPosition; // 0: South (You), 1: West, 2: North, 3: East
  isTurn: boolean;
  bid?: number;
  tricksWon?: number;
  score?: number;
  cardCount?: number;
  isDealer?: boolean;
  isBiddingPhase?: boolean;
  className?: string;
}

export const PlayerSeat: React.FC<PlayerSeatProps> = ({
  player,
  position,
  isTurn,
  bid,
  tricksWon = 0,
  score,
  cardCount = 13,
  isDealer = false,
  isBiddingPhase = false,
  className = '',
}) => {
  if (!player) {
    return (
      <div className={`flex flex-col items-center justify-center p-2 rounded-xl bg-black/20 border border-white/5 text-emerald-300/40 ${className}`}>
        <div className="w-10 h-10 rounded-full border border-dashed border-emerald-500/30 flex items-center justify-center text-xs">
          Open
        </div>
        <span className="text-[11px] mt-1 font-medium">Waiting...</span>
      </div>
    );
  }

  const isSouth = position === 0;

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Turn indicator glow ring */}
      <div
        className={`relative rounded-full p-0.5 transition-all duration-300 ${
          isTurn
            ? 'ring-4 ring-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.7)] animate-pulse'
            : 'ring-1 ring-white/10'
        }`}
      >
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-slate-900 via-emerald-950 to-slate-800 flex items-center justify-center text-2xl sm:text-3xl shadow-inner border border-amber-400/30 overflow-hidden">
          {player.avatar || '👤'}

          {/* Large Bid Number Overlay (Matches reference game in Image 2!) */}
          {typeof bid === 'number' && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="font-mono font-black text-xl sm:text-2xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                {bid}
              </span>
            </div>
          )}
        </div>

        {/* Distributor (Dealer) badge */}
        {isDealer && (
          <div
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center shadow-md border border-white"
            title="Card Distributor (Dealer)"
          >
            D
          </div>
        )}

        {/* Turn "Thinking" banner */}
        {isTurn && player.isAi && (
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-[9px] shadow animate-bounce">
            Thinking...
          </div>
        )}
      </div>

      {/* Name and Position */}
      <div className="mt-1 flex items-center gap-1">
        <span className="text-xs font-semibold text-slate-100 max-w-[85px] truncate drop-shadow-sm">
          {player.name}
        </span>
        {isSouth && (
          <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 font-medium">
            YOU
          </span>
        )}
      </div>

      {/* Game Stats Pill (Call & Tricks Won) */}
      <div className="mt-0.5 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-sm text-[11px] font-medium text-emerald-200">
        <span className="flex items-center gap-0.5">
          <span className="text-amber-400 font-bold">Call:</span>{' '}
          {typeof bid === 'number' ? bid : isBiddingPhase ? '...' : '-'}
        </span>
        <span className="text-white/30">•</span>
        <span className="flex items-center gap-0.5">
          <span className="text-emerald-300 font-bold">Won:</span> {tricksWon}
        </span>
        {typeof score === 'number' && (
          <>
            <span className="text-white/30">•</span>
            <span className={`font-semibold ${score >= 0 ? 'text-amber-300' : 'text-red-400'}`}>
              {score > 0 ? `+${score}` : score}
            </span>
          </>
        )}
      </div>

      {/* Opponent Card Count Badge (Only for West, North, East) */}
      {!isSouth && cardCount > 0 && (
        <div className="mt-1 flex items-center gap-1">
          <div className="flex -space-x-4">
            {Array.from({ length: Math.min(3, cardCount) }).map((_, i) => (
              <div
                key={i}
                className="w-4 h-6 rounded-xs bg-indigo-950 border border-amber-300/40 shadow-xs"
              />
            ))}
          </div>
          <span className="text-[10px] text-white/70 font-mono">x{cardCount}</span>
        </div>
      )}
    </div>
  );
};
