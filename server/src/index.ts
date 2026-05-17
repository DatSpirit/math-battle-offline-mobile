// index.ts — Entry point Express + Socket.IO server
// Math Battle: Payment + Auth + PvP Backend

import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';

import paymentRoutes from './routes/payment.routes';
import authRoutes    from './routes/auth.routes';
import syncRoutes    from './routes/sync.routes';
import leaderboardRoutes from './routes/leaderboard.routes';
import balanceRoutes from './routes/balance.routes';
import { prisma } from './lib/prisma';
import { handleStripeWebhook } from './webhooks/stripe.webhook';
import { handleMomoWebhook }   from './webhooks/momo.webhook';

// ─── Kiểm tra các biến môi trường bắt buộc ──────────────────────
const REQUIRED_ENV = ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'MOMO_SECRET_KEY', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
const missing = REQUIRED_ENV.filter(k => !process.env[k]);
if (missing.length > 0) {
  console.error('❌ Thiếu biến môi trường trong .env:');
  missing.forEach(k => console.error(`   - ${k}`));
  console.error('\nCopy server/.env.example → server/.env và điền key vào.');
  process.exit(1);
}
// ─────────────────────────────────────────────────────────────────

const app  = express();
const httpServer = createServer(app);
const PORT = parseInt(process.env.PORT || '3001', 10);
const ALLOWED_ORIGIN = process.env.FRONTEND_URL || 'http://localhost:5173';

// ─── Socket.IO (PvP Realtime) ─────────────────────
const io = new SocketServer(httpServer, {
  cors: { origin: ALLOWED_ORIGIN, methods: ['GET', 'POST'] },
});
import { initGameHandler } from './pvp/gameHandler';
initGameHandler(io);

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

// Auth API routes (Sprint 1 — PvP)
app.use('/api/auth', authRoutes);

// Sync API routes (Sprint 2 — Data Sync)
app.use('/api/sync', syncRoutes);

// Leaderboard API routes (Sprint 3)
app.use('/api/leaderboard', leaderboardRoutes);

// Balance API route (Sprint 7)
app.use('/api/balance', balanceRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  });
});

// Global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Server Error]', err);
  res.status(500).json({ error: 'Internal server error' });
});

httpServer.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   Math Battle Server — READY             ║');
  console.log(`║   http://localhost:${PORT}                  ║`);
  console.log('╚══════════════════════════════════════════╝');
  console.log('');
  console.log('REST Endpoints:');
  console.log('  [Payment]  /api/payment/*');
  console.log('  [Auth]     /api/auth/{register|me|profile}');
  console.log('  [Sync]     /api/sync');
  console.log('  [Ranking]  /api/leaderboard{|/around}');
  console.log('  [Balance]  /api/balance');
  console.log('  [Webhooks] /api/webhooks/{stripe|momo}');
  console.log('');
  console.log('Socket.IO Events:');
  console.log('  quick_match → match_found → turn_start → submit_cards → turn_result → game_over');
  console.log('  reconnect_room | disconnect (30s window)');
  console.log('');

  // ─── Room Cleanup Cron (mỗi 1h, xóa room > 2h) ──────────
  setInterval(async () => {
    try {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const result = await prisma.pvpRoom.deleteMany({
        where: {
          status: { in: ['waiting', 'finished'] },
          updatedAt: { lt: twoHoursAgo },
        },
      });
      if (result.count > 0) {
        console.log(`[Cleanup] 🗑️ Deleted ${result.count} stale PvP rooms`);
      }
    } catch (err) {
      console.error('[Cleanup] Error:', err);
    }
  }, 60 * 60 * 1000); // Mỗi 1 giờ
});
