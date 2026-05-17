// sync.routes.ts — API đồng bộ dữ liệu Offline ↔ Server
import { Router } from 'express';
import { requireAuth, type AuthRequest } from '../middleware/auth.middleware';
import { syncUserData, getServerData } from '../services/sync.service';

const router = Router();

/**
 * GET /api/sync
 * Lấy dữ liệu từ server để client merge khi mở app
 */
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const data = await getServerData(req.supabaseUserId!);
    if (!data) return res.status(404).json({ error: 'User not found' });
    return res.json({ data });
  } catch (err) {
    console.error('[Sync] Get error:', err);
    return res.status(500).json({ error: 'Sync failed' });
  }
});

/**
 * POST /api/sync
 * Client gửi dữ liệu local → server merge an toàn
 * Body: { coins, gems, level, xp, winStreak }
 */
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { coins, gems, level, xp, winStreak } = req.body;

    // Validate cơ bản
    if (typeof coins !== 'number' || typeof gems !== 'number') {
      return res.status(400).json({ error: 'Invalid sync payload' });
    }

    const merged = await syncUserData(req.supabaseUserId!, {
      coins: Math.max(0, coins),
      gems: Math.max(0, gems),
      level: Math.max(1, level || 1),
      xp: Math.max(0, xp || 0),
      winStreak: Math.max(0, winStreak || 0),
    });

    if (!merged) return res.status(404).json({ error: 'User not found' });
    return res.json({ data: merged });
  } catch (err) {
    console.error('[Sync] Post error:', err);
    return res.status(500).json({ error: 'Sync failed' });
  }
});

export default router;
