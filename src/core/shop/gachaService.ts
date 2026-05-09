import type { Rarity } from '../../types/game';
import { GACHA_CARD_POOL, GACHA_PACK_CONFIG, type GachaTemplate } from '../../data/gachaData';

/**
 * Gacha Service to generate cards based on pack type
 */
export const generatePackCards = (packId: string, count: number = 10, mathBonus: number = 1): GachaTemplate[] => {
  const result: GachaTemplate[] = [];
  const config = GACHA_PACK_CONFIG[packId as keyof typeof GACHA_PACK_CONFIG] || GACHA_PACK_CONFIG.pack_standard;

  for (let i = 0; i < count; i++) {
    let rarity: Rarity = 'rare'; 
    const rand = Math.random() * 100;

    // Apply math bonus to thresholds (higher threshold = better chance for high rarity)
    const ultraThreshold = config.ultra * mathBonus;
    const superThreshold = config.super ? config.super * mathBonus : 0;

    if (rand < ultraThreshold) {
      rarity = 'ultra';
    } else if (superThreshold && rand < superThreshold) {
      rarity = 'super';
    } else {
      rarity = 'rare';
    }

    // Filter pool based on pack type if necessary
    const pool = (packId === 'pack_operator' || packId === 'OPERATOR') 
      ? GACHA_CARD_POOL.filter(c => c.type === 'operator') 
      : GACHA_CARD_POOL;

    const base = pool[Math.floor(Math.random() * pool.length)];
    result.push({ ...base, rarity });
  }

  return result;
};
