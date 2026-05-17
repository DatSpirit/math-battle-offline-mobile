// routes/payment.routes.ts
// API endpoints thanh toán
// v2: Zod validation + order status polling endpoint
// POST /api/payment/stripe/intent  — tạo Stripe PaymentIntent
// POST /api/payment/momo/create    — tạo MoMo order + payUrl
// GET  /api/payment/order/:orderId — poll order status (frontend dùng)

import { Router, Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import { createStripeIntent } from '../services/stripe.service';
import { createMomoPayment }  from '../services/momo.service';
import { getOrderByOrderId }  from '../services/order.service';

const router = Router();

// Rate limiting: tối đa 10 request thanh toán / phút / IP
const paymentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Quá nhiều yêu cầu, vui lòng thử lại sau.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Zod Schema — thay thế manual validation ────────────────────
const CreatePaymentSchema = z.object({
  amountUsd: z.number().positive().max(500), // giới hạn max $500
  userId:    z.string().min(1),
  itemId:    z.string().min(1),
});
// ─────────────────────────────────────────────────────────────────

/**
 * POST /api/payment/stripe/intent
 * Body: { amountUsd: number, userId: string, itemId: string }
 * Response: { clientSecret: string, intentId: string, orderId: string, amountCents: number }
 */
router.post('/stripe/intent', paymentLimiter, async (req: Request, res: Response) => {
  const parsed = CreatePaymentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues });
    return;
  }

  try {
    const result = await createStripeIntent(
      parsed.data.amountUsd,
      parsed.data.userId,
      parsed.data.itemId,
    );
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
  const parsed = CreatePaymentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues });
    return;
  }

  try {
    const result = await createMomoPayment(
      parsed.data.amountUsd,
      parsed.data.userId,
      parsed.data.itemId,
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

/**
 * GET /api/payment/order/:orderId
 * Frontend poll sau khi redirect về — kiểm tra trạng thái đơn hàng
 * Response: { status: 'PENDING' | 'SUCCESS' | 'FAILED', rewardDelivered: boolean }
 */
router.get('/order/:orderId', async (req: Request, res: Response) => {
  try {
    const order = await getOrderByOrderId(req.params.orderId);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    res.json({
      status: order.status,
      rewardDelivered: order.rewardDelivered,
    });
  } catch (err) {
    console.error('[Route] Order status error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
