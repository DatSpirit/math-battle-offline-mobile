// auth.routes.ts — Đăng ký / Đăng nhập / Profile
import { Router } from 'express';
import { requireAuth, type AuthRequest } from '../middleware/auth.middleware';
import { findOrCreateUser, getUserBySupabaseId, updateUserProfile } from '../services/auth.service';

const router = Router();

/**
 * POST /api/auth/register
 * Đăng ký hoặc đăng nhập: tạo User trong DB nếu chưa có
 * Body: { username, avatarEmoji? }
 */
router.post('/register', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { username, avatarEmoji } = req.body;

    if (!username || typeof username !== 'string' || username.trim().length < 2) {
      return res.status(400).json({ error: 'Username phải có ít nhất 2 ký tự' });
    }

    const user = await findOrCreateUser(
      req.supabaseUserId!,
      username.trim(),
      avatarEmoji
    );

    return res.json({ user });
  } catch (err) {
    console.error('[Auth] Register error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/auth/me
 * Lấy profile hiện tại
 */
router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await getUserBySupabaseId(req.supabaseUserId!);
    if (!user) {
      return res.status(404).json({ error: 'User not found. Please register first.' });
    }
    return res.json({ user });
  } catch (err) {
    console.error('[Auth] Get profile error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/auth/profile
 * Cập nhật profile (username, avatar)
 */
router.put('/profile', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { username, avatarEmoji } = req.body;
    const data: { username?: string; avatarEmoji?: string } = {};

    if (username && typeof username === 'string' && username.trim().length >= 2) {
      data.username = username.trim();
    }
    if (avatarEmoji && typeof avatarEmoji === 'string') {
      data.avatarEmoji = avatarEmoji;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const user = await updateUserProfile(req.supabaseUserId!, data);
    return res.json({ user });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'P2002') {
      return res.status(409).json({ error: 'Username đã được sử dụng' });
    }
    console.error('[Auth] Update profile error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
