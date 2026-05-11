// services/reward.service.ts
// Phát thưởng sau khi thanh toán thành công
// Hiện tại: log + emit event
// Tương lai: ghi vào DB, cộng gems vào tài khoản user

/**
 * Map itemId → loại phần thưởng
 * Phải khớp với id trong shopData.ts của frontend
 */
const REWARD_MAP: Record<string, { gems?: number; cardPacks?: number; label: string }> = {
  gems_100:  { gems: 100,  label: '100 Gems' },
  gems_500:  { gems: 500,  label: '500 Gems' },
  gems_1200: { gems: 1200, label: '1200 Gems' },
  pack_basic:  { cardPacks: 1, label: 'Basic Pack x1' },
  pack_premium: { cardPacks: 3, label: 'Premium Pack x3' },
};

/**
 * Delivered reward log (replace with DB write in production)
 */
const deliveredOrders = new Set<string>(); // in-memory idempotency (dùng DB khi production)

/**
 * Phát thưởng cho người chơi sau thanh toán thành công.
 * @param userId    - ID người chơi (từ metadata)
 * @param itemId    - ID sản phẩm (từ metadata, khớp shopData.ts)
 * @param orderId   - ID giao dịch (để chống trùng lặp)
 */
export const deliverReward = async (
  userId: string,
  itemId: string,
  orderId?: string,
): Promise<void> => {
  // ─── Idempotency check ───────────────────────────────────────
  const key = `${userId}:${orderId ?? itemId}`;
  if (orderId && deliveredOrders.has(key)) {
    console.warn(`[REWARD] Duplicate webhook ignored: ${key}`);
    return;
  }
  if (orderId) deliveredOrders.add(key);
  // ─────────────────────────────────────────────────────────────

  const reward = REWARD_MAP[itemId];
  if (!reward) {
    console.error(`[REWARD] Unknown itemId: "${itemId}" — no reward delivered`);
    return;
  }

  console.log(`[REWARD] ✅ userId=${userId} received: ${reward.label} (order=${orderId ?? 'n/a'})`);

  // TODO (production): Ghi vào database
  // await db.transactions.insertOne({ userId, itemId, orderId, reward, deliveredAt: new Date() });
  // await db.users.updateOne({ _id: userId }, { $inc: { gems: reward.gems ?? 0 } });

  // TODO (production): Thông báo real-time cho frontend qua WebSocket/SSE
  // realtimeService.notify(userId, { type: 'reward', reward });
};
