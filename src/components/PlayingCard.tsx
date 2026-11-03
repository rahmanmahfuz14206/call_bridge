import React from 'react';
import { Card, Suit } from '../types/game';
import { RANK_NAMES, SUIT_SYMBOLS } from '../engine/deck';

interface PlayingCardProps {
  card?: Card;
  faceDown?: boolean;
  isPlayable?: boolean;
  isSelected?: boolean;
  isWinning?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'mini';
  className?: string;
  style?: React.CSSProperties;
}

export const PlayingCard: React.FC<PlayingCardProps> = ({
  card,
  faceDown = false,
  isPlayable = true,
  isSelected = false,
  isWinning = false,
  onClick,
  size = 'md',
  className = '',
  style = {},
}) => {
  const sizeClasses = {
    mini: 'w-8 h-12 text-[10px] rounded-xs',
    sm: 'w-11 h-16 text-xs rounded-md',
    md: 'w-[54px] sm:w-15 h-20 sm:h-22 text-xs rounded-lg',
    lg: 'w-16 sm:w-20 h-24 sm:h-28 text-sm rounded-xl',
  }[size];

  if (faceDown || !card) {
    return (
      <div
        onClick={onClick}
        style={style}
        className={`relative select-none cursor-pointer transition-transform duration-200 shadow-md ${sizeClasses} ${className}`}
      >
        <div className="w-full h-full rounded-[inherit] bg-gradient-to-br from-blue-900 via-indigo-950 to-blue-950 border border-amber-400/50 p-0.5 flex items-center justify-center overflow-hidden shadow-inner">
          <div className="w-full h-full rounded-[inherit] border border-amber-300/30 flex items-center justify-center bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:5px_5px]">
            <span className="text-amber-400/80 font-bold opacity-60">♠</span>
          </div>
        </div>
      </div>
    );
  }

  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  const suitSymbol = SUIT_SYMBOLS[card.suit];
  const rankLabel = RANK_NAMES[card.rank];

  return (
    <div
      onClick={isPlayable ? onClick : undefined}
      style={style}
      className={`relative select-none transition-all duration-150 ${sizeClasses} ${
        isSelected ? '-translate-y-5 shadow-2xl ring-2 ring-amber-400 scale-105 z-30' : ''
      } ${
        isPlayable
          ? 'cursor-pointer hover:-translate-y-2 hover:shadow-lg active:scale-95'
          : 'opacity-40 grayscale-[40%] cursor-not-allowed'
      } ${
        isWinning ? 'ring-2 ring-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.7)]' : ''
      } ${className}`}
    >
      <div className="w-full h-full rounded-[inherit] bg-white border border-slate-300 shadow-md relative overflow-hidden flex flex-col justify-between">
        {/* Pinned Top-Left Corner Index (Strictly pinned left so overlapping cards never cover it!) */}
        <div className="absolute top-1 left-1 w-5 text-center flex flex-col items-center justify-start leading-none select-none z-10 pointer-events-none">
          <span
            className={`font-black tracking-tight text-[13px] sm:text-sm ${
              isRed ? 'text-red-600' : 'text-slate-950'
            }`}
          >
            {rankLabel}
          </span>
          <span
            className={`text-xs font-bold leading-none mt-0.5 ${
              isRed ? 'text-red-600' : 'text-slate-950'
            }`}
          >
            {suitSymbol}
          </span>
        </div>

        {/* Center Artwork / Large Suit Pip */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span
            className={`text-2xl sm:text-3xl transition-transform ${
              isRed ? 'text-red-600/90' : 'text-slate-950/90'
            }`}
          >
            {suitSymbol}
          </span>
        </div>

        {/* Bottom-right Corner (Inverted) */}
        <div className="absolute bottom-1 right-1 w-5 text-center flex flex-col items-center justify-start leading-none rotate-180 select-none pointer-events-none">
          <span
            className={`font-black tracking-tight text-[13px] sm:text-sm ${
              isRed ? 'text-red-600' : 'text-slate-950'
            }`}
          >
            {rankLabel}
          </span>
          <span
            className={`text-xs font-bold leading-none mt-0.5 ${
              isRed ? 'text-red-600' : 'text-slate-950'
            }`}
          >
            {suitSymbol}
          </span>
        </div>
      </div>
    </div>
  );
};
