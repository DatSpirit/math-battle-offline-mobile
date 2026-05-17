// webhooks/momo.webhook.ts
// Nhận và xác thực IPN (Instant Payment Notification) từ MoMo
// v2: Thứ tự field CHÍNH XÁC theo tài liệu MoMo IPN v2
//     + truyền orderId/transId cho idempotency qua DB
// MoMo gọi POST tới ipnUrl sau khi thanh toán hoàn tất

import crypto from 'crypto';
import { Request, Response } from 'express';
import { deliverReward } from '../services/reward.service';

interface MomoIpnBody {
  partnerCode:  string;
  orderId:      string;
  requestId:    string;
  amount:       number;
  orderInfo:    string;
  orderType:    string;
  transId:      number;
  resultCode:   number;
  message:      string;
  payType:      string;
  responseTime: number;
  extraData:    string;
  signature:    string;
}

export const handleMomoWebhook = async (req: Request, res: Response): Promise<void> => {
  const body = req.body as MomoIpnBody;

  // ─── Xác thực chữ ký HMAC-SHA256 ────────────────────────────
  // v2: Thứ tự field CHÍNH XÁC theo tài liệu MoMo IPN v2
  // KHÔNG dùng Object.keys().sort() — MoMo yêu cầu thứ tự cố định
  const rawSignature = [
    `accessKey=${process.env.MOMO_ACCESS_KEY}`,
    `amount=${body.amount}`,
    `extraData=${body.extraData}`,
    `message=${body.message}`,
    `orderId=${body.orderId}`,
    `orderInfo=${body.orderInfo}`,
    `orderType=${body.orderType}`,
    `partnerCode=${body.partnerCode}`,
    `payType=${body.payType}`,
    `requestId=${body.requestId}`,
    `responseTime=${body.responseTime}`,
    `resultCode=${body.resultCode}`,
    `transId=${body.transId}`,
  ].join('&');

  const expected = crypto
    .createHmac('sha256', process.env.MOMO_SECRET_KEY!)
    .update(rawSignature)
    .digest('hex');

  if (body.signature !== expected) {
    console.error('[MoMo Webhook] Invalid signature');
    console.error('  Expected:', expected);
    console.error('  Received:', body.signature);
    res.status(400).json({ message: 'Invalid signature' });
    return;
  }
  // ─────────────────────────────────────────────────────────────

  console.log(`[MoMo Webhook] orderId=${body.orderId} resultCode=${body.resultCode}`);

  if (body.resultCode === 0) {
    // resultCode 0 = thanh toán thành công
    try {
      const { userId, itemId, orderId } = JSON.parse(
        Buffer.from(body.extraData, 'base64').toString('utf-8'),
      ) as { userId: string; itemId: string; orderId: string };

      // v2: truyền orderId + transId cho idempotency qua DB
      await deliverReward(userId, itemId, orderId, String(body.transId));
      console.log(`[MoMo Webhook] ✅ Reward delivered: ${itemId} → ${userId} (order=${orderId})`);
    } catch (err) {
      console.error('[MoMo Webhook] Failed to parse extraData:', err);
    }
  } else {
    console.warn(`[MoMo Webhook] Payment not successful: code=${body.resultCode}`);
  }

  // MoMo bắt buộc response 200 với body { message: 'ok' } trong vòng 5s
  res.status(200).json({ message: 'ok' });
};
