// index.ts — Entry point Express server
// Math Battle Payment Backend

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import paymentRoutes from './routes/payment.routes';
import { handleStripeWebhook } from './webhooks/stripe.webhook';
import { handleMomoWebhook }   from './webhooks/momo.webhook';

// ─── Kiểm tra các biến môi trường bắt buộc ──────────────────────
const REQUIRED_ENV = ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'MOMO_SECRET_KEY'];
const missing = REQUIRED_ENV.filter(k => !process.env[k]);
if (missing.length > 0) {
  console.error('❌ Thiếu biến môi trường trong .env:');
  missing.forEach(k => console.error(`   - ${k}`));
  console.error('\nCopy server/.env.example → server/.env và điền key vào.');
  process.exit(1);
}
// ─────────────────────────────────────────────────────────────────

const app  = express();
const PORT = parseInt(process.env.PORT || '3001', 10);
const ALLOWED_ORIGIN = process.env.FRONTEND_URL || 'http://localhost:5173';

// ══════════════════════════════════════════════════════════════════
//   QUAN TRỌNG: Stripe webhook phải dùng raw body (express.raw)
//   Phải đặt TRƯỚC express.json()
// ══════════════════════════════════════════════════════════════════
app.post(
  '/api/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook,
);

// ─── Global Middleware ───────────────────────────────────────────
app.use(helmet());                                // HTTP security headers
app.use(cors({ origin: ALLOWED_ORIGIN }));        // Chỉ cho phép frontend URL
app.use(express.json({ limit: '1mb' }));          // Parse JSON body
// ─────────────────────────────────────────────────────────────────

// MoMo webhook — JSON bình thường (sau express.json())
app.post('/api/webhooks/momo', handleMomoWebhook);

// Payment API routes
app.use('/api/payment', paymentRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Server Error]', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log('');
  console.log('╔═══════════════════════════════════════╗');
  console.log('║   Math Battle Payment Server — READY  ║');
  console.log(`║   http://localhost:${PORT}               ║`);
  console.log('╚═══════════════════════════════════════╝');
  console.log('');
  console.log('Endpoints:');
  console.log(`  POST /api/payment/stripe/intent`);
  console.log(`  POST /api/payment/momo/create`);
  console.log(`  POST /api/webhooks/stripe`);
  console.log(`  POST /api/webhooks/momo`);
  console.log(`  GET  /health`);
  console.log('');
  console.log('Dev tip: Run Stripe webhook forward:');
  console.log(`  stripe listen --forward-to localhost:${PORT}/api/webhooks/stripe`);
  console.log('');
});
