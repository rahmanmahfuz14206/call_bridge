import React, { useState, useEffect, useRef } from 'react';
import { Card, PlayedCard, Player, PlayerPosition, RoundScore } from '../types/game';
import { dealHands } from '../engine/deck';
import { evaluateTrickWinner, isMoveValid, getNextAntiClockwisePlayer } from '../engine/rules';
import { calculateRoundScore } from '../engine/scoring';
import { chooseAiCard, evaluateAiBid } from '../engine/ai';
import { sound } from '../engine/sound';
import { getPlayerProfile } from '../engine/storage';
import { GameTable } from './GameTable';
import { BiddingModal } from './BiddingModal';
import { ScoreModal } from './ScoreModal';
import { RoundEndModal } from './RoundEndModal';
import { MatchEndModal } from './MatchEndModal';
import { RulesModal } from './RulesModal';
import { SettingsModal } from './SettingsModal';

interface SoloGameControllerProps {
  totalRounds: number;
  aiDifficulty: 'easy' | 'medium' | 'hard';
  onExit: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  fastAnimations: boolean;
  onToggleFastAnimations: () => void;
}

export const SoloGameController: React.FC<SoloGameControllerProps> = ({
  totalRounds,
  aiDifficulty,
  onExit,
  soundEnabled,
  onToggleSound,
  fastAnimations,
  onToggleFastAnimations,
}) => {
  const userProfile = getPlayerProfile();

  const [players, setPlayers] = useState<Player[]>([
    {
      id: userProfile.id,
      name: userProfile.name,
      avatar: userProfile.avatar,
      isAi: false,
      position: 0,
    },
    {
      id: 'bot_west',
      name: 'Rafiq',
      avatar: '💎',
      isAi: true,
      aiDifficulty,
      position: 1,
    },
    {
      id: 'bot_north',
      name: 'Shakib',
      avatar: '👑',
      isAi: true,
      aiDifficulty,
      position: 2,
    },
    {
      id: 'bot_east',
      name: 'Ayesha',
      avatar: '🐯',
      isAi: true,
      aiDifficulty,
      position: 3,
    },
  ]);

  const [currentRound, setCurrentRound] = useState<number>(1);
  const [distributor, setDistributor] = useState<PlayerPosition>(0); // Distributor (Dealer)
  const [roundStarter, setRoundStarter] = useState<PlayerPosition>(3); // Next player anti-clockwise
  const [currentTurn, setCurrentTurn] = useState<PlayerPosition>(3);
  const [gamePhase, setGamePhase] = useState<'bidding' | 'playing' | 'round_end' | 'match_end'>('bidding');

  // Hands for 4 players (index 0 is South/User)
  const [hands, setHands] = useState<[Card[], Card[], Card[], Card[]]>([[], [], [], []]);

  // Bids & Tricks
  const [bids, setBids] = useState<Record<string, number>>({});
  const [tricksWon, setTricksWon] = useState<Record<string, number>>({});
  const [cumulativeScores, setCumulativeScores] = useState<Record<string, number>>({});
  const [roundScores, setRoundScores] = useState<RoundScore[]>([]);

  // Current Trick state
  const [currentTrick, setCurrentTrick] = useState<{
    trickNumber: number;
    leadPlayer: PlayerPosition;
    cards: PlayedCard[];
    winnerPlayer?: PlayerPosition;
    winningCard?: Card;
  }>({
    trickNumber: 1,
    leadPlayer: 3,
    cards: [],
  });

  const [completedTricks, setCompletedTricks] = useState<PlayedCard[][]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Modals state
  const [showScoreModal, setShowScoreModal] = useState<boolean>(false);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [currentDifficulty, setCurrentDifficulty] = useState<'easy' | 'medium' | 'hard'>(aiDifficulty);

  const processingTurnRef = useRef(false);

  // Initialize a new round
  const startNewRound = (roundNum: number, distPos: PlayerPosition) => {
    const dealt = dealHands();
    setHands(dealt);
    setBids({});
    const initialWon: Record<string, number> = {};
    players.forEach((p) => {
      initialWon[p.id] = 0;
    });
    setTricksWon(initialWon);
    setCompletedTricks([]);

    // Next player anti-clockwise after distributor bids and plays first
    const firstPlayer = getNextAntiClockwisePlayer(distPos);
    setRoundStarter(firstPlayer);
    setCurrentTrick({
      trickNumber: 1,
      leadPlayer: firstPlayer,
      cards: [],
    });
    setCurrentTurn(firstPlayer);
    setGamePhase('bidding');
    setStatusMessage(
      `Round ${roundNum}: ${players[distPos].name} distributes. ${players[firstPlayer].name} bids first (anti-clockwise).`
    );
    sound.playCardDeal();
  };

  // Start on initial mount
  useEffect(() => {
    const initialScores: Record<string, number> = {};
    players.forEach((p) => {
      initialScores[p.id] = 0;
    });
    setCumulativeScores(initialScores);
    setDistributor(0);
    startNewRound(1, 0);
  }, []);

  // AI Bidding Effect
  useEffect(() => {
    if (gamePhase !== 'bidding') return;

    const currentPlayer = players[currentTurn];
    if (currentPlayer && currentPlayer.isAi) {
      const delay = fastAnimations ? 350 : 700;
      const timer = setTimeout(() => {
        const aiHand = hands[currentPlayer.position];
        const bid = evaluateAiBid(aiHand, currentDifficulty);
        handleBidSubmit(currentPlayer.position, bid);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [gamePhase, currentTurn, bids]);

  // Handle Bid Submission (Anti-clockwise progression)
  const handleBidSubmit = (pos: PlayerPosition, bid: number) => {
    const player = players[pos];
    const newBids = { ...bids, [player.id]: bid };
    setBids(newBids);

    const nextTurn = getNextAntiClockwisePlayer(pos);

    // Check if all 4 have bid
    const allDone = players.every((p) => typeof newBids[p.id] === 'number');
    if (allDone) {
      setGamePhase('playing');
      setCurrentTurn(roundStarter);
      setStatusMessage(`Round ${currentRound} playing! ${players[roundStarter].name} leads.`);
    } else {
      setCurrentTurn(nextTurn);
    }
  };

  // Handle Card Play
  const handlePlayCard = (playerPos: PlayerPosition, card: Card) => {
    if (processingTurnRef.current) return;

    const player = players[playerPos];
    const playerHand = hands[playerPos];

    // Remove card from hand
    const updatedHand = playerHand.filter((c) => c.id !== card.id);
    const updatedHands = [...hands] as [Card[], Card[], Card[], Card[]];
    updatedHands[playerPos] = updatedHand;
    setHands(updatedHands);

    // Add to trick
    const newPlayedCard: PlayedCard = {
      playerId: player.id,
      position: playerPos,
      card,
    };
    const updatedTrickCards = [...currentTrick.cards, newPlayedCard];

    // Check if trick completed (4 cards)
    if (updatedTrickCards.length === 4) {
      processingTurnRef.current = true;
      const winningPlay = evaluateTrickWinner(updatedTrickCards);
      const winner = players.find((p) => p.id === winningPlay.playerId)!;

      setCurrentTrick({
        ...currentTrick,
        cards: updatedTrickCards,
        winnerPlayer: winningPlay.position,
        winningCard: winningPlay.card,
      });

      setStatusMessage(`${winner.name} won the trick with ${winningPlay.card.rank} of ${winningPlay.card.suit}!`);

      // Update tricks won
      const newTricksWon = {
        ...tricksWon,
        [winner.id]: (tricksWon[winner.id] || 0) + 1,
      };
      setTricksWon(newTricksWon);

      const trickPause = fastAnimations ? 700 : 1300;
      setTimeout(() => {
        sound.playTrickWon();
        const newCompleted = [...completedTricks, updatedTrickCards];
        setCompletedTricks(newCompleted);

        // Check if round finished (13 tricks)
        if (newCompleted.length === 13) {
          // Calculate round scores
          const roundScoreMap: Record<string, number> = {};
          const newCumulative = { ...cumulativeScores };

          players.forEach((p) => {
            const b = bids[p.id] || 1;
            const w = newTricksWon[p.id] || 0;
            const sc = calculateRoundScore(b, w);
            roundScoreMap[p.id] = sc;
            newCumulative[p.id] = Math.round(((newCumulative[p.id] || 0) + sc) * 10) / 10;
          });

          const currentRoundScoreRecord: RoundScore = {
            roundNumber: currentRound,
            bids,
            tricksWon: newTricksWon,
            scores: roundScoreMap,
            cumulativeScores: newCumulative,
          };

          setCumulativeScores(newCumulative);
          setRoundScores([...roundScores, currentRoundScoreRecord]);

          if (currentRound >= totalRounds) {
            setGamePhase('match_end');
          } else {
            setGamePhase('round_end');
          }
        } else {
          // Next trick: winner leads
          setCurrentTrick({
            trickNumber: newCompleted.length + 1,
            leadPlayer: winningPlay.position,
            cards: [],
          });
          setCurrentTurn(winningPlay.position);
          setStatusMessage(`${winner.name} leads Trick ${newCompleted.length + 1}.`);
        }
        processingTurnRef.current = false;
      }, trickPause);
    } else {
      // Next player in trick (anti-clockwise)
      setCurrentTrick({
        ...currentTrick,
        cards: updatedTrickCards,
      });
      const nextTurn = getNextAntiClockwisePlayer(playerPos);
      setCurrentTurn(nextTurn);
    }
  };

  // AI Card Play Effect
  useEffect(() => {
    if (gamePhase !== 'playing') return;
    if (processingTurnRef.current) return;

    const currentPlayer = players[currentTurn];
    if (currentPlayer && currentPlayer.isAi) {
      const delay = fastAnimations ? 400 : 800;
      const timer = setTimeout(() => {
        if (gamePhase !== 'playing' || currentTurn !== currentPlayer.position) return;
        const aiHand = hands[currentPlayer.position];
        const playedHistory = completedTricks.flatMap((t) => t.map((c) => c.card));
        const aiCard = chooseAiCard(
          aiHand,
          currentTrick.cards,
          currentPlayer,
          bids[currentPlayer.id] || 2,
          tricksWon[currentPlayer.id] || 0,
          playedHistory
        );

        handlePlayCard(currentPlayer.position, aiCard);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [gamePhase, currentTurn, currentTrick.cards, hands]);

  const handleNextRoundFromModal = () => {
    const nextRnd = currentRound + 1;
    // Distributor rotates anti-clockwise after each round of play!
    const nextDist = getNextAntiClockwisePlayer(distributor);
    setDistributor(nextDist);
    setCurrentRound(nextRnd);
    startNewRound(nextRnd, nextDist);
  };

  const handlePlayAgain = () => {
    setCurrentRound(1);
    setDistributor(0);
    setRoundScores([]);
    const initialScores: Record<string, number> = {};
    players.forEach((p) => {
      initialScores[p.id] = 0;
    });
    setCumulativeScores(initialScores);
    startNewRound(1, 0);
  };

  return (
    <>
      <GameTable
        players={players}
        userPosition={0}
        userHand={hands[0]}
        currentTurn={currentTurn}
        currentTrick={currentTrick}
        bids={bids}
        tricksWon={tricksWon}
        cumulativeScores={cumulativeScores}
        currentRound={currentRound}
        totalRounds={totalRounds}
        isBiddingPhase={gamePhase === 'bidding'}
        dealerPosition={distributor}
        statusMessage={statusMessage}
        onPlayCard={(card) => handlePlayCard(0, card)}
        onOpenScoreSheet={() => setShowScoreModal(true)}
        onOpenRules={() => setShowRulesModal(true)}
        onExitGame={onExit}
        soundEnabled={soundEnabled}
        onToggleSound={onToggleSound}
      />

      {/* Bidding Interface */}
      <BiddingModal
        isOpen={gamePhase === 'bidding'}
        hand={hands[0]}
        currentTurn={currentTurn}
        userPosition={0}
        players={players}
        bids={bids}
        onPlaceBid={(bid) => handleBidSubmit(0, bid)}
      />

      {/* Score Table Popup Modal */}
      <ScoreModal
        isOpen={showScoreModal}
        onClose={() => setShowScoreModal(false)}
        players={players}
        roundScores={roundScores}
        cumulativeScores={cumulativeScores}
        totalRounds={totalRounds}
        currentRound={currentRound}
      />

      {/* Round End Modal */}
      <RoundEndModal
        isOpen={gamePhase === 'round_end'}
        roundScore={roundScores[roundScores.length - 1] || null}
        players={players}
        cumulativeScores={cumulativeScores}
        currentRound={currentRound}
        totalRounds={totalRounds}
        onNextRound={handleNextRoundFromModal}
        isHost={true}
      />

      {/* Match Victory End Modal */}
      <MatchEndModal
        isOpen={gamePhase === 'match_end'}
        players={players}
        cumulativeScores={cumulativeScores}
        roundScores={roundScores}
        onPlayAgain={handlePlayAgain}
        onGoHome={onExit}
      />

      {/* Rules Guide Modal */}
      <RulesModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        aiDifficulty={currentDifficulty}
        onChangeDifficulty={(diff) => {
          setCurrentDifficulty(diff);
          setPlayers(
            players.map((p) => (p.isAi ? { ...p, aiDifficulty: diff } : p))
          );
        }}
        soundEnabled={soundEnabled}
        onToggleSound={onToggleSound}
        fastAnimations={fastAnimations}
        onToggleFastAnimations={onToggleFastAnimations}
        onProfileUpdated={(prof) => {
          setPlayers(
            players.map((p) =>
              p.position === 0 ? { ...p, name: prof.name, avatar: prof.avatar } : p
            )
          );
        }}
      />
    </>
  );
};
