import React, { useState } from 'react';
import { DEFAULT_AVATARS, getPlayerProfile, savePlayerProfile, PlayerProfile } from '../engine/storage';
import { sound } from '../engine/sound';
import { Settings as SettingsIcon, Volume2, VolumeX, Zap, Bot, User, X, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  aiDifficulty: 'easy' | 'medium' | 'hard';
  onChangeDifficulty: (diff: 'easy' | 'medium' | 'hard') => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  fastAnimations: boolean;
  onToggleFastAnimations: () => void;
  onProfileUpdated?: (profile: PlayerProfile) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  aiDifficulty,
  onChangeDifficulty,
  soundEnabled,
  onToggleSound,
  fastAnimations,
  onToggleFastAnimations,
  onProfileUpdated,
}) => {
  const [profile, setProfile] = useState<PlayerProfile>(getPlayerProfile());
  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState(profile.avatar);

  if (!isOpen) return null;

  const handleSaveProfile = () => {
    const updated = {
      ...profile,
      name: name.trim() || 'Champion',
      avatar,
    };
    savePlayerProfile(updated);
    setProfile(updated);
    if (onProfileUpdated) onProfileUpdated(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-950 border border-amber-400/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 bg-black/40 border-b border-amber-400/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-amber-300">Game Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[75vh] text-xs">
          {/* Player Profile & Avatar */}
          <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-2.5">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <User className="w-4 h-4" />
              <span>Player Profile</span>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={16}
                className="w-full px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 text-white font-medium focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Select Avatar</label>
              <div className="grid grid-cols-4 gap-2">
                {DEFAULT_AVATARS.map((av) => (
                  <button
                    key={av}
                    onClick={() => setAvatar(av)}
                    className={`h-10 rounded-xl text-xl flex items-center justify-center transition ${
                      avatar === av
                        ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                        : 'bg-white/5 hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bot Difficulty */}
          <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-2">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Bot className="w-4 h-4" />
              <span>Bot Difficulty</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {(['easy', 'medium', 'hard'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => onChangeDifficulty(diff)}
                  className={`py-2 rounded-lg font-bold uppercase text-[11px] transition ${
                    aiDifficulty === diff
                      ? 'bg-amber-400 text-slate-950 shadow-md ring-1 ring-amber-300'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Sound & Haptics */}
          <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-200">
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
                <span>Sound Effects</span>
              </div>
              <button
                onClick={() => {
                  onToggleSound();
                  if (!soundEnabled) sound.playBidPing();
                }}
                className={`w-11 h-6 rounded-full transition-colors p-0.5 ${
                  soundEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    soundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-200">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Fast Animations</span>
              </div>
              <button
                onClick={onToggleFastAnimations}
                className={`w-11 h-6 rounded-full transition-colors p-0.5 ${
                  fastAnimations ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    fastAnimations ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-black/40 border-t border-white/10 flex gap-2">
          <button
            onClick={() => {
              handleSaveProfile();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition active:scale-98"
          >
            <Check className="w-4 h-4" />
            <span>Save & Apply</span>
          </button>
        </div>
      </div>
    </div>
  );
};
