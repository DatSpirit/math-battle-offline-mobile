// pvp/gameHandler.ts — Core PvP Game Logic (Socket.IO)
// Quản lý: matchmaking, turn timer, disconnect/reconnect, scoring

import type { Server, Socket } from 'socket.io';
import { prisma } from '../lib/prisma';
import { validatePlay, evaluateServerPlay } from './validator';
import { calculateEloChange, calculateEloChangeDraw } from './eloCalculator';

// ─── Constants ──────────────────────────────
const TURN_TIMEOUT = 65_000; // 65s (5s buffer so với client 60s)
const RECONNECT_WINDOW = 30_000; // 30s để reconnect
const TOTAL_TURNS = 6;

// ─── In-Memory Room State ───────────────────
interface ServerCard {
  id: string;
  value: string;
  type: 'number' | 'operator';
}

interface RoomState {
  roomCode: string;
  dbId: string;
  status: 'waiting' | 'playing' | 'finished';
  players: {
    [supabaseId: string]: {
      socketId: string;
      username: string;
      elo: number;
      hand: ServerCard[];
      reserve: ServerCard[];
      submitted: boolean;
      submittedCards: ServerCard[];
      disconnectedAt?: number;
    };
  };
  p1Id: string;
  p2Id?: string;
  scores: { p1: number; p2: number };
  currentTurn: number;
  turnTimer?: ReturnType<typeof setTimeout>;
}

const rooms = new Map<string, RoomState>();
const playerRooms = new Map<string, string>(); // supabaseId → roomCode

// ─── Utility ────────────────────────────────
function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateDeck(): ServerCard[] {
  const deck: ServerCard[] = [];
  // 12 number cards (1-9) + 6 operator cards
  for (let i = 0; i < 12; i++) {
    deck.push({ id: `n${i}_${Date.now()}`, value: String(Math.floor(Math.random() * 9) + 1), type: 'number' });
  }
  const ops = ['+', '-', '*', '+', '-', '*'];
  for (let i = 0; i < 6; i++) {
    deck.push({ id: `o${i}_${Date.now()}`, value: ops[i], type: 'operator' });
  }
  // Shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function dealCards(turn: number, deck: ServerCard[]): { hand: ServerCard[]; remaining: ServerCard[] } {
  const handSize = Math.min(turn + 2, deck.length); // Turn 1 → 3 cards, Turn 6 → 8 cards
  return {
    hand: deck.slice(0, handSize),
    remaining: deck.slice(handSize),
  };
}

// ─── Socket Handler ─────────────────────────
export function initGameHandler(io: Server) {
  io.on('connection', (socket: Socket) => {
    const supabaseId = socket.handshake.auth?.supabaseId as string;
    const username = socket.handshake.auth?.username as string || 'Player';

    if (!supabaseId) {
      socket.emit('error', { message: 'Authentication required' });
      socket.disconnect();
      return;
    }

    console.log(`[PvP] ${username} connected (${supabaseId.slice(0, 8)}...)`);

    // ─── QUICK MATCH ──────────────────────────
    socket.on('quick_match', async () => {
      // Kiểm tra nếu đang ở room khác
      const existingRoom = playerRooms.get(supabaseId);
      if (existingRoom) {
        socket.emit('error', { message: 'Bạn đang trong một trận đấu' });
        return;
      }

      // Tìm room đang chờ
      let room: RoomState | null = null;
      for (const [, r] of rooms) {
        if (r.status === 'waiting' && r.p1Id !== supabaseId) {
          room = r;
          break;
        }
      }

      if (room) {
        // Join existing room
        room.p2Id = supabaseId;
        const user = await prisma.user.findUnique({ where: { supabaseId } });
        room.players[supabaseId] = {
          socketId: socket.id,
          username,
          elo: user?.elo || 1000,
          hand: [],
          reserve: [],
          submitted: false,
          submittedCards: [],
        };
        playerRooms.set(supabaseId, room.roomCode);
        socket.join(room.roomCode);

        // Start game!
        room.status = 'playing';
        room.currentTurn = 1;

        // Update DB
        await prisma.pvpRoom.update({
          where: { roomCode: room.roomCode },
          data: { status: 'playing', p2Id: supabaseId, p2Elo: user?.elo || 1000 },
        });

        // Deal cards
        startTurn(io, room);

        io.to(room.roomCode).emit('match_found', {
          roomCode: room.roomCode,
          players: Object.entries(room.players).map(([id, p]) => ({
            supabaseId: id,
            username: p.username,
            elo: p.elo,
          })),
        });
      } else {
        // Create new room
        const roomCode = generateRoomCode();
        const user = await prisma.user.findUnique({ where: { supabaseId } });
        const dbRoom = await prisma.pvpRoom.create({
          data: { roomCode, p1Id: supabaseId, p1Elo: user?.elo || 1000 },
        });

        const newRoom: RoomState = {
          roomCode,
          dbId: dbRoom.id,
          status: 'waiting',
          players: {
            [supabaseId]: {
              socketId: socket.id,
              username,
              elo: user?.elo || 1000,
              hand: [],
              reserve: [],
              submitted: false,
              submittedCards: [],
            },
          },
          p1Id: supabaseId,
          scores: { p1: 0, p2: 0 },
          currentTurn: 0,
        };

        rooms.set(roomCode, newRoom);
        playerRooms.set(supabaseId, roomCode);
        socket.join(roomCode);

        socket.emit('waiting_for_opponent', { roomCode });
      }
    });

    // ─── SUBMIT CARDS ─────────────────────────
    socket.on('submit_cards', (data: { cardIds: string[] }) => {
      const roomCode = playerRooms.get(supabaseId);
      if (!roomCode) return;
      const room = rooms.get(roomCode);
      if (!room || room.status !== 'playing') return;

      const player = room.players[supabaseId];
      if (!player || player.submitted) return;

      // Validate play (anti-cheat)
      const result = validatePlay(data.cardIds, player.hand, room.currentTurn);
      if (!result.valid) {
        socket.emit('play_invalid', { error: result.error });
        return;
      }

      player.submitted = true;
      player.submittedCards = result.cards;

      socket.emit('play_accepted');

      // Check if both submitted
      const allSubmitted = Object.values(room.players).every(p => p.submitted);
      if (allSubmitted) {
        resolveTurn(io, room);
      }
    });

    // ─── RECONNECT ────────────────────────────
    socket.on('reconnect_room', () => {
      const roomCode = playerRooms.get(supabaseId);
      if (!roomCode) {
        socket.emit('error', { message: 'No active room found' });
        return;
      }
      const room = rooms.get(roomCode);
      if (!room) return;

      const player = room.players[supabaseId];
      if (!player) return;

      // Reconnect!
      player.socketId = socket.id;
      delete player.disconnectedAt;
      socket.join(roomCode);

      socket.emit('reconnected', {
        roomCode,
        turn: room.currentTurn,
        scores: room.scores,
        hand: player.hand,
        submitted: player.submitted,
      });

      console.log(`[PvP] ${username} reconnected to ${roomCode}`);
    });

    // ─── DISCONNECT ───────────────────────────
    socket.on('disconnect', () => {
      const roomCode = playerRooms.get(supabaseId);
      if (!roomCode) return;
      const room = rooms.get(roomCode);
      if (!room) return;

      const player = room.players[supabaseId];
      if (!player) return;

      if (room.status === 'waiting') {
        // Chưa bắt đầu → hủy room
        rooms.delete(roomCode);
        playerRooms.delete(supabaseId);
        prisma.pvpRoom.delete({ where: { roomCode } }).catch(() => {});
        return;
      }

      // Đang chơi → cho thời gian reconnect
      player.disconnectedAt = Date.now();
      console.log(`[PvP] ${username} disconnected — 30s reconnect window`);

      setTimeout(async () => {
        if (player.disconnectedAt && Date.now() - player.disconnectedAt >= RECONNECT_WINDOW) {
          // Forfeit
          console.log(`[PvP] ${username} forfeited (timeout)`);
          const winnerId = supabaseId === room.p1Id ? room.p2Id : room.p1Id;
          await endGame(io, room, winnerId || null, 'forfeit');
        }
      }, RECONNECT_WINDOW);
    });
  });
}

// ─── Game Logic ─────────────────────────────

function startTurn(io: Server, room: RoomState) {
  const turn = room.currentTurn;

  // Deal cards to each player
  for (const [, player] of Object.entries(room.players)) {
    const deck = generateDeck();
    const { hand, remaining } = dealCards(turn, deck);
    player.hand = hand;
    player.reserve = remaining;
    player.submitted = false;
    player.submittedCards = [];

    // Gửi hand riêng cho từng player
    io.to(player.socketId).emit('turn_start', {
      turn,
      hand: player.hand,
      timeLimit: 60, // client hiển thị 60s
    });
  }

  // Start timeout
  if (room.turnTimer) clearTimeout(room.turnTimer);
  room.turnTimer = setTimeout(() => {
    handleTimeout(io, room);
  }, TURN_TIMEOUT);
}

function handleTimeout(io: Server, room: RoomState) {
  // Auto-submit rỗng cho ai chưa submit
  for (const [, player] of Object.entries(room.players)) {
    if (!player.submitted) {
      player.submitted = true;
      player.submittedCards = []; // Rỗng → 0 điểm
    }
  }
  resolveTurn(io, room);
}

function resolveTurn(io: Server, room: RoomState) {
  if (room.turnTimer) clearTimeout(room.turnTimer);

  const p1 = room.players[room.p1Id];
  const p2Id = room.p2Id!;
  const p2 = room.players[p2Id];

  // Tính điểm
  const turn = room.currentTurn;
  const turnFactor = 1 + (turn - 1) * 0.5;

  const p1Value = evaluateServerPlay(p1.submittedCards, turn);
  const p2Value = evaluateServerPlay(p2.submittedCards, turn);

  const p1Points = p1Value !== null && p1Value > 0 ? Math.floor(p1Value * turnFactor) : 0;
  const p2Points = p2Value !== null && p2Value > 0 ? Math.floor(p2Value * turnFactor) : 0;

  room.scores.p1 += p1Points;
  room.scores.p2 += p2Points;

  // Emit result
  io.to(room.roomCode).emit('turn_result', {
    turn,
    p1: {
      expression: p1.submittedCards.map(c => c.value).join(''),
      value: p1Value,
      points: p1Points,
    },
    p2: {
      expression: p2.submittedCards.map(c => c.value).join(''),
      value: p2Value,
      points: p2Points,
    },
    scores: room.scores,
  });

  // Next turn or game over
  if (turn >= TOTAL_TURNS) {
    const winnerId = room.scores.p1 > room.scores.p2 ? room.p1Id
      : room.scores.p2 > room.scores.p1 ? p2Id
      : null; // tie
    endGame(io, room, winnerId, 'completed');
  } else {
    room.currentTurn++;
    // Delay trước khi bắt đầu turn mới
    setTimeout(() => startTurn(io, room), 3000);
  }
}

async function endGame(io: Server, room: RoomState, winnerId: string | null, reason: string) {
  room.status = 'finished';
  if (room.turnTimer) clearTimeout(room.turnTimer);

  // Tính ELO
  const p1 = room.players[room.p1Id];
  const p2Id = room.p2Id!;
  const p2 = room.players[p2Id];

  let p1EloChange = 0;
  let p2EloChange = 0;

  if (winnerId) {
    const [winChange, loseChange] = calculateEloChange(
      winnerId === room.p1Id ? p1.elo : p2.elo,
      winnerId === room.p1Id ? p2.elo : p1.elo,
    );
    p1EloChange = winnerId === room.p1Id ? winChange : loseChange;
    p2EloChange = winnerId === room.p1Id ? loseChange : winChange;
  } else {
    [p1EloChange, p2EloChange] = calculateEloChangeDraw(p1.elo, p2.elo);
  }

  // Update DB
  try {
    await prisma.$transaction([
      prisma.pvpRoom.update({
        where: { roomCode: room.roomCode },
        data: {
          status: 'finished',
          winnerId,
          p1Score: room.scores.p1,
          p2Score: room.scores.p2,
          currentTurn: room.currentTurn,
          p1EloChange,
          p2EloChange,
        },
      }),
      prisma.user.update({
        where: { supabaseId: room.p1Id },
        data: {
          elo: { increment: p1EloChange },
          wins: winnerId === room.p1Id ? { increment: 1 } : undefined,
          winStreak: winnerId === room.p1Id ? { increment: 1 } : { set: 0 },
        },
      }),
      prisma.user.update({
        where: { supabaseId: p2Id },
        data: {
          elo: { increment: p2EloChange },
          wins: winnerId === p2Id ? { increment: 1 } : undefined,
          winStreak: winnerId === p2Id ? { increment: 1 } : { set: 0 },
        },
      }),
    ]);
  } catch (err) {
    console.error('[PvP] DB update error:', err);
  }

  // Emit game over
  io.to(room.roomCode).emit('game_over', {
    winnerId,
    reason,
    scores: room.scores,
    eloChanges: {
      [room.p1Id]: p1EloChange,
      [p2Id]: p2EloChange,
    },
  });

  // Cleanup
  playerRooms.delete(room.p1Id);
  playerRooms.delete(p2Id);
  rooms.delete(room.roomCode);

  console.log(`[PvP] Game ${room.roomCode} ended — Winner: ${winnerId || 'TIE'} (${reason})`);
}
