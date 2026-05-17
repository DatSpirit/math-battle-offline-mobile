// syncSlice.ts — Offline-First Data Sync Layer
// Debounce 3s sau mỗi state change → POST /api/sync
// Queue offline changes → sync khi reconnect

import { useAuthStore } from '../authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
let syncTimer: ReturnType<typeof setTimeout> | null = null;
let offlineQueue: SyncPayload | null = null;

interface SyncPayload {
  coins: number;
  gems: number;
  level: number;
  xp: number;
  winStreak: number;
}

/**
 * Debounced sync — gọi sau mỗi lần playerStore thay đổi.
 * Chỉ active khi isOnlineMode === true.
 */
export const debouncedSync = (data: SyncPayload) => {
  const { isOnlineMode, accessToken } = useAuthStore.getState();
  if (!isOnlineMode || !accessToken) {
    // Lưu vào queue để sync khi online
    offlineQueue = data;
    return;
  }

  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    performSync(data, accessToken);
  }, 3000);
};

/**
 * Thực hiện POST sync lên server
 */
const performSync = async (data: SyncPayload, token: string) => {
  try {
    const res = await fetch(`${API_URL}/api/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      console.log('[Sync] ✅ Data synced to server');
      offlineQueue = null;
    } else {
      console.warn('[Sync] ⚠️ Sync failed, will retry');
      offlineQueue = data;
    }
  } catch {
    console.warn('[Sync] ⚠️ Offline — queued for later');
    offlineQueue = data;
  }
};

/**
 * Pull dữ liệu từ server khi mở app (GET /api/sync)
 * Trả về data server để playerStore merge
 */
export const pullServerData = async (): Promise<SyncPayload | null> => {
  const { isOnlineMode, accessToken } = useAuthStore.getState();
  if (!isOnlineMode || !accessToken) return null;

  try {
    const res = await fetch(`${API_URL}/api/sync`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    if (!res.ok) return null;
    const { data } = await res.json();
    return data;
  } catch {
    console.warn('[Sync] ⚠️ Cannot reach server');
    return null;
  }
};

/**
 * Flush offline queue — gọi khi reconnect
 */
export const flushOfflineQueue = async () => {
  const { accessToken } = useAuthStore.getState();
  if (!offlineQueue || !accessToken) return;

  console.log('[Sync] 🔄 Flushing offline queue...');
  await performSync(offlineQueue, accessToken);
};

/**
 * Tự detect online/offline và flush queue
 */
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[Sync] 🌐 Back online — syncing...');
    flushOfflineQueue();
  });
}
