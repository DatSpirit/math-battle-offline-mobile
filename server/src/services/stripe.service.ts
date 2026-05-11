// services/stripe.service.ts
// Tạo PaymentIntent qua Stripe SDK
// Yêu cầu: STRIPE_SECRET_KEY trong .env

import Stripe from 'stripe';
import { usdToCents } from '../utils/currency';

// ← Chỉ cần STRIPE_SECRET_KEY trong .env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export interface StripeIntentResult {
  clientSecret: string;
  intentId: string;
  amountCents: number;
}

/**
 * Tạo Stripe PaymentIntent.
 * Frontend dùng clientSecret với @stripe/react-stripe-js để confirm thanh toán.
 */
export const createStripeIntent = async (
  amountUsd: number,
  userId: string,
  itemId: string,
): Promise<StripeIntentResult> => {
  const amountCents = usdToCents(amountUsd);

  const intent = await stripe.paymentIntents.create({
    amount:   amountCents,
    currency: 'usd',
    metadata: { userId, itemId }, // truyền vào webhook để phát thưởng
    automatic_payment_methods: { enabled: true },
  });

  if (!intent.client_secret) throw new Error('Stripe: client_secret is null');

  return {
    clientSecret: intent.client_secret,
    intentId:     intent.id,
    amountCents,
  };
};

/** Export stripe instance cho webhook verify */
export { stripe };
