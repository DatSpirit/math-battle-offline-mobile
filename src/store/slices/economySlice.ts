import type { PlayerState } from './types';
import type { Rarity } from '../../types/game';
import type { StoreApi } from 'zustand';
import { generatePackCards } from '../../core/shop/gachaService';
import { ECONOMY_CONSTANTS } from '../../data/mechanicsData';

/**
 * SLICE: Kinh tế & Tiến trình (Economy & Progression)
 * Quản lý tiền tệ, cấp độ, XP, bảng xếp hạng và phần thưởng sau trận đấu.
 */
export const createEconomySlice = (
  set: StoreApi<PlayerState>['setState'],
  get: StoreApi<PlayerState>['getState']
) => ({
  /** Số lượng Vàng hiện có */
  coins: ECONOMY_CONSTANTS.INITIAL_COINS,
  /** Số lượng Kim cương hiện có */
  gems: ECONOMY_CONSTANTS.INITIAL_GEMS,
  /** Cấp độ hiện tại của người chơi */
  level: 1,
  /** Kinh nghiệm (XP) hiện có trong cấp độ hiện tại */
  xp: 0,
  /** Chỉ số Elo (dùng cho xếp hạng PvP giả lập) */
  elo: 1000,
  /** Thứ hạng trên bảng xếp hạng toàn cầu (giả lập) */
  rank: 1245,
  /** Ngày cuối cùng nhận thưởng hàng ngày (ISO Date string) */
  lastDailyRewardClaimed: null as string | null,
  /** Tuần cuối cùng nhận thưởng hàng tuần */
  lastWeeklyRewardClaimed: null as string | null,
  /** Chuỗi trận thắng liên tiếp */
  winStreak: 0,
  /** Tổng số trận thắng */
  wins: 0,
  /** Chế độ đồ họa (ECO, BALANCED, ULTRA) */
  performanceMode: 'BALANCED' as 'ECO' | 'BALANCED' | 'ULTRA',
  /** Trạng thái tắt tiếng (Muted) */
  isMuted: false,

  /** Thiết lập chế độ hiệu năng */
  setPerformanceMode: (mode: 'ECO' | 'BALANCED' | 'ULTRA') => set({ performanceMode: mode } as Partial<PlayerState>),
  /** Bật/Tắt âm thanh */
  toggleMute: () => set((s: PlayerState) => ({ isMuted: !s.isMuted }) as Partial<PlayerState>),
  /** Thiết lập trạng thái đã cấu hình hiệu năng */
  setIsPerformanceSet: (val: boolean) => set({ isPerformanceSet: val } as Partial<PlayerState>),

  /** Thêm Vàng vào tài khoản */
  addCoins: (amount: number) => set((state: PlayerState) => {
    state.updateQuestProgress('w5', amount); // Track Earn Gold Quest
    return { coins: state.coins + amount } as Partial<PlayerState>;
  }),

  /** Thêm Kim cương vào tài khoản */
  addGems: (amount: number) => set((state: PlayerState) => ({ gems: state.gems + amount }) as Partial<PlayerState>),
  
  /** Thêm Sách Thăng Hoa Đỏ vào tài khoản */
  addRedAscensionBooks: (amount: number) => set((state: PlayerState) => ({ redAscensionBooks: state.redAscensionBooks + amount }) as Partial<PlayerState>),
  
  /** 
   * Thêm XP và tự động tính toán thăng cấp.
   * Khi XP đạt ngưỡng `XP_PER_LEVEL`, người chơi sẽ tăng 1 cấp.
   */
  addXP: (amount: number) => set((state: PlayerState) => {
    const newXP = state.xp + amount;
    const nextLevelXP = state.level * ECONOMY_CONSTANTS.XP_PER_LEVEL;
    if (newXP >= nextLevelXP) {
      return { level: state.level + 1, xp: newXP - nextLevelXP } as Partial<PlayerState>;
    }
    return { xp: newXP } as Partial<PlayerState>;
  }),

  /** Tăng chuỗi đúng liên tiếp và cập nhật nhiệm vụ d4 */
  incrementConsecutiveSuccess: () => set((state: PlayerState) => {
    const next = state.consecutiveSuccess + 1;
    state.setQuestProgress('d4', next); // Cập nhật trực tiếp số chuỗi vào nhiệm vụ
    return { consecutiveSuccess: next } as Partial<PlayerState>;
  }),

  /** Reset chuỗi đúng khi làm sai */
  resetConsecutiveSuccess: () => set((state: PlayerState) => {
    state.setQuestProgress('d4', 0); // Reset tiến độ nhiệm vụ chuỗi
    return { consecutiveSuccess: 0 } as Partial<PlayerState>;
  }),

  /** Nhận thưởng điểm danh hàng ngày dựa trên thứ hạng rank */
  claimDailyReward: () => {
    const state = get();
    const today = new Date().toISOString().split('T')[0];
    if (state.lastDailyRewardClaimed === today) {
      return { success: false, msg: 'Bạn đã nhận thưởng hôm nay rồi!' };
    }
    
    let reward = ECONOMY_CONSTANTS.DAILY_REWARD_BASE;
    if (state.rank === 1) reward = 50000;
    else if (state.rank <= 3) reward = 25000;
    else if (state.rank <= 10) reward = 15000;
    else if (state.rank <= 100) reward = 5000;

    set((state: PlayerState) => ({
      coins: state.coins + reward,
      lastDailyRewardClaimed: today
    }) as Partial<PlayerState>);
    return { success: true, reward, msg: `Chúc mừng! Bạn nhận được ${reward} Coins vì đứng hạng #${state.rank}.` };
  },

  /** Nhận thưởng tổng kết tuần */
  claimWeeklyReward: () => {
    const state = get();
    const weekKey = `w_${new Date().getFullYear()}_${Math.floor(new Date().getDate() / 7)}`;
    if (state.lastWeeklyRewardClaimed === weekKey) {
        return { success: false, msg: 'Bạn đã nhận thưởng tuần này rồi!' };
    }

    let reward = ECONOMY_CONSTANTS.WEEKLY_REWARD_BASE;
    if (state.rank === 1) reward = 500000;
    set((state: PlayerState) => ({
        coins: state.coins + reward,
        lastWeeklyRewardClaimed: weekKey
    }) as Partial<PlayerState>);
    return { success: true, reward, msg: `Chúc mừng! Phần thưởng tuần: ${reward} Coins.` };
  },

  /** 
   * Xử lý kết quả sau một trận đấu PvP hoặc đấu với AI.
   * Tính toán Vàng thưởng, XP, Elo và cập nhật thông độ thông thạo thẻ bài (Mastery).
   */
  processMatchResult: (winner: 'player' | 'ai' | 'tie', usedCards: string[]) => {
    const state = get();
    let coinsBonus = 0;
    let xpGained = 10;
    let eloGained = 0;
    let nextStreak = state.winStreak;

    // Cập nhật Mastery cho các thẻ bài đã sử dụng trong trận
    const nextMastery = { ...state.cardMastery };
    usedCards.forEach(id => {
       if (!nextMastery[id]) {
         nextMastery[id] = { matchesPlayed: 0, starsReached: 0, matchesWon: 0, completedLevels: [] };
       }
       nextMastery[id].matchesPlayed += 1;
       if (winner === 'player') nextMastery[id].matchesWon += 1;
       const card = state.collection[id];
       if (card) nextMastery[id].starsReached = Math.max(nextMastery[id].starsReached, card.stars);
    });

    if (winner === 'player') {
      nextStreak += 1;
      const nextWins = state.wins + 1;
      
      set({ wins: nextWins, winStreak: nextStreak, cardMastery: nextMastery } as Partial<PlayerState>);
      state.updateQuestProgress('w10', 1); // Track Win Streak (simplified to total wins during streak)

      // Cập nhật tiến độ thành tựu (Achievements) liên quan đến thắng trận
      state.updateAchievementProgress('first_blood', 1);
      state.updateAchievementProgress('win_5', nextWins);
      state.updateAchievementProgress('win_20', nextWins);
      state.updateAchievementProgress('win_50', nextWins);
      state.updateAchievementProgress('streak_3', nextStreak);
      state.updateAchievementProgress('streak_5', nextStreak);

      // Thưởng Vàng nhân đôi theo chuỗi thắng (Streak bonus)
      coinsBonus = ECONOMY_CONSTANTS.BASE_WIN_COINS * Math.pow(2, Math.max(0, nextStreak - 1));
      xpGained = ECONOMY_CONSTANTS.WIN_XP;
      eloGained = ECONOMY_CONSTANTS.ELO_GAIN;

    } else if (winner === 'ai') {
      nextStreak = 0; // Thua trận làm mất chuỗi thắng
      xpGained = ECONOMY_CONSTANTS.LOSE_XP;
      eloGained = ECONOMY_CONSTANTS.ELO_LOSS;
      set({ winStreak: nextStreak } as Partial<PlayerState>);
    } else {
      nextStreak = 0;
      xpGained = ECONOMY_CONSTANTS.TIE_XP;
      eloGained = 0;
      set({ winStreak: nextStreak } as Partial<PlayerState>);
    }

    // Áp dụng các thay đổi vào state chính
    set((s: PlayerState) => ({
      coins: s.coins + coinsBonus,
      xp: s.xp + xpGained,
      elo: Math.max(0, s.elo + eloGained)
    }) as Partial<PlayerState>);

    // Giả lập tăng hạng trên bảng xếp hạng (tỉ lệ 30% mỗi trận thắng)
    if (eloGained > 0 && Math.random() > 0.7) {
        set((s: PlayerState) => ({ rank: Math.max(1, s.rank - 1) }) as Partial<PlayerState>);
    }

    return { coins: coinsBonus, xp: xpGained, elo: eloGained, streak: nextStreak };
  },

  /**
   * Xử lý phần thưởng khi vượt ải Campaign.
   * Thưởng dựa trên số sao đạt được (1 sao: Vàng, 2 sao: Kim cương, 3 sao: Gói thẻ).
   */
  processCampaignResult: (stageId: number, newStars: number, previousStars: number, gold: number, gems: number, packType: 'R' | 'SR' | 'UR' | 'OPERATOR' | null, usedCards: string[]) => {
    let finalPack = null;
    let earnedCards: { value: string; type: 'number' | 'operator'; rarity: Rarity }[] = [];
    
    // --- PHẦN THƯỞNG CHƠI LẠI (REPLAY REWARDS) ---
    const stage = get().stages.find(s => s.id === stageId);
    const isBoss = stage?.type === 'boss';
    let replayGold = 0;
    let droppedBook = false;

    // Nếu đã đạt 3 sao từ trước, lần chơi này là chơi lại (Replay)
    if (previousStars >= 3) {
      replayGold = isBoss ? 10000 : 5000;
      // Tỷ lệ 10% rơi Sách Thăng Hoa Đỏ khi đánh Boss
      if (isBoss && Math.random() < 0.1) {
        droppedBook = true;
      }
    }

    // Kiểm tra xem người chơi có đạt cột mốc sao mới không để trao thưởng (tránh nhận thưởng lại lần 2)
    const shouldGiveGold = newStars >= 1 && previousStars < 1;
    const shouldGiveGems = newStars >= 2 && previousStars < 2;
    const shouldGivePack = newStars >= 3 && previousStars < 3;

    const earnedGold = (shouldGiveGold ? gold : 0) + replayGold;
    const earnedGems = shouldGiveGems ? gems : 0;
    
    if (shouldGiveGold) {
      get().updateQuestProgress('w6', 1); // Track Campaign Stage Quest
    }

    if (shouldGivePack && packType) {
      const packId = packType === 'UR' ? 'pack_ur' : packType === 'SR' ? 'pack_sr' : packType === 'R' ? 'R' : 'pack_operator';
      // Boss stages (chia hết cho 5) sẽ tặng nhiều thẻ hơn
      earnedCards = generatePackCards(packId, stageId % 5 === 0 ? 15 : 10);
      get().buyPack(earnedCards);
      finalPack = packId;
    }

    // Cập nhật Mastery cho chiến dịch
    const nextMastery = { ...get().cardMastery };
    usedCards.forEach(id => {
       if (!nextMastery[id]) {
         nextMastery[id] = { matchesPlayed: 0, starsReached: 0, matchesWon: 0, completedLevels: [] };
       }
       nextMastery[id].matchesPlayed += 1;
       if (newStars >= 1) nextMastery[id].matchesWon += 1;
       const card = get().collection[id];
       if (card) nextMastery[id].starsReached = Math.max(nextMastery[id].starsReached, card.stars);
    });
    set({ cardMastery: nextMastery } as Partial<PlayerState>);
    
    if (earnedGold > 0) get().addCoins(earnedGold);
    if (earnedGems > 0) get().addGems(earnedGems);
    if (droppedBook) get().addRedAscensionBooks(1);
    
    // Thêm vào danh sách thông báo phần thưởng đang chờ xử lý
    let pendingMsg = `Phần thưởng vượt ải ${stageId}: ${earnedGold} Vàng`;
    if (earnedGems > 0) pendingMsg += `, ${earnedGems} Kim cương`;
    if (droppedBook) pendingMsg += `, 1 Sách Toán`;
    
    if (earnedGold > 0 || earnedGems > 0 || shouldGivePack || droppedBook) {
      set((s: PlayerState) => ({
        pendingUnlocks: [...s.pendingUnlocks, pendingMsg]
      }) as Partial<PlayerState>);
    }

    return { coins: earnedGold, gems: earnedGems, pack: finalPack, cards: earnedCards, droppedBook };
  }
});
