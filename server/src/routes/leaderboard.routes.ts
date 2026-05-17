// leaderboard.routes.ts — Bảng xếp hạng ELO
import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, type AuthRequest } from '../middleware/auth.middleware';

const router = Router();

/**
 * GET /api/leaderboard
 * Top 100 players by ELO (public — không cần auth)
 */
router.get('/', async (_req, res) => {
  try {
    const players = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        avatarEmoji: true,
        elo: true,
        wins: true,
        level: true,
      },
      orderBy: { elo: 'desc' },
      take: 100,
    });

    // Thêm rank
    const ranked = players.map((p: any, i: number) => ({ ...p, rank: i + 1 }));
    return res.json({ data: ranked });
  } catch (err) {
    console.error('[Leaderboard] Error:', err);
    return res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

/**
 * GET /api/leaderboard/around
 * 5 players trên + 5 players dưới rank của mình (cần auth)
 */
router.get('/around', requireAuth, async (req: AuthRequest, res) => {
  try {
    const me = await prisma.user.findUnique({
      where: { supabaseId: req.supabaseUserId! },
      select: { elo: true, id: true },
    });
    if (!me) return res.status(404).json({ error: 'User not found' });

    // Đếm rank hiện tại
    const myRank = await prisma.user.count({ where: { elo: { gt: me.elo } } }) + 1;

    // 5 trên + mình + 5 dưới
    const above = await prisma.user.findMany({
      where: { elo: { gt: me.elo } },
      select: { id: true, username: true, avatarEmoji: true, elo: true, wins: true, level: true },
      orderBy: { elo: 'asc' },
      take: 5,
    });

    const below = await prisma.user.findMany({
      where: { elo: { lt: me.elo }, id: { not: me.id } },
      select: { id: true, username: true, avatarEmoji: true, elo: true, wins: true, level: true },
      orderBy: { elo: 'desc' },
      take: 5,
    });

    const meData = await prisma.user.findUnique({
      where: { id: me.id },
      select: { id: true, username: true, avatarEmoji: true, elo: true, wins: true, level: true },
    });

    const result = [
      ...above.reverse().map((p: any, i: number) => ({ ...p, rank: myRank - above.length + i })),
      { ...meData, rank: myRank, isMe: true },
      ...below.map((p: any, i: number) => ({ ...p, rank: myRank + 1 + i })),
    ];

    return res.json({ data: result, myRank });
  } catch (err) {
    console.error('[Leaderboard] Around error:', err);
    return res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

export default router;
