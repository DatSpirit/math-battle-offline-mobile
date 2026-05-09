import { ScoringPipeline } from './ScoringPipeline';
import type { EngineInput, EngineOutput } from './types';
import type { PipelineState } from './effects/effectTypes';

/**
 * Chế độ Logic: Thuần tính toán.
 * - Không áp dụng bất kỳ kỹ năng thẻ bài nào (Thẻ 0-9).
 * - Không có bonus từ toán tử (+, -, *, /).
 * - Điểm số chỉ dựa trên giá trị biểu thức toán học nhân với hệ số lượt.
 * - Không có điểm Tactical (BonusScore luôn = 0).
 */
export class LogicScoringPipeline extends ScoringPipeline {
  public calculate(input: EngineInput): EngineOutput {
    const state: PipelineState = this.initializeState(input);

    // Vô hiệu hóa TẤT CẢ kỹ năng của cả 2 người chơi
    ['player1', 'player2'].forEach((pKey) => {
      const p = pKey as 'player1' | 'player2';
      state[p].cards.forEach(card => {
        state[p].disabledSkills.add(card.id);
      });
      // Reset bonus dồn tích về 0
      state[p].totalBonusPercent = 0;
    });

    // BƯỚC 1: Bỏ qua Giai đoạn Vô hiệu hóa (Neutralization) - vì đã disable hết rồi

    // BƯỚC 2: Tính toán giá trị gốc (Chỉ còn biểu thức toán học thuần túy)
    this.calculateBaseValues(state);

    // BƯỚC 3: Bỏ qua Bonus Toán tử

    // BƯỚC 4: Áp dụng hệ số lượt (Chỉ giữ lại turnFactor, bỏ qua kỹ năng nhân/chia)
    this.applyLogicMultipliers(state);

    // BƯỚC 5: Bỏ qua Global Modifiers (Cướp điểm, cân bằng...)

    // BƯỚC 6: Kết quả cuối cùng
    const result = this.finalize(state);
    
    // Đảm bảo bonusScore luôn bằng 0 trong chế độ Logic
    result.player1Details.bonusScore = 0;
    result.player2Details.bonusScore = 0;
    result.player1NextBonus = 0;
    result.player2NextBonus = 0;

    return result;
  }

  /**
   * Hệ số nhân trong chế độ Logic chỉ bao gồm hệ số lượt mặc định.
   */
  private applyLogicMultipliers(state: PipelineState) {
    ['player1', 'player2'].forEach((pKey) => {
      const p = pKey as 'player1' | 'player2';
      // Hệ số lượt mặc định: Turn 1: x1.0, Turn 2: x1.5... Turn 6: x3.5
      const turnFactor = 1 + (state.turn - 1) * 0.5;
      state[p].multiplier = turnFactor;
      
      // Tính điểm tổng (không bonus)
      state[p].totalScore = Math.floor(state[p].baseValue * state[p].multiplier);
    });
  }
}
