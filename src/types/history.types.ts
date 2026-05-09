// ============================================================
// History Types — Math Battle Offline
// Lưu lịch sử trận đấu vào localStorage
// ============================================================

import type { TurnResult } from './game';

export type GameMode = 'vs_ai' | 'pass_play' | 'campaign' | 'logic';
export type AIDifficulty = 'easy' | 'medium' | 'hard' | 'boss';

export interface MatchRecord {
  id: string;
  date: string;           // ISO string
  mode: GameMode;
  difficulty?: AIDifficulty; // chỉ có khi mode === 'vs_ai'
  player1: {
    name: string;
    avatar: string;
    score: number;
  };
  player2: {
    name: string;
    avatar: string;
    score: number;
    isAI: boolean;
  };
  winner: 'player1' | 'player2' | 'tie';
  turns: TurnResult[];
  durationSeconds: number;
}

export interface PlayerStats {
  totalGames: number;
  wins: number;
  losses: number;
  ties: number;
  winRate: number;
  highestScore: number;
  favoriteMode: GameMode | null;
  longestWinStreak: number;
  currentWinStreak: number;
}
