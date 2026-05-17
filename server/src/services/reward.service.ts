// services/reward.service.ts
// Phát thưởng sau khi thanh toán thành công
// v2: Idempotency qua database thay vì in-memory Set

import {
  getOrderByOrderId,
  markOrderSuccess,
  markRewardDelivered,
} from './order.service';

/**
 * Map itemId → loại phần thưởng
 * Phải khớp với id trong shopData.ts của frontend
 */
const REWARD_MAP: Record<string, { gems?: number; coins?: number; cardPacks?: number; label: string }> = {
  // ─── Special Offers ──────────────────────
  gems_limited_100k:  { gems: 10000,   label: '10,000 Gems (Rương Báu Vĩnh Cửu)' },
  gems_limited_daily: { gems: 1500,    label: '1,500 Gems (Siêu Cấp Giới Hạn)' },
  gems_limited_500k:  { gems: 75000,   label: '75,000 Gems (Di Sản Đế Vương)' },
  // ─── Diamond Packages ────────────────────
  gems_1:   { gems: 200,     label: '200 Gems' },
  gems_2:   { gems: 500,     label: '500 Gems' },
  gems_3:   { gems: 1500,    label: '1,500 Gems' },
  gems_4:   { gems: 3500,    label: '3,500 Gems' },
  gems_5:   { gems: 8000,    label: '8,000 Gems' },
  gems_6:   { gems: 25000,   label: '25,000 Gems' },
  gems_7:   { gems: 60000,   label: '60,000 Gems' },
  gems_8:   { gems: 150000,  label: '150,000 Gems' },
  gems_9:   { gems: 500000,  label: '500,000 Gems' },
  gems_10:  { gems: 1200000, label: '1,200,000 Gems' },
  // ─── Gold Packages (dùng gems mua, không qua payment gateway) ─
  // coins_1..coins_10: xử lý ở frontend, không cần ở đây
};

/**
 * Phát thưởng cho người chơi sau thanh toán thành công.
 * Idempotency: check DB → nếu đã phát thì bỏ qua.
 *
 * @param userId    - ID người chơi (từ webhook metadata)
 * @param itemId    - ID sản phẩm (khớp shopData.ts)
 * @param orderId   - ID giao dịch (để đối soát + chống trùng)
 * @param transId   - Transaction ID từ cổng thanh toán
 */
export const deliverReward = async (
  userId: string,
  itemId: string,
  orderId: string,
  transId: string,
): Promise<void> => {
  // ─── Kiểm tra order trong DB ──────────────────────────────────
  const order = await getOrderByOrderId(orderId);

  if (!order) {
    console.error(`[REWARD] Order không tồn tại: ${orderId}`);
    return;
  }

  // Idempotency: đã phát rồi thì bỏ qua
  if (order.rewardDelivered) {
    console.warn(`[REWARD] Duplicate webhook ignored: orderId=${orderId}`);
    return;
  }
  // ──────────────────────────────────────────────────────────────

  // Update order thành SUCCESS
  await markOrderSuccess(orderId, transId);

  const reward = REWARD_MAP[itemId];
  if (!reward) {
    console.error(`[REWARD] Unknown itemId: "${itemId}" — no reward delivered`);
    return;
  }

  console.log(`[REWARD] ✅ userId=${userId} received: ${reward.label} (order=${orderId})`);

  // TODO (production): Ghi vào database game để cộng gems/coins cho userId
  // await gameDb.users.updateOne({ _id: userId }, { $inc: { gems: reward.gems ?? 0 } });

  // TODO (production): Thông báo real-time cho frontend qua WebSocket/SSE
  // realtimeService.notify(userId, { type: 'reward', reward });

  // Đánh dấu đã phát — tránh webhook gọi lại 2 lần
  await markRewardDelivered(orderId);
};
