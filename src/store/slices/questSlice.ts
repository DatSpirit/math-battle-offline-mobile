import type { PlayerState } from './types';
import { QUEST_POOL, DAILY_QUESTS, WEEKLY_QUESTS } from '../../data/questData';
import type { Quest } from '../../types/player.types';
import type { StoreApi } from 'zustand';

/**
 * SLICE: Nhiệm vụ (Quests)
 * Quản lý hệ thống nhiệm vụ hàng ngày, tiến độ và trao thưởng nhiệm vụ.
 */
export const createQuestSlice = (
  set: StoreApi<PlayerState>['setState'],
  get: StoreApi<PlayerState>['getState']
) => ({
  /** Danh sách toàn bộ nhiệm vụ đang thực hiện (10 ngày + 15 tuần) */
  activeQuests: [] as Quest[],
  /** Kho lưu trữ toàn bộ các mẫu nhiệm vụ */
  questPool: QUEST_POOL,
  /** Thời điểm cuối cùng làm mới nhiệm vụ hàng ngày */
  lastQuestReset: new Date().toISOString(),
  /** Thời điểm cuối cùng làm mới nhiệm vụ hàng tuần */
  lastWeeklyReset: new Date().toISOString(),

  /** 
   * Cập nhật tiến độ của một nhiệm vụ cụ thể (Cộng dồn).
   */
  updateQuestProgress: (id: string, amount: number) => set((state: PlayerState) => ({
    activeQuests: state.activeQuests.map((q: Quest) => {
      if ((q.id === id || q.id.startsWith(id + '_')) && !q.completed) {
        const nextCurrent = Math.min(q.goal, q.current + amount);
        return { ...q, current: nextCurrent, completed: nextCurrent >= q.goal };
      }
      return q;
    })
  }) as Partial<PlayerState>),

  /** 
   * Thiết lập giá trị tiến độ tuyệt đối cho nhiệm vụ (Dùng cho chuỗi thắng/liên tiếp).
   */
  setQuestProgress: (id: string, amount: number) => set((state: PlayerState) => ({
    activeQuests: state.activeQuests.map((q: Quest) => {
      if ((q.id === id || q.id.startsWith(id + '_')) && !q.completed) {
        const nextCurrent = Math.min(q.goal, amount);
        return { ...q, current: nextCurrent, completed: nextCurrent >= q.goal };
      }
      return q;
    })
  }) as Partial<PlayerState>),

  /** Kiểm tra xem đã đến lúc làm mới nhiệm vụ chưa */
  checkAndResetQuests: () => {
    const { lastQuestReset, lastWeeklyReset, activeQuests } = get();
    const now = new Date();
    
    // Reset Hàng ngày (24h)
    const lastDaily = new Date(lastQuestReset);
    const dailyDiff = (now.getTime() - lastDaily.getTime()) / (1000 * 60 * 60);
    
    // Reset Hàng tuần (7 ngày)
    const lastWeekly = new Date(lastWeeklyReset || lastQuestReset);
    const weeklyDiff = (now.getTime() - lastWeekly.getTime()) / (1000 * 60 * 60 * 24);

    const hasDaily = activeQuests.some(q => q.type === 'daily');
    const hasWeekly = activeQuests.some(q => q.type === 'weekly');

    if (dailyDiff >= 24 || !hasDaily) {
      get().refreshQuests('daily');
    }

    if (weeklyDiff >= 7 || !hasWeekly) {
      get().refreshQuests('weekly');
    }
  },

  /** Làm mới danh sách nhiệm vụ theo loại */
  refreshQuests: (type: 'daily' | 'weekly') => {
    const { activeQuests } = get();
    const pool = type === 'daily' ? DAILY_QUESTS : WEEKLY_QUESTS;
    
    // Giữ lại các nhiệm vụ loại khác
    const otherTypeQuests = activeQuests.filter(q => q.type !== type);
    
    // Khởi tạo mới các nhiệm vụ loại này
    const newQuests = pool.map((q: Quest) => ({
      ...q,
      current: 0,
      completed: false,
      claimed: false,
      id: `${q.id}_${Date.now()}` // Unique ID cho instance này
    }));

    set({ 
      activeQuests: [...otherTypeQuests, ...newQuests],
      [type === 'daily' ? 'lastQuestReset' : 'lastWeeklyReset']: new Date().toISOString()
    } as Partial<PlayerState>);
  },

  /** Nhận thưởng sau khi hoàn thành nhiệm vụ */
  claimQuestReward: (id: string) => {
    const { activeQuests, coins, xp } = get();
    const quest = activeQuests.find((q: Quest) => q.id === id);
    
    if (quest && quest.completed && !quest.claimed) {
      // Track Weekly Quest for completing Daily Quests
      if (quest.type === 'daily') {
        get().updateQuestProgress('w13', 1);
      }

      set({
        coins: coins + quest.reward,
        gems: (get().gems || 0) + (quest.rewardGems || 0),
        xp: xp + Math.floor(quest.reward * 0.2), // Thưởng XP bằng 20% vàng
        activeQuests: get().activeQuests.map((q: Quest) => q.id === id ? { ...q, claimed: true } : q)
      } as Partial<PlayerState>);
      return { success: true, reward: quest.reward, gems: quest.rewardGems };
    }
    return { success: false, reward: 0, gems: 0 };
  }
});
