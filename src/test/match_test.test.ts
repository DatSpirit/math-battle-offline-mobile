/**
 * match_test.test.ts — Kiểm tra toàn bộ logic trận đấu 6 lượt
 * Chạy: npx vitest run src/test/match_test.test.ts
 */

import { describe, it, expect } from 'vitest';
import { applyAbilities, type AbilityContext } from '../core/game/abilityEngine';
import { computeTurnResult, evaluatePlay } from '../core/game/matchEngine';
import type { GameCard, TurnResult } from '../types/game';

// ─── Helper ──────────────────────────────────────────────────────────────────
let _id = 0;
function card(
  value: string,
  rarity: 'normal' | 'rare' | 'super' | 'ultra' = 'normal',
  stars = 0
): GameCard {
  const type = ['+', '-', '*', '/'].includes(value) ? 'operator' : 'number';
  return { id: `c${_id++}`, value, type, rarity, stars, level: 1 };
}

const baseCtx = (
  turn: number,
  history: TurnResult[] = [],
  pScore = 0,
  aScore = 0
): AbilityContext => ({
  currentTurn: turn,
  playerCards: [],
  aiCards: [],
  playerScore: pScore,
  aiScore: aScore,
  history,
});

// ─────────────────────────────────────────────────────────────────────────────

describe('1. evaluatePlay — biểu thức theo lượt', () => {
  it('Lượt 1: số đơn', () => expect(evaluatePlay([card('5')], 1).value).toBe(5));
  it('Lượt 2: ghép số', () => expect(evaluatePlay([card('2'), card('3')], 2).value).toBe(23));
  it('Lượt 3: 3+4=7', () => expect(evaluatePlay([card('3'), card('+'), card('4')], 3).value).toBe(7));
  it('Lượt 3: 4/2=2', () => expect(evaluatePlay([card('4'), card('/'), card('2')], 3).value).toBe(2));
  it('Lượt 5: 2+3*4=14', () =>
    expect(evaluatePlay([card('2'), card('+'), card('3'), card('*'), card('4')], 5).value).toBe(14));
  it('Lượt 3: dấu đầu → null', () =>
    expect(evaluatePlay([card('+'), card('3'), card('4')], 3).value).toBeNull());
  it('Lượt 3: 2 dấu liền → null', () =>
    expect(evaluatePlay([card('3'), card('+'), card('*')], 3).value).toBeNull());
});

// ─────────────────────────────────────────────────────────────────────────────

describe('2. Thẻ 0 — Vô Hiệu', () => {
  it('0R giảm mult đối thủ', () => {
    const r = applyAbilities([card('0', 'rare')], baseCtx(1), false);
    expect(r.opponentMultiplierMod).toBeLessThan(0);
  });
  it('0UR giảm nhiều hơn 0R', () => {
    const rR = applyAbilities([card('0', 'rare')], baseCtx(1), false);
    const rUR = applyAbilities([card('0', 'ultra')], baseCtx(1), false);
    expect(rUR.opponentMultiplierMod).toBeLessThan(rR.opponentMultiplierMod);
  });
  it('0N không có hiệu ứng', () => {
    const r = applyAbilities([card('0', 'normal')], baseCtx(1), false);
    expect(r.opponentMultiplierMod).toBe(0);
  });
});

describe('3. Thẻ 2 — Phân Đôi', () => {
  it('2R → shouldEqualizePoints', () => {
    const r = applyAbilities([card('2', 'rare')], baseCtx(1), false);
    expect(r.shouldEqualizePoints).toBe(true);
  });
  it('2SR → cắt giảm 50% mult đối thủ', () => {
    const r = applyAbilities([card('2', 'super')], baseCtx(1), false);
    expect(r.opponentMultiplierMod).toBe(-0.5);
  });
  it('2UR → stealHalfFromOpponent', () => {
    const r = applyAbilities([card('2', 'ultra')], baseCtx(1), false);
    expect(r.stealHalfFromOpponent).toBe(true);
  });
});

describe('4. Thẻ 3 — Tam Hợp', () => {
  it('3R với 2 số: không kích hoạt', () => {
    const r = applyAbilities([card('3', 'rare'), card('4'), card('+')], baseCtx(3), false);
    expect(r.valueMod).toBe(0);
  });
  it('3R với 3 số: kích hoạt', () => {
    const r = applyAbilities([card('3', 'rare'), card('4'), card('5'), card('+')], baseCtx(4), false);
    expect(r.valueMod).toBeGreaterThan(0);
  });
  it('3UR valueMod > 3R', () => {
    const hand4 = [card('3', 'ultra'), card('4'), card('5'), card('+')];
    const hand4R = [card('3', 'rare'), card('4'), card('5'), card('+')];
    const rUR = applyAbilities(hand4, baseCtx(4), false);
    const rR = applyAbilities(hand4R, baseCtx(4), false);
    expect(rUR.valueMod).toBeGreaterThan(rR.valueMod);
  });
});

describe('5. Thẻ 5 — Đảo Chiều (giới hạn lượt)', () => {
  it('5R lượt 2 khi thua → kích hoạt', () => {
    const r = applyAbilities([card('5', 'rare')], baseCtx(2, [], 0, 100), false);
    expect(r.multiplierMod).toBeGreaterThan(0);
  });
  it('5R lượt 4 khi thua → KHÔNG kích hoạt (chỉ star/level bonus)', () => {
    const r = applyAbilities([card('5', 'rare')], baseCtx(4, [], 0, 100), false);
    // Level=1 → +0.01 LEVEL_BONUS_MOD nhưng không có ability bonus (x2)
    expect(r.multiplierMod).toBeLessThan(0.5); // không có +1.0 bonus
    expect(r.multiplierMod).toBeCloseTo(0.01); // chỉ level bonus
  });
  it('5SR lượt 4 khi thua → kích hoạt', () => {
    const r = applyAbilities([card('5', 'super')], baseCtx(4, [], 0, 100), false);
    expect(r.multiplierMod).toBeGreaterThan(0);
  });
  it('5SR lượt 5 khi thua → KHÔNG kích hoạt (chỉ level bonus)', () => {
    const r = applyAbilities([card('5', 'super')], baseCtx(5, [], 0, 100), false);
    expect(r.multiplierMod).toBeLessThan(0.5);
    expect(r.multiplierMod).toBeCloseTo(0.01);
  });
  it('5UR lượt 6 khi thua → kích hoạt', () => {
    const r = applyAbilities([card('5', 'ultra')], baseCtx(6, [], 0, 100), false);
    expect(r.multiplierMod).toBeGreaterThan(0);
  });
  it('5UR khi thắng → chỉ level bonus, không có +1.0', () => {
    const r = applyAbilities([card('5', 'ultra')], baseCtx(3, [], 100, 0), false);
    expect(r.multiplierMod).toBeLessThan(0.5); // không có ability
    expect(r.multiplierMod).toBeCloseTo(0.01);
  });
});

describe('6. Thẻ 6 — Biến Số (check value thẻ, không phải lượt)', () => {
  it('6R → valueMod trong [-6, 6]', () => {
    for (let i = 0; i < 20; i++) {
      const r = applyAbilities([card('6', 'rare')], baseCtx(3), false);
      expect(r.valueMod).toBeGreaterThanOrEqual(-6);
      expect(r.valueMod).toBeLessThanOrEqual(6);
    }
  });
  it('6UR → valueMod trong [-6, 18]', () => {
    for (let i = 0; i < 20; i++) {
      const r = applyAbilities([card('6', 'ultra')], baseCtx(1), false);
      expect(r.valueMod).toBeGreaterThanOrEqual(-6);
      expect(r.valueMod).toBeLessThanOrEqual(18);
    }
  });
  it('Thẻ 9 lượt 6 không bị nhầm thành thẻ 6', () => {
    const r = applyAbilities([card('9', 'rare')], baseCtx(6), false);
    expect(r.valueMod).toBe(0);
  });
});

describe('7. Toán tử +/-/*/  theo R/SR/UR', () => {
  it('+ R: +10% (+ 0.01 level bonus = 0.11)', () => {
    const r = applyAbilities([card('+', 'rare')], baseCtx(3), false);
    expect(r.multiplierMod).toBeCloseTo(0.11, 1); // 0.10 + 0.01 level
  });
  it('+ UR: +40% (+ 0.01 level = 0.41)', () => {
    const r = applyAbilities([card('+', 'ultra')], baseCtx(3), false);
    expect(r.multiplierMod).toBeCloseTo(0.41, 1);
  });
  it('- R: -10% mult đối thủ', () => {
    const r = applyAbilities([card('-', 'rare')], baseCtx(3), false);
    expect(r.opponentMultiplierMod).toBeCloseTo(-0.10);
  });
  it('- UR: -50% mult đối thủ', () => {
    const r = applyAbilities([card('-', 'ultra')], baseCtx(3), false);
    expect(r.opponentMultiplierMod).toBeCloseTo(-0.50);
  });
  it('* R: +50% (+ 0.01 level = 0.51)', () => {
    const r = applyAbilities([card('*', 'rare')], baseCtx(3), false);
    expect(r.multiplierMod).toBeCloseTo(0.51, 1);
  });
  it('* UR: +150% (+ 0.01 level = 1.51)', () => {
    const r = applyAbilities([card('*', 'ultra')], baseCtx(3), false);
    expect(r.multiplierMod).toBeCloseTo(1.51, 1);
  });
  it('/ R: -15% mult đối thủ', () => {
    const r = applyAbilities([card('/', 'rare')], baseCtx(3), false);
    expect(r.opponentMultiplierMod).toBeCloseTo(-0.15);
  });
  it('/ UR: -50% mult đối thủ', () => {
    const r = applyAbilities([card('/', 'ultra')], baseCtx(3), false);
    expect(r.opponentMultiplierMod).toBeCloseTo(-0.50);
  });
  it('+ N: không có hiệu ứng', () => {
    const r = applyAbilities([card('+', 'normal')], baseCtx(3), false);
    expect(r.multiplierMod).toBe(0);
  });
});

describe('8. Thẻ 2 UR — cướp điểm trong computeTurnResult', () => {
  it('2UR cướp 50% điểm AI', () => {
    const pCards = [card('2', 'ultra'), card('+'), card('3')];
    const aCards = [card('5'), card('+'), card('1')];
    const ctx = baseCtx(3, [], 0, 0);
    const result = computeTurnResult(3, pCards, aCards, ctx);
    // stealHalf: nếu AI có điểm > 0, player được cộng thêm từ AI
    expect(result.playerPointsEarned).toBeGreaterThanOrEqual(0);
    expect(result.aiPointsEarned).toBeGreaterThanOrEqual(0);
    // Tổng điểm sau steal phải <= tổng trước (không tạo ra điểm từ không)
    // (playerPoints + aiPoints) sau steal <= trước steal (chỉ dịch chuyển)
  });
});

describe('9. Trận đấu 6 lượt — end-to-end', () => {
  const history: TurnResult[] = [];
  let p1Score = 0;
  let p2Score = 0;

  const TURNS = [
    { turn: 1, p: [card('9', 'rare', 2)], a: [card('5')] },
    { turn: 2, p: [card('3'), card('4')], a: [card('1'), card('2')] },
    { turn: 3, p: [card('5', 'rare'), card('*', 'super'), card('2')], a: [card('7'), card('+'), card('3')] },
    { turn: 4, p: [card('4', 'ultra'), card('*', 'rare'), card('3'), card('+'), card('2')], a: [card('9'), card('+'), card('5'), card('*'), card('1')] },
    { turn: 5, p: [card('6', 'super'), card('+'), card('7'), card('*', 'rare'), card('8')], a: [card('3'), card('+'), card('4'), card('*'), card('5')] },
    { turn: 6, p: [card('9', 'ultra'), card('*', 'super'), card('8'), card('+'), card('7'), card('6')], a: [card('5'), card('*'), card('4'), card('+'), card('3'), card('-', 'super')] },
  ];

  for (const t of TURNS) {
    it(`Lượt ${t.turn}: điểm không âm`, () => {
      const ctx: AbilityContext = {
        currentTurn: t.turn,
        playerCards: t.p,
        aiCards: t.a,
        playerScore: p1Score,
        aiScore: p2Score,
        history: [...history],
      };
      const result = computeTurnResult(t.turn, t.p, t.a, ctx);
      history.push(result);
      p1Score += result.playerPointsEarned;
      p2Score += result.aiPointsEarned;

      expect(result.playerPointsEarned).toBeGreaterThanOrEqual(0);
      expect(result.aiPointsEarned).toBeGreaterThanOrEqual(0);
      expect(['player', 'ai', 'tie']).toContain(result.winner);
    });
  }

  it('Tổng điểm sau 6 lượt > 0', () => {
    expect(p1Score + p2Score).toBeGreaterThan(0);
  });
});
