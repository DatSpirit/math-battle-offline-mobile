import type { GameCard } from '../../types/game';
import type { BattleEvent } from '../types';

/**
 * Trạng thái tạm thời trong quá trình tính toán Pipeline
 */
export interface PipelineState {
  player1: {
    cards: GameCard[];
    baseValue: number;
    multiplier: number;
    totalScore: number;
    disabledCardIds: Set<string>;
    disabledSkills: Set<string>;
    poolPoints: number;
    activeBonuses: number; // % cộng dồn từ thẻ 8
    totalBonusPercent: number; // Tổng % thưởng hiện tại
    isImmuneToDebuffs: boolean; // Thẻ 4 bảo vệ
    blockedSkillsCount: number; // Số kỹ năng đã chặn được
    maxBlockedSkills: number; // Giới hạn số kỹ năng có thể chặn
  };
  player2: {
    cards: GameCard[];
    baseValue: number;
    multiplier: number;
    totalScore: number;
    disabledCardIds: Set<string>;
    disabledSkills: Set<string>;
    poolPoints: number;
    activeBonuses: number;
    totalBonusPercent: number;
    isImmuneToDebuffs: boolean;
    blockedSkillsCount: number;
    maxBlockedSkills: number;
  };
  turn: number;
  events: BattleEvent[];
}

/**
 * Interface cho một kỹ năng thẻ bài
 */
export interface CardEffect {
  id: string;
  apply(state: PipelineState): void;
}
