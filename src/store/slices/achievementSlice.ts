import type { PlayerState } from './types';
import type { StoreApi } from 'zustand';
import type { Achievement } from '../../types/player.types';
import { ACHIEVEMENTS_DATA } from '../../data/achievementData';

/**
 * Interface cho trạng thái của Thành tựu (Achievements).
 */
export interface AchievementState {
  /** Danh sách toàn bộ thành tựu trong game */
  achievements: Achievement[];
  /** Danh sách các ID thành tựu vừa mới mở khóa — dùng để hiển thị thông báo Toast */
  pendingUnlocks: string[];
  /** Hàm mở khóa thủ công một thành tựu */
  unlockAchievement: (id: string) => void;
  /** Cập nhật tiến độ của một thành tựu cụ thể */
  updateAchievementProgress: (id: string, progress: number) => void;
  /** Xóa danh sách thông báo chờ */
  clearPendingUnlocks: () => void;
}

/**
 * SLICE: Thành tựu (Achievements)
 * Quản lý hệ thống 20 huy chương chia làm 5 danh mục: combat, collection, social, economy, mastery.
 */
export const createAchievementSlice = (
  set: StoreApi<PlayerState>['setState'],
  get: StoreApi<PlayerState>['getState'],
) => ({
  /** Khởi tạo danh sách thành tựu từ dữ liệu mẫu */
  achievements: ACHIEVEMENTS_DATA as Achievement[],
  /** Khởi tạo danh sách thông báo chờ trống */
  pendingUnlocks: [] as string[],

  /** 
   * Mở khóa ngay lập tức một thành tựu dựa trên ID.
   * Thường dùng cho các thành tựu mang tính cột mốc không có tiến độ tích lũy (ví dụ: 'Tham gia Discord').
   */
  unlockAchievement: (id: string) => {
    const state = get();
    const ach = state.achievements.find(a => a.id === id);
    if (!ach || ach.isUnlocked) return;

    set((s: PlayerState) => ({
      achievements: s.achievements.map(a =>
        a.id === id
          ? { ...a, isUnlocked: true, progress: a.goal, unlockedAt: new Date().toISOString() }
          : a
      ),
      pendingUnlocks: [...s.pendingUnlocks, id],
      // Thưởng Vàng khi đạt thành tựu
      coins: s.coins + ach.reward,
    }) as Partial<PlayerState>);
  },

  /** 
   * Cập nhật tiến độ tích lũy cho một thành tựu (ví dụ: 'Thắng 5 trận').
   * Nếu tiến độ đạt mức tiêu chuẩn (Goal), thành tựu sẽ tự động mở khóa.
   */
  updateAchievementProgress: (id: string, progress: number) => {
    const state = get();
    const ach = state.achievements.find(a => a.id === id);
    // Nếu thành tựu không tồn tại hoặc đã mở khóa rồi thì bỏ qua
    if (!ach || ach.isUnlocked) return;

    const newProgress = Math.min(progress, ach.goal);
    const shouldUnlock = newProgress >= ach.goal;

    set((s: PlayerState) => ({
      achievements: s.achievements.map(a =>
        a.id === id
          ? {
              ...a,
              progress: newProgress,
              isUnlocked: shouldUnlock,
              unlockedAt: shouldUnlock ? new Date().toISOString() : a.unlockedAt,
            }
          : a
      ),
      // Nếu đủ điều kiện mở khóa, thêm vào hàng chờ thông báo và cộng thưởng
      ...(shouldUnlock && {
        pendingUnlocks: [...s.pendingUnlocks, id],
        coins: s.coins + ach.reward,
      }),
    }) as Partial<PlayerState>);
  },

  /** Xóa sạch danh sách ID trong hàng chờ thông báo (thường gọi sau khi đã hiển thị Toast) */
  clearPendingUnlocks: () => set(() => ({ pendingUnlocks: [] } as Partial<PlayerState>)),
});
