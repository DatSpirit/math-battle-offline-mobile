// services/order.service.ts
// Quản lý vòng đời Order trong database (Prisma)
// Tạo order trước khi gọi cổng thanh toán → cập nhật sau khi nhận webhook

import { PrismaClient } from '@prisma/client';
import { usdToCents, usdToVnd } from '../utils/currency';

const db = new PrismaClient({});

/**
 * Tạo order mới trước khi gọi cổng thanh toán.
 * Status mặc định = PENDING.
 */
export const createOrder = async (
  userId: string,
  itemId: string,
  amountUsd: number,
  paymentMethod: 'stripe' | 'momo',
) => {
  const orderId = `MB_${userId}_${Date.now()}`;
  return db.order.create({
    data: {
      orderId,
      userId,
      itemId,
      amountUsd,
      amountLocal: paymentMethod === 'stripe'
        ? usdToCents(amountUsd)
        : usdToVnd(amountUsd),
      currency: paymentMethod === 'stripe' ? 'usd' : 'vnd',
      paymentMethod,
      status: 'PENDING',
    },
  });
};

/**
 * Tìm order theo orderId (unique).
 */
export const getOrderByOrderId = (orderId: string) =>
  db.order.findUnique({ where: { orderId } });

/**
 * Đánh dấu order thành công + lưu transId.
 */
export const markOrderSuccess = (orderId: string, transId: string) =>
  db.order.update({
    where: { orderId },
    data: { status: 'SUCCESS', transId },
  });

/**
 * Đánh dấu order thất bại.
 */
export const markOrderFailed = (orderId: string) =>
  db.order.update({
    where: { orderId },
    data: { status: 'FAILED' },
  });

/**
 * Đánh dấu phần thưởng đã phát — chống phát trùng.
 */
export const markRewardDelivered = (orderId: string) =>
  db.order.update({
    where: { orderId },
    data: { rewardDelivered: true },
  });

/**
 * Lưu Stripe intentId vào order (để đối soát).
 */
export const updateOrderIntentId = (orderId: string, intentId: string) =>
  db.order.update({
    where: { orderId },
    data: { intentId },
  });

/** Export db instance cho trường hợp cần query đặc biệt */
export { db };
