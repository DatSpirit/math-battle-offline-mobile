import type { GameCard, TurnResult, Rarity } from '../../types/game';
import { 
  RARITY_POWER_MAP, 
  STAR_MULTIPLIER_MODS, 
  LEVEL_BONUS_MOD,
  SYNERGY_SEQUENCE_MOD,
  SYNERGY_PARITY_MOD,
  SYNERGY_OPERATOR_MASTER_MOD,
  SYNERGY_OPERATOR_GRANDMASTER_MOD
} from '../../data/mechanicsData';

/**
 * Ability Engine — Math Card Battle
 * Handles special card effects, rarities, levels, and synergies.
 */

export interface AbilityContext {
  currentTurn: number;
  playerCards: GameCard[];
  aiCards: GameCard[];
  playerScore: number;
  aiScore: number;
  history: TurnResult[];
}

export interface AbilityResult {
  multiplierMod: number;
  valueMod: number;
  opponentMultiplierMod: number;
  /** R: san sẻ cả 2 bên | SR: chỉ chia đôi đối thủ | UR: chia đôi và cướp */
  shouldEqualizePoints?: boolean;
  stealHalfFromOpponent?: boolean;
  halveSelfOnly?: boolean;
  specialEffect: string[];
}

const RARITY_ORDER: Record<Rarity, number> = {
  'normal': 0,
  'rare': 1,
  'super': 2,
  'ultra': 3
};

/**
 * Tính toán tất cả các chỉ số cộng thêm từ thẻ bài
 */
export const applyAbilities = (
  cards: GameCard[],
  context: AbilityContext,
  isAI: boolean
): AbilityResult => {
  let multiplierMod = 0;
  let valueMod = 0;
  let opponentMultiplierMod = 0;
  let shouldEqualizePoints = false;
  let stealHalfFromOpponent = false;
  let halveSelfOnly = false;
  const effects: string[] = [];

  const { playerScore, aiScore } = context;
  const myScore = isAI ? aiScore : playerScore;
  const oppScore = isAI ? playerScore : aiScore;

  cards.forEach((card) => {
    const val = card.value;
    const rarity = card.rarity || 'normal';
    const stars = card.stars || 0;
    const level = card.level || 0;
    const power = RARITY_POWER_MAP[rarity];

    // --- 1. BONUS MẶC ĐỊNH (SAO & LEVEL) ---
    if (rarity !== 'normal') {
      let currentMod = STAR_MULTIPLIER_MODS[stars] || 0;
      
      if (card.hasHalfStar && stars < 5) {
        const nextMod = STAR_MULTIPLIER_MODS[stars + 1] || currentMod;
        currentMod = (currentMod + nextMod) / 2;
      }
      
      multiplierMod += currentMod;
      if (level > 0) multiplierMod += (level * LEVEL_BONUS_MOD);
    }

    // --- 2. KỸ NĂNG ĐẶC BIỆT ---
    if (power <= 0) return; 
    
    if (val === '0') {
      const reduction = (RARITY_ORDER[rarity] + 1) * 0.2 * power;
      opponentMultiplierMod -= reduction;
      effects.push(`Số 0: Giảm sức mạnh đối thủ ${Math.round(reduction * 100)}%`);
    }

    // Thẻ 1 — Việc vô hiệu toán tử xử lý trong card1.ts (engine/effects)
    // Trong applyAbilities: chú thích để rõ không cần xử lý thêm
    if (val === '1') { /* Handled by card1.ts effect pipeline */ }

    if (val === '2') {
      if (rarity === 'rare') {
        // R: San sẻ điểm — cả 2 bên cùng về mức trung bình
        shouldEqualizePoints = true;
        effects.push('Số 2 (R): San sẻ điểm cả 2 bên');
      } else if (rarity === 'super') {
        // SR: Chỉ chia đôi điểm đối thủ (không ảnh hưởng mình)
        halveSelfOnly = false;
        opponentMultiplierMod -= 0.5;
        effects.push('Số 2 (SR): Cắt giảm 50% điểm đối thủ');
      } else if (rarity === 'ultra') {
        // UR: Chia đôi đối thủ và cộng phần đó cho mình
        stealHalfFromOpponent = true;
        effects.push('Số 2 (UR): Cướp 50% điểm đối thủ');
      }
    }

    if (val === '3') {
      // Kích hoạt khi có ≥3 thẻ số trong tay (không phải lượt 3)
      const numCardCount = cards.filter(c => c.type === 'number').length;
      if (numCardCount >= 3) {
        // R: x3 ngẫu nhiên 1 số | SR: x3 bất kỳ | UR: luôn x3 số lớn nhất
        const bonusMap: Record<string, number> = { 'rare': 10, 'super': 15, 'ultra': 20 };
        const bonus = (bonusMap[rarity] || 10) * power;
        valueMod += bonus;
        effects.push(`Số 3 (${rarity.toUpperCase()}): +${Math.round(bonus)} điểm gốc (Tam Hợp)`);
      }
    }

    if (val === '4') {
      // Trực Giao: Chặn kỹ năng đối thủ (xử lý ở card0/pipeline)
      // Ngoài ra cộng thêm 1/4 điểm lượt hiện tại vào tổng điểm (phần chia có giớnh hạn theo rarity)
      // R: chặn 1 kỹ năng + 1/4 điểm | SR: chặn 2 + 1/4 | UR: chặn 3 + 1/4
      // Việc chặn kỹ năng thông qua disabledSkills trong pipeline riêng
      // Ở đây chỉ cộng thêm % điểm tương đương 25% (bonus cho mình)
      const bonusByRarity: Record<string, number> = { 'rare': 0.15, 'super': 0.20, 'ultra': 0.25 };
      const bonus = bonusByRarity[rarity] || 0.15;
      multiplierMod += bonus;
      effects.push(`Số 4 (${rarity.toUpperCase()}): Trực Giao +${Math.round(bonus * 100)}% điểm`);
    }

    if (val === '5') {
      if (myScore < oppScore) {
        const turn = context.currentTurn;
        // R: x2 điểm (chỉ trước lượt 4), SR: x2 điểm (trước lượt 5), UR: x2 luôn luôn
        const isValid =
          (rarity === 'rare'  && turn < 4) ||
          (rarity === 'super' && turn < 5) ||
          (rarity === 'ultra');
        if (isValid) {
          // x2 = thêm +100% multiplier (hệ số x2 = 1.0 + multiplierMod)
          multiplierMod += 1.0;
          effects.push(`Số 5 (${rarity.toUpperCase()}): Đảo Chiều x2 điểm lượt này!`);
        }
      }
    }

    if (val === '6') {
      // Kích hoạt khi thẻ số 6 xuất hiện trên sân (không phải lượt 6)
      // R: +(-6 to 6), SR: +(-6 to 12), UR: +(-6 to 18) vào giá trị thẻ
      const maxBonus: Record<string, number> = { 'rare': 6, 'super': 12, 'ultra': 18 };
      const range = maxBonus[rarity] || 6;
      const randomBonus = Math.floor(Math.random() * (range + 6 + 1)) - 6; // [-6, range]
      valueMod += randomBonus;
      const sign = randomBonus >= 0 ? '+' : '';
      effects.push(`Số 6 (${rarity.toUpperCase()}): Biến Số ${sign}${randomBonus} vào giá trị`);
    }

    // Dấu + : Bồi Đắp — tăng % giá trị kết quả
    if (val === '+') {
      const addMap: Record<string, number> = { 'rare': 0.10, 'super': 0.20, 'ultra': 0.40 };
      multiplierMod += (addMap[rarity] || 0);
      if (rarity !== 'normal') effects.push(`Dấu + (${rarity.toUpperCase()}): Bồi Đắc +${Math.round((addMap[rarity] || 0) * 100)}%`);
    }

    // Dấu - : Thanh Lọc — trừ % điểm đối thủ
    if (val === '-') {
      const subMap: Record<string, number> = { 'rare': 0.10, 'super': 0.25, 'ultra': 0.50 };
      const reduction = subMap[rarity] || 0;
      if (reduction > 0) {
        opponentMultiplierMod -= reduction;
        effects.push(`Dấu - (${rarity.toUpperCase()}): Thanh Lọc -${Math.round(reduction * 100)}% điểm đối thủ`);
      }
    }

    // Dấu * : Khuếch Đại — nhân hệ số điểm lượt
    if (val === '*') {
      const multMap: Record<string, number> = { 'rare': 0.50, 'super': 1.00, 'ultra': 1.50 };
      const bonus = multMap[rarity] || 0;
      multiplierMod += bonus;
      if (rarity !== 'normal') effects.push(`Dấu * (${rarity.toUpperCase()}): Khuếch Đại x${1 + bonus}`);
    }

    // Dấu / : Thấu Thị — giảm hệ số điểm đối thủ
    if (val === '/') {
      const divMap: Record<string, number> = { 'rare': 0.15, 'super': 0.30, 'ultra': 0.50 };
      const reduction = divMap[rarity] || 0;
      if (reduction > 0) {
        opponentMultiplierMod -= reduction;
        effects.push(`Dấu / (${rarity.toUpperCase()}): Thấu Thị -${Math.round(reduction * 100)}% hệ số đối thủ`);
      }
    }

    // Thẻ 8 : Tích Lũy — cộng dồn % cho các lượt tiếp theo
    // Giá trị này được lưu vào store và cộng vào lượt sau (xử lý như activeBonus)
    if (val === '8') {
      const accumMap: Record<string, number> = { 'rare': 0.20, 'super': 0.20, 'ultra': 0.40 };
      const pct = accumMap[rarity] || 0;
      // Aplied truc tiep vao multiplierMod luot nay + flag cho store
      multiplierMod += pct;
      effects.push(`Số 8 (${rarity.toUpperCase()}): Tích Lũy +${Math.round(pct * 100)}% (hiệu lực ngược lượt này)`);
    }

    // Thẻ 9 : Kho Điểm — trích % điểm vào két nếu thắng
    // opponentMultiplierMod được dùng như "reduction" để rút bớt tổng điểm lượt — phần đó sẽ lưu store
    if (val === '9') {
      const poolMap: Record<string, number> = { 'rare': 0.30, 'super': 0.60, 'ultra': 0.90 };
      const pct = poolMap[rarity] || 0;
      // Đánh dấu để matchEngine xử lý sau khi xác định thắng thua
      effects.push(`Số 9 (${rarity.toUpperCase()}): Kho Điểm sẽ trích ${Math.round(pct * 100)}% vào két nếu thắng`);
    }

  }); // end cards.forEach

  // --- 3. TỔ HỢP (SYNERGY) ---
  const numCards = cards.filter(c => c.type === 'number');
  const numValues = numCards.map(c => parseInt(c.value)).sort((a,b) => a-b);

  if (numValues.length >= 3) {
    let isSequence = true;
    for (let i = 0; i < numValues.length - 1; i++) {
      if (numValues[i+1] !== numValues[i] + 1) {
        isSequence = false;
        break;
      }
    }
    if (isSequence) {
      multiplierMod += SYNERGY_SEQUENCE_MOD;
      effects.push('Hào quang: Chuỗi số liên tiếp!');
    }

    const allEven = numValues.every(v => v % 2 === 0);
    const allOdd = numValues.every(v => v % 2 !== 0);
    if (allEven || allOdd) {
      multiplierMod += SYNERGY_PARITY_MOD;
      effects.push(allEven ? 'Thế trận Chẵn: +10% điểm' : 'Thế trận Lẻ: +10% điểm');
    }
  }

  const uniqueOps = new Set(cards.filter(c => c.type === 'operator').map(c => c.value));
  if (uniqueOps.size === 2) {
    multiplierMod += SYNERGY_OPERATOR_MASTER_MOD;
    effects.push('Bậc thầy toán tử: +10% điểm');
  } else if (uniqueOps.size >= 3) {
    multiplierMod += SYNERGY_OPERATOR_GRANDMASTER_MOD;
    effects.push('Đại sư toán tử: +30% điểm');
  }

  return { multiplierMod, valueMod, opponentMultiplierMod, shouldEqualizePoints, stealHalfFromOpponent, halveSelfOnly, specialEffect: effects };
};
