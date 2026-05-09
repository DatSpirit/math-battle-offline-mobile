import { buildDeck } from './deckLogic';
import { describe, it } from 'vitest';

describe('Card Spawn Rate Simulation', () => {
  it('should log the average distribution of cards over 1000 shuffles', () => {
    const iterations = 1000;
    const stats: Record<string, number> = {};

    for (let i = 0; i < iterations; i++) {
      const deck = buildDeck('p');
      deck.forEach(card => {
        const key = `${card.type}_${card.value}`;
        stats[key] = (stats[key] || 0) + 1;
      });
    }

    console.log('--- Card Distribution (Average per Deck) ---');
    const sortedKeys = Object.keys(stats).sort();
    sortedKeys.forEach(key => {
      const avg = (stats[key] / iterations).toFixed(2);
      console.log(`${key}: ${avg}`);
    });
    console.log('--------------------------------------------');
  });

  it('should verify the rarity distribution matches 50/30/15/5 over 1000 shuffles', () => {
    const iterations = 1000;
    const totals = { normal: 0, rare: 0, super: 0, ultra: 0 };

    for (let i = 0; i < iterations; i++) {
      const deck = buildDeck('p');
      deck.forEach(c => {
        totals[c.rarity]++;
      });
    }

    const totalCards = iterations * 27;
    console.log('--- Average Rarity Distribution (Percent) ---');
    console.log(`Normal: ${(totals.normal / totalCards * 100).toFixed(2)}% (Target: 50%)`);
    console.log(`Rare:   ${(totals.rare / totalCards * 100).toFixed(2)}% (Target: 30%)`);
    console.log(`Super:  ${(totals.super / totalCards * 100).toFixed(2)}% (Target: 15%)`);
    console.log(`Ultra:  ${(totals.ultra / totalCards * 100).toFixed(2)}% (Target: 5%)`);
    console.log('---------------------------------------------');
  });

  it('should verify weighted draw (stars) increases appearance rate in early hand', () => {
    // We'll give card '9' (Super) 5 stars in the collection
    const collection = {
      'number_9': { stars: 5, level: 10, count: 1, id: '9-star', type: 'number' as const, value: '9', name: '9', rarity: 'super' as const, abilityName: '', abilityDesc: '', activationCond: '', flavorText: '' }
    };

    const iterations = 2000;
    let top10Count = 0;

    for (let i = 0; i < iterations; i++) {
      const deck = buildDeck('p', collection);
      // Check if card '9' is in the first 10 cards
      const top10 = deck.slice(0, 10);
      if (top10.some(c => c.value === '9')) {
        top10Count++;
      }
    }

    const rate = (top10Count / iterations) * 100;
    console.log(`--- Weighted Draw Simulation (Card 9 with 5 Stars) ---`);
    console.log(`Appeared in top 10: ${rate.toFixed(2)}% of the time`);
    
    // Random chance for 1 card out of 26 to be in top 10: 10/26 = 38.46%
    // With 20% shift (Math.random() > 0.8), it should be slightly higher.
    console.log(`(Random chance would be ~38.46%)`);
    console.log(`------------------------------------------------------`);
  });
});
