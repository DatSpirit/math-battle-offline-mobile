import type { GameCard, TurnResult, AIDifficulty } from '../../types/game';
import { applyAbilities, type AbilityContext } from './abilityEngine';

// ──────────────────────────────────────────
// Operator Placement Validator
// ──────────────────────────────────────────

export function hasValidOperatorPlacement(cards: GameCard[]): boolean {
  if (cards.length === 0) return false;
  if (cards[0].type === 'operator') return false;
  if (cards[cards.length - 1].type === 'operator') return false;
  for (let i = 0; i < cards.length - 1; i++) {
    if (cards[i].type === 'operator' && cards[i + 1].type === 'operator') return false;
  }
  return true;
}

export function operatorPlacementError(cards: GameCard[]): string | null {
  if (cards.length === 0) return null;
  if (cards[0].type === 'operator') return 'Dấu phải nằm giữa các con số';
  if (cards[cards.length - 1].type === 'operator') return 'Dấu phải nằm giữa các con số';
  for (let i = 0; i < cards.length - 1; i++) {
    if (cards[i].type === 'operator' && cards[i + 1].type === 'operator') return 'Hai dấu không được đứng liền nhau';
  }
  return null;
}

// ──────────────────────────────────────────
// Expression Evaluation Engine
// ──────────────────────────────────────────

// Tối ưu hóa việc tính toán cho AI — Sử dụng eval native thay vì mathjs cho các biểu thức đơn giản
function fastEval(expr: string): number | null {
  try {
    // Chỉ cho phép số và toán tử cơ bản
    if (/[^0-9+\-*/.\s]/.test(expr)) return null;
    // Ngăn chia cho 0
    if (/\/0(?!\.)/.test(expr)) return null;
    
    const result = new Function(`"use strict"; return (${expr})`)();
    if (typeof result !== 'number' || !isFinite(result)) return null;
    return result;
  } catch {
    return null;
  }
}

export function evaluatePlay(
  cards: GameCard[],
  turn: number
): { expression: string; value: number | null } {
  if (cards.length === 0) return { expression: '', value: null };

  if (turn === 1) {
    const val = parseInt(cards[0].value);
    return { expression: cards[0].value, value: isNaN(val) ? null : val };
  }

  if (turn === 2) {
    if (cards.some(c => c.type !== 'number')) return { expression: '', value: null };
    const expression = cards.map(c => c.value).join('');
    const value = parseInt(expression);
    return { expression, value: isNaN(value) ? null : value };
  }

  const opCount = cards.filter(c => c.type === 'operator').length;

  if (turn <= 4 && opCount !== 1) {
    return { expression: cards.map(c => c.value).join(''), value: null };
  }
  if (turn >= 5 && opCount < 2) {
    return { expression: cards.map(c => c.value).join(''), value: null };
  }

  if (!hasValidOperatorPlacement(cards)) {
    return { expression: cards.map(c => c.value).join(''), value: null };
  }

  const expression = cards.map(c => c.value).join('');
  
  // Tận dụng fastEval cho các lượt đấu thông thường
  const value = fastEval(expression);

  return { expression, value };
}

export function validatePlay(
  slots: (GameCard | null)[],
  turn: number
): { valid: boolean; message: string } {
  const played = slots.filter(Boolean) as GameCard[];

  if (played.length !== turn) return { valid: false, message: `Đặt thêm ${turn - played.length} lá nữa` };

  if (turn === 1) {
    if (played[0].type !== 'number') return { valid: false, message: 'Lượt 1: chỉ dùng thẻ số' };
    return { valid: true, message: '' };
  }

  if (turn === 2) {
    if (played.some(c => c.type !== 'number')) return { valid: false, message: 'Lượt 1-2: chỉ ghép số!' };
    return { valid: true, message: '' };
  }

  const ops = played.filter(c => c.type === 'operator');
  if (turn <= 4) {
    if (ops.length !== 1) return { valid: false, message: 'Cần dùng đúng 1 thẻ phép tính' };
  } else {
    if (ops.length < 2) return { valid: false, message: 'Cần ít nhất 2 thẻ phép tính' };
  }

  // evaluatePlay đã kiểm tra placement nội bộ — chỉ cần kiểm tra chia 0 và gọi 1 lần
  const expression = played.map(c => c.value).join('');
  if (/\/0(?!\.)/.test(expression)) return { valid: false, message: 'Không thể chia cho 0!' };

  const { value } = evaluatePlay(played, turn);
  if (value === null) return { valid: false, message: 'Phép tính không hợp lệ hoặc sai vị trí' };

  return { valid: true, message: '' };
}

// ──────────────────────────────────────────
// Turn Result Computation
// ──────────────────────────────────────────

export function computeTurnResult(
  turn: number,
  playerCards: GameCard[],
  aiCards: GameCard[],
  context: AbilityContext,
  options?: { playerTimeout?: boolean; aiTimeout?: boolean }
): TurnResult {
  const { expression: pExprRaw, value: pValRaw } = evaluatePlay(playerCards, turn);
  const { expression: aExprRaw, value: aValRaw } = evaluatePlay(aiCards, turn);

  const pVal = options?.playerTimeout ? null : pValRaw;
  const aVal = options?.aiTimeout ? null : aValRaw;
  
  const pExpr = options?.playerTimeout ? '?' : pExprRaw;
  const aExpr = options?.aiTimeout ? '?' : aExprRaw;

  const pAbility = pVal !== null ? applyAbilities(playerCards, context, false) : null;
  const aAbility = aVal !== null ? applyAbilities(aiCards, context, true) : null;

  const turnFactor = 1 + (turn - 1) * 0.5;

  let pMult = 1.0 + (pAbility?.multiplierMod || 0);
  let aMult = 1.0 + (aAbility?.multiplierMod || 0);

  if (aAbility) pMult += aAbility.opponentMultiplierMod;
  if (pAbility) aMult += pAbility.opponentMultiplierMod;

  // Fix floating point precision issues
  let pPoints = 0;
  let aPoints = 0;
  let pLogicScore = 0;
  let pTacticalScore = 0;
  let aLogicScore = 0;
  let aTacticalScore = 0;

  if (pVal !== null && pVal > 0) {
    pLogicScore = Math.floor(pVal * turnFactor);
    pPoints = Math.max(0, Math.floor((pVal + (pAbility?.valueMod || 0)) * Math.max(0.1, pMult) * turnFactor));
    pTacticalScore = Math.max(0, pPoints - pLogicScore);
  }

  if (aVal !== null && aVal > 0) {
    aLogicScore = Math.floor(aVal * turnFactor);
    aPoints = Math.max(0, Math.floor((aVal + (aAbility?.valueMod || 0)) * Math.max(0.1, aMult) * turnFactor));
    aTacticalScore = Math.max(0, aPoints - aLogicScore);
  }

  const allEffects: string[] = [];
  if (pAbility?.specialEffect) allEffects.push(...pAbility.specialEffect);
  if (aAbility?.specialEffect) allEffects.push(...aAbility.specialEffect);

  // NOTE: Hiệu ứng thẻ 1 (vô hiệu toán tử) xử lý trong card1.ts pipeline.
  // Hiệu ứng dấu - (Thanh Lọc) xử lý trong abilityEngine.ts qua opponentMultiplierMod.

  if (pAbility?.shouldEqualizePoints || aAbility?.shouldEqualizePoints) {
    const avg = Math.floor((pPoints + aPoints) / 2);
    pPoints = avg;
    aPoints = avg;
    allEffects.push('San sẻ: Điểm số đã được cân bằng!');
  }

  // Thẻ 2 UR: Cướp 50% điểm đối thủ
  if (pAbility?.stealHalfFromOpponent) {
    const stolen = Math.floor(aPoints * 0.5);
    aPoints = Math.max(0, aPoints - stolen);
    pPoints += stolen;
    allEffects.push(`Phân Đôi UR: Cướp ${stolen} điểm từ đối thủ!`);
  }
  if (aAbility?.stealHalfFromOpponent) {
    const stolen = Math.floor(pPoints * 0.5);
    pPoints = Math.max(0, pPoints - stolen);
    aPoints += stolen;
    allEffects.push(`AI Phân Đôi UR: Bị đối thủ cướp ${stolen} điểm!`);
  }

  const winner = pPoints > aPoints ? 'player' : pPoints < aPoints ? 'ai' : 'tie';

  return {
    turn,
    playerCards,
    playerExpression: pExpr,
    playerValue: pVal,
    playerLogicScore: pLogicScore,
    playerTacticalScore: pTacticalScore,
    aiCards,
    aiExpression: aExpr,
    aiValue: aVal,
    aiLogicScore: aLogicScore,
    aiTacticalScore: aTacticalScore,
    winner,
    playerPointsEarned: pPoints,
    aiPointsEarned: aPoints,
    events: [],
    specialEffect: allEffects.length > 0 ? allEffects.join(' • ') : undefined,
    isCritical: turn >= 4 && (
      (pPoints >= aPoints * 3 && pPoints > 0) || 
      (aPoints >= pPoints * 3 && aPoints > 0)
    ),
    attacker: winner === 'player' ? 'player' : winner === 'ai' ? 'ai' : null
  };
}

// ──────────────────────────────────────────
// AI Logic Engine (RESTORED & OPTIMIZED)
// ──────────────────────────────────────────

function combinations(array: GameCard[], k: number, callback: (combo: GameCard[]) => void): void {
  function helper(start: number, combo: GameCard[]) {
    if (combo.length === k) {
      callback([...combo]);
      return;
    }
    for (let i = start; i < array.length; i++) {
      combo.push(array[i]);
      helper(i + 1, combo);
      combo.pop();
    }
  }
  helper(0, []);
}

function permutations(array: GameCard[], callback: (perm: GameCard[]) => boolean): void {
  const n = array.length;
  const used = new Array(n).fill(false);
  const current: GameCard[] = [];
  let count = 0;
  const limit = 2000; // Tăng giới hạn nhưng vẫn kiểm soát

  function helper(): boolean {
    if (current.length === n) {
      count++;
      return callback([...current]);
    }

    for (let i = 0; i < n; i++) {
      if (used[i]) continue;
      
      // PERFORMANCE GUARD: Dừng nếu quá giới hạn
      if (count > limit) return true;

      used[i] = true;
      current.push(array[i]);
      if (helper()) return true; // Early exit
      current.pop();
      used[i] = false;
    }
    return false;
  }
  helper();
}

export function getAIPlay(
  hand: GameCard[],
  turn: number,
  difficulty: AIDifficulty | 'boss',
  targetScore?: number
): GameCard[] {
  // Tối ưu hóa: Ưu tiên chọn các thẻ hiếm và nhiều sao trước để AI đánh "khôn" hơn
  const sortedHand = [...hand].sort((a, b) => {
    const rarityVal = (r: string) => ({ 'normal': 0, 'rare': 1, 'super': 2, 'ultra': 3 }[r] || 0);
    const scoreA = rarityVal(a.rarity) * 10 + (a.stars || 0);
    const scoreB = rarityVal(b.rarity) * 10 + (b.stars || 0);
    return scoreB - scoreA;
  });

  // Xác định số lượng dấu cần thiết cho lượt
  let reqOps = 0;
  if (turn === 3 || turn === 4) reqOps = 1;
  else if (turn >= 5) reqOps = 2;
  const reqNums = turn - reqOps;

  const nums = sortedHand.filter(c => c.type === 'number');
  const ops = sortedHand.filter(c => c.type === 'operator');

  // SAFETY: Nếu không đủ thẻ, lấy thẻ rác bù vào để không bị crash
  while (nums.length < reqNums) nums.push({ id: `dummy-n-${Date.now()}`, value: '1', type: 'number', rarity: 'normal' });
  while (ops.length < reqOps) ops.push({ id: `dummy-o-${Date.now()}`, value: '+', type: 'operator', rarity: 'normal' });

  let bestPlay: GameCard[] = [];
  let bestScore = -1;

  // Cache expression → value để tránh gọi evaluatePlay trùng lặp
  const evalCache = new Map<string, number | null>();
  function cachedEval(cards: GameCard[]): number | null {
    // PERFORMANCE: Dùng string key cực ngắn để cache
    let key = "";
    for(let i=0; i<cards.length; i++) key += cards[i].value;

    if (evalCache.has(key)) return evalCache.get(key)!;
    const { value } = evaluatePlay(cards, turn);
    evalCache.set(key, value);
    return value;
  }

  // Lấy các tổ hợp Số và Dấu phù hợp
  combinations(nums, turn - reqOps, (nc) => {
    combinations(ops, reqOps, (oc) => {
      const combined = [...nc, ...oc];
      
      permutations(combined, (p) => {
        const value = cachedEval(p);
        if (value !== null) {
          let strategicScore = value;
          
          // Campaign Scripting: Try to hit targetScore
          if (targetScore && targetScore > 0) {
            const turnTarget = targetScore / 6; 
            const diffFromTarget = Math.abs(value - turnTarget);
            strategicScore = 1000 - diffFromTarget;
          } else {
            // Normal competitive logic
            if (difficulty === 'hard' || difficulty === 'boss') {
              strategicScore += p.filter(c => (c.stars || 0) > 2).length * 20;
              if (p.some(c => c.rarity === 'ultra')) strategicScore += 100;
            }
          }

          if (strategicScore > bestScore) {
            bestScore = strategicScore;
            bestPlay = p;
            
            // EARLY EXIT: 
            // 1. Nếu sát mục tiêu Campaign, dừng ngay
            if (targetScore && Math.abs(value - (targetScore/6)) < 1) return true;

            // 2. Chế độ Dễ & Bình thường: Chỉ cần tìm thấy phép tính hợp lệ là dừng ngay (không cần tối ưu điểm)
            if (difficulty === 'easy' || difficulty === 'medium') return true;

            // 3. Chế độ Khó & Boss: Chỉ dừng khi đạt ngưỡng điểm rất cao để tiết kiệm CPU
            if (difficulty !== 'boss' && strategicScore > 500) return true;
          }
        }
        return false;
      });
    });
  });

  // Fallback: Nếu không tìm thấy nước đi hợp lệ, xây dựng một chuỗi cơ bản đúng luật (Số - Dấu - Số...)
  if (bestPlay.length === 0) {
    const fallback: GameCard[] = [];
    const nList = [...nums.slice(0, reqNums)];
    const oList = [...ops.slice(0, reqOps)];
    
    if (reqOps === 0) {
      bestPlay = nList;
    } else {
      // Xen kẽ: N O N O N N... (Đảm bảo không bắt đầu/kết thúc bằng dấu và không 2 dấu liền nhau)
      const firstNum = nList.shift();
      if (firstNum) fallback.push(firstNum);
      
      while (oList.length > 0 && nList.length > 0) {
        fallback.push(oList.shift()!);
        fallback.push(nList.shift()!);
      }
      // Thêm phần còn lại
      while (oList.length > 0) fallback.push(oList.shift()!);
      while (nList.length > 0) fallback.push(nList.shift()!);
      
      bestPlay = fallback;
    }
  }

  return bestPlay;
}

export function fmtVal(value: string): string {
  if (value === '*') return '×';
  if (value === '/') return '÷';
  return value;
}

export function fmtExpression(cards: GameCard[]): string {
  return cards.map(c => fmtVal(c.value)).join(' ');
}

export function fmtResult(value: number | null): string {
  if (value === null) return '?';
  if (Number.isInteger(value)) return value.toString();
  return parseFloat(value.toFixed(2)).toString();
}
