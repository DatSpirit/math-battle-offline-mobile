// webhooks/momo.webhook.ts
// Nhận và xác thực IPN (Instant Payment Notification) từ MoMo
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
  const { signature, extraData, resultCode, orderId, ...fields } = body;

  // ─── Xác thực chữ ký HMAC-SHA256 ────────────────────────────
  // MoMo ký theo thứ tự alphabet của các field (trừ signature và extraData)
  const rawSignature = Object.keys(fields)
    .sort()
    .map(k => `${k}=${(fields as Record<string, unknown>)[k]}`)
    .join('&');

  const expected = crypto
    .createHmac('sha256', process.env.MOMO_SECRET_KEY!)
    .update(rawSignature)
    .digest('hex');

  if (signature !== expected) {
    console.error('[MoMo Webhook] Invalid signature');
    console.error('  Expected:', expected);
    console.error('  Received:', signature);
    res.status(400).json({ message: 'Invalid signature' });
    return;
  }
  // ─────────────────────────────────────────────────────────────

  console.log(`[MoMo Webhook] orderId=${orderId} resultCode=${resultCode}`);

  if (resultCode === 0) {
    // resultCode 0 = thanh toán thành công
    try {
      const { userId, itemId } = JSON.parse(
        Buffer.from(extraData, 'base64').toString('utf-8'),
      ) as { userId: string; itemId: string };

      await deliverReward(userId, itemId, orderId);
      console.log(`[MoMo Webhook] ✅ Reward delivered: ${itemId} → ${userId}`);
    } catch (err) {
      console.error('[MoMo Webhook] Failed to parse extraData:', err);
    }
  } else {
    console.warn(`[MoMo Webhook] Payment not successful: code=${resultCode}`);
  }

  // MoMo yêu cầu backend trả về 200 với body { message: 'ok' }
  res.status(200).json({ message: 'ok' });
};
