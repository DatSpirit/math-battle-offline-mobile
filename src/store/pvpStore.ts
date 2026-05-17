// pvpStore.ts — Zustand store for PvP Socket.IO state management
import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from './authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface ServerCard {
  id: string;
  value: string;
  type: 'number' | 'operator';
}

interface PvPPlayer {
  supabaseId: string;
  username: string;
  elo: number;
}

interface TurnResultData {
  turn: number;
  p1: { expression: string; value: number | null; points: number };
  p2: { expression: string; value: number | null; points: number };
  scores: { p1: number; p2: number };
}

interface GameOverData {
  winnerId: string | null;
  reason: string;
  scores: { p1: number; p2: number };
  eloChanges: Record<string, number>;
}

export type PvPPhase =
  | 'idle'
  | 'searching'
  | 'found'
  | 'playing'
  | 'turn_result'
  | 'game_over';

interface PvPState {
  phase: PvPPhase;
  socket: Socket | null;
  roomCode: string | null;
  players: PvPPlayer[];
  myId: string | null;
  hand: ServerCard[];
  currentTurn: number;
  timeLeft: number;
  scores: { p1: number; p2: number };
  turnResult: TurnResultData | null;
  gameOverData: GameOverData | null;
  hasSubmitted: boolean;
  error: string | null;

  // Actions
  connectAndSearch: () => void;
  submitCards: (cardIds: string[]) => void;
  disconnect: () => void;
  resetPvP: () => void;
  setTimeLeft: (t: number) => void;
}

export const usePvPStore = create<PvPState>((set, get) => ({
  phase: 'idle',
  socket: null,
  roomCode: null,
  players: [],
  myId: null,
  hand: [],
  currentTurn: 0,
  timeLeft: 60,
  scores: { p1: 0, p2: 0 },
  turnResult: null,
  gameOverData: null,
  hasSubmitted: false,
  error: null,

  connectAndSearch: () => {
    const { accessToken } = useAuthStore.getState();
    const user = useAuthStore.getState().user;
    if (!accessToken || !user?.supabaseId) {
      set({ error: 'Cần đăng nhập để chơi PvP' });
      return;
    }

    // Disconnect existing socket
    get().socket?.disconnect();

    const socket = io(API_URL, {
      auth: {
        supabaseId: user.supabaseId,
        username: user.name,
        token: accessToken,
      },
    });

    set({ socket, phase: 'searching', error: null, myId: user.supabaseId });

    // ─── Socket Events ────────────────────
    socket.on('connect', () => {
      socket.emit('quick_match');
    });

    socket.on('waiting_for_opponent', ({ roomCode }) => {
      set({ roomCode, phase: 'searching' });
    });

    socket.on('match_found', ({ roomCode, players }) => {
      set({
        roomCode,
        players,
        phase: 'found',
      });
      // Chuyển sang playing sau 2s (hiệu ứng "Found!")
      setTimeout(() => {
        set({ phase: 'playing' });
      }, 2000);
    });

    socket.on('turn_start', ({ turn, hand, timeLimit }) => {
      set({
        currentTurn: turn,
        hand,
        timeLeft: timeLimit,
        hasSubmitted: false,
        turnResult: null,
        phase: 'playing',
      });
    });

    socket.on('play_accepted', () => {
      set({ hasSubmitted: true });
    });

    socket.on('play_invalid', ({ error }) => {
      set({ error, hasSubmitted: false });
    });

    socket.on('turn_result', (data: TurnResultData) => {
      set({
        turnResult: data,
        scores: data.scores,
        phase: 'turn_result',
      });
    });

    socket.on('game_over', (data: GameOverData) => {
      set({
        gameOverData: data,
        scores: data.scores,
        phase: 'game_over',
      });
    });

    socket.on('reconnected', ({ roomCode, turn, scores, hand, submitted }) => {
      set({
        roomCode,
        currentTurn: turn,
        scores,
        hand,
        hasSubmitted: submitted,
        phase: 'playing',
      });
    });

    socket.on('no_match', ({ message }: { message: string }) => {
      set({ phase: 'idle', error: message || 'Không tìm được đối thủ, thử lại sau' });
      socket.disconnect();
    });

    socket.on('error', ({ message }) => {
      set({ error: message });
    });

    socket.on('disconnect', () => {
      // Will auto-reconnect via socket.io
    });
  },

  submitCards: (cardIds: string[]) => {
    const { socket, hasSubmitted } = get();
    if (!socket || hasSubmitted) return;
    socket.emit('submit_cards', { cardIds });
  },

  disconnect: () => {
    get().socket?.disconnect();
    set({
      socket: null,
      phase: 'idle',
      roomCode: null,
      players: [],
      hand: [],
      currentTurn: 0,
      timeLeft: 60,
      scores: { p1: 0, p2: 0 },
      turnResult: null,
      gameOverData: null,
      hasSubmitted: false,
      error: null,
    });
  },

  resetPvP: () => {
    get().socket?.disconnect();
    set({
      socket: null,
      phase: 'idle',
      roomCode: null,
      players: [],
      hand: [],
      currentTurn: 0,
      timeLeft: 60,
      scores: { p1: 0, p2: 0 },
      turnResult: null,
      gameOverData: null,
      hasSubmitted: false,
      error: null,
    });
  },

  setTimeLeft: (t) => set({ timeLeft: t }),
}));
