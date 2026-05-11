// routes/payment.routes.ts
// API endpoints thanh toán
// POST /api/payment/stripe/intent  — tạo Stripe PaymentIntent
// POST /api/payment/momo/create    — tạo MoMo order + payUrl

import { Router, Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import { createStripeIntent } from '../services/stripe.service';
import { createMomoPayment }  from '../services/momo.service';

const router = Router();

// Rate limiting: tối đa 10 request thanh toán / phút / IP
const paymentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Quá nhiều yêu cầu, vui lòng thử lại sau.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Validate input helper ───────────────────────────────────────
const validatePaymentBody = (
  req: Request,
  res: Response,
): { amountUsd: number; userId: string; itemId: string } | null => {
  const { amountUsd, userId, itemId } = req.body as {
    amountUsd: unknown;
    userId: unknown;
    itemId: unknown;
  };

  if (typeof amountUsd !== 'number' || amountUsd <= 0 || amountUsd > 1000) {
    res.status(400).json({ error: 'amountUsd không hợp lệ (phải là số > 0 và ≤ 1000)' });
    return null;
  }
  if (typeof userId !== 'string' || userId.trim() === '') {
    res.status(400).json({ error: 'userId không hợp lệ' });
    return null;
  }
  if (typeof itemId !== 'string' || itemId.trim() === '') {
    res.status(400).json({ error: 'itemId không hợp lệ' });
    return null;
  }

  return { amountUsd, userId: userId.trim(), itemId: itemId.trim() };
};
// ─────────────────────────────────────────────────────────────────

/**
 * POST /api/payment/stripe/intent
 * Body: { amountUsd: number, userId: string, itemId: string }
 * Response: { clientSecret: string, intentId: string, amountCents: number }
 */
router.post('/stripe/intent', paymentLimiter, async (req: Request, res: Response) => {
  const params = validatePaymentBody(req, res);
  if (!params) return;

  try {
    const result = await createStripeIntent(params.amountUsd, params.userId, params.itemId);
    res.json(result);
  } catch (err) {
    console.error('[Route] Stripe intent error:', err);
    res.status(500).json({ error: 'Không thể tạo Stripe payment intent' });
  }
});

/**
 * POST /api/payment/momo/create
 * Body: { amountUsd: number, userId: string, itemId: string }
 * Response: { payUrl: string, deeplink?: string, orderId: string }
 */
router.post('/momo/create', paymentLimiter, async (req: Request, res: Response) => {
  const params = validatePaymentBody(req, res);
  if (!params) return;

  try {
    const orderId = `MB_${params.userId}_${Date.now()}`;
    const result  = await createMomoPayment(
      params.amountUsd, orderId, params.userId, params.itemId,
    );
    res.json({
      payUrl:   result.payUrl,
      deeplink: result.deeplink,
      orderId:  result.orderId,
    });
  } catch (err) {
    console.error('[Route] MoMo create error:', err);
    res.status(500).json({ error: 'Không thể tạo MoMo payment' });
  }
});

export default router;
