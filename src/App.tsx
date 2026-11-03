/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { getPlayerProfile, PlayerProfile } from './engine/storage';
import { sound } from './engine/sound';
import { Lobby } from './components/Lobby';
import { SoloGameController } from './components/SoloGameController';
import { MultiplayerGameController } from './components/MultiplayerGameController';
import { RulesModal } from './components/RulesModal';
import { StatsModal } from './components/StatsModal';
import { SettingsModal } from './components/SettingsModal';

type AppMode = 'lobby' | 'solo' | 'multiplayer';

export default function App() {
  const [mode, setMode] = useState<AppMode>('lobby');
  const [profile, setProfile] = useState<PlayerProfile>(getPlayerProfile());
  const [soundEnabled, setSoundEnabled] = useState<boolean>(!sound.getMuted());
  const [fastAnimations, setFastAnimations] = useState<boolean>(false);

  // Solo mode configuration
  const [soloRounds, setSoloRounds] = useState<number>(5);
  const [soloDifficulty, setSoloDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  // Multiplayer configuration
  const [multiplayerRoomCode, setMultiplayerRoomCode] = useState<string>('');
  const [isMultiplayerHost, setIsMultiplayerHost] = useState<boolean>(false);

  // Global modals
  const [showRules, setShowRules] = useState<boolean>(false);
  const [showStats, setShowStats] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Toggle sound
  const handleToggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    sound.setMuted(!nextState);
  };

  // Toggle fast animations
  const handleToggleFastAnimations = () => {
    setFastAnimations((prev) => !prev);
  };

  // Start Solo Game
  const handleStartSolo = (rounds: number, difficulty: 'easy' | 'medium' | 'hard') => {
    setSoloRounds(rounds);
    setSoloDifficulty(difficulty);
    setMode('solo');
  };

  // Create Private Room via Socket
  const handleCreateRoom = (rounds: number) => {
    // Initiate socket connection to ask server for room creation
    const serverUrl = (import.meta as any).env?.VITE_SERVER_URL || window.location.origin;
    const socket = io(serverUrl);
    socket.emit('create_room', {
      playerName: profile.name,
      avatar: profile.avatar,
      roundsCount: rounds,
      allowAiFill: true,
    });

    socket.on('room_created', ({ roomCode }) => {
      setMultiplayerRoomCode(roomCode);
      setIsMultiplayerHost(true);
      setMode('multiplayer');
      socket.disconnect();
    });
  };

  // Join Existing Private Room
  const handleJoinRoom = (code: string) => {
    setMultiplayerRoomCode(code);
    setIsMultiplayerHost(false);
    setMode('multiplayer');
  };

  return (
    <main className="w-full min-h-screen bg-[#020d07] text-white flex flex-col items-center justify-center overflow-x-hidden font-sans">
      {mode === 'lobby' && (
        <Lobby
          onStartSolo={handleStartSolo}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onOpenRules={() => setShowRules(true)}
          onOpenStats={() => setShowStats(true)}
          onOpenSettings={() => setShowSettings(true)}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          profile={profile}
        />
      )}

      {mode === 'solo' && (
        <SoloGameController
          totalRounds={soloRounds}
          aiDifficulty={soloDifficulty}
          onExit={() => {
            setProfile(getPlayerProfile());
            setMode('lobby');
          }}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          fastAnimations={fastAnimations}
          onToggleFastAnimations={handleToggleFastAnimations}
        />
      )}

      {mode === 'multiplayer' && (
        <MultiplayerGameController
          roomCode={multiplayerRoomCode}
          isHost={isMultiplayerHost}
          onExit={() => {
            setProfile(getPlayerProfile());
            setMode('lobby');
          }}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
        />
      )}

      {/* Global Modals from Lobby */}
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />

      <StatsModal isOpen={showStats} onClose={() => setShowStats(false)} />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        aiDifficulty={soloDifficulty}
        onChangeDifficulty={setSoloDifficulty}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        fastAnimations={fastAnimations}
        onToggleFastAnimations={handleToggleFastAnimations}
        onProfileUpdated={(updated) => setProfile(updated)}
      />
    </main>
  );
}
