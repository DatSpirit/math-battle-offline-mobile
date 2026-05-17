// services/momo.service.ts
// Tạo lệnh thanh toán MoMo qua API v2
// v2: Tạo order trong DB trước + gửi orderId trong extraData
// Yêu cầu: MOMO_SECRET_KEY trong .env

import crypto from 'crypto';
import axios from 'axios';
import { usdToVnd } from '../utils/currency';
import { createOrder } from './order.service';

export interface MomoPaymentResult {
  payUrl: string;       // redirect URL sang app/web MoMo
  deeplink?: string;    // deeplink mở MoMo app trực tiếp
  orderId: string;
  requestId: string;
  resultCode: number;
  message: string;
}

/**
 * Tạo lệnh thanh toán MoMo.
 * 1. Tạo order trong DB (status=PENDING)
 * 2. Ký HMAC-SHA256 bằng MOMO_SECRET_KEY
 * 3. Gọi MoMo API → lấy payUrl
 * Frontend chỉ cần redirect tới payUrl.
 */
export const createMomoPayment = async (
  amountUsd: number,
  userId: string,
  itemId: string,
): Promise<MomoPaymentResult & { orderId: string }> => {
  // 1. Tạo order trong DB
  const order = await createOrder(userId, itemId, amountUsd, 'momo');
  const amount    = usdToVnd(amountUsd);
  const requestId = `${order.orderId}_${Date.now()}`;

  // extraData phải là base64 JSON — gửi kèm orderId để webhook đối soát
  const extraData = Buffer.from(
    JSON.stringify({ userId, itemId, orderId: order.orderId }),
  ).toString('base64');

  const ipnUrl    = `${process.env.FRONTEND_URL}/api/webhooks/momo`;
  const redirectUrl = `${process.env.FRONTEND_URL}/shop/success?orderId=${order.orderId}`;
  const orderInfo = `Math Battle - ${itemId}`;
  const partnerCode = process.env.MOMO_PARTNER_CODE!;
  const accessKey   = process.env.MOMO_ACCESS_KEY!;
  const secretKey   = process.env.MOMO_SECRET_KEY!;
  const requestType = 'payWithMethod';

  // ─── Tạo chữ ký HMAC-SHA256 ───────────────────────────────────
  const rawSignature = [
    `accessKey=${accessKey}`,
    `amount=${amount}`,
    `extraData=${extraData}`,
    `ipnUrl=${ipnUrl}`,
    `orderId=${order.orderId}`,
    `orderInfo=${orderInfo}`,
    `partnerCode=${partnerCode}`,
    `redirectUrl=${redirectUrl}`,
    `requestId=${requestId}`,
    `requestType=${requestType}`,
  ].join('&');

  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(rawSignature)
    .digest('hex');
  // ─────────────────────────────────────────────────────────────

  const { data } = await axios.post<MomoPaymentResult>(
    `${process.env.MOMO_ENDPOINT}/v2/gateway/api/create`,
    {
      partnerCode,
      requestId,
      orderId: order.orderId,
      amount,
      orderInfo,
      redirectUrl,
      ipnUrl,
      requestType,
      extraData,
      lang: 'vi',
      signature,
    },
    { headers: { 'Content-Type': 'application/json' } },
  );

  if (data.resultCode !== 0) {
    throw new Error(`MoMo error ${data.resultCode}: ${data.message}`);
  }

  return {
    ...data,
    orderId: order.orderId,
    requestId,
  };
};
