import { describe, it, expect } from 'vitest';
import { smartDraw } from '../core/game/deckLogic';
import type { GameCard } from '../types/game';

describe('smartDraw operator guarantees', () => {
  const makeNum = (id: string): GameCard => ({ id, value: '5', type: 'number', rarity: 'normal' });
  const makeOp = (id: string): GameCard => ({ id, value: '+', type: 'operator', rarity: 'normal' });

  it('guarantees 1 operator after Turn 2 (for Round 3)', () => {
    const hand: GameCard[] = [makeNum('h1'), makeNum('h2'), makeNum('h3')];
    const reserve: GameCard[] = [makeNum('r1'), makeOp('op1')]; // Reserve has 1 op
    
    // Draw 2 cards after Turn 2
    const [newHand] = smartDraw(hand, reserve, 2, 2);
    
    const ops = newHand.filter(c => c.type === 'operator');
    expect(ops.length).toBeGreaterThanOrEqual(1);
    expect(newHand.some(c => c.id === 'op1')).toBe(true);
  });

  it('guarantees 2 operators after Turn 4 (for Round 5)', () => {
    const hand: GameCard[] = [makeNum('h1'), makeNum('h2')];
    const reserve: GameCard[] = [makeNum('r1'), makeNum('r2'), makeOp('op1'), makeOp('op2')];
    
    // Draw 4 cards after Turn 4
    const [newHand] = smartDraw(hand, reserve, 4, 4);
    
    const ops = newHand.filter(c => c.type === 'operator');
    expect(ops.length).toBeGreaterThanOrEqual(2);
  });

  it('does not swap if no operators available in reserve', () => {
    const hand: GameCard[] = [makeNum('h1')];
    const reserve: GameCard[] = [makeNum('r1'), makeNum('r2')];
    
    const [newHand] = smartDraw(hand, reserve, 2, 4);
    
    const ops = newHand.filter(c => c.type === 'operator');
    expect(ops.length).toBe(0);
  });
});
