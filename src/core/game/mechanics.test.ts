import { describe, it, expect } from 'vitest';
import { computeTurnResult } from './matchEngine';
import { makeCard } from './deckLogic';
import type { AbilityContext } from './abilityEngine';
import type { TurnResult } from '../../types/game';

describe('Math Battle Core Mechanics & Abilities', () => {
  const createCtx = (pScore = 0, aScore = 0, history: TurnResult[] = [], turn = 1): AbilityContext => ({
    currentTurn: turn,
    playerCards: [],
    aiCards: [],
    playerScore: pScore,
    aiScore: aScore,
    history
  });

  it('Ability 0 (Số 0): Should reduce opponent multiplier', () => {
    const pCards = [makeCard('0', 'number', 'super', 'p')]; // Super rarity = 0.6 reduction
    const aCards = [makeCard('5', 'number', 'normal', 'ai')];
    
    const ctx = createCtx();
    const result = computeTurnResult(1, pCards, aCards, ctx);
    
    // Player 0 card has no value on its own but reduces AI multiplier
    // Số 0 (Super) reduces 0.6. AI final mult = 0.4
    // AI Points: 5 * 0.4 * Turn(1) = 2
    expect(result.aiPointsEarned).toBe(2);
    expect(result.specialEffect).toContain('Số 0');
  });

  it('Ability 1 (Số 1): Should reduce opponent total points by 15% if result is odd', () => {
    // Player (Turn 2): 9, 1 -> 91 (odd)
    // AI (Turn 2): 5, 0 -> 50 (even)
    const pCards = [makeCard('9', 'number', 'normal', 'p'), makeCard('1', 'number', 'normal', 'p')];
    const aCards = [makeCard('5', 'number', 'normal', 'ai'), makeCard('0', 'number', 'normal', 'ai')];
    
    const ctx = createCtx(0, 0, [], 2);
    // Player is odd, should reduce AI points.
    // AI Points: 50 * 2 (Turn) = 100
    // Reduced: 100 * 0.85 = 85
    const result = computeTurnResult(2, pCards, aCards, ctx);
    
    expect(result.aiPointsEarned).toBe(85);
    expect(result.specialEffect).toContain('Số 1');
  });

  it('Ability 2 (Số 2): Should equalize points between players', () => {
    // Player (Turn 3): 9 + 9 = 18. Points: 18 * 1.05 * 3 = 56.7 -> 56
    const pCards = [makeCard('9', 'number', 'normal', 'p'), makeCard('+', 'operator', 'normal', 'p'), makeCard('9', 'number', 'normal', 'p')];
    // AI (Turn 3): 2 + 1 = 3. Points: 3 * 1.0 * 3 = 9. 
    // And AI has card '2' (Equalizer) in the expression
    const aCards = [makeCard('2', 'number', 'normal', 'ai'), makeCard('+', 'operator', 'normal', 'ai'), makeCard('1', 'number', 'normal', 'ai')];
    
    const ctx = createCtx(0, 0, [], 3);
    const result = computeTurnResult(3, pCards, aCards, ctx);
    
    // Player points: 56. AI points: 9. 
    // Average: (56 + 9) / 2 = 32.5 -> 32
    expect(result.playerPointsEarned).toBe(result.aiPointsEarned);
    expect(result.playerPointsEarned).toBe(32);
    expect(result.specialEffect).toContain('Số 2');
  });

  it('Operator Modifiers: * (Even x2) and / (Odd x3)', () => {
    // Case 1: Multiply with Even result (Turn 3)
    const pCardsEven = [makeCard('4', 'number', 'normal', 'p'), makeCard('*', 'operator', 'normal', 'p'), makeCard('2', 'number', 'normal', 'p')];
    const resEven = computeTurnResult(3, pCardsEven, [makeCard('0', 'number', 'normal', 'ai')], createCtx());
    // (4*2) = 8 (even). Mult x2. Points: Math.floor(8 * 2.0) * 3 = 16 * 3 = 48
    expect(resEven.playerPointsEarned).toBe(48);

    // Case 2: Divide with Odd result (Turn 3)
    const pCardsOdd = [makeCard('9', 'number', 'normal', 'p'), makeCard('/', 'operator', 'normal', 'p'), makeCard('3', 'number', 'normal', 'p')];
    const resOdd = computeTurnResult(3, pCardsOdd, [makeCard('0', 'number', 'normal', 'ai')], createCtx());
    // (9/3) = 3 (odd). Mult x3. Points: Math.floor(3 * 3.0) * 3 = 9 * 3 = 27
    expect(resOdd.playerPointsEarned).toBe(27);
  });

  it('Full Synergy: Numerical Sequence (+1.0 multiplier)', () => {
    // Turn 5 requires 3 numbers and 2 operators
    const pCards = [
      makeCard('3', 'number', 'normal', 'p'),
      makeCard('+', 'operator', 'normal', 'p'),
      makeCard('4', 'number', 'normal', 'p'),
      makeCard('+', 'operator', 'normal', 'p'),
      makeCard('5', 'number', 'normal', 'p')
    ];
    // Seq 3-4-5. Mult +1.0 (Synergy) + 0.1 (two + signs). Total 2.1.
    // Val: 3+4+5 = 12. Points: Math.floor(12 * 2.1) * 5 = 25 * 5 = 125
    const result = computeTurnResult(5, pCards, [makeCard('0', 'number', 'normal', 'ai')], createCtx());
    expect(result.playerPointsEarned).toBe(125);
    expect(result.specialEffect).toContain('Chuỗi số liên tiếp');
  });
});
