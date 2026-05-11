// webhooks/stripe.webhook.ts
// Nhận và xác thực webhook từ Stripe
// Quan trọng: route này cần express.raw() (không phải express.json())

import { Request, Response } from 'express';
import Stripe from 'stripe';
import { stripe } from '../services/stripe.service';
import { deliverReward } from '../services/reward.service';

export const handleStripeWebhook = async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    res.status(400).send('Missing stripe-signature header');
    return;
  }

  let event: Stripe.Event;
  try {
    // req.body phải là raw Buffer — xem index.ts (express.raw middleware)
    event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err);
    res.status(400).send('Webhook signature invalid');
    return;
  }

  console.log(`[Stripe Webhook] Event: ${event.type}`);

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const intent = event.data.object as Stripe.PaymentIntent;
      const { userId, itemId } = intent.metadata;

      if (!userId || !itemId) {
        console.error('[Stripe Webhook] Missing metadata:', intent.metadata);
        break;
      }

      await deliverReward(userId, itemId, intent.id);
      console.log(`[Stripe Webhook] ✅ Reward delivered: ${itemId} → ${userId}`);
      break;
    }

    case 'payment_intent.payment_failed': {
      const intent = event.data.object as Stripe.PaymentIntent;
      console.warn(`[Stripe Webhook] Payment failed: ${intent.id}`);
      break;
    }

    default:
      console.log(`[Stripe Webhook] Unhandled event: ${event.type}`);
  }

  // Phải trả 200 để Stripe không retry
  res.json({ received: true });
};
