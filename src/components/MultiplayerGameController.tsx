import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Card, ChatMessage, PlayedCard, Player, PlayerPosition, RoundScore } from '../types/game';
import { getPlayerProfile } from '../engine/storage';
import { sound } from '../engine/sound';
import { GameTable } from './GameTable';
import { BiddingModal } from './BiddingModal';
import { ScoreModal } from './ScoreModal';
import { RoundEndModal } from './RoundEndModal';
import { MatchEndModal } from './MatchEndModal';
import { RulesModal } from './RulesModal';
import { ChatDrawer } from './ChatDrawer';
import { Users, Copy, Check, Play, Bot, ArrowLeft, MessageSquare, ShieldCheck } from 'lucide-react';

interface MultiplayerGameControllerProps {
  roomCode: string;
  isHost: boolean;
  onExit: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const MultiplayerGameController: React.FC<MultiplayerGameControllerProps> = ({
  roomCode,
  isHost,
  onExit,
  soundEnabled,
  onToggleSound,
}) => {
  const userProfile = getPlayerProfile();
  const socketRef = useRef<Socket | null>(null);

  const [connected, setConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Room state from server
  const [roomData, setRoomData] = useState<any>(null);
  const [userHand, setUserHand] = useState<Card[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Modals
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);

  useEffect(() => {
    // Connect to backend Socket.IO
    const serverUrl = (import.meta as any).env?.VITE_SERVER_URL || window.location.origin;
    const socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      // Join or establish
      socket.emit('join_room', {
        roomCode,
        playerName: userProfile.name,
        avatar: userProfile.avatar,
      });
    });

    socket.on('room_updated', (data) => {
      setRoomData(data);
      // Find my own hand in the payload
      const me = data.players.find((p: any) => p.id === socket.id);
      if (me && me.hand) {
        setUserHand(me.hand);
      }
    });

    socket.on('chat_received', (msg: ChatMessage) => {
      sound.playBidPing();
      setChatMessages((prev) => [...prev.slice(-30), msg]);
    });

    socket.on('error_message', (msg: string) => {
      setErrorMessage(msg);
      sound.playInvalid();
      setTimeout(() => setErrorMessage(null), 4000);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomCode]);

  const copyRoomCode = () => {
    navigator.clipboard?.writeText(roomCode);
    setCopied(true);
    sound.playCardDeal();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleReady = () => {
    sound.playCardDeal();
    socketRef.current?.emit('toggle_ready', { roomCode });
  };

  const handleFillAi = () => {
    sound.playCardDeal();
    socketRef.current?.emit('fill_ai', { roomCode });
  };

  const handleStartGame = () => {
    sound.playCardDeal();
    socketRef.current?.emit('start_game', { roomCode });
  };

  const handlePlaceBid = (bid: number) => {
    socketRef.current?.emit('place_bid', { roomCode, bid });
  };

  const handlePlayCard = (card: Card) => {
    socketRef.current?.emit('play_card', { roomCode, cardId: card.id });
  };

  const handleNextRound = () => {
    socketRef.current?.emit('next_round', { roomCode });
  };

  const handleSendMessage = (text: string, isQuickMsg?: boolean) => {
    socketRef.current?.emit('send_chat', { roomCode, text, isQuickMsg });
  };

  // If roomData not yet received or still connecting
  if (!roomData) {
    return (
      <div className="w-full h-[100dvh] max-w-md mx-auto bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-10 h-10 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-base font-bold text-amber-300">Connecting to Private Room...</h2>
        <p className="text-xs text-slate-400 mt-1">Room Code: {roomCode}</p>
        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs">
            {errorMessage}
          </div>
        )}
        <button
          onClick={onExit}
          className="mt-6 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-slate-300 font-semibold"
        >
          Cancel & Exit
        </button>
      </div>
    );
  }

  // WAITING LOBBY PHASE
  if (roomData.status === 'waiting') {
    const me = roomData.players.find((p: any) => p.id === socketRef.current?.id);
    const amHost = me?.isHost || false;
    const canStart =
      roomData.players.length === 4 &&
      roomData.players.every((p: any) => p.isAi || p.isHost || p.isReady);

    return (
      <div className="w-full h-[100dvh] max-w-md mx-auto bg-slate-950 flex flex-col justify-between p-4 select-none">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={onExit}
            className="p-2 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-slate-300"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-base font-black text-amber-300 uppercase tracking-wider">
            Private Room Lobby
          </h2>
          <button
            onClick={() => setIsChatOpen(true)}
            className="p-2 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-cyan-300 relative"
          >
            <MessageSquare className="w-4 h-4" />
            {chatMessages.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>
        </div>

        {/* Room Code Card */}
        <div className="my-auto space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-b from-emerald-950/80 to-slate-900 border border-amber-400/40 text-center shadow-xl">
            <span className="text-[11px] font-bold text-emerald-300 tracking-wider uppercase">
              Room Code
            </span>
            <div className="flex items-center justify-center gap-2 my-2">
              <span className="font-mono text-3xl font-black text-amber-300 tracking-widest">
                {roomCode}
              </span>
              <button
                onClick={copyRoomCode}
                className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 active:scale-95 transition"
                title="Copy Room Code"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-300">
              Share this 4-letter code with friends to join!
            </p>
            <div className="mt-2 text-[11px] text-amber-400/90 font-medium">
              Match Length: {roomData.roundsCount} Rounds
            </div>
          </div>

          {/* Player Seats List (4 Slots) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-semibold">
              <span>Players ({roomData.players.length} / 4)</span>
              <span>Status</span>
            </div>

            {Array.from({ length: 4 }).map((_, index) => {
              const player = roomData.players[index];

              if (!player) {
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-xl bg-black/25 border border-dashed border-white/10 text-xs text-slate-500"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center">
                        ?
                      </div>
                      <span>Waiting for player...</span>
                    </div>
                    <span className="text-[10px] text-slate-600">Open Seat</span>
                  </div>
                );
              }

              const isMe = player.id === socketRef.current?.id;

              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs transition ${
                    isMe
                      ? 'bg-amber-500/10 border-amber-400/50'
                      : 'bg-black/40 border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{player.avatar}</span>
                    <div className="text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-100">{player.name}</span>
                        {isMe && (
                          <span className="text-[9px] px-1 rounded bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
                            YOU
                          </span>
                        )}
                        {player.isHost && (
                          <span className="text-[9px] px-1 rounded bg-amber-500/30 text-amber-300 border border-amber-400/30 font-bold">
                            HOST
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {player.isAi ? 'Computer Bot' : 'Human Player'}
                      </span>
                    </div>
                  </div>

                  <div>
                    {player.isHost ? (
                      <span className="text-amber-400 font-bold text-[11px]">Ready (Host)</span>
                    ) : player.isReady ? (
                      <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                        <Check className="w-3 h-3" /> Ready
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Not Ready</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Host Options: Fill remaining with Bots */}
          {amHost && roomData.players.length < 4 && (
            <button
              onClick={handleFillAi}
              className="w-full py-2.5 rounded-xl bg-indigo-950 hover:bg-indigo-900 border border-indigo-400/40 text-indigo-200 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-98 shadow"
            >
              <Bot className="w-4 h-4 text-amber-300" />
              <span>Fill Empty Seats with Bots</span>
            </button>
          )}

          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs text-center">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-2">
          {amHost ? (
            <button
              onClick={handleStartGame}
              disabled={!canStart}
              className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition active:scale-98 ${
                canStart
                  ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 hover:from-amber-400 hover:to-amber-300 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Match (4 Players)</span>
            </button>
          ) : (
            <button
              onClick={handleToggleReady}
              className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition active:scale-98 ${
                me?.isReady
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{me?.isReady ? 'Set to Unready' : 'I am Ready!'}</span>
            </button>
          )}
        </div>

        <ChatDrawer
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          currentUserId={socketRef.current?.id || ''}
        />
      </div>
    );
  }

  // IN GAME PHASE (Bidding, Playing, Round End, Match End)
  const myPlayer = roomData.players.find((p: any) => p.id === socketRef.current?.id);
  const myPos = (myPlayer?.position ?? 0) as PlayerPosition;
  const amHost = myPlayer?.isHost || false;

  // Remap players so local player is always South (position 0 on screen)
  const screenPlayers = roomData.players.map((p: any) => {
    // Relative position
    const relativePos = ((p.position - myPos + 4) % 4) as PlayerPosition;
    return {
      ...p,
      position: relativePos,
    };
  });

  const relativeTurn = ((roomData.currentTurn - myPos + 4) % 4) as PlayerPosition;

  // Re-orient current trick cards for local screen
  const relativeTrick = {
    ...roomData.currentTrick,
    leadPlayer: ((roomData.currentTrick.leadPlayer - myPos + 4) % 4) as PlayerPosition,
    winnerPlayer:
      roomData.currentTrick.winnerPlayer !== undefined
        ? (((roomData.currentTrick.winnerPlayer - myPos + 4) % 4) as PlayerPosition)
        : undefined,
    cards: roomData.currentTrick.cards.map((c: PlayedCard) => ({
      ...c,
      position: ((c.position - myPos + 4) % 4) as PlayerPosition,
    })),
  };

  return (
    <>
      <GameTable
        players={screenPlayers}
        userPosition={0}
        userHand={userHand}
        currentTurn={relativeTurn}
        currentTrick={relativeTrick}
        bids={roomData.bids}
        tricksWon={roomData.tricksWon}
        cumulativeScores={roomData.cumulativeScores}
        currentRound={roomData.currentRound}
        totalRounds={roomData.roundsCount}
        isBiddingPhase={roomData.status === 'bidding'}
        dealerPosition={(((roomData.distributor ?? 0) - myPos + 4) % 4) as PlayerPosition}
        statusMessage={
          roomData.status === 'bidding'
            ? 'Bidding phase: call your tricks!'
            : undefined
        }
        onPlayCard={handlePlayCard}
        onOpenScoreSheet={() => setShowScoreModal(true)}
        onOpenRules={() => setShowRulesModal(true)}
        onOpenChat={() => setIsChatOpen(true)}
        onExitGame={onExit}
        soundEnabled={soundEnabled}
        onToggleSound={onToggleSound}
        roomCode={roomCode}
      />

      {/* Bidding Modal */}
      <BiddingModal
        isOpen={roomData.status === 'bidding'}
        hand={userHand}
        currentTurn={roomData.currentTurn}
        userPosition={myPos}
        players={roomData.players}
        bids={roomData.bids}
        onPlaceBid={handlePlaceBid}
      />

      {/* Score Table Popup */}
      <ScoreModal
        isOpen={showScoreModal}
        onClose={() => setShowScoreModal(false)}
        players={roomData.players}
        roundScores={roomData.roundScores}
        cumulativeScores={roomData.cumulativeScores}
        totalRounds={roomData.roundsCount}
        currentRound={roomData.currentRound}
      />

      {/* Round End Modal */}
      <RoundEndModal
        isOpen={roomData.status === 'round_end'}
        roundScore={roomData.roundScores[roomData.roundScores.length - 1] || null}
        players={roomData.players}
        cumulativeScores={roomData.cumulativeScores}
        currentRound={roomData.currentRound}
        totalRounds={roomData.roundsCount}
        onNextRound={handleNextRound}
        isHost={amHost}
      />

      {/* Match Victory End Modal */}
      <MatchEndModal
        isOpen={roomData.status === 'match_end'}
        players={roomData.players}
        cumulativeScores={roomData.cumulativeScores}
        roundScores={roomData.roundScores}
        onPlayAgain={handleNextRound}
        onGoHome={onExit}
      />

      {/* Rules Modal */}
      <RulesModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
      />

      {/* Chat Drawer */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        currentUserId={socketRef.current?.id || ''}
      />
    </>
  );
};
