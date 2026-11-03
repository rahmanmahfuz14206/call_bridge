import React, { useState } from 'react';
import { Card, PlayedCard, Player, PlayerPosition, RoundScore } from '../types/game';
import { PlayingCard } from './PlayingCard';
import { PlayerSeat } from './PlayerSeat';
import { isMoveValid, TRUMP_SUIT } from '../engine/rules';
import { sound } from '../engine/sound';
import { BarChart3, HelpCircle, Volume2, VolumeX, ArrowLeft, MessageSquare, ShieldCheck } from 'lucide-react';

interface GameTableProps {
  players: Player[];
  userPosition: PlayerPosition; // usually 0 (South)
  userHand: Card[];
  currentTurn: PlayerPosition;
  currentTrick: {
    trickNumber: number;
    leadPlayer: PlayerPosition;
    cards: PlayedCard[];
    winnerPlayer?: PlayerPosition;
    winningCard?: Card;
  };
  bids: Record<string, number>;
  tricksWon: Record<string, number>;
  cumulativeScores: Record<string, number>;
  currentRound: number;
  totalRounds: number;
  isBiddingPhase: boolean;
  dealerPosition: PlayerPosition;
  statusMessage?: string;
  onPlayCard: (card: Card) => void;
  onOpenScoreSheet: () => void;
  onOpenRules: () => void;
  onOpenChat?: () => void;
  onExitGame: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  roomCode?: string;
}

export const GameTable: React.FC<GameTableProps> = ({
  players,
  userPosition,
  userHand,
  currentTurn,
  currentTrick,
  bids,
  tricksWon,
  cumulativeScores,
  currentRound,
  totalRounds,
  isBiddingPhase,
  dealerPosition,
  statusMessage,
  onPlayCard,
  onOpenScoreSheet,
  onOpenRules,
  onOpenChat,
  onExitGame,
  soundEnabled,
  onToggleSound,
  roomCode,
}) => {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [illegalWarning, setIllegalWarning] = useState<string | null>(null);

  const isUserTurn = currentTurn === userPosition && !isBiddingPhase;
  const ledSuit = currentTrick.cards.length > 0 ? currentTrick.cards[0].card.suit : null;

  // Relative positions mapping (0 = South, 1 = West, 2 = North, 3 = East)
  const getPlayerAt = (pos: PlayerPosition) => players.find((p) => p.position === pos);

  const southPlayer = getPlayerAt(0);
  const westPlayer = getPlayerAt(1);
  const northPlayer = getPlayerAt(2);
  const eastPlayer = getPlayerAt(3);

  const handleCardClick = (card: Card) => {
    if (!isUserTurn) return;

    const valid = isMoveValid(card, userHand, ledSuit);
    if (!valid) {
      sound.playInvalid();
      // Provide clear guidance on why it's illegal
      const hasLedSuit = userHand.some((c) => c.suit === ledSuit);
      if (hasLedSuit) {
        setIllegalWarning(`You must follow the led suit (${ledSuit?.toUpperCase()})!`);
      } else {
        setIllegalWarning('Bangladeshi Rule: You must play a Trump (♠ Spades) card!');
      }
      setTimeout(() => setIllegalWarning(null), 2500);
      return;
    }

    setIllegalWarning(null);

    // If already selected, play it immediately on second tap!
    if (selectedCardId === card.id) {
      if (card.suit === TRUMP_SUIT) {
        sound.playTrumpPlay();
      } else {
        sound.playCardPlay();
      }
      onPlayCard(card);
      setSelectedCardId(null);
    } else {
      sound.playCardDeal();
      setSelectedCardId(card.id);
    }
  };

  const handleConfirmPlay = () => {
    if (!selectedCardId || !isUserTurn) return;
    const card = userHand.find((c) => c.id === selectedCardId);
    if (!card) return;

    if (card.suit === TRUMP_SUIT) {
      sound.playTrumpPlay();
    } else {
      sound.playCardPlay();
    }
    onPlayCard(card);
    setSelectedCardId(null);
  };

  // Helper for trick position on the felt
  const getCardTransformForPosition = (pos: PlayerPosition) => {
    switch (pos) {
      case 0: // South (Bottom)
        return 'translate-y-4 sm:translate-y-6 rotate-0 z-20';
      case 1: // West (Left)
        return '-translate-x-6 sm:-translate-x-10 -rotate-12 z-10';
      case 2: // North (Top)
        return '-translate-y-4 sm:-translate-y-6 rotate-6 z-10';
      case 3: // East (Right)
        return 'translate-x-6 sm:translate-x-10 rotate-12 z-10';
      default:
        return '';
    }
  };

  const [handViewMode, setHandViewMode] = useState<'fan' | 'grid'>('fan');

  // Suit distribution counts
  const trumpCount = userHand.filter((c) => c.suit === TRUMP_SUIT).length;
  const heartsCount = userHand.filter((c) => c.suit === 'hearts').length;
  const clubsCount = userHand.filter((c) => c.suit === 'clubs').length;
  const diamondsCount = userHand.filter((c) => c.suit === 'diamonds').length;

  return (
    <div className="relative w-full h-[100dvh] max-w-md mx-auto bg-slate-950 flex flex-col justify-between overflow-hidden select-none">
      {/* Background Felt Texture & Table Border */}
      <div className="absolute inset-2 sm:inset-3 rounded-[32px] sm:rounded-[40px] bg-gradient-to-b from-[#0e432c] via-[#093522] to-[#041e13] border-4 sm:border-8 border-[#3b2d18] shadow-[inset_0_0_50px_rgba(0,0,0,0.8),0_10px_30px_rgba(0,0,0,0.9)] overflow-hidden pointer-events-none">
        {/* Subtle Felt Fabric Pattern Overlay */}
        <div className="w-full h-full opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px]" />
        {/* Inner Gold Table Accent Ring */}
        <div className="absolute inset-2 rounded-[28px] sm:rounded-[36px] border border-amber-400/20" />
      </div>

      {/* TOP FLOATING NAVIGATION & STATS BAR */}
      <header className="relative z-30 px-3 pt-3 flex items-center justify-between text-xs text-white">
        <div className="flex items-center gap-1.5">
          <button
            onClick={onExitGame}
            className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 active:scale-95 transition"
            title="Leave Game"
          >
            <ArrowLeft className="w-4 h-4 text-slate-300" />
          </button>

          <button
            onClick={onToggleSound}
            className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 active:scale-95 transition"
            title="Sound"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-300" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          <button
            onClick={onOpenRules}
            className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 active:scale-95 transition"
            title="How to Play"
          >
            <HelpCircle className="w-4 h-4 text-amber-300" />
          </button>
        </div>

        {/* Center Round & Trump Badge */}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 border border-amber-400/30 shadow backdrop-blur-xs">
          <span className="text-[11px] font-bold text-amber-300">
            Rnd {currentRound}/{totalRounds}
          </span>
          <span className="text-white/30">•</span>
          <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-0.5">
            Trump: <span className="text-amber-400 text-sm">♠</span>
          </span>
          {roomCode && (
            <>
              <span className="text-white/30">•</span>
              <span className="text-[10px] font-mono text-cyan-300 font-bold">
                {roomCode}
              </span>
            </>
          )}
        </div>

        {/* Top-Right: Score Sheet Popup & Chat */}
        <div className="flex items-center gap-1.5">
          {onOpenChat && (
            <button
              onClick={onOpenChat}
              className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 active:scale-95 transition"
              title="Chat"
            >
              <MessageSquare className="w-4 h-4 text-cyan-300" />
            </button>
          )}

          {/* Floating Score Table Popup Button */}
          <button
            onClick={onOpenScoreSheet}
            className="flex items-center gap-1 px-2 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300 font-bold text-xs shadow-md active:scale-95 transition"
            title="View Score Table Popup"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="text-[11px]">Score</span>
          </button>
        </div>
      </header>

      {/* NORTH SEAT (Opponent 1 - Top) */}
      <div className="relative z-20 flex justify-center pt-1">
        {northPlayer && (
          <PlayerSeat
            player={northPlayer}
            position={2}
            isTurn={currentTurn === 2}
            bid={bids[northPlayer.id]}
            tricksWon={tricksWon[northPlayer.id]}
            score={cumulativeScores[northPlayer.id]}
            cardCount={northPlayer.isAi ? 13 - (currentTrick.trickNumber - 1) - (currentTrick.cards.some((c) => c.position === 2) ? 1 : 0) : 13}
            isDealer={dealerPosition === 2}
            isBiddingPhase={isBiddingPhase}
          />
        )}
      </div>

      {/* MIDDLE FELT AREA: WEST, CENTER TRICK PILE, EAST */}
      <div className="relative z-20 flex-1 flex items-center justify-between px-3 sm:px-4">
        {/* WEST SEAT (Opponent 2 - Left) */}
        <div className="w-20 sm:w-24 shrink-0 flex justify-start">
          {westPlayer && (
            <PlayerSeat
              player={westPlayer}
              position={1}
              isTurn={currentTurn === 1}
              bid={bids[westPlayer.id]}
              tricksWon={tricksWon[westPlayer.id]}
              score={cumulativeScores[westPlayer.id]}
              cardCount={westPlayer.isAi ? 13 - (currentTrick.trickNumber - 1) - (currentTrick.cards.some((c) => c.position === 1) ? 1 : 0) : 13}
              isDealer={dealerPosition === 1}
              isBiddingPhase={isBiddingPhase}
            />
          )}
        </div>

        {/* CENTER TABLE FELT: TRICK PILE & TURN STATUS */}
        <div className="relative flex-1 h-44 sm:h-52 flex flex-col items-center justify-center">
          {/* Subtle felt center emblem */}
          <div className="absolute w-28 h-28 rounded-full border border-amber-400/10 flex items-center justify-center pointer-events-none">
            <span className="text-4xl text-amber-400/10 font-bold">♠</span>
          </div>

          {/* Cards played in current trick */}
          <div className="relative w-28 h-36 flex items-center justify-center">
            {currentTrick.cards.map((play) => {
              const isWinner =
                currentTrick.winnerPlayer !== undefined &&
                currentTrick.winnerPlayer === play.position;

              return (
                <div
                  key={play.card.id}
                  className={`absolute transition-all duration-300 ${getCardTransformForPosition(
                    play.position
                  )}`}
                >
                  <PlayingCard
                    card={play.card}
                    size="md"
                    isWinning={isWinner}
                    className="shadow-2xl"
                  />
                  {/* Miniature Player Pill on Played Card */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-black/80 border border-white/10 text-[9px] text-white whitespace-nowrap shadow font-medium">
                    {players.find((p) => p.position === play.position)?.name.split(' ')[0]}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Prompt status / Banner */}
          <div className="mt-4 px-3 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-xs text-[11px] text-slate-200 text-center font-medium shadow-md">
            {illegalWarning ? (
              <span className="text-red-400 font-bold animate-pulse">
                {illegalWarning}
              </span>
            ) : statusMessage ? (
              <span>{statusMessage}</span>
            ) : isUserTurn ? (
              <span className="text-amber-300 font-bold animate-pulse">
                Your Turn! Select a card to play
              </span>
            ) : (
              <span className="text-slate-300">
                Trick {currentTrick.trickNumber} of 13
              </span>
            )}
          </div>
        </div>

        {/* EAST SEAT (Opponent 3 - Right) */}
        <div className="w-20 sm:w-24 shrink-0 flex justify-end">
          {eastPlayer && (
            <PlayerSeat
              player={eastPlayer}
              position={3}
              isTurn={currentTurn === 3}
              bid={bids[eastPlayer.id]}
              tricksWon={tricksWon[eastPlayer.id]}
              score={cumulativeScores[eastPlayer.id]}
              cardCount={eastPlayer.isAi ? 13 - (currentTrick.trickNumber - 1) - (currentTrick.cards.some((c) => c.position === 3) ? 1 : 0) : 13}
              isDealer={dealerPosition === 3}
              isBiddingPhase={isBiddingPhase}
            />
          )}
        </div>
      </div>

      {/* BOTTOM SECTION: SOUTH SEAT (HUMAN) & CARDS HAND */}
      <div className="relative z-30 pb-3 flex flex-col items-center">
        {/* South Player Header stats & Hand Inspector Toolbar */}
        <div className="w-full px-3 mb-1 flex items-center justify-between">
          {/* Suit count pills for quick hand evaluation */}
          <div className="flex items-center gap-1">
            <span
              className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-0.5 ${
                trumpCount > 0
                  ? 'bg-amber-400/20 border-amber-400/40 text-amber-300 shadow-xs'
                  : 'bg-black/30 border-white/5 text-slate-500'
              }`}
              title="Trump Spades"
            >
              ♠ {trumpCount}
            </span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-black/30 border border-white/5 text-red-400">
              ♥ {heartsCount}
            </span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-black/30 border border-white/5 text-slate-300">
              ♣ {clubsCount}
            </span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-black/30 border border-white/5 text-red-400">
              ♦ {diamondsCount}
            </span>
          </div>

          {/* South Avatar & Bid Pill */}
          {southPlayer && (
            <div className="flex items-center gap-1.5">
              <PlayerSeat
                player={southPlayer}
                position={0}
                isTurn={isUserTurn}
                bid={bids[southPlayer.id]}
                tricksWon={tricksWon[southPlayer.id]}
                score={cumulativeScores[southPlayer.id]}
                cardCount={userHand.length}
                isDealer={dealerPosition === 0}
                isBiddingPhase={isBiddingPhase}
              />

              {/* Action Button when card selected during play */}
              {selectedCardId && isUserTurn && (
                <button
                  onClick={handleConfirmPlay}
                  className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition active:scale-95 animate-bounce ml-1"
                >
                  Play ➔
                </button>
              )}
            </div>
          )}
        </div>

        {/* HAND VIEW: HORIZONTAL SPREAD (Matching reference game in Image 2: every card index 100% visible!) */}
        <div className="relative w-full px-2 max-w-md mx-auto h-22 sm:h-24 overflow-visible">
          <div className="relative w-full h-full">
            {userHand.map((card, index) => {
              const totalCards = userHand.length;
              const isPlayable = isUserTurn ? isMoveValid(card, userHand, ledSuit) : true;
              const isSelected = selectedCardId === card.id;

              // Percentage calculation so cards spread smoothly across any mobile screen
              const percent = totalCards > 1 ? (index / (totalCards - 1)) * 100 : 50;

              return (
                <div
                  key={card.id}
                  style={{
                    position: 'absolute',
                    left: totalCards > 1 ? `calc(${percent}% - ${(percent / 100) * 52}px)` : 'calc(50% - 26px)',
                    bottom: 0,
                    transform: `translateY(${isSelected ? -22 : 0}px)`,
                    zIndex: isSelected ? 50 : index + 5,
                  }}
                  className="transition-transform duration-150"
                >
                  <PlayingCard
                    card={card}
                    size="md"
                    isPlayable={isUserTurn ? isPlayable : true}
                    isSelected={isSelected}
                    onClick={() => handleCardClick(card)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
