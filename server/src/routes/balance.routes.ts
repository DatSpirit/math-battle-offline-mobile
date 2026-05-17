// balance.routes.ts — User balance API
// Sprint 7: Xem gems/coins balance từ server

import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, type AuthRequest } from '../middleware/auth.middleware';

const router = Router();

/**
 * GET /api/balance
 * Lấy balance gems/coins từ server (cần auth)
 */
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { supabaseId: req.supabaseUserId! },
      select: {
        id: true,
        gems: true,
        coins: true,
        elo: true,
        level: true,
        xp: true,
        wins: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ balance: user });
  } catch (err) {
    console.error('[Balance] Error:', err);
    return res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

export default router;
