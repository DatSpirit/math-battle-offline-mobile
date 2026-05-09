// ============================================================
// Game Types — Math Card Battle
// ============================================================

export type CardType = 'number' | 'operator';
export type Rarity = 'normal' | 'rare' | 'super' | 'ultra';

export type GameMode = 'vs_ai' | 'pass_play' | 'campaign' | 'logic';
export type AIDifficulty = 'easy' | 'medium' | 'hard' | 'boss';
export type PlayerRole = 'player1' | 'player2';

export type GamePhase =
  | 'start_screen'
  | 'player1_placing'
  | 'player2_placing'
  | 'round_result'
  | 'game_over';


export interface GameCard {
  id: string;
  value: string; // '0'-'9' | '+' | '-' | '*' | '/'
  type: CardType;
  rarity: Rarity;
  stars?: number;
  redStars?: number;
  level?: number;
  hasHalfStar?: boolean;
  name?: string;
  flavorText?: string;
  abilityName?: string;
  abilityDesc?: string;
  activationCond?: string;
}

import type { BattleEvent } from '../engine/types';

export interface TurnResult {
  turn: number;
  playerCards: GameCard[];
  playerExpression: string;
  playerValue: number | null;
  playerLogicScore: number;
  playerTacticalScore: number;
  aiCards: GameCard[];
  aiExpression: string;
  aiValue: number | null;
  aiLogicScore: number;
  aiTacticalScore: number;
  winner: 'player' | 'ai' | 'tie';
  playerPointsEarned: number;
  aiPointsEarned: number;
  events: BattleEvent[];
  specialEffect?: string;
  isCritical?: boolean;
  attacker?: 'player' | 'ai' | null;
}

// Per-turn requirements (index = turn - 1)
export const TURN_INFO: {
  slotsCount: number;
  description: string;
  numCount: number;
  opCount: number;
  mode: 'single' | 'concat' | 'expression';
}[] = [
  { slotsCount: 1, numCount: 1, opCount: 0, description: 'Đặt 1 thẻ số',              mode: 'single'     },
  { slotsCount: 2, numCount: 2, opCount: 0, description: 'Ghép 2 số thành 1 số lớn',   mode: 'concat'     },
  { slotsCount: 3, numCount: 2, opCount: 1, description: '2 số + 1 phép tính',          mode: 'expression' },
  { slotsCount: 4, numCount: 3, opCount: 1, description: '3 số + 1 phép tính',          mode: 'expression' },
  { slotsCount: 5, numCount: 3, opCount: 2, description: '3 số + 2 phép tính',          mode: 'expression' },
  { slotsCount: 6, numCount: 4, opCount: 2, description: '4 số + 2 phép tính',          mode: 'expression' },
];

export interface CardMetadata {
  name: string;
  flavorText?: string;
  abilityName?: string;
  /** Kỹ năng riêng cho từng phẩm chất R / SR / UR */
  abilities?: {
    rare?: string;
    super?: string;
    ultra?: string;
  };
  /** Giữ để backwards-compat, dùng khi không có `abilities` */
  abilityDesc?: string;
  activationCond?: string;
}
