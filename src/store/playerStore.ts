import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { PlayerState } from './slices/types';
import { capacitorStorage } from './capacitorStorage';
import { createCollectionSlice, STARTER_COLLECTION } from './slices/collectionSlice';
import { createEconomySlice } from './slices/economySlice';
import { createQuestSlice } from './slices/questSlice';
import { createCampaignSlice } from './slices/campaignSlice';
import { createAchievementSlice } from './slices/achievementSlice';
import { createShopSlice } from './slices/shopSlice';
import { QUEST_POOL } from '../data/questData';
import { SHOP_PRODUCTS } from '../data/shopData';
import { ECONOMY_CONSTANTS } from '../data/mechanicsData';

/**
 * GIÁ TRỊ KHỞI TẠO CỦA CỬA HÀNG (INITIAL STORE VALUES)
 * Chứa toàn bộ các thông số mặc định khi người chơi mới bắt đầu game.
 */
const INITIAL_ECONOMY = {
  coins: ECONOMY_CONSTANTS.INITIAL_COINS,
  gems: ECONOMY_CONSTANTS.INITIAL_GEMS,
  redAscensionBooks: 5,
  level: 1,
  xp: 0,
  elo: 1000,
  rank: 1245,
  lastDailyRewardClaimed: null,
  lastWeeklyRewardClaimed: null,
  winStreak: 0,
  wins: 0,
  consecutiveSuccess: 0,
  isMuted: false,
  lastQuestReset: new Date().toISOString(),
  lastWeeklyReset: new Date().toISOString(),
  transactions: [],
  hasHydrated: false,
  pendingUnlocks: [],
  libraryRewardsClaimed: [],
  newlyUnlockedCards: [],
  resonanceRewardsClaimed: [],
  cardMastery: {},
  activeQuests: [],
  questPool: QUEST_POOL,
  completedQuests: [],
  shopProducts: SHOP_PRODUCTS,
  progress: {
    1: { stageId: 1, stars: 0, isUnlocked: true, bestScore: 0, dailyAttempts: 0, lastAttemptDate: null }
  },
  currentStageId: null,
  achievements: [],
  shopDailyLimits: {},
  lastShopReset: new Date().toISOString(),
  lastDailyReset: new Date().toISOString(),
  freeSummonsUsed: {},
  isPerformanceSet: false,
};

/**
 * STORE CHÍNH: Người Chơi (Player Store)
 * Sử dụng Zustand kết hợp với middleware Persist để lưu trữ dữ liệu vào LocalStorage.
 * Store này là "Single Source of Truth" cho toàn bộ thông tin cá nhân, tài sản và tiến trình của người chơi.
 */
export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      // --- Tích hợp các giá trị khởi tạo ---
      ...INITIAL_ECONOMY,

      // --- Tích hợp các Slice (Mô-đun hóa Store) ---
      // Mỗi Slice quản lý một mảng logic riêng biệt để tránh file store quá dài.
      ...createCollectionSlice(set, get),
      ...createEconomySlice(set, get),
      ...createQuestSlice(set, get),
      ...createCampaignSlice(set),
      ...createAchievementSlice(set, get),
      ...createShopSlice(set, get),
      
      /** 
       * RESET TOÀN BỘ HỆ THỐNG HÀNG NGÀY
       * Bao gồm: Quests, Shop, Summon miễn phí
       */
      checkDailyReset: () => {
        const state = get();
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const lastReset = state.lastDailyReset?.split('T')[0];

        if (today !== lastReset) {
          console.log(`[System] Daily Reset Triggered: ${today}`);
          
          // Track Login Quests
          state.updateQuestProgress('d1', 1);
          state.updateQuestProgress('w9', 1);
          
          // 2. Reset Shop Limits
          set({ 
            shopDailyLimits: {}, 
            lastShopReset: now.toISOString(),
            // 3. Reset Free Summons
            freeSummonsUsed: {},
            lastDailyReset: now.toISOString()
          } as Partial<PlayerState>);
        }

        // 1. Reset Quests (Luôn kiểm tra tiến độ ngày/tuần hoặc sự thiếu hụt dữ liệu)
        state.checkAndResetQuests();
      },

      /** Cập nhật trạng thái dữ liệu đã được tải xong từ bộ nhớ (LocalStorage) */
      setHasHydrated: (val: boolean) => {
        set({ hasHydrated: val } as Partial<PlayerState>);
        // Khi tải dữ liệu xong, tự động kiểm tra reset hàng ngày
        get().checkDailyReset();

        // Tự động làm sạch dữ liệu thành tựu nếu bị trùng lặp (do lỗi cũ trong Storage)
        const currentAchievements = get().achievements || [];
        const unique = Array.from(new Map(currentAchievements.map(a => [a.id, a])).values());
        if (unique.length !== currentAchievements.length) {
          console.log('[System] Deduplicating achievements in storage...');
          set({ achievements: unique } as Partial<PlayerState>);
        }
      },

      /** Hàm khung cho việc xóa toàn bộ tài khoản (hiện chưa triển khai logic sâu) */
      resetAccount: () => {
         get().resetProgress();
      },

      /** 
       * Reset tiến trình chơi về trạng thái ban đầu.
       * Dùng khi người chơi muốn bắt đầu lại hành trình từ đầu nhưng vẫn giữ một số cài đặt.
       */
      resetProgress: () => {
        set({
          ...INITIAL_ECONOMY,
          collection: STARTER_COLLECTION,
          activeQuests: QUEST_POOL, // Load toàn bộ 10 ngày + 15 tuần
          questPool: [],
        } as Partial<PlayerState>);
      },
    }),
    {
      // --- Cấu hình Persistence ---
      /** Tên khóa lưu trữ trong LocalStorage */
      name: 'math-battle-player-storage',
      /** Sử dụng Capacitor Preferences storage */
      storage: createJSONStorage(() => capacitorStorage),
      /** 
       * Callback được gọi sau khi dữ liệu từ LocalStorage được đưa vào Store thành công.
       * Điều này giúp ứng dụng biết khi nào dữ liệu đã sẵn sàng để hiển thị UI.
       */
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
