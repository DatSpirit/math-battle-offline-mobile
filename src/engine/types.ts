import type { GameCard, PlayerRole } from '../types/game';
export type { PlayerRole, GameCard };

/**
 * Các loại sự kiện diễn ra trong một lượt đấu
 */
export type BattleEventType = 
  | 'NEUTRALIZED'      // Thẻ bị vô hiệu hóa
  | 'SKILL_ACTIVATED'   // Kích hoạt kỹ năng
  | 'VALUE_MODIFIED'   // Giá trị trên thẻ thay đổi
  | 'BONUS_APPLIED'    // Cộng % từ toán tử
  | 'MULTIPLIER_HIT'   // Nhân hệ số (x2, x3...)
  | 'GLOBAL_EFFECT'    // Hiệu ứng toàn cục (chia đôi, đảo ngược)
  | 'POOL_TRANSFER'    // Chuyển điểm vào kho
  | 'ABILITY_GLOW'     // Thẻ phát sáng
  | 'TEXT_POPUP';      // Hiện chữ thông báo

/**
 * Một bước nhỏ trong "kịch bản" trận đấu
 */
export interface BattleEvent {
  type: BattleEventType;
  sourceCardId?: string;
  targetCardId?: string; // ID thẻ bị tác động
  targetPlayer?: PlayerRole;
  skillName?: string; // Tên kỹ năng chuyên nghiệp
  description: string;
  valueFrom?: number;
  valueTo?: number;
  priority: number;
  displaySide?: PlayerRole;
}

export interface EngineInput {
  player1: {
    cards: GameCard[];
    poolPoints: number;
    activeBonuses: number;
  };
  player2: {
    cards: GameCard[];
    poolPoints: number;
    activeBonuses: number;
  };
  turn: number;
}

export interface EngineOutput {
  player1Score: number;
  player2Score: number;
  player1Details: {
    baseValue: number;      // Giá trị gốc từ biểu thức (sau khi vô hiệu hóa)
    logicScore: number;     // Giá trị sau khi nhân hệ số (x2, x3...)
    bonusScore: number;     // Điểm cộng thêm từ kỹ năng hoặc kho điểm
  };
  player2Details: {
    baseValue: number;
    logicScore: number;
    bonusScore: number;
  };
  winner: 'player1' | 'player2' | 'tie';
  events: BattleEvent[];
  player1NextBonus: number; // % bonus chuyển sang lượt sau
  player2NextBonus: number;
}
