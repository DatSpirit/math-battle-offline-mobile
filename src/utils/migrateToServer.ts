// migrateToServer.ts — One-time migration utility
// Chuyển dữ liệu từ localStorage (offline) → server (online)
// Gọi một lần khi user đăng nhập online lần đầu

import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const MIGRATION_KEY = 'math_battle_migrated';

interface LocalData {
  coins: number;
  gems: number;
  level: number;
  xp: number;
  winStreak: number;
}

/**
 * Kiểm tra và thực hiện migration localStorage → server.
 * Chỉ chạy 1 lần khi user chuyển từ offline → online lần đầu.
 */
export async function migrateLocalToServer(): Promise<boolean> {
  // Đã migrate rồi → skip
  if (localStorage.getItem(MIGRATION_KEY) === 'true') return false;

  const { isOnlineMode, accessToken } = useAuthStore.getState();
  if (!isOnlineMode || !accessToken) return false;

  // Đọc dữ liệu local từ playerStore persist
  const playerStoreRaw = localStorage.getItem('player-store');
  if (!playerStoreRaw) {
    localStorage.setItem(MIGRATION_KEY, 'true');
    return false;
  }

  try {
    const parsed = JSON.parse(playerStoreRaw);
    const state = parsed?.state || parsed;

    const localData: LocalData = {
      coins: state.coins ?? 10000,
      gems: state.gems ?? 50,
      level: state.level ?? 1,
      xp: state.xp ?? 0,
      winStreak: state.winStreak ?? 0,
    };

    // POST lên server — server sẽ MAX merge
    const res = await fetch(`${API_URL}/api/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(localData),
    });

    if (res.ok) {
      localStorage.setItem(MIGRATION_KEY, 'true');
      console.log('[Migration] ✅ Local data migrated to server successfully');
      return true;
    } else {
      console.warn('[Migration] ⚠️ Server rejected migration, will retry next login');
      return false;
    }
  } catch (err) {
    console.error('[Migration] ❌ Migration failed:', err);
    return false;
  }
}
