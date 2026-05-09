import type { PlayerState } from './types';
import type { Rarity } from '../../types/game';
import { CARD_METADATA } from '../../data/cardMetadata';
import type { StoreApi } from 'zustand';
import type { CollectionCard } from '../../types/player.types';
import { RESONANCE_COMBOS, type ResonanceCombo } from '../../data/resonanceData';

/**
 * Dữ liệu thẻ bài khởi đầu cho người chơi mới.
 * Bao gồm các thẻ số từ 0-9 và các phép tính cơ bản ở phẩm chất Thường (Normal).
 */
export const STARTER_COLLECTION: Record<string, CollectionCard> = {
  // Thẻ số khởi đầu 0-9 (N)
  ...Array.from({ length: 10 }, (_, i) => {
    const val = String(i);
    const meta = CARD_METADATA[val];
    return {
      [`number_${val}_normal`]: { 
        value: val, 
        type: 'number' as const, 
        rarity: 'normal' as const, 
        count: 10, 
        level: 1, 
        stars: 0, 
        evoPoints: 0, 
        name: meta.name, 
        flavorText: meta.flavorText, 
        abilityName: '', 
        abilityDesc: 'Thẻ thường: Không có nội tại.', 
        activationCond: '' 
      }
    };
  }).reduce((acc, curr) => ({ ...acc, ...curr }), {}),
  
  // Thẻ phép tính khởi đầu (N)
  ...['+', '-', '*', '/'].map(val => {
    const meta = CARD_METADATA[val];
    return {
      [`operator_${val}_normal`]: { 
        value: val, 
        type: 'operator' as const, 
        rarity: 'normal' as const, 
        count: 10, 
        level: 1, 
        stars: 0, 
        evoPoints: 0, 
        name: meta.name, 
        abilityName: '', 
        abilityDesc: 'Thẻ thường: Không có nội tại.', 
        activationCond: '' 
      }
    };
  }).reduce((acc, curr) => ({ ...acc, ...curr }), {}),
};

/**
 * SLICE: Bộ sưu tập (Collection)
 * Quản lý kho thẻ bài của người chơi, nâng cấp thẻ, cộng hưởng và hệ thống phần thưởng bộ sưu tập.
 */
export const createCollectionSlice = (
  set: StoreApi<PlayerState>['setState'],
  get: StoreApi<PlayerState>['getState']
) => ({
  /** Kho lưu trữ toàn bộ thẻ bài người chơi sở hữu */
  collection: STARTER_COLLECTION,
  /** Danh sách các thẻ đã nhận thưởng lần đầu trong Thư viện */
  libraryRewardsClaimed: [] as string[],
  /** Danh sách các thẻ mới mở khóa chưa xem (hiện chấm đỏ notification) */
  newlyUnlockedCards: [] as string[],
  /** Danh sách các mốc cộng hưởng đã nhận thưởng */
  resonanceRewardsClaimed: [] as string[],
  /** Dữ liệu thông thạo thẻ bài (số trận chơi, số trận thắng...) */
  cardMastery: {} as Record<string, {
    matchesPlayed: number;
    starsReached: number;
    matchesWon: number;
    completedLevels: number[];
  }>,

  /** Đảm bảo người chơi luôn có đủ thẻ bài khởi đầu (trường hợp reset hoặc lỗi dữ liệu) */
  ensureStarterCollection: () => {
    set((state: PlayerState) => {
      const current = { ...state.collection };
      let updated = false;
      Object.entries(STARTER_COLLECTION).forEach(([key, card]) => {
        if (!current[key]) {
          current[key] = card;
          updated = true;
        }
      });
      return (updated ? { collection: current } : {}) as Partial<PlayerState>;
    });
  },

  /** 
   * Xử lý khi mở gói thẻ bài (Gacha).
   * Thêm thẻ mới vào bộ sưu tập hoặc tăng số lượng (Count) nếu đã sở hữu.
   */
  buyPack: (newCards: { value: string; type: 'number' | 'operator'; rarity: Rarity }[]) => {
    set((state: PlayerState) => {
      const nextCollection = { ...state.collection };
      const newlyUnlocked = [...state.newlyUnlockedCards];
      
      newCards.forEach(c => {
        const key = `${c.type}_${c.value}_${c.rarity}`;
        const meta = CARD_METADATA[c.value] || {};
        if (nextCollection[key]) {
          nextCollection[key].count += 1;
        } else {
          // Nếu là thẻ bài lần đầu tiên xuất hiện trong kho
          nextCollection[key] = { ...c, ...meta, count: 1, level: 1, stars: 0, evoPoints: 0 } as CollectionCard;
          if (!newlyUnlocked.includes(key)) {
            newlyUnlocked.push(key);
            state.updateQuestProgress('w3', 1); // Track New Card Quest
          }
        }
      });
      return { 
        collection: nextCollection,
        newlyUnlockedCards: newlyUnlocked
      } as Partial<PlayerState>;
    });
  },

  /** Đánh dấu thẻ đã được xem trong Thư viện để xóa thông báo "Mới" */
  viewCardInLibrary: (cardId: string) => {
    set((state: PlayerState) => ({
      newlyUnlockedCards: state.newlyUnlockedCards.filter(id => id !== cardId)
    }) as Partial<PlayerState>);
  },

  /** Nhận thưởng lần đầu khi mở khóa một thẻ bài mới trong Thư viện */
  claimLibraryReward: (cardId: string) => {
    const state = get();
    if (state.libraryRewardsClaimed.includes(cardId)) return { success: false, coins: 0, gems: 0 };
    
    set((s: PlayerState) => ({
      libraryRewardsClaimed: [...s.libraryRewardsClaimed, cardId],
      coins: s.coins + 10000,
      gems: s.gems + 100
    }) as Partial<PlayerState>);
    return { success: true, coins: 10000, gems: 100 };
  },

  /** Nhận thưởng khi đạt mốc cộng hưởng thẻ bài (kết hợp các thẻ bài có liên quan) */
  claimResonanceReward: (resId: string) => {
    const state = get();
    const combo = (RESONANCE_COMBOS as ResonanceCombo[]).find(c => c.id === resId);
    if (!combo || state.resonanceRewardsClaimed.includes(resId)) return { success: false, coins: 0, gems: 0 };
    
    set((s: PlayerState) => ({
      resonanceRewardsClaimed: [...s.resonanceRewardsClaimed, resId],
      coins: s.coins + combo.rewards.coins,
      gems: s.gems + combo.rewards.gems
    }) as Partial<PlayerState>);
    return { success: true, coins: combo.rewards.coins, gems: combo.rewards.gems };
  },

  /** Nhận thưởng thông thạo thẻ bài khi chơi đủ số trận quy định */
  claimMasteryReward: (cardId: string, level: number) => {
    const state = get();
    const mastery = state.cardMastery[cardId];
    if (!mastery || mastery.completedLevels.includes(level)) return { success: false, coins: 0, gems: 0 };

    const req = level === 1 ? 10 : level === 2 ? 25 : level === 3 ? 50 : level === 4 ? 100 : 250;
    if (mastery.matchesPlayed < req) return { success: false, coins: 0, gems: 0 };

    // Thưởng tăng dần theo cấp độ thông thạo (Cân bằng lại: L1: 1k, L2: 2.5k, L3: 7.5k, L4: 20k, L5: 50k)
    const rewardCoins = level === 1 ? 1000 : level === 2 ? 2500 : level === 3 ? 7500 : level === 4 ? 20000 : 50000;
    const rewardGems = level === 1 ? 10 : level === 2 ? 25 : level === 3 ? 75 : level === 4 ? 200 : 500;
    
    set((s: PlayerState) => {
      const nextCollection = { ...s.collection };
      if (nextCollection[cardId]) {
        nextCollection[cardId].count += 1; // Tặng thêm 1 thẻ cùng loại làm quà
      }
      return {
        coins: s.coins + rewardCoins,
        gems: s.gems + rewardGems,
        collection: nextCollection,
        cardMastery: {
          ...s.cardMastery,
          [cardId]: {
            ...mastery,
            completedLevels: [...mastery.completedLevels, level]
          }
        }
      } as Partial<PlayerState>;
    });
    return { success: true, coins: rewardCoins, gems: rewardGems, card: cardId };
  },

  /** 
   * Nâng cấp cấp độ (Level) của thẻ bài bằng Vàng.
   * Cấp độ tăng giúp chỉ số cơ bản của thẻ mạnh hơn trong trận đấu.
   */
  upgradeCardLevel: (cardKey: string, cost: number) => {
    const { coins, collection } = get();
    if (coins < cost) return false;
    const card = collection[cardKey];
    // Thẻ hiếm trở lên mới nâng cấp được. Giới hạn cấp độ dựa trên Sao Đỏ (Mặc định 50, +10 mỗi Sao Đỏ)
    const maxLevel = 50 + ((card.redStars || 0) * 10);
    if (!card || card.rarity === 'normal' || card.level >= maxLevel) return false;

    set((state: PlayerState) => {
      state.updateQuestProgress('d7', 1); // Nhiệm vụ nâng cấp thẻ
      return {
        coins: state.coins - cost,
        collection: {
          ...state.collection,
          [cardKey]: { ...card, level: card.level + 1 }
        }
      } as Partial<PlayerState>;
    });
    return true;
  },

  /** 
   * Tiêm điểm thăng hoa (Evolution Points) vào thẻ bài bằng cách tiêu thụ thẻ thừa và Vàng.
   * Khi điểm tích lũy đủ, thẻ bài sẽ thăng hạng Sao (Star Rank Up).
   */
  injectEvoPoints: (payload: { cardKey: string, materials: Record<string, number>, cost: number, pointsToAdd: number, providedBooks?: number }) => {
    const { collection, coins } = get();
    const { cardKey, materials, cost, pointsToAdd, providedBooks = 0 } = payload;
    const targetCard = collection[cardKey];
    if (!targetCard || coins < cost) return false;

    set((state: PlayerState) => {
      const nextCollection = { ...state.collection };
      
      // Tiêu thụ các thẻ bài nguyên liệu
      Object.entries(materials).forEach(([mKey, count]) => {
        if (nextCollection[mKey]) {
          nextCollection[mKey] = {
            ...nextCollection[mKey],
            count: Math.max(0, nextCollection[mKey].count - count)
          };
        }
      });

      // Tăng điểm thăng hoa
      let newEvoPoints = (nextCollection[cardKey].evoPoints || 0) + pointsToAdd;
      let newStars = nextCollection[cardKey].stars;

      // Xử lý thăng hạng Sao nếu điểm vượt ngưỡng (Star Overflow)
      // GIỚI HẠN: Chỉ cho phép thăng hoa dựa trên cấp độ hiện tại (Cấp 10 -> 1*, Cấp 40 -> 4*)
      const maxStarsAllowed = Math.floor(targetCard.level / 10);
      const neededTable = [1, 2, 3, 4, 5];
      
      while (newStars < 5 && newStars < maxStarsAllowed) {
        const needed = neededTable[newStars];
        if (newEvoPoints >= needed) {
          newEvoPoints -= needed;
          newStars += 1;
        } else {
          break;
        }
      }

      // Xử lý thăng hạng Sao Đỏ (Red Star Ascension)
      // Điều kiện: Đã đạt 5 Sao Vàng và Cấp độ đạt mốc (50, 60, 70...)
      let newRedStars = nextCollection[cardKey].redStars || 0;
      let usedBooks = 0;
      const maxRedStarsAllowed = Math.max(0, Math.floor((targetCard.level - 40) / 10)); // Lv 50 -> 1, Lv 60 -> 2...

      if (newStars === 5) {
        const redStarNeededTable = [2, 4, 6, 8, 10];
        while (newRedStars < maxRedStarsAllowed && newRedStars < 5) {
          const neededRed = redStarNeededTable[newRedStars];
          // Kiểm tra đủ điểm VÀ đủ sách (Chỉ thăng hoa nếu người dùng đã bỏ sách vào)
          if (newEvoPoints >= neededRed && usedBooks < providedBooks) {
            newEvoPoints -= neededRed;
            newRedStars += 1;
            usedBooks += 1;
          } else {
            break;
          }
        }
      }

      nextCollection[cardKey] = {
        ...nextCollection[cardKey],
        stars: newStars,
        redStars: newRedStars,
        evoPoints: newEvoPoints
      };

      // Track Quest Thăng Hoa (Tiến hóa)
      if (newStars > targetCard.stars || newRedStars > (targetCard.redStars || 0)) {
        state.updateQuestProgress('w4', 1);
        
        // Track card reaching 5 stars (Weekly)
        if (newStars === 5 && targetCard.stars < 5) {
          state.updateQuestProgress('w12', 1);
        }
      }

      // Track Quest EXP Bank (Weekly)
      state.updateQuestProgress('w15', pointsToAdd);

      return { 
        collection: nextCollection,
        coins: state.coins - cost,
        redAscensionBooks: state.redAscensionBooks - usedBooks
      } as Partial<PlayerState>;
    });

    return true;
  },

});
