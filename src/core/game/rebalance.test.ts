import { describe, it, expect } from 'vitest';
import { computeTurnResult } from './matchEngine';
import { applyAbilities, type AbilityContext } from './abilityEngine';
import type { GameCard, Rarity } from '../../types/game';

const mockContext: AbilityContext = {
  currentTurn: 1,
  playerCards: [],
  aiCards: [],
  playerScore: 0,
  aiScore: 0,
  history: []
};

const createCard = (val: string, rarity: Rarity = 'normal', stars = 0, level = 1): GameCard => ({
  id: Math.random().toString(),
  value: val,
  type: (val === '+' || val === '-' || val === '*' || val === '/') ? 'operator' : 'number',
  rarity,
  stars,
  level,
  abilityDesc: ''
});

describe('Rebalance Scoring Logic', () => {

  describe('Turn Multiplier (Factor 0.5 per turn)', () => {
    it('should calculate correct points for Turn 1 (x1.0)', () => {
      const pCards = [createCard('10')];
      const result = computeTurnResult(1, pCards, [createCard('5')], mockContext);
      // 10 * (1 + (1-1)*0.5) = 10
      expect(result.playerPointsEarned).toBe(10);
    });

    it('should calculate correct points for Turn 4 (x2.5)', () => {
      const pCards = [createCard('10'), createCard('+'), createCard('10')];
      const result = computeTurnResult(4, pCards, pCards, mockContext);
      // Result: 10 + 10 = 20
      // Multiplier: 1 + (4-1)*0.5 = 2.5
      // Score: 20 * 2.5 = 50
      expect(result.playerPointsEarned).toBe(50);
    });

    it('should calculate correct points for Turn 6 (x3.5)', () => {
       // Turn factor = 1 + (6-1)*0.5 = 3.5
       const pCards = [
         createCard('1'), createCard('+'), 
         createCard('2'), createCard('+'), 
         createCard('3'), createCard('4')
       ];
       const result = computeTurnResult(6, pCards, pCards, mockContext);
       // Value: 1 + 2 + 34 = 37
       // Synergy: Sequence (1-2-3-4) = +0.1
       // Score: Math.floor(37 * 1.1 * 3.5) = Math.floor(142.45) = 142
       expect(result.playerPointsEarned).toBe(142);
    });
  });

  describe('Operator Synergy Removal', () => {
    it('should NOT give x2 bonus for Even + Multiply', () => {
      const pCards = [createCard('2'), createCard('*'), createCard('4')]; // Turn 3
      const result = computeTurnResult(3, pCards, pCards, mockContext);
      // Result: 8. Factor: 2.0. Score: 16.
      expect(result.playerPointsEarned).toBe(16);
    });
  });

  describe('Level & Rarity Bonus', () => {
    it('Normal cards should have NO bonus even at Level 100', () => {
      const pCards = [createCard('2', 'normal', 0, 100)];
      const ability = applyAbilities(pCards, mockContext, false);
      expect(ability.multiplierMod).toBe(0);
    });

    it('Rare cards should get +1% per level', () => {
      const pCards = [createCard('2', 'rare', 0, 10)];
      const ability = applyAbilities(pCards, mockContext, false);
      // 10 * 0.01 = 0.1
      expect(ability.multiplierMod).toBeCloseTo(0.1);
    });

    it('Star bonuses for Rare cards', () => {
      expect(applyAbilities([createCard('2', 'rare', 1)], mockContext, false).multiplierMod).toBeCloseTo(0.11); // 10% + 1% (lv1)
      expect(applyAbilities([createCard('2', 'rare', 3)], mockContext, false).multiplierMod).toBeCloseTo(0.31); // 30% + 1%
      expect(applyAbilities([createCard('2', 'rare', 5)], mockContext, false).multiplierMod).toBeCloseTo(1.01); // 100% + 1%
    });
  });

  describe('Synergy Bonuses', () => {
    it('Sequence synergy (+10%)', () => {
      const pCards = [createCard('1'), createCard('2'), createCard('3')];
      const ability = applyAbilities(pCards, mockContext, false);
      expect(ability.specialEffect).toContain('Hào quang: Chuỗi số liên tiếp!');
      // Synergy applies to N cards
      expect(ability.multiplierMod).toBeCloseTo(0.1);
    });

    it('Odd/Even chain synergy (+10%)', () => {
      const pCards = [createCard('1'), createCard('3'), createCard('5')];
      const ability = applyAbilities(pCards, mockContext, false);
      expect(ability.specialEffect).toContain('Thế trận Lẻ: +10% điểm');
      expect(ability.multiplierMod).toBeCloseTo(0.1);
    });

    it('Operator Master synergy', () => {
      // 1-5-9 is an Odd chain (+0.1) + 2 operators (+0.1) = 0.2
      const cards2 = [createCard('1'), createCard('+'), createCard('5'), createCard('*'), createCard('9')];
      const ability2 = applyAbilities(cards2, mockContext, false);
      expect(ability2.specialEffect).toContain('Bậc thầy toán tử: +10% điểm');
      expect(ability2.multiplierMod).toBeCloseTo(0.2);

      // 1-4-7-9 has no sequence and no odd/even chain. Just 3 operators (+0.3)
      const cards3 = [createCard('1'), createCard('+'), createCard('4'), createCard('*'), createCard('7'), createCard('-'), createCard('9')];
      const ability3 = applyAbilities(cards3, mockContext, false);
      expect(ability3.specialEffect).toContain('Đại sư toán tử: +30% điểm');
      expect(ability3.multiplierMod).toBeCloseTo(0.3);
    });
  });

});
