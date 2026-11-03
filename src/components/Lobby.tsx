import React, { useState } from 'react';
import { getPlayerProfile, PlayerProfile } from '../engine/storage';
import { sound } from '../engine/sound';
import {
  Trophy,
  Users,
  Play,
  Settings as SettingsIcon,
  HelpCircle,
  BarChart3,
  Volume2,
  VolumeX,
  Sparkles,
  Layers,
  ArrowRight,
  Shield,
  Zap,
} from 'lucide-react';

interface LobbyProps {
  onStartSolo: (rounds: number, difficulty: 'easy' | 'medium' | 'hard') => void;
  onCreateRoom: (rounds: number) => void;
  onJoinRoom: (code: string) => void;
  onOpenRules: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  profile: PlayerProfile;
}

export const Lobby: React.FC<LobbyProps> = ({
  onStartSolo,
  onCreateRoom,
  onJoinRoom,
  onOpenRules,
  onOpenStats,
  onOpenSettings,
  soundEnabled,
  onToggleSound,
  profile,
}) => {
  const [soloRounds, setSoloRounds] = useState<number>(5);
  const [soloDifficulty, setSoloDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [roomRounds, setRoomRounds] = useState<number>(5);
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
  const [showJoinModal, setShowJoinModal] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  const winRate =
    profile.gamesPlayed > 0
      ? Math.round((profile.gamesWon / profile.gamesPlayed) * 100)
      : 0;

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    sound.playCardDeal();
    onJoinRoom(joinCodeInput.trim().toUpperCase());
  };

  return (
    <div className="relative w-full h-[100dvh] max-w-md mx-auto bg-slate-950 flex flex-col justify-between overflow-hidden select-none p-4">
      {/* Background Ornate Felt Pattern & Vignette */}
      <div className="absolute inset-2 sm:inset-3 rounded-[32px] sm:rounded-[40px] bg-gradient-to-b from-[#0c3924] via-[#082a1b] to-[#041910] border-4 sm:border-8 border-[#3b2d18] shadow-[inset_0_0_60px_rgba(0,0,0,0.85)] pointer-events-none overflow-hidden">
        <div className="w-full h-full opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:14px_14px]" />
        {/* Subtle Luxury Corner Flourishes */}
        <div className="absolute inset-3 rounded-[26px] sm:rounded-[32px] border border-amber-400/20" />
      </div>

      {/* TOP BAR: Player mini-card & Quick actions */}
      <header className="relative z-20 flex items-center justify-between pt-1">
        {/* Player Profile Quick View */}
        <div
          onClick={onOpenStats}
          className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-black/50 border border-amber-400/30 shadow backdrop-blur-xs cursor-pointer hover:bg-black/60 transition active:scale-95"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-lg shadow border border-amber-300">
            {profile.avatar}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-slate-100 max-w-[80px] truncate leading-tight">
              {profile.name}
            </span>
            <span className="text-[10px] text-amber-300 font-medium leading-none">
              Win {winRate}%
            </span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleSound}
            className="p-2 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-slate-300 active:scale-95 transition"
            title="Sound Toggle"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-300" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          <button
            onClick={onOpenStats}
            className="p-2 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-amber-300 active:scale-95 transition"
            title="Statistics"
          >
            <BarChart3 className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenRules}
            className="p-2 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-slate-300 active:scale-95 transition"
            title="How to Play"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-slate-300 active:scale-95 transition"
            title="Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* CENTER HERO: LUXURY LOGO LOCKUP */}
      <div className="relative z-20 my-auto flex flex-col items-center text-center py-2">
        {/* Ornate Gold Crown & Ace of Spades Badge */}
        <div className="relative mb-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 p-0.5 shadow-[0_0_25px_rgba(251,191,36,0.5)] rotate-45 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center -rotate-45">
              <span className="text-3xl text-amber-400 font-serif font-black">♠</span>
            </div>
          </div>
          <Sparkles className="w-4 h-4 text-amber-300 absolute -top-1 -right-1 animate-ping" />
        </div>

        {/* Embossed Typography */}
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
          Call Bridge
        </h1>
        <p className="text-[11px] font-semibold text-emerald-300/90 tracking-widest uppercase mt-0.5">
          Royal Card Game
        </p>

        {/* Career Stats Strip */}
        <div className="mt-4 flex items-center justify-center gap-4 px-4 py-1.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-xs text-xs text-slate-300">
          <div>
            <span className="text-[10px] text-slate-400 block">Games</span>
            <span className="font-bold font-mono text-white">{profile.gamesPlayed}</span>
          </div>
          <span className="text-white/20">|</span>
          <div>
            <span className="text-[10px] text-slate-400 block">Wins</span>
            <span className="font-bold font-mono text-amber-300">{profile.gamesWon}</span>
          </div>
          <span className="text-white/20">|</span>
          <div>
            <span className="text-[10px] text-slate-400 block">Tricks</span>
            <span className="font-bold font-mono text-emerald-300">{profile.totalTricksWon}</span>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: PRIMARY GAME MODES */}
      <div className="relative z-20 space-y-2.5 pb-2">
        {/* MODE A: PLAY SOLO */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border border-amber-400/40 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>
              <div className="text-left">
                <h3 className="text-xs font-black text-amber-300 uppercase tracking-wide">
                  Play Solo
                </h3>
                <span className="text-[10px] text-emerald-200/70">
                  Against 3 Computer Opponents
                </span>
              </div>
            </div>

            {/* Bot Difficulty Selector */}
            <div className="flex bg-black/50 rounded-lg p-0.5 border border-white/10">
              {(['easy', 'medium', 'hard'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSoloDifficulty(diff)}
                  className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition ${
                    soloDifficulty === diff
                      ? 'bg-amber-400 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Rounds Slider / Selector (3 to 10) */}
          <div className="flex items-center justify-between bg-black/30 px-3 py-1.5 rounded-xl border border-white/5 mb-2.5 text-xs">
            <span className="text-slate-300 text-[11px] font-medium">Match Length:</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="3"
                max="10"
                value={soloRounds}
                onChange={(e) => setSoloRounds(Number(e.target.value))}
                className="w-24 accent-amber-400 cursor-pointer"
              />
              <span className="font-mono font-bold text-amber-300 w-14 text-right">
                {soloRounds} Rnds
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playCardDeal();
              onStartSolo(soloRounds, soloDifficulty);
            }}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 transition active:scale-98"
          >
            <span>Start Solo Match</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* MODE B: PRIVATE ROOM MULTIPLAYER (Create & Join) */}
        <div className="grid grid-cols-2 gap-2">
          {/* Create Room Button */}
          <button
            onClick={() => {
              sound.playCardDeal();
              setShowCreateModal(true);
            }}
            className="p-3 rounded-2xl bg-gradient-to-b from-indigo-950 to-slate-900 border border-indigo-400/40 hover:border-amber-400/60 shadow-lg text-left flex flex-col justify-between transition active:scale-98"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 mb-2">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-100">Create Room</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Host private match</p>
            </div>
          </button>

          {/* Join Room Button */}
          <button
            onClick={() => {
              sound.playCardDeal();
              setShowJoinModal(true);
            }}
            className="p-3 rounded-2xl bg-gradient-to-b from-slate-900 to-emerald-950 border border-emerald-400/40 hover:border-amber-400/60 shadow-lg text-left flex flex-col justify-between transition active:scale-98"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 mb-2">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-100">Join Room</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Enter with code</p>
            </div>
          </button>
        </div>

        {/* Bottom Right Copyright Hyperlink */}
        <div className="flex justify-end pr-1 pt-0.5">
          <a
            href="https://www.facebook.com/mahfuz14206"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-medium text-amber-300/70 hover:text-amber-300 transition underline-offset-2 hover:underline"
          >
            ©Mah Fuz
          </a>
        </div>
      </div>

      {/* CREATE ROOM MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in zoom-in-95 duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-950 border border-amber-400/40 p-4 shadow-2xl flex flex-col text-center">
            <h3 className="text-base font-bold text-amber-300 mb-1">Create Private Room</h3>
            <p className="text-xs text-slate-300 mb-4">
              Set match rounds and invite up to 3 friends or computer bots
            </p>

            <div className="p-3 rounded-xl bg-black/40 border border-white/10 mb-4 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300">Rounds to play:</span>
                <span className="font-mono font-bold text-amber-300">{roomRounds} Rounds</span>
              </div>
              <input
                type="range"
                min="3"
                max="10"
                value={roomRounds}
                onChange={(e) => setRoomRounds(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>3 (Quick)</span>
                <span>5 (Standard)</span>
                <span>10 (Full Marathon)</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  onCreateRoom(roomRounds);
                }}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase"
              >
                Create Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* JOIN ROOM MODAL */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in zoom-in-95 duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-950 border border-amber-400/40 p-4 shadow-2xl flex flex-col text-center">
            <h3 className="text-base font-bold text-amber-300 mb-1">Join Private Room</h3>
            <p className="text-xs text-slate-300 mb-4">
              Enter the 4-letter room code shared by the host
            </p>

            <form onSubmit={handleJoinSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="e.g. 7K2M"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                maxLength={6}
                className="w-full text-center font-mono text-2xl font-black tracking-widest uppercase py-3 rounded-xl bg-black/60 border border-amber-400/50 text-amber-300 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400"
                autoFocus
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={joinCodeInput.trim().length < 3}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs uppercase"
                >
                  Enter Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
