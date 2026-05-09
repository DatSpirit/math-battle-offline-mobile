import { buildDeck, smartDraw } from './deckLogic';
import type { GameCard } from '../../types/game';

describe('gameDeck.ts', () => {
  it('should generate exactly 26 cards', () => {
    const deck = buildDeck('p');
    expect(deck.length).toBe(26);
  });

  it('should contain a balanced rarity distribution', () => {
    const deck = buildDeck('p');
    const superCount = deck.filter(c => c.rarity === 'super').length;
    expect(superCount).toBeGreaterThanOrEqual(2);
  });

  describe('smartDraw', () => {
    it('should ensure at least 1 operator for Turn 3 (after Turn 2)', () => {
      const hand: GameCard[] = [
        { id: '1', value: '5', type: 'number', rarity: 'normal' },
        { id: '2', value: '2', type: 'number', rarity: 'normal' }
      ];
      const reserve: GameCard[] = [
        { id: '3', value: '+', type: 'operator', rarity: 'normal' },
        { id: '4', value: '7', type: 'number', rarity: 'normal' }
      ];
      
      const [newHand] = smartDraw(hand, reserve, 1, 2);
      // afterTurn = 2, so nextTurn = 3. Needs 1 Op.
      const ops = newHand.filter(c => c.type === 'operator');
      expect(ops.length).toBeGreaterThanOrEqual(1);
    });

    it('should ensure 2 operators and 4 numbers for Turn 6 (after Turn 5)', () => {
      // Hand has 4 cards (all numbers)
      const hand: GameCard[] = [
        { id: '1', value: '1', type: 'number', rarity: 'normal' },
        { id: '2', value: '2', type: 'number', rarity: 'normal' },
        { id: '3', value: '3', type: 'number', rarity: 'normal' },
        { id: '4', value: '4', type: 'number', rarity: 'normal' }
      ];
      // Reserve has 2 ops
      const reserve: GameCard[] = [
        { id: '5', value: '+', type: 'operator', rarity: 'normal' },
        { id: '6', value: '-', type: 'operator', rarity: 'normal' },
        { id: '7', value: '8', type: 'number', rarity: 'normal' },
        { id: '8', value: '9', type: 'number', rarity: 'normal' }
      ];
      
      const [newHand] = smartDraw(hand, reserve, 2, 5); 
      // nextTurn = 6. Needs 2 Ops, 4 Nums.
      const ops = newHand.filter(c => c.type === 'operator');
      const nums = newHand.filter(c => c.type === 'number');
      
      expect(ops.length).toBe(2);
      expect(nums.length).toBe(4);
    });

    it('should prioritize keeping Rare cards when swapping for Operators', () => {
      // Hand has 4 numbers (1 Super, 3 Normal)
      const hand: GameCard[] = [
        { id: '1', value: '9', type: 'number', rarity: 'super' },
        { id: '2', value: '1', type: 'number', rarity: 'normal' },
        { id: '3', value: '2', type: 'number', rarity: 'normal' },
        { id: '4', value: '3', type: 'number', rarity: 'normal' }
      ];
      // Reserve has 2 operators
      const reserve: GameCard[] = [
        { id: '5', value: '+', type: 'operator', rarity: 'normal' },
        { id: '6', value: '-', type: 'operator', rarity: 'normal' }
      ];
      
      const [finalHand] = smartDraw(hand, reserve, 1, 4); 
      // afterTurn = 4 -> nextTurn = 5. Needs 2 Ops, 3 Nums.
      // After drawing id: 5, hand has [9(S), 1(N), 2(N), 3(N), +(N)] (1 Op, 4 Nums).
      // Total 5 cards. Still needs 1 more Op. 
      // Should swap one of the Normal numbers (2, 3, or 4) for '-' (id: 6).
      // Should NOT discard Super 9 (id: 1).
      
      const ops = finalHand.filter(c => c.type === 'operator');
      const nums = finalHand.filter(c => c.type === 'number');
      
      expect(ops.length).toBe(2);
      expect(nums.length).toBe(3);
      expect(finalHand.some(c => c.id === '1')).toBe(true); // Super 9 stays
    });
  });
});
