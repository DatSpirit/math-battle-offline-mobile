// services/stripe.service.ts
// Tạo PaymentIntent qua Stripe SDK
// v2: Tạo order trong DB trước khi gọi Stripe + idempotencyKey
// Yêu cầu: STRIPE_SECRET_KEY trong .env

import Stripe from 'stripe';
import { usdToCents } from '../utils/currency';
import { createOrder, updateOrderIntentId } from './order.service';

// ← Chỉ cần STRIPE_SECRET_KEY trong .env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export interface StripeIntentResult {
  clientSecret: string;
  intentId: string;
  orderId: string;
  amountCents: number;
}

/**
 * Tạo Stripe PaymentIntent.
 * 1. Tạo order trong DB (status=PENDING)
 * 2. Tạo Stripe intent với idempotencyKey = orderId
 * 3. Lưu intentId vào DB
 * 4. Trả clientSecret cho frontend
 */
export const createStripeIntent = async (
  amountUsd: number,
  userId: string,
  itemId: string,
): Promise<StripeIntentResult> => {
  // 1. Tạo order trong DB
  const order = await createOrder(userId, itemId, amountUsd, 'stripe');
  const amountCents = usdToCents(amountUsd);

  // 2. Tạo Stripe PaymentIntent với idempotencyKey
  const intent = await stripe.paymentIntents.create(
    {
      amount: amountCents,
      currency: 'usd',
      metadata: {
        userId,
        itemId,
        orderId: order.orderId, // ← lưu orderId để webhook đối soát
      },
      automatic_payment_methods: { enabled: true },
    },
    {
      idempotencyKey: order.orderId, // Stripe tự dedup nếu gọi 2 lần
    },
  );

  if (!intent.client_secret) throw new Error('Stripe: client_secret is null');

  // 3. Lưu intentId vào DB
  await updateOrderIntentId(order.orderId, intent.id);

  return {
    clientSecret: intent.client_secret,
    intentId:     intent.id,
    orderId:      order.orderId,
    amountCents,
  };
};

/** Export stripe instance cho webhook verify */
export { stripe };
