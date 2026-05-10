import type { EngineInput, EngineOutput, GameCard } from './types';
import type { PipelineState, CardEffect } from './effects/effectTypes';
import { Card0Effect } from './effects/card0';
import { Card1Effect } from './effects/card1';
import { Card4Effect } from './effects/card4';
import { Card7Effect } from './effects/card7';
import { evaluatePlay } from '../core/game/matchEngine';

export class ScoringPipeline {
  private effects: CardEffect[] = [
    new Card4Effect(), // Thẻ 4 chạy trước để bảo vệ bài
    new Card0Effect(),
    new Card1Effect(),
    new Card7Effect(),
  ];

  /** 
   * Lấy sức mạnh (Potency) của thẻ bài.
   * - Level: Đã loại bỏ (không còn ảnh hưởng đến điểm).
   * - Sao (Stars): +10% hiệu lực mỗi sao (ví dụ 5 sao -> +50%).
   */
  protected getPotency(card: GameCard): number {
    const stars = card.stars || 0;
    const redStars = card.redStars || 0;
    // Mỗi sao vàng cộng 10% sức mạnh kỹ năng
    // Mỗi sao đỏ cộng 20% sức mạnh kỹ năng
    return 1 + (stars * 0.1) + (redStars * 0.2);
  }

  /**
   * Hàm core tính toán điểm số cho một lượt đấu.
   * Logic được chia thành các Pipeline (Giai đoạn) để đảm bảo thứ tự ưu tiên của các kỹ năng.
   */
  public calculate(input: EngineInput): EngineOutput {
    const state: PipelineState = this.initializeState(input);

    // BƯỚC 1: Giai đoạn Vô hiệu hóa (Neutralization)
    // Thẻ 0 (Gốc Tọa Độ), Thẻ 1 (Đơn Vị), Thẻ 7 (May Mắn) thực hiện khóa kỹ năng/giá trị của đối thủ.
    this.runNeutralization(state);

    // BƯỚC 2: Giai đoạn Giá trị gốc (Base Value)
    // Thẻ 3 (Tam Hợp) nhân 3 giá trị, Thẻ 6 (Biến Thiên) đổi giá trị ngẫu nhiên.
    // Sau đó ghép các số đứng cạnh nhau và tính toán biểu thức toán học (ví dụ: 1 + 2 * 3).
    this.calculateBaseValues(state);

    // BƯỚC 3: Giai đoạn Bonus Toán tử (+, -)
    // Toán tử Cộng (+) tăng % điểm thưởng của bản thân.
    // Toán tử Trừ (-) giảm % điểm thưởng của đối thủ.
    this.applyOperatorSkills(state);

    // BƯỚC 4: Giai đoạn Hệ số nhân (Multipliers)
    // Thẻ * (Cấp Số) nhân hệ số, Thẻ / (Phân Rã) chia hệ số đối thủ.
    // Thẻ 5 (Lật Kèo) nhân hệ số nếu đang thua. Thẻ 8 (Vô Cực) cộng bonus dồn tích.
    // Lượt càng về sau (Turn 1 -> 6), hệ số mặc định càng cao (+0.5 mỗi lượt).
    this.applyMultipliers(state);

    // BƯỚC 5: Giai đoạn Can thiệp đặc biệt (Global Modifiers)
    // Thẻ 2 (Đối Xứng) cân bằng hoặc cướp điểm. Thẻ 4 (Phòng Ngự) cộng điểm dựa trên tổng điểm hiện có.
    // Điểm từ "Kho điểm" (Pool Points) của lượt trước được cộng trực tiếp vào đây.
    this.applyGlobalModifiers(state);

    // BƯỚC 6: Kết quả cuối cùng
    return {
      ...this.finalize(state),
      player1Score: state.player1.totalScore,
      player2Score: state.player2.totalScore,
    };
  }

  protected initializeState(input: EngineInput): PipelineState {
    return {
      player1: { 
        ...input.player1, 
        baseValue: 0, 
        multiplier: 1, 
        totalScore: 0, 
        disabledCardIds: new Set(), 
        disabledSkills: new Set(), 
        totalBonusPercent: input.player1.activeBonuses,
        isImmuneToDebuffs: false,
        blockedSkillsCount: 0,
        maxBlockedSkills: 0
      },
      player2: { 
        ...input.player2, 
        baseValue: 0, 
        multiplier: 1, 
        totalScore: 0, 
        disabledCardIds: new Set(), 
        disabledSkills: new Set(), 
        totalBonusPercent: input.player2.activeBonuses,
        isImmuneToDebuffs: false,
        blockedSkillsCount: 0,
        maxBlockedSkills: 0
      },
      turn: input.turn,
      events: []
    };
  }

  protected runNeutralization(state: PipelineState) {
    // Các hiệu ứng vô hiệu hóa được thực thi tuần tự
    this.effects.forEach(effect => effect.apply(state));
  }

  /**
   * Bước 2: Tính toán giá trị toán học thuần túy từ các thẻ bài trên bàn.
   */
  protected calculateBaseValues(state: PipelineState) {
    ['player1', 'player2'].forEach((pKey) => {
      const p = pKey as 'player1' | 'player2';
      const cards = state[p].cards;
      
      const rawParts = cards.map(c => {
        // Nếu thẻ bị vô hiệu hóa bởi Thẻ 0, giá trị coi như bằng 0
        if (state[p].disabledCardIds.has(c.id)) return '0';
        
        let val = parseInt(c.value);
        if (isNaN(val)) return c.value; // Nếu là toán tử (+, -, *, /) thì giữ nguyên ký tự

        // --- KỸ NĂNG THẺ 6 (BIẾN SỐ) ---
        // Ý nghĩa: Thẻ 6 có tính bất định, giá trị thay đổi ngẫu nhiên mỗi lượt.
        // Khoảng dao động (-6 đến +18) được thiết kế để tạo ra sự đột biến lớn trong trận đấu.
        if (c.value === '6' && !state[p].disabledSkills.has(c.id) && c.rarity && c.rarity !== 'normal') {
          const potency = this.getPotency(c);
          const rarity = c.rarity;
          
          // Metadata: Rare (+6), Super (+12), Ultra (+18). Potency (sao) nhân thêm hiệu ứng.
          const rangeMax = rarity === 'rare' ? 6 : rarity === 'super' ? 12 : 18;
          const rangeMin = -6;
          
          const bonus = (Math.floor(Math.random() * (rangeMax - rangeMin + 1)) + rangeMin) * potency;
          val = Math.max(0, val + Math.floor(bonus));
          
          const starBonus = Math.round((potency - 1) * 100);
          const bonusText = starBonus > 0 ? ` (Sao +${starBonus}%)` : '';
          
          state.events.push({ 
            type: 'VALUE_MODIFIED', 
            sourceCardId: c.id, 
            targetPlayer: p, 
            skillName: 'BIẾN SỐ',
            description: `Thẻ [6] biến đổi thành [${val}] (Biến động: ${bonus > 0 ? '+' : ''}${Math.floor(bonus)})${bonusText}`, 
            priority: 2 
          });
        }

        // --- KỸ NĂNG THẺ 3 (TAM HỢP) ---
        // Ý nghĩa: Thẻ 3 tượng trưng cho sự liên kết. Nó không tự mạnh lên mà làm mạnh các thẻ số khác.
        // Logic: Chờ duyệt hết các thẻ rồi mới tìm mục tiêu để nhân 3 giá trị.
        return val.toString();
      }).filter(v => v !== null) as string[];

      // XỬ LÝ RIÊNG THẺ 3: Tìm mục tiêu hợp lệ để buff (Thẻ số khác)
      const activeCard3s = state[p].cards.filter(c => c.value === '3' && !state[p].disabledSkills.has(c.id) && c.rarity !== 'normal');
      
      activeCard3s.forEach(card3 => {
        const potency = this.getPotency(card3);
        const rarity = card3.rarity;
        
        const otherNumbers = state[p].cards.filter(c => c.id !== card3.id && !isNaN(parseInt(c.value)));
        if (otherNumbers.length === 0) return;

        let target: GameCard | undefined;
        if (rarity === 'rare') {
          // Buff 1 lá ngẫu nhiên
          target = otherNumbers[Math.floor(Math.random() * otherNumbers.length)];
        } else if (rarity === 'super') {
          // Buff 1 lá mạnh nhất (chọn lá đầu tiên nếu trùng)
          const maxVal = Math.max(...otherNumbers.map(n => parseInt(n.value)));
          target = otherNumbers.find(n => parseInt(n.value) === maxVal);
        } else if (rarity === 'ultra') {
          // Buff 1 lá mạnh nhất và cộng thêm bonus điểm thưởng (+30%)
          const maxVal = Math.max(...otherNumbers.map(n => parseInt(n.value)));
          target = otherNumbers.find(n => parseInt(n.value) === maxVal);
          state[p].totalBonusPercent += 0.3 * potency;
        }

        if (target) {
          const idx = state[p].cards.findIndex(c => c.id === target.id);
          if (idx !== -1) {
            const oldVal = parseInt(rawParts[idx]);
            const newVal = Math.floor(oldVal * 3 * potency);
            rawParts[idx] = newVal.toString();
            
            const starBonus = Math.round((potency - 1) * 100);
            const bonusText = starBonus > 0 ? ` (Sao +${starBonus}%)` : '';
            
            state.events.push({ 
              type: 'VALUE_MODIFIED', 
              sourceCardId: card3.id, 
              targetCardId: target.id, 
              targetPlayer: p, 
              skillName: 'TAM HỢP',
              description: `Nhân 3 giá trị lá [${target.value}] -> [${newVal}]${bonusText}${rarity === 'ultra' ? ' & +30% Bonus' : ''}`, 
              priority: 2 
            });
          }
        }
      });

      // Logic "Ghép số": Nếu đặt [1] và [7] cạnh nhau mà không có toán tử ở giữa, nó sẽ thành "17"
      const expressionParts: string[] = [];
      let currentNumberBuffer = "";

      for (let i = 0; i < rawParts.length; i++) {
        const part = rawParts[i];
        const isNum = !isNaN(parseInt(part));

        if (isNum) {
          currentNumberBuffer += part;
        } else {
          if (currentNumberBuffer !== "") {
            expressionParts.push(currentNumberBuffer);
            currentNumberBuffer = "";
          }
          expressionParts.push(part);
        }
      }
      if (currentNumberBuffer !== "") {
        expressionParts.push(currentNumberBuffer);
      }


      try {
        // Sử dụng logic evaluatePlay đã được tối ưu hóa (fastEval)
        // Lưu ý: Pipeline này chạy trên cards ảo đã qua xử lý, nên ta giả lập cấu trúc cards
        const mockCards = expressionParts.map(val => ({ 
          value: val, 
          type: isNaN(parseInt(val)) ? 'operator' as const : 'number' as const,
          id: 'temp',
          rarity: 'normal' as const
        }));
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { value } = evaluatePlay(mockCards as any, state.turn);
        state[p].baseValue = value !== null ? Math.max(0, Math.round(value)) : 0;
        
        state.events.push({
          type: 'VALUE_MODIFIED',
          targetPlayer: p,
          skillName: 'ĐIỂM GỐC',
          description: `${expressionParts.join('')} = ${state[p].baseValue}`,
          priority: 2
        });
      } catch {
        // Nếu biểu thức lỗi (ví dụ "5 + *"), giá trị mặc định là 0
        state[p].baseValue = 0;
      }
    });
  }

  protected applyOperatorSkills(state: PipelineState) {
    ['player1', 'player2'].forEach((pKey) => {
      const p = pKey as 'player1' | 'player2';

      state[p].cards.forEach(card => {
        if (card.type !== 'operator' || state[p].disabledSkills.has(card.id)) return;
        const rarity = card.rarity || 'normal';
        if (rarity === 'normal') return;
        const potency = this.getPotency(card);

        if (card.value === '+') {
          // Metadata: +10%, +20%, +40%
          const bonusMap: Record<string, number> = { 'rare': 0.1, 'super': 0.2, 'ultra': 0.4 };
          const b = (bonusMap[rarity] || 0.1) * potency;
          state[p].totalBonusPercent += b;
          state.events.push({ 
            type: 'BONUS_APPLIED', 
            sourceCardId: card.id, 
            targetPlayer: p, 
            skillName: 'HỘI TỤ',
            description: `Tăng +${(b * 100).toFixed(1)}% điểm thưởng`, 
            priority: 3 
          });
        }

        if (card.value === '-') {
          // Metadata yêu cầu trừ điểm lượt của đối thủ. Việc này sẽ được xử lý ở Giai đoạn 5 (Global Modifiers)
          // để đảm bảo tính toán trên tổng điểm cuối cùng.
        }
      });
    });
  }

  /**
   * Bước 4: Áp dụng các hệ số nhân và bonus phần trăm.
   */
  protected applyMultipliers(state: PipelineState) {
    ['player1', 'player2'].forEach((pKey) => {
      const p = pKey as 'player1' | 'player2';
      const opp = p === 'player1' ? 'player2' : 'player1';

      // 1. Hệ số lượt mặc định: Tăng dần theo thời gian trận đấu
      // Turn 1: x1.0, Turn 2: x1.5, Turn 3: x2.0... Turn 6: x3.5
      const turnFactor = 1 + (state.turn - 1) * 0.5;
      state[p].multiplier *= turnFactor;

      // 2. Kỹ năng Thẻ * (Cấp Số) và / (Phân Rã)
      state[p].cards.forEach(card => {
        if (card.type !== 'operator' || state[p].disabledSkills.has(card.id)) return;
        const rarity = card.rarity || 'normal';
        if (rarity === 'normal') return;
        const potency = this.getPotency(card);

        if (card.value === '*') {
          // Nhân hệ số của mình (1.5x -> 2.5x tùy rarity)
          const multMap: Record<string, number> = { 'rare': 1.5, 'super': 2.0, 'ultra': 2.5 };
          const m = (multMap[rarity] || 1) * potency;
          state[p].multiplier *= m;
            const starBonus = Math.round((potency - 1) * 100);
            const bonusText = starBonus > 0 ? ` (Sao +${starBonus}%)` : '';
            
            state.events.push({ 
              type: 'MULTIPLIER_HIT', 
              sourceCardId: card.id, 
              targetPlayer: p, 
              skillName: 'CẤP SỐ',
              description: `Nhân x${m.toFixed(2)} hệ số lượt${bonusText}`, 
              priority: 4 
            });
        }

        if (card.value === '/') {
          // KIỂM TRA MIỄN NHIỄM (THẺ 4)
          if (state[opp].isImmuneToDebuffs && state[opp].blockedSkillsCount < state[opp].maxBlockedSkills) {
            state[opp].blockedSkillsCount++;
            state.events.push({ 
              type: 'TEXT_POPUP', 
              targetPlayer: opp, 
              skillName: 'TRỰC GIAO',
              description: `Lá chắn chặn phép Phân Rã! (${state[opp].blockedSkillsCount}/${state[opp].maxBlockedSkills})`, 
              priority: 4 
            });
          } else {
            // Giảm hệ số của đối thủ
            const redMap: Record<string, number> = { 'rare': 0.15, 'super': 0.3, 'ultra': 0.5 };
            const red = Math.min(0.9, (redMap[rarity] || 0) * potency);
            state[opp].multiplier *= (1 - red);
            const starBonus = Math.round((potency - 1) * 100);
            const bonusText = starBonus > 0 ? ` (Sao +${starBonus}%)` : '';
            
            state.events.push({ 
                type: 'MULTIPLIER_HIT', 
                sourceCardId: card.id, 
                targetPlayer: opp, 
                skillName: 'PHÂN RÃ',
                description: `Giảm ${(red * 100).toFixed(1)}% hệ số đối thủ${bonusText}`, 
                priority: 4 
            });
          }
        }
      });

      // --- KỸ NĂNG THẺ 5 (ĐẢO CHIỀU) ---
      // Ý nghĩa: Giúp người chơi lật ngược thế cờ khi đang yếu thế.
      // Điều kiện: Chỉ kích hoạt ở những lượt đầu (trước lượt 4/5) để tránh quá bá đạo ở cuối game.
      state[p].cards.forEach(card => {
        if (card.value === '5' && !state[p].disabledSkills.has(card.id) && card.rarity && card.rarity !== 'normal') {
          const rarity = card.rarity;
          const turn = state.turn;
          
          const isTurnValid = rarity === 'ultra' || (rarity === 'rare' && turn < 4) || (rarity === 'super' && turn < 5);
          
          if (isTurnValid && state[p].baseValue < state[opp].baseValue) {
            const potency = this.getPotency(card);
            const m = 2 * potency;
            state[p].multiplier *= m;
            const starBonus = Math.round((potency - 1) * 100);
            const bonusText = starBonus > 0 ? ` (Sao +${starBonus}%)` : '';
            
            state.events.push({ 
                type: 'MULTIPLIER_HIT', 
                sourceCardId: card.id, 
                targetPlayer: p, 
                skillName: 'ĐẢO CHIỀU',
                description: `Nhân x${m.toFixed(2)} hệ số (Lật kèo thành công)${bonusText}`, 
                priority: 4 
            });
          }
        }
      });

      // --- KỸ NĂNG THẺ 8 (VÔ CỰC - TÍCH LŨY) ---
      // Ý nghĩa: Tích lũy sức mạnh theo thời gian. Bonus không mất đi ngay mà truyền lại cho các lượt sau.
      // Complexity: Để tối ưu Complexity O(1), ta sử dụng cơ chế Decay (giảm dần) ở Store thay vì đếm lượt thủ công.
      state[p].cards.forEach(card => {
        if (card.value === '8' && !state[p].disabledSkills.has(card.id) && card.rarity !== 'normal') {
          const potency = this.getPotency(card);
          const rarity = card.rarity;
          
          const b = (rarity === 'ultra' ? 0.4 : 0.2) * potency;
          state[p].totalBonusPercent += b;
          
            const starBonus = Math.round((potency - 1) * 100);
            const bonusText = starBonus > 0 ? ` (Sao +${starBonus}%)` : '';
            
            state.events.push({ 
              type: 'BONUS_APPLIED', 
              sourceCardId: card.id, 
              targetPlayer: p, 
              skillName: 'VÔ CỰC',
              description: `Tích lũy +${(b * 100).toFixed(0)}% điểm thưởng${bonusText}`, 
              priority: 4 
            });
        }
      });
    });
  }

  /**
   * Bước 5: Các can thiệp đặc biệt thay đổi trực tiếp tổng điểm.
   */
  protected applyGlobalModifiers(state: PipelineState) {
    // Công thức tính điểm tạm thời: Tổng = Giá trị gốc * (1 + % Bonus) * Hệ số nhân
    ['player1', 'player2'].forEach((pKey) => {
      const p = pKey as 'player1' | 'player2';
      state[p].totalScore = Math.floor(state[p].baseValue * (1 + state[p].totalBonusPercent) * state[p].multiplier);
    });

    ['player1', 'player2'].forEach((pKey) => {
      const p = pKey as 'player1' | 'player2';
      const opp = p === 'player1' ? 'player2' : 'player1';

      // 1. Kỹ năng Thẻ 2 (Đối Xứng): Thay đổi cán cân điểm số
      state[p].cards.forEach(card => {
        if (card.value !== '2' || state[p].disabledSkills.has(card.id)) return;
        
        // KIỂM TRA MIỄN NHIỄM (THẺ 4)
        if (state[opp].isImmuneToDebuffs && state[opp].blockedSkillsCount < state[opp].maxBlockedSkills) {
           state[opp].blockedSkillsCount++;
           state.events.push({ 
             type: 'TEXT_POPUP', 
             sourceCardId: card.id, 
             targetPlayer: opp, 
             skillName: 'TRỰC GIAO',
             description: `Lá chắn chặn kỹ năng Đối Xứng! (${state[opp].blockedSkillsCount}/${state[opp].maxBlockedSkills})`, 
             priority: 5 
           });
           return;
        }

        const rarity = card.rarity || 'normal';
        const potency = this.getPotency(card);

        if (rarity === 'rare') {
          // San bằng điểm số 2 bên
          const avg = Math.floor((state[p].totalScore + state[opp].totalScore) / 2);
          state[p].totalScore = avg;
          state[opp].totalScore = avg;
          state.events.push({ 
              type: 'GLOBAL_EFFECT', 
              sourceCardId: card.id, 
              targetPlayer: p, 
              skillName: 'ĐỐI XỨNG',
              description: 'Cân bằng điểm số hai bên', 
              priority: 5 
          });
        } else if (rarity === 'super') {
          // Giảm 50% điểm đối thủ
          const red = Math.min(0.9, 0.5 * potency);
          state[opp].totalScore = Math.floor(state[opp].totalScore * (1 - red));
          state.events.push({ 
              type: 'GLOBAL_EFFECT', 
              sourceCardId: card.id, 
              targetPlayer: opp, 
              skillName: 'SUY YẾU',
              description: `Áp chế đối thủ (Giảm ${(red * 100).toFixed(1)}% điểm)`, 
              priority: 5 
          });
        } else if (rarity === 'ultra') {
          // Cướp điểm đối thủ
          const steal = Math.min(0.95, 0.5 * potency);
          const amount = Math.floor(state[opp].totalScore * steal);
          state[opp].totalScore -= amount;
          state[p].totalScore += amount;
          state.events.push({ 
              type: 'GLOBAL_EFFECT', 
              sourceCardId: card.id, 
              targetPlayer: p, 
              skillName: 'HẤP THỤ',
              description: `Cướp ${amount} điểm từ đối thủ`, 
              priority: 5 
          });
        }
      });

      // 2. Kỹ năng Thẻ 4 (Trực Giao): Đã được xử lý ở giai đoạn Neutralization (miễn nhiễm kỹ năng)
      // Thưởng điểm: mỗi lần chặn cộng 1/4 (25%) điểm lượt. Không chặn không cộng.
      state[p].cards.forEach(card => {
        if (card.value === '4' && !state[p].disabledSkills.has(card.id) && card.rarity && card.rarity !== 'normal') {
          if (state[p].blockedSkillsCount > 0) {
            const potency = this.getPotency(card);
            const starBonus = Math.round((potency - 1) * 100);
            const bonusText = starBonus > 0 ? ` (Sao +${starBonus}%)` : '';
            
            // Công thức: Chặn 1 -> 1/4 | Chặn 2 -> 2/4 | Chặn 3 -> 3/4
            const blockRatio = state[p].blockedSkillsCount * 0.25;
            const bonus = Math.floor(state[p].totalScore * blockRatio * potency);
            state[p].totalScore += bonus;
            
            state.events.push({ 
                type: 'GLOBAL_EFFECT', 
                sourceCardId: card.id, 
                targetPlayer: p, 
                skillName: 'PHÒNG NGỰ',
                description: `Lá chắn chặn ${state[p].blockedSkillsCount} kỹ năng -> Cộng +${bonus} điểm${bonusText}`, 
                priority: 5 
            });
          }
        }
      });

      // 3. Phép Biến Hiệu (-): Trừ % điểm lượt của đối thủ
      state[p].cards.forEach(card => {
        if (card.value === '-' && !state[p].disabledSkills.has(card.id) && card.rarity && card.rarity !== 'normal') {
          // KIỂM TRA MIỄN NHIỄM (THẺ 4)
          if (state[opp].isImmuneToDebuffs && state[opp].blockedSkillsCount < state[opp].maxBlockedSkills) {
            state[opp].blockedSkillsCount++;
            state.events.push({ 
                type: 'TEXT_POPUP', 
                targetPlayer: opp, 
                skillName: 'TRỰC GIAO',
                description: `Lá chắn chặn phép Thanh Lọc! (${state[opp].blockedSkillsCount}/${state[opp].maxBlockedSkills})`, 
                priority: 5 
            });
            return;
          }

          const potency = this.getPotency(card);
          const rarity = card.rarity;
          // Metadata: -10%, -25%, -50%
          const debuffMap: Record<string, number> = { 'rare': 0.1, 'super': 0.25, 'ultra': 0.5 };
          const penaltyPercent = (debuffMap[rarity] || 0.1) * potency;
          const penalty = Math.floor(state[opp].totalScore * penaltyPercent);
          
          state[opp].totalScore -= penalty;
          const starBonus = Math.round((potency - 1) * 100);
          const bonusText = starBonus > 0 ? ` (Sao +${starBonus}%)` : '';
          
          state.events.push({ 
              type: 'GLOBAL_EFFECT', 
              sourceCardId: card.id, 
              targetPlayer: opp, 
              skillName: 'THANH LỌC',
              description: `Trừ ${penalty} điểm tổng đối thủ${bonusText}`, 
              priority: 5 
          });
        }
      });

      // 4. Cộng điểm từ Kho Điểm (Pool Points) của lượt trước
      if (state[p].poolPoints > 0) {
        state[p].totalScore += state[p].poolPoints;
        state.events.push({ type: 'POOL_TRANSFER', targetPlayer: p, valueTo: state[p].poolPoints, description: `Kho Điểm: Nhận +${state[p].poolPoints} điểm từ lượt trước`, priority: 5 });
      }
    });
  }

  protected finalize(state: PipelineState): EngineOutput {
    const p1Score = Math.max(0, state.player1.totalScore);
    const p2Score = Math.max(0, state.player2.totalScore);
    const winner = p1Score > p2Score ? 'player1' : p1Score < p2Score ? 'player2' : 'tie';

    const p1Logic = Math.floor(state.player1.baseValue * state.player1.multiplier);
    const p1Bonus = p1Score - p1Logic;
    const p2Logic = Math.floor(state.player2.baseValue * state.player2.multiplier);
    const p2Bonus = p2Score - p2Logic;

    // Kỹ năng Thẻ 9 (Tiệm Cận): Lưu trữ một phần tổng điểm trận đấu (P1 + P2) cho người thắng
    // Điểm này sẽ được cộng vào lượt sau thông qua Kho Điểm (Pool Points).
    if (winner !== 'tie') {
      const winnerKey = winner;
      const winnerState = state[winnerKey];
      const card9 = winnerState.cards.find(c => c.value === '9' && !winnerState.disabledSkills.has(c.id) && c.rarity && c.rarity !== 'normal');
      if (card9) {
        const potency = this.getPotency(card9);
        const rarity = card9.rarity || 'normal';
        // Lưu trữ từ 30% đến 90% tổng điểm lượt này
        const percentMap: Record<string, number> = { 'rare': 0.3, 'super': 0.6, 'ultra': 0.9 };
        const percent = (percentMap[rarity] || 0.1) * potency;
        const poolAmount = Math.floor((p1Score + p2Score) * Math.min(1.0, percent));
        
        state.events.push({ 
            type: 'POOL_TRANSFER', 
            sourceCardId: card9.id, 
            targetPlayer: winnerKey, 
            skillName: 'TIỆM CẬN',
            valueTo: poolAmount, 
            description: `Lưu trữ ${poolAmount} điểm cho lượt kế tiếp`, 
            priority: 6 
        });
      }
    }

    return {
      player1Score: p1Score,
      player2Score: p2Score,
      player1Details: {
        baseValue: state.player1.baseValue,
        logicScore: p1Logic,
        bonusScore: p1Bonus
      },
      player2Details: {
        baseValue: state.player2.baseValue,
        logicScore: p2Logic,
        bonusScore: p2Bonus
      },
      events: state.events.sort((a, b) => a.priority - b.priority),
      winner,
      // Tính toán bonus cho lượt sau:
      // - Lấy bonus từ các thẻ 8 vừa đánh (ở đây ta đơn giản hóa là bonus hiện tại)
      // - Store sẽ chịu trách nhiệm giảm dần (decay) hoặc xóa bỏ sau X lượt.
      // Ở đây ta trả về tổng bonus hiện có để Store cập nhật.
      player1NextBonus: state.player1.totalBonusPercent > 0 ? state.player1.totalBonusPercent : 0,
      player2NextBonus: state.player2.totalBonusPercent > 0 ? state.player2.totalBonusPercent : 0,
    };
  }
}
