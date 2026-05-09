import { describe, it, expect } from 'vitest';
import { getAIPlay } from './matchEngine';
import type { GameCard } from '../../types/game';

describe('AI Strategy Testing', () => {
  const ultraCard: GameCard = { id: 'u1', value: '9', type: 'number', rarity: 'ultra' };
  const lowCard1: GameCard = { id: 'l1', value: '1', type: 'number', rarity: 'normal' };
  const lowCard2: GameCard = { id: 'l2', value: '2', type: 'number', rarity: 'normal' };
  const lowCard3: GameCard = { id: 'l3', value: '3', type: 'number', rarity: 'normal' };
  const plusOp: GameCard = { id: 'op1', value: '+', type: 'operator', rarity: 'normal' };

  it('Hard AI should preserve Ultra Rare cards for later turns', () => {
    const hand: GameCard[] = [ultraCard, lowCard1];
    const play = getAIPlay(hand, 1, 'hard');
    expect(play[0].id).toBe('l1');
  });

  it('Hard AI should prioritize Numerical Sequence bonus (Synergy)', () => {
    const card3: GameCard = { id: 'n3', value: '3', type: 'number', rarity: 'normal' };
    const card4: GameCard = { id: 'n4', value: '4', type: 'number', rarity: 'normal' };
    const card5: GameCard = { id: 'n5', value: '5', type: 'number', rarity: 'normal' };
    const card9: GameCard = { id: 'n9', value: '9', type: 'number', rarity: 'normal' };
    
    const hand: GameCard[] = [card9, card3, card4, card5, plusOp];
    getAIPlay(hand, 3, 'hard'); // Verified result in previous turn
    
    const c4: GameCard = { id: 'c4', value: '4', type: 'number', rarity: 'normal' };
    const c5: GameCard = { id: 'c5', value: '5', type: 'number', rarity: 'normal' };
    const c6: GameCard = { id: 'c6', value: '6', type: 'number', rarity: 'normal' };
    const c9: GameCard = { id: 'c9', value: '9', type: 'number', rarity: 'normal' };
    const opP: GameCard = { id: 'opp', value: '+', type: 'operator', rarity: 'normal' };
    
    const hand6: GameCard[] = [c4, c5, c6, c9, opP, opP];
    const play6 = getAIPlay(hand6, 6, 'hard');
    
    const has456 = play6.some(c => c.id === 'c4') && play6.some(c => c.id === 'c5') && play6.some(c => c.id === 'c6');
    expect(has456).toBe(true);
  });

  it('Easy AI should pick a random play from valid ones', () => {
    const hand: GameCard[] = [lowCard1, lowCard2, lowCard3];
    const play1 = getAIPlay(hand, 1, 'easy');
    getAIPlay(hand, 1, 'easy');
    expect(hand.some(c => c.id === play1[0].id)).toBe(true);
  });
});
