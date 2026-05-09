import type { GameCard, CardType, Rarity, GameMode, AIDifficulty } from '../../types/game';
import type { CollectionCard } from '../../types/player.types';
import { CARD_METADATA } from '../../data/cardMetadata';

let _idCounter = 0;

export function makeCard(value: string, type: CardType, rarity: Rarity, prefix: string): GameCard {
  const meta = { ...(CARD_METADATA[value] || { name: 'Unknown', flavorText: '', activationCond: '' }) };
  
  let abilityName = '';
  let abilityDesc = '';
  let activationCond = '';

  if (rarity === 'normal') {
    // Thẻ thường không có kỹ năng
    abilityName = '';
    abilityDesc = 'Thẻ thường: Không có nội tại.';
    activationCond = '';
  } else if (meta.abilities) {
    // Hệ thống kế thừa: UR > SR > R
    abilityName = meta.abilityName || '';
    activationCond = meta.activationCond || '';
    if (rarity === 'ultra') {
      abilityDesc = meta.abilities.ultra || meta.abilities.super || meta.abilities.rare || '';
    } else if (rarity === 'super') {
      abilityDesc = meta.abilities.super || meta.abilities.rare || '';
    } else { // rare
      abilityDesc = meta.abilities.rare || '';
    }
  } else {
    // Backwards-compat: dùng abilityDesc cũ nếu không có abilities
    abilityName = meta.abilityName || '';
    abilityDesc = meta.abilityDesc || '';
    activationCond = meta.activationCond || '';
  }

  return { 
    id: `${prefix}_${_idCounter++}_${value}_${Math.random().toString(36).slice(2, 5)}`, 
    value, 
    type, 
    rarity,
    name: meta.name,
    flavorText: meta.flavorText,
    abilityName,
    abilityDesc,
    activationCond,
  };
}

/**
 * 2-Layer Random Card Generation
 * Layer 1: Determine Rarity based on 50/30/15/5 split.
 * Layer 2: Determine Value based on Rarity and Type.
 */
function generateRandomValue(type: CardType, theme?: string, isAiRestricted?: boolean): { value: string, rarity: Rarity } {
  if (isAiRestricted) {
    let value = '0';
    if (type === 'number') {
      value = ['0', '1', '2', '3', '4', '5'][Math.floor(Math.random() * 6)];
    } else {
      value = ['+', '-'][Math.floor(Math.random() * 2)];
    }
    return { value, rarity: 'normal' };
  }

  const roll = Math.random() * 100;
  let rarity: Rarity = 'normal';
  
  if (roll < 5) rarity = 'ultra';
  else if (roll < 20) rarity = 'super';
  else if (roll < 50) rarity = 'rare';
  else rarity = 'normal';

  let value = '0';
  if (type === 'number') {
    if (rarity === 'normal') value = ['0', '1', '2', '3', '4', '5'][Math.floor(Math.random() * 6)];
    else if (rarity === 'rare') value = ['6', '7', '8'][Math.floor(Math.random() * 3)];
    else value = '9'; 
  } else {
    // Theme-based Operator Selection
    const ops: string[] = [];
    if (!theme || theme === "Đại Chiến Toán Học" || theme === "Cộng Trừ Phối Hợp") {
      if (rarity === 'normal') ops.push('+', '-');
      else if (rarity === 'rare') ops.push('*');
      else ops.push('/');
    } else if (theme === "Phép Cộng Kì Diệu") {
      ops.push('+');
    } else if (theme === "Phép Trừ Thần Tốc") {
      ops.push('-');
    } else if (theme === "Nhân Chia Khám Phá") {
      if (rarity === 'normal' || rarity === 'rare') ops.push('*');
      else ops.push('/');
    }

    if (ops.length === 0) ops.push('+'); // Fallback
    value = ops[Math.floor(Math.random() * ops.length)];
  }

  return { value, rarity };
}

/**
 * Build a 27-card deck based on 72% Number / 28% Operator split.
 */
export function buildDeck(
  prefix: 'p' | 'ai', 
  collection?: Record<string, CollectionCard>,
  difficulty: AIDifficulty = 'medium',
  mode: GameMode = 'vs_ai',
  theme?: string,
  stageId?: number
): GameCard[] {
  _idCounter = 0;
  const cards: GameCard[] = [];
  
  const totalCards = 27;
  const numCount = Math.round(totalCards * 0.72); // ~19
  const opCount = totalCards - numCount; // ~8

  const isAiRestricted = prefix === 'ai' && mode === 'campaign' && stageId !== undefined && stageId >= 1 && stageId <= 4;

  const getStats = (val: string, type: CardType, rarity: Rarity) => {
    if (prefix === 'p') {
      if (!collection) return { stars: 0, level: 1, hasHalfStar: false };
      const key = `${type}_${val}_${rarity}`;
      const card = collection[key];
      if (!card) return { stars: 0, level: 1, hasHalfStar: false };

      // Calculate half star status
      let hasHalfStar = false;
      if (card.rarity !== 'normal' && card.stars < 5) {
        const needed = [1, 2, 4, 8, 16][card.stars];
        const rarityOrder: Rarity[] = ['normal', 'rare', 'super', 'ultra'];
        const targetIdx = rarityOrder.indexOf(card.rarity);
        
        let points = 0;
        Object.entries(collection).forEach(([, c]) => {
          if (c.value === val && c.rarity !== 'normal') {
            const fodderIdx = rarityOrder.indexOf(c.rarity);
            const weight = Math.pow(10, fodderIdx - targetIdx);
            points += Math.max(0, c.count - 1) * weight;
          }
        });
        hasHalfStar = points >= (needed * 0.5);
      }

      return { stars: card.stars, level: card.level, hasHalfStar };
    } else {
      // AI Stats based on difficulty and mode
      if (isAiRestricted) return { stars: 0, level: 1, hasHalfStar: false };
      
      let stars = 0;
      if (mode === 'campaign' && difficulty === 'boss') {
        const roll = Math.random();
        if (roll > 0.8) stars = 5;
        else if (roll > 0.5) stars = 4;
        else if (roll > 0.2) stars = 3;
        else stars = 2;
      } else {
        if (difficulty === 'medium') stars = Math.random() > 0.7 ? 1 : 0;
        else if (difficulty === 'hard') {
            const roll = Math.random();
            if (roll > 0.8) stars = 5;
            else if (roll > 0.5) stars = 4;
            else stars = 3;
        }
      }
      return { stars, level: (mode === 'campaign' && difficulty === 'boss') ? 10 : (difficulty === 'hard' ? 5 : 1), hasHalfStar: false };
    }
  };

  // Generate Numbers
  for (let i = 0; i < numCount; i++) {
    let value: string;
    let rarity: Rarity;

    if (prefix === 'p' && collection) {
      const numKeys = Object.keys(collection).filter(k => k.startsWith('number') && collection[k].count > 0);
      if (numKeys.length > 0) {
        const key = numKeys[Math.floor(Math.random() * numKeys.length)];
        const c = collection[key];
        value = c.value;
        rarity = c.rarity;
      } else {
        // Absolute fallback if collection is broken
        value = '0';
        rarity = 'normal';
      }
    } else {
      const res = generateRandomValue('number', theme, isAiRestricted);
      value = res.value;
      rarity = res.rarity;
    }

    const card = makeCard(value, 'number', rarity, prefix);
    const stats = getStats(value, 'number', rarity);
    cards.push({ ...card, ...stats });
  }

  // Generate Operators
  for (let i = 0; i < opCount; i++) {
    let value: string;
    let rarity: Rarity;

    if (prefix === 'p' && collection) {
      const opKeys = Object.keys(collection).filter(k => k.startsWith('operator') && collection[k].count > 0);
      if (opKeys.length > 0) {
        const key = opKeys[Math.floor(Math.random() * opKeys.length)];
        const c = collection[key];
        value = c.value;
        rarity = c.rarity;
      } else {
        value = '+';
        rarity = 'normal';
      }
    } else {
      const res = generateRandomValue('operator', theme, isAiRestricted);
      value = res.value;
      rarity = res.rarity;
    }

    const card = makeCard(value, 'operator', rarity, prefix);
    const stats = getStats(value, 'operator', rarity);
    cards.push({ ...card, ...stats });
  }

  const shuffled = shuffle(cards);
  
  // Weighted sort based on stars (20% bias)
  if (prefix === 'p' && collection) {
    shuffled.sort((a, b) => {
       if ((a.stars || 0) > (b.stars || 0)) return Math.random() > 0.8 ? -1 : 1;
       return 0;
    });
  }

  return shuffled;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const HAND_SIZE = 6;

/**
 * Enhanced Smart Draw - Đảm bảo luôn đủ điều kiện lập công thức
 */
export function smartDraw(
  hand: GameCard[], 
  reserve: GameCard[], 
  _count: number,
  afterTurn: number
): [GameCard[], GameCard[]] {
  const nextTurn = afterTurn + 1;
  const targetSize = (nextTurn >= 5) ? 7 : HAND_SIZE; // Rút dư ở lượt 5,6
  
  const needed = Math.max(0, targetSize - hand.length);
  const n = Math.min(needed, reserve.length);
  
  const newReserve = [...reserve];
  const drawn = newReserve.splice(0, n);
  const newHand = [...hand, ...drawn];

  let minOps = 0;
  const maxOps = nextTurn >= 5 ? 3 : 2; // Giới hạn chặt chẽ hơn để tránh thừa dấu
  let minNums = 1;

  if (nextTurn === 2) {
    minNums = 2;
    minOps = 0;
  } else if (nextTurn === 3) {
    minNums = 2;
    minOps = 1;
  } else if (nextTurn === 4) {
    minNums = 3;
    minOps = 1;
  } else if (nextTurn === 5) {
    minNums = 3;
    minOps = 2;
  } else if (nextTurn === 6) {
    minNums = 4;
    minOps = 2;
  }

  const swapWithReserve = (targetType: CardType, discardType: CardType) => {
    const discardIdx = newHand.findIndex(c => c.type === discardType && c.rarity === 'normal');
    const backupDiscardIdx = newHand.findIndex(c => c.type === discardType && c.rarity !== 'super' && c.rarity !== 'ultra');
    const finalDiscardIdx = discardIdx !== -1 ? discardIdx : backupDiscardIdx;

    const targetInReserveIdx = newReserve.findIndex(c => c.type === targetType && (c.rarity === 'super' || c.rarity === 'ultra'));
    const backupTargetIdx = newReserve.findIndex(c => c.type === targetType);
    const finalTargetIdx = targetInReserveIdx !== -1 ? targetInReserveIdx : backupTargetIdx;

    if (finalDiscardIdx !== -1 && finalTargetIdx !== -1) {
      const drawnCard = newReserve[finalTargetIdx];
      const pushedCard = newHand[finalDiscardIdx];
      newHand[finalDiscardIdx] = drawnCard;
      newReserve[finalTargetIdx] = pushedCard;
      return true;
    }
    return false;
  };

  let attempts = 0;
  const maxAttempts = 15;

  while (attempts < maxAttempts) {
    const currentOps = newHand.filter(c => c.type === 'operator').length;
    const currentNums = newHand.filter(c => c.type === 'number').length;
    
    if (currentOps < minOps) {
      if (!swapWithReserve('operator', 'number')) break;
    } 
    else if (currentNums < minNums) {
      if (!swapWithReserve('number', 'operator')) break;
    }
    else if (currentOps > maxOps) {
      if (!swapWithReserve('number', 'operator')) break;
    } else {
      break; 
    }
    attempts++;
  }

  return [newHand, newReserve];
}
