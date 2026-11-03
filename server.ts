import express from 'express';
import http from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { Card, PlayedCard, Player, PlayerPosition, RoomState, RoundScore, Trick } from './src/types/game';
import { createDeck, dealHands, sortHand } from './src/engine/deck';
import { evaluateTrickWinner, isMoveValid, getNextAntiClockwisePlayer } from './src/engine/rules';
import { calculateRoundScore } from './src/engine/scoring';
import { chooseAiCard, evaluateAiBid } from './src/engine/ai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(express.json());

// API health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Multiplayer Room State Interface
interface ServerRoom {
  code: string;
  hostSocketId: string;
  roundsCount: number;
  currentRound: number;
  status: 'waiting' | 'bidding' | 'playing' | 'round_end' | 'match_end';
  players: (Player & { socketId: string; hand: Card[] })[];
  bids: Record<string, number>;
  tricksWon: Record<string, number>;
  currentTurn: PlayerPosition;
  currentTrick: Trick;
  completedTricks: Trick[];
  roundScores: RoundScore[];
  cumulativeScores: Record<string, number>;
  distributor: PlayerPosition;
  roundStarter: PlayerPosition;
}

const rooms: Map<string, ServerRoom> = new Map();

const BOT_NAMES = ['Shakib', 'Ayesha', 'Rafiq', 'Tanvir'];
const BOT_AVATARS = ['👑', '🐯', '🦅', '💎'];

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return rooms.has(code) ? generateRoomCode() : code;
}

function sanitizeRoomForClient(room: ServerRoom, requestingSocketId?: string) {
  return {
    code: room.code,
    hostId: room.hostSocketId,
    roundsCount: room.roundsCount,
    currentRound: room.currentRound,
    status: room.status,
    distributor: room.distributor,
    currentTurn: room.currentTurn,
    currentTrick: room.currentTrick,
    bids: room.bids,
    tricksWon: room.tricksWon,
    roundScores: room.roundScores,
    cumulativeScores: room.cumulativeScores,
    players: room.players.map((p) => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      isAi: p.isAi,
      position: p.position,
      isHost: p.socketId === room.hostSocketId,
      isReady: p.isReady,
      cardCount: p.hand.length,
      // Only include actual hand for the requesting player
      hand: requestingSocketId === p.socketId ? p.hand : undefined,
    })),
  };
}

function broadcastRoomState(room: ServerRoom) {
  room.players.forEach((p) => {
    if (!p.isAi && p.socketId) {
      io.to(p.socketId).emit('room_updated', sanitizeRoomForClient(room, p.socketId));
    }
  });
}

function startRoundInRoom(room: ServerRoom) {
  room.currentRound += 1;
  room.status = 'bidding';
  room.bids = {};
  room.tricksWon = {};
  room.completedTricks = [];
  
  // Dealing hands
  const hands = dealHands();
  room.players.forEach((p, idx) => {
    p.hand = hands[idx];
    room.tricksWon[p.id] = 0;
  });

  // Next player anti-clockwise after distributor bids and leads Trick 1
  room.roundStarter = getNextAntiClockwisePlayer(room.distributor);
  room.currentTurn = room.roundStarter;
  room.currentTrick = {
    trickNumber: 1,
    leadPlayer: room.roundStarter,
    cards: [],
  };

  broadcastRoomState(room);

  // Check if current bidder is AI
  checkAndTriggerAiBid(room);
}

function checkAndTriggerAiBid(room: ServerRoom) {
  if (room.status !== 'bidding') return;
  const currentBiddingPlayer = room.players[room.currentTurn];
  if (!currentBiddingPlayer || !currentBiddingPlayer.isAi) return;

  setTimeout(() => {
    if (room.status !== 'bidding' || room.currentTurn !== currentBiddingPlayer.position) return;
    const aiBid = evaluateAiBid(currentBiddingPlayer.hand, currentBiddingPlayer.aiDifficulty || 'medium');
    handleRoomBid(room, currentBiddingPlayer.id, aiBid);
  }, 1000);
}

function handleRoomBid(room: ServerRoom, playerId: string, bid: number) {
  room.bids[playerId] = bid;
  
  // Advance turn to next player anti-clockwise
  room.currentTurn = getNextAntiClockwisePlayer(room.currentTurn);

  // Check if all 4 players placed bids
  const allBidsPlaced = room.players.every((p) => typeof room.bids[p.id] === 'number');

  if (allBidsPlaced) {
    room.status = 'playing';
    room.currentTurn = room.roundStarter; // First trick led by round starter
    broadcastRoomState(room);
    checkAndTriggerAiPlay(room);
  } else {
    broadcastRoomState(room);
    checkAndTriggerAiBid(room);
  }
}

function checkAndTriggerAiPlay(room: ServerRoom) {
  if (room.status !== 'playing') return;
  const currentPlayer = room.players[room.currentTurn];
  if (!currentPlayer || !currentPlayer.isAi) return;

  setTimeout(() => {
    if (room.status !== 'playing' || room.currentTurn !== currentPlayer.position) return;

    const cardsPlayedSoFar = room.completedTricks.flatMap((t) => t.cards.map((c) => c.card));
    const aiCard = chooseAiCard(
      currentPlayer.hand,
      room.currentTrick.cards,
      currentPlayer,
      room.bids[currentPlayer.id] || 2,
      room.tricksWon[currentPlayer.id] || 0,
      cardsPlayedSoFar
    );

    handleRoomCardPlay(room, currentPlayer.id, aiCard.id);
  }, 800 + Math.floor(Math.random() * 400));
}

function handleRoomCardPlay(room: ServerRoom, playerId: string, cardId: string) {
  const player = room.players.find((p) => p.id === playerId);
  if (!player || player.position !== room.currentTurn) return;

  const cardIndex = player.hand.findIndex((c) => c.id === cardId);
  if (cardIndex === -1) return;

  const card = player.hand[cardIndex];
  const ledSuit = room.currentTrick.cards.length > 0 ? room.currentTrick.cards[0].card.suit : null;

  if (!isMoveValid(card, player.hand, ledSuit)) {
    return;
  }

  // Remove card from player hand
  player.hand.splice(cardIndex, 1);

  // Add to trick
  const playedCard: PlayedCard = {
    playerId: player.id,
    position: player.position,
    card,
  };
  room.currentTrick.cards.push(playedCard);

  // If trick is complete (4 cards)
  if (room.currentTrick.cards.length === 4) {
    const winningPlay = evaluateTrickWinner(room.currentTrick.cards);
    const winningPlayer = room.players.find((p) => p.id === winningPlay.playerId)!;

    room.currentTrick.winnerPlayer = winningPlay.position;
    room.currentTrick.winningCard = winningPlay.card;
    room.tricksWon[winningPlayer.id] = (room.tricksWon[winningPlayer.id] || 0) + 1;

    broadcastRoomState(room);

    // Short pause so all players can see the trick winner
    setTimeout(() => {
      room.completedTricks.push({ ...room.currentTrick });
      const completedCount = room.completedTricks.length;

      if (completedCount === 13) {
        // Round Finished! Calculate round scores
        const roundScores: Record<string, number> = {};
        room.players.forEach((p) => {
          const b = room.bids[p.id] || 1;
          const w = room.tricksWon[p.id] || 0;
          const s = calculateRoundScore(b, w);
          roundScores[p.id] = s;
          room.cumulativeScores[p.id] = (room.cumulativeScores[p.id] || 0) + s;
        });

        const roundScoreRecord: RoundScore = {
          roundNumber: room.currentRound,
          bids: { ...room.bids },
          tricksWon: { ...room.tricksWon },
          scores: { ...roundScores },
          cumulativeScores: { ...room.cumulativeScores },
        };
        room.roundScores.push(roundScoreRecord);

        if (room.currentRound >= room.roundsCount) {
          room.status = 'match_end';
        } else {
          room.status = 'round_end';
          // Distributor rotates anti-clockwise after each round
          room.distributor = getNextAntiClockwisePlayer(room.distributor);
        }

        broadcastRoomState(room);
      } else {
        // Next Trick! Winner leads
        room.currentTurn = winningPlay.position;
        room.currentTrick = {
          trickNumber: completedCount + 1,
          leadPlayer: winningPlay.position,
          cards: [],
        };
        broadcastRoomState(room);
        checkAndTriggerAiPlay(room);
      }
    }, 1200);
  } else {
    // Next player's turn in current trick (anti-clockwise)
    room.currentTurn = getNextAntiClockwisePlayer(room.currentTurn);
    broadcastRoomState(room);
    checkAndTriggerAiPlay(room);
  }
}

// Socket.io Connection Logic
io.on('connection', (socket: Socket) => {
  socket.on('create_room', ({ playerName, avatar, roundsCount, allowAiFill }) => {
    const code = generateRoomCode();
    const player: Player & { socketId: string; hand: Card[] } = {
      id: socket.id,
      name: playerName || 'Player 1',
      avatar: avatar || '🐯',
      isAi: false,
      position: 0,
      isHost: true,
      isReady: true,
      socketId: socket.id,
      hand: [],
    };

    const room: ServerRoom = {
      code,
      hostSocketId: socket.id,
      roundsCount: Math.min(10, Math.max(3, Number(roundsCount) || 5)),
      currentRound: 0,
      status: 'waiting',
      players: [player],
      bids: {},
      tricksWon: {},
      currentTurn: getNextAntiClockwisePlayer(0),
      currentTrick: { trickNumber: 1, leadPlayer: getNextAntiClockwisePlayer(0), cards: [] },
      completedTricks: [],
      roundScores: [],
      cumulativeScores: { [player.id]: 0 },
      distributor: 0,
      roundStarter: getNextAntiClockwisePlayer(0),
    };

    rooms.set(code, room);
    socket.join(code);
    socket.emit('room_created', { roomCode: code });
    broadcastRoomState(room);
  });

  socket.on('join_room', ({ roomCode, playerName, avatar }) => {
    const upperCode = (roomCode || '').toUpperCase().trim();
    const room = rooms.get(upperCode);

    if (!room) {
      socket.emit('error_message', 'Room not found. Check the code and try again.');
      return;
    }

    if (room.status !== 'waiting') {
      socket.emit('error_message', 'Game in this room is already in progress.');
      return;
    }

    if (room.players.length >= 4) {
      socket.emit('error_message', 'Room is already full (4 players maximum).');
      return;
    }

    const pos = room.players.length as PlayerPosition;
    const newPlayer: Player & { socketId: string; hand: Card[] } = {
      id: socket.id,
      name: playerName || `Player ${pos + 1}`,
      avatar: avatar || '🦅',
      isAi: false,
      position: pos,
      isHost: false,
      isReady: false,
      socketId: socket.id,
      hand: [],
    };

    room.players.push(newPlayer);
    room.cumulativeScores[newPlayer.id] = 0;
    socket.join(upperCode);

    socket.emit('room_joined', { roomCode: upperCode });
    broadcastRoomState(room);
  });

  socket.on('toggle_ready', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room) return;
    const player = room.players.find((p) => p.socketId === socket.id);
    if (player && !player.isHost) {
      player.isReady = !player.isReady;
      broadcastRoomState(room);
    }
  });

  socket.on('fill_ai', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room || room.hostSocketId !== socket.id || room.status !== 'waiting') return;

    while (room.players.length < 4) {
      const pos = room.players.length as PlayerPosition;
      const aiPlayer: Player & { socketId: string; hand: Card[] } = {
        id: `ai_${pos}_${Date.now()}`,
        name: BOT_NAMES[pos % BOT_NAMES.length],
        avatar: BOT_AVATARS[pos % BOT_AVATARS.length],
        isAi: true,
        aiDifficulty: 'medium',
        position: pos,
        isReady: true,
        socketId: '',
        hand: [],
      };
      room.players.push(aiPlayer);
      room.cumulativeScores[aiPlayer.id] = 0;
    }

    broadcastRoomState(room);
  });

  socket.on('start_game', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room || room.hostSocketId !== socket.id) return;

    if (room.players.length !== 4) {
      socket.emit('error_message', 'Exactly 4 players required to start. Fill with bots or invite friends.');
      return;
    }

    // Check ready states
    const unreadyHumans = room.players.filter((p) => !p.isAi && !p.isHost && !p.isReady);
    if (unreadyHumans.length > 0) {
      socket.emit('error_message', 'All human players must be ready before starting.');
      return;
    }

    startRoundInRoom(room);
  });

  socket.on('place_bid', ({ roomCode, bid }) => {
    const room = rooms.get(roomCode);
    if (!room || room.status !== 'bidding') return;
    const player = room.players.find((p) => p.socketId === socket.id);
    if (!player || player.position !== room.currentTurn) return;

    const numBid = Math.max(1, Math.min(13, Number(bid)));
    handleRoomBid(room, player.id, numBid);
  });

  socket.on('play_card', ({ roomCode, cardId }) => {
    const room = rooms.get(roomCode);
    if (!room || room.status !== 'playing') return;
    const player = room.players.find((p) => p.socketId === socket.id);
    if (!player || player.position !== room.currentTurn) return;

    handleRoomCardPlay(room, player.id, cardId);
  });

  socket.on('next_round', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room || room.hostSocketId !== socket.id || room.status !== 'round_end') return;
    startRoundInRoom(room);
  });

  socket.on('send_chat', ({ roomCode, text, isQuickMsg }) => {
    const room = rooms.get(roomCode);
    if (!room) return;
    const player = room.players.find((p) => p.socketId === socket.id);
    if (!player) return;

    io.to(room.code).emit('chat_received', {
      id: 'msg_' + Date.now() + Math.random(),
      senderId: player.id,
      senderName: player.name,
      text: String(text).slice(0, 100),
      timestamp: Date.now(),
      isQuickMsg: !!isQuickMsg,
    });
  });

  socket.on('disconnect', () => {
    rooms.forEach((room, code) => {
      const idx = room.players.findIndex((p) => p.socketId === socket.id);
      if (idx !== -1) {
        if (room.status === 'waiting') {
          // If in lobby, remove player
          room.players.splice(idx, 1);
          // Reassign positions
          room.players.forEach((p, i) => {
            p.position = i as PlayerPosition;
          });
          if (room.players.length === 0) {
            rooms.delete(code);
          } else {
            // Reassign host if host left
            if (room.hostSocketId === socket.id) {
              const nextHuman = room.players.find((p) => !p.isAi);
              if (nextHuman) {
                room.hostSocketId = nextHuman.socketId;
                nextHuman.isHost = true;
              }
            }
            broadcastRoomState(room);
          }
        } else {
          // In game: mark as AI so game continues smoothly without stalling
          const leavingPlayer = room.players[idx];
          leavingPlayer.isAi = true;
          leavingPlayer.name += ' (Bot)';
          leavingPlayer.aiDifficulty = 'medium';
          broadcastRoomState(room);

          if (room.status === 'bidding' && room.currentTurn === leavingPlayer.position) {
            checkAndTriggerAiBid(room);
          } else if (room.status === 'playing' && room.currentTurn === leavingPlayer.position) {
            checkAndTriggerAiPlay(room);
          }
        }
      }
    });
  });
});

// Vite middleware mounting in development or static serving in production
async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Call Bridge Game Server running on port ${PORT}`);
  });
}

startServer();
