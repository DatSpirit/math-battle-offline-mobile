import { describe, it, expect } from 'vitest';
import { evaluatePlay, validatePlay } from './matchEngine';
import type { GameCard } from '../../types/game';

describe('gameLogic.ts', () => {
  describe('evaluatePlay', () => {
    it('should correctly evaluate simple numbers in Turn 1', () => {
      const cards: GameCard[] = [
        { id: '1', value: '7', type: 'number', rarity: 'normal' }
      ];
      const result = evaluatePlay(cards, 1);
      expect(result.value).toBe(7);
      expect(result.expression).toBe('7');
    });

    it('should evaluate concatenation in Turn 2', () => {
      const cards: GameCard[] = [
        { id: '1', value: '3', type: 'number', rarity: 'normal' },
        { id: '2', value: '8', type: 'number', rarity: 'normal' }
      ];
      const result = evaluatePlay(cards, 2);
      expect(result.value).toBe(38);
      expect(result.expression).toBe('38');
    });

    it('should respect order of operations in Turn 3-4 (exactly 1 operator)', () => {
      const cards: GameCard[] = [
        { id: '1', value: '2', type: 'number', rarity: 'normal' },
        { id: '2', value: '+', type: 'operator', rarity: 'normal' },
        { id: '3', value: '3', type: 'number', rarity: 'normal' }
      ];
      const result = evaluatePlay(cards, 3);
      expect(result.value).toBe(5);
    });

    it('should return null for invalid operator placement', () => {
      const cards: GameCard[] = [
        { id: '1', value: '+', type: 'operator', rarity: 'normal' },
        { id: '2', value: '3', type: 'number', rarity: 'normal' }
      ];
      const result = evaluatePlay(cards, 2); // Turn 2 doesn't allow operators anyway, but let's test logic
      expect(result.value).toBeNull();
    });

    it('should allow decimals (Math.floor) in Turn 6', () => {
      // Actually evaluatePlay for turn 6 requires >= 2 ops to return non-null in current implementation.
      // Let's add more ops to make it valid for Turn 6 logic
      const cards6: GameCard[] = [
        { id: '1', value: '5', type: 'number', rarity: 'normal' },
        { id: '2', value: '/', type: 'operator', rarity: 'normal' },
        { id: '3', value: '2', type: 'number', rarity: 'normal' },
        { id: '4', value: '+', type: 'operator', rarity: 'normal' },
        { id: '5', value: '1', type: 'number', rarity: 'normal' },
        { id: '6', value: '0', type: 'number', rarity: 'normal' },
      ]; // Expression: "5 / 2 + 10" = 2.5 + 10 = 12.5 -> floor -> 12
      const result = evaluatePlay(cards6, 6);
      expect(result.value).toBe(12);
    });
  });

  describe('validatePlay', () => {
    it('should fail if card count mismatch', () => {
      const slots: (GameCard | null)[] = [null, null];
      const result = validatePlay(slots, 2);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('Đặt thêm 2 lá nữa');
    });

    it('should fail if Turn 1 result is not positive integer', () => {
       const slots: (GameCard | null)[] = [
         { id: '1', value: '0', type: 'number', rarity: 'normal' }
       ];
       const result = validatePlay(slots, 1);
       expect(result.valid).toBe(false);
       expect(result.message).toContain('yêu cầu kết quả lớn hơn 0');
    });

    it('should block division by zero', () => {
      const slots: (GameCard | null)[] = [
        { id: '1', value: '5', type: 'number', rarity: 'normal' },
        { id: '2', value: '/', type: 'operator', rarity: 'normal' },
        { id: '3', value: '0', type: 'number', rarity: 'normal' }
      ];
      const result = validatePlay(slots, 3);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('Không thể chia cho 0');
    });
  });
});
