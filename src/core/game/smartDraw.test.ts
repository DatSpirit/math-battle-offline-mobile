import { describe, it, expect } from 'vitest';
import { smartDraw, makeCard } from './deckLogic';
import type { GameCard } from '../../types/game';

describe('smartDraw Logic Verification', () => {
  const mockReserve: GameCard[] = new Array(20).fill(null).map((_, i) => makeCard('1', 'number', 'normal', `res${i}`));

  it('Should refill hand to 6 in early turns', () => {
    // Player has 3 cards left, should draw 3 to reach 6
    const hand: GameCard[] = new Array(3).fill(null).map((_, i) => makeCard('1', 'number', 'normal', `h${i}`));
    const [newHand, newRes] = smartDraw(hand, mockReserve, 3, 1); // After Turn 1, next is Turn 2
    
    expect(newHand.length).toBe(6);
    expect(newRes.length).toBe(17);
  });

  it('Should NOT draw more if hand is already full (Target 6)', () => {
    // Player has 6 cards (didn't play any?), should draw 0
    const hand: GameCard[] = new Array(6).fill(null).map((_, i) => makeCard('1', 'number', 'normal', `h${i}`));
    const [newHand, newRes] = smartDraw(hand, mockReserve, 1, 1); 
    
    expect(newHand.length).toBe(6);
    expect(newRes.length).toBe(20);
  });

  it('Should draw extra card for Turn 5 (Target 7)', () => {
    // After Turn 4, next is Turn 5. Target is 7.
    // Player played 4 cards, has 2 left. Should draw 5 cards.
    const hand: GameCard[] = new Array(2).fill(null).map((_, i) => makeCard('1', 'number', 'normal', `h${i}`));
    const [newHand, newRes] = smartDraw(hand, mockReserve, 4, 4); 
    
    expect(newHand.length).toBe(7);
    expect(newRes.length).toBe(15);
  });

  it('Should ensure at least 3 numbers for Turn 4 and limit operators', () => {
    // Player has 2 numbers and 4 operators (Total 6)
    // For Turn 4, nextTurn = 4. minNums = 3, minOps = 1, maxOps = 2.
    const hand: GameCard[] = [
      makeCard('1', 'number', 'normal', 'n1'),
      makeCard('2', 'number', 'normal', 'n2'),
      makeCard('+', 'operator', 'normal', 'o1'),
      makeCard('-', 'operator', 'normal', 'o2'),
      makeCard('*', 'operator', 'normal', 'o3'),
      makeCard('/', 'operator', 'normal', 'o4'),
    ];
    
    // Reserve has numbers
    const reserve = [
        makeCard('9', 'number', 'normal', 'r1'),
        makeCard('8', 'number', 'normal', 'r2'),
        makeCard('7', 'number', 'normal', 'r3'),
    ];

    const [newHand] = smartDraw(hand, reserve, 0, 3); // After Turn 3
    
    const numCount = newHand.filter(c => c.type === 'number').length;
    const opCount = newHand.filter(c => c.type === 'operator').length;

    expect(numCount).toBeGreaterThanOrEqual(3);
    expect(opCount).toBeLessThanOrEqual(2);
    expect(newHand.length).toBe(6);
  });
});
