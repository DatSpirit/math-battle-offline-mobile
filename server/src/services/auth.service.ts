// auth.service.ts — Quản lý đăng ký/đăng nhập User trong Prisma DB
import { prisma } from '../lib/prisma';

/**
 * Tìm hoặc tạo User dựa trên Supabase Auth ID.
 * Gọi khi user đăng nhập lần đầu hoặc mỗi lần mở app.
 */
export const findOrCreateUser = async (supabaseId: string, username: string, avatarEmoji?: string) => {
  // Kiểm tra user đã tồn tại chưa
  const existing = await prisma.user.findUnique({ where: { supabaseId } });
  if (existing) return existing;

  // Kiểm tra username trùng
  const nameTaken = await prisma.user.findUnique({ where: { username } });
  if (nameTaken) {
    // Thêm suffix ngẫu nhiên nếu trùng
    username = `${username}_${Math.random().toString(36).slice(2, 6)}`;
  }

  return prisma.user.create({
    data: {
      supabaseId,
      username,
      avatarEmoji: avatarEmoji || '🐼',
    },
  });
};

/**
 * Lấy profile User bằng supabaseId
 */
export const getUserBySupabaseId = async (supabaseId: string) => {
  return prisma.user.findUnique({ where: { supabaseId } });
};

/**
 * Cập nhật profile User
 */
export const updateUserProfile = async (supabaseId: string, data: { username?: string; avatarEmoji?: string }) => {
  return prisma.user.update({
    where: { supabaseId },
    data,
  });
};

/**
 * Lấy profile User bằng internal ID
 */
export const getUserById = async (id: string) => {
  return prisma.user.findUnique({ where: { id } });
};
