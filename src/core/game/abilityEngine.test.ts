import { describe, it, expect } from 'vitest';
import { applyAbilities, type AbilityContext } from './abilityEngine';
import type { GameCard } from '../../types/game';

describe('abilityEngine.ts', () => {
  const mockContext: AbilityContext = {
    currentTurn: 3,
    playerCards: [],
    aiCards: [],
    playerScore: 100,
    aiScore: 200,
    history: []
  };

  it('should trigger Comeback Buff when player is losing', () => {
    const cards: GameCard[] = [
      { id: '1', value: '5', type: 'number', rarity: 'normal' },
      { id: '2', value: '+', type: 'operator', rarity: 'normal' },
      { id: '3', value: '2', type: 'number', rarity: 'normal' }
    ];
    // Player is 100, AI is 200. Player is losing.
    const result = applyAbilities(cards, mockContext, false);
    expect(result.multiplierMod).toBeGreaterThan(0);
    expect(result.specialEffect).toBe('Comeback Buff');
  });

  it('should trigger Numerical Sequence bonus (1-2-3)', () => {
    const cards: GameCard[] = [
      { id: '1', value: '1', type: 'number', rarity: 'normal' },
      { id: '2', value: '2', type: 'number', rarity: 'normal' },
      { id: '3', value: '3', type: 'number', rarity: 'normal' }
    ];
    const result = applyAbilities(cards, { ...mockContext, playerScore: 300 }, false);
    expect(result.multiplierMod).toBeGreaterThanOrEqual(1.0);
    expect(result.specialEffect).toBe('Numerical Sequence!');
  });

  it('should trigger Operator Master bonus (using + and -)', () => {
    const cards: GameCard[] = [
      { id: '1', value: '5', type: 'number', rarity: 'normal' },
      { id: '2', value: '+', type: 'operator', rarity: 'normal' },
      { id: '3', value: '2', type: 'number', rarity: 'normal' },
      { id: '4', value: '-', type: 'operator', rarity: 'normal' },
      { id: '5', value: '1', type: 'number', rarity: 'normal' }
    ];
    const result = applyAbilities(cards, { ...mockContext, playerScore: 300 }, false);
    expect(result.multiplierMod).toBeGreaterThan(0.5);
    expect(result.specialEffect).toBe('Operator Master');
  });

  it('should trigger Premium Synergy with Ultra Rare cards', () => {
    const cards: GameCard[] = [
      { id: '1', value: '9', type: 'number', rarity: 'ultra' },
      { id: '2', value: '5', type: 'number', rarity: 'super' },
      { id: '3', value: '2', type: 'number', rarity: 'normal' }
    ];
    const result = applyAbilities(cards, { ...mockContext, playerScore: 300 }, false);
    // 2 premium cards * 0.3 = 0.6 multiplier
    expect(result.multiplierMod).toBeCloseTo(0.6, 1);
    expect(result.specialEffect).toBe('Premium Synergy');
  });
});
