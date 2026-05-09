import { describe, it, expect } from 'vitest';
import { computeTurnResult } from './matchEngine';
import { makeCard } from './deckLogic';
import type { AbilityContext } from './abilityEngine';
import type { TurnResult } from '../../types/game';

describe('Detailed Scoring Mechanics (Logic vs Tactical)', () => {
  const createCtx = (pScore = 0, aScore = 0, history: TurnResult[] = [], turn = 1): AbilityContext => ({
    currentTurn: turn,
    playerCards: [],
    aiCards: [],
    playerScore: pScore,
    aiScore: aScore,
    history
  });

  it('Scenario 1: Simple Logic Score (Turn 1, No Bonuses)', () => {
    const pCards = [makeCard('9', 'number', 'normal', 'p1')];
    const aCards = [makeCard('1', 'number', 'normal', 'ai')];
    
    const result = computeTurnResult(1, pCards, aCards, createCtx());

    // Logic: 9 * 1 = 9
    // Tactical: 0
    // Total: 9
    expect(result.playerLogicScore).toBe(9);
    expect(result.playerTacticalScore).toBe(0);
    expect(result.playerPointsEarned).toBe(9);
  });

  it('Scenario 2: Decimal Result and Floor Rounding (Turn 3)', () => {
    // 8 / 5 = 1.6
    // Turn 3 requires 3 cards (2 nums, 1 op)
    const pCards = [
      makeCard('8', 'number', 'normal', 'p1'),
      makeCard('/', 'operator', 'normal', 'p2'),
      makeCard('5', 'number', 'normal', 'p3')
    ];
    
    const result = computeTurnResult(3, pCards, [makeCard('0', 'number', 'normal', 'ai')], createCtx(0,0,[],3));

    // raw = 1.6
    // logic = floor(1.6) * 3 = 1 * 3 = 3
    // mult = 1.0 (base) * 3.0 (Divide mod for non-even result) = 3.0
    // total = floor(1.6 * 3.0) * 3 = floor(4.8) * 3 = 4 * 3 = 12
    // tactical = 12 - 3 = 9
    expect(result.playerValue).toBe(1.6);
    expect(result.playerLogicScore).toBe(3);
    expect(result.playerPointsEarned).toBe(12);
    expect(result.playerTacticalScore).toBe(9);
  });

  it('Scenario 3: Tactical Bonus from Stars (Turn 1)', () => {
    const pCard = makeCard('9', 'number', 'normal', 'p1');
    pCard.stars = 3; // 3 stars = +1.0 multiplier
    
    const result = computeTurnResult(1, [pCard], [makeCard('0', 'number', 'normal', 'ai')], createCtx());

    // logic = 9 * 1 = 9
    // mult = 1.0 (base) + 1.0 (stars) = 2.0
    // total = floor(9 * 2.0) * 1 = 18
    // tactical = 18 - 9 = 9
    expect(result.playerLogicScore).toBe(9);
    expect(result.playerTacticalScore).toBe(9);
    expect(result.playerPointsEarned).toBe(18);
  });

  it('Scenario 4: Rarity Scaling (Rare vs Ultra Ability)', () => {
    // Ability 3 (Tam Giác Lửa): +15 valueMod at Turn 3
    // Turn 3 requires 3 cards
    
    // RARE (10% power)
    const rareCards = [
      makeCard('3', 'number', 'rare', 'p1'),
      makeCard('+', 'operator', 'normal', 'p2'),
      makeCard('0', 'number', 'normal', 'p3')
    ]; 
    const resRare = computeTurnResult(3, rareCards, [makeCard('0', 'number', 'normal', 'ai')], createCtx(0,0,[],3));
    // power = 0.1. valueMod = 15 * 0.1 = 1.5. pVal = 3.
    // logic = 3 * 3 = 9.
    // total = floor(3 + 1.5) * 3 = 4 * 3 = 12.
    // tactical = 12 - 9 = 3.
    expect(resRare.playerLogicScore).toBe(9);
    expect(resRare.playerTacticalScore).toBe(3);
    expect(resRare.playerPointsEarned).toBe(12);

    // ULTRA (100% power)
    const ultraCards = [
      makeCard('3', 'number', 'ultra', 'p1'),
      makeCard('+', 'operator', 'normal', 'p2'),
      makeCard('0', 'number', 'normal', 'p3')
    ];
    const resUltra = computeTurnResult(3, ultraCards, [makeCard('0', 'number', 'normal', 'ai')], createCtx(0,0,[],3));
    // power = 1.0. valueMod = 15 * 1.0 = 15. pVal = 3.
    // logic = 3 * 3 = 9.
    // total = floor(3 + 15) * 3 = 18 * 3 = 54.
    // tactical = 54 - 9 = 45.
    expect(resUltra.playerLogicScore).toBe(9);
    expect(resUltra.playerTacticalScore).toBe(45);
    expect(resUltra.playerPointsEarned).toBe(54);
  });

  it('Scenario 5: Negative Result Fallback (Turn 3)', () => {
    const pCards = [
      makeCard('1', 'number', 'normal', 'p1'),
      makeCard('-', 'operator', 'normal', 'p2'),
      makeCard('5', 'number', 'normal', 'p3')
    ];
    
    const result = computeTurnResult(3, pCards, [makeCard('0', 'number', 'normal', 'ai')], createCtx(0,0,[],3));

    // result = -4. 
    // Logic/Tactical/Total must all be 0.
    expect(result.playerValue).toBe(-4);
    expect(result.playerPointsEarned).toBe(0);
    expect(result.playerLogicScore).toBe(0);
    expect(result.playerTacticalScore).toBe(0);
  });

  it('Scenario 6: Full Tactical Combo (* with Even result + Stars)', () => {
    const pCards = [
      makeCard('4', 'number', 'normal', 'p1'),
      makeCard('*', 'operator', 'normal', 'p2'),
      makeCard('2', 'number', 'normal', 'p3')
    ];
    pCards[0].stars = 2; // +0.5 mult
    pCards[2].stars = 2; // +0.5 mult
    
    const result = computeTurnResult(3, pCards, [makeCard('0', 'number', 'normal', 'ai')], createCtx(0,0,[],3));

    // val = 4 * 2 = 8.
    // base mult = 1.0. 
    // star mult = 0.5 + 0.5 = 1.0. Total = 2.0.
    // operator * with even result = x2. Final Mult = 2.0 * 2 = 4.0.
    // logic = 8 * 3 = 24.
    // total = floor(8 * 4.0) * 3 = 32 * 3 = 96.
    // tactical = 96 - 24 = 72.
    expect(result.playerValue).toBe(8);
    expect(result.playerLogicScore).toBe(24);
    expect(result.playerTacticalScore).toBe(72);
    expect(result.playerPointsEarned).toBe(96);
  });
});
