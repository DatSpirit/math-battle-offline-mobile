// sync.service.ts — Data Sync: Offline-First với Safe Merge
// Merge strategy: MAX(coins/gems/level/xp), server-only(elo/wins)
import { prisma } from '../lib/prisma';

interface SyncPayload {
  coins: number;
  gems: number;
  level: number;
  xp: number;
  winStreak: number;
  // ELO và wins KHÔNG nhận từ client (chống hack)
}

/**
 * Safe merge: Kết hợp dữ liệu local (offline) và server.
 * - coins/gems/level/xp: lấy MAX → không bao giờ mất tài sản
 * - elo/wins: chỉ server ghi → client không hack được
 */
export const syncUserData = async (supabaseId: string, localData: SyncPayload) => {
  const user = await prisma.user.findUnique({ where: { supabaseId } });
  if (!user) return null;

  const merged = await prisma.user.update({
    where: { supabaseId },
    data: {
      coins:     Math.max(localData.coins, user.coins),
      gems:      Math.max(localData.gems, user.gems),
      level:     Math.max(localData.level, user.level),
      xp:        Math.max(localData.xp, user.xp),
      winStreak: Math.max(localData.winStreak, user.winStreak),
      // elo, wins: giữ nguyên giá trị server
    },
  });

  return merged;
};

/**
 * Lấy dữ liệu server để client merge khi mở app
 */
export const getServerData = async (supabaseId: string) => {
  return prisma.user.findUnique({
    where: { supabaseId },
    select: {
      coins: true,
      gems: true,
      level: true,
      xp: true,
      elo: true,
      wins: true,
      winStreak: true,
    },
  });
};
