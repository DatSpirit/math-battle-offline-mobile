import type { Achievement } from '../types/player.types';

export const ACHIEVEMENTS_DATA: Achievement[] = [
  // ── Combat ──
  {
    id: 'first_blood',   title: 'Chiến Thắng Đầu Tiên',  emoji: '⚔️',
    description: 'Thắng trận đầu tiên trong sự nghiệp.',
    category: 'combat',  rarity: 'bronze',  goal: 1,  progress: 0, isUnlocked: false, reward: 500,
  },
  {
    id: 'win_5',         title: 'Chiến Binh Đang Lên',    emoji: '🏅',
    description: 'Thắng 5 trận tổng cộng.',
    category: 'combat',  rarity: 'bronze',  goal: 5,  progress: 0, isUnlocked: false, reward: 1000,
  },
  {
    id: 'win_20',        title: 'Dũng Sĩ Toán Học',       emoji: '🥈',
    description: 'Thắng 20 trận tổng cộng.',
    category: 'combat',  rarity: 'silver',  goal: 20, progress: 0, isUnlocked: false, reward: 3000,
  },
  {
    id: 'win_50',        title: 'Huyền Thoại Số Học',      emoji: '🏆',
    description: 'Thắng 50 trận tổng cộng.',
    category: 'combat',  rarity: 'gold',   goal: 50, progress: 0, isUnlocked: false, reward: 8000,
  },
  {
    id: 'streak_3',      title: 'Chuỗi Không Dừng',        emoji: '🔥',
    description: 'Thắng 3 trận liên tiếp.',
    category: 'combat',  rarity: 'bronze',  goal: 3,  progress: 0, isUnlocked: false, reward: 1500,
  },
  {
    id: 'streak_5',      title: 'Bất Khả Chiến Bại',       emoji: '💥',
    description: 'Thắng 5 trận liên tiếp.',
    category: 'combat',  rarity: 'silver',  goal: 5,  progress: 0, isUnlocked: false, reward: 4000,
  },

  // ── Collection ──
  {
    id: 'first_pack',    title: 'Nhà Sưu Tập Tập Sự',     emoji: '🎁',
    description: 'Mở gói bài đầu tiên.',
    category: 'collection', rarity: 'bronze', goal: 1, progress: 0, isUnlocked: false, reward: 500,
  },
  {
    id: 'pack_5',        title: 'Bậc Thầy Gacha',          emoji: '🎰',
    description: 'Mở 5 gói bài trong cửa hàng.',
    category: 'collection', rarity: 'silver', goal: 5, progress: 0, isUnlocked: false, reward: 2500,
  },
  {
    id: 'first_super',   title: 'Thẻ Huyền Thoại',         emoji: '💎',
    description: 'Sở hữu thẻ bài Siêu Cấp đầu tiên.',
    category: 'collection', rarity: 'gold',  goal: 1, progress: 0, isUnlocked: false, reward: 5000,
  },
  {
    id: 'cards_20',      title: 'Thư Viện Toán Học',        emoji: '📚',
    description: 'Sở hữu 20 loại thẻ khác nhau trong bộ sưu tập.',
    category: 'collection', rarity: 'silver', goal: 20, progress: 0, isUnlocked: false, reward: 3000,
  },

  // ── Mastery (Cấp độ tài khoản) ──
  {
    id: 'level_5',       title: 'Học Viên Siêng Năng',        emoji: '📖',
    description: 'Đạt cấp độ 5.',
    category: 'mastery', rarity: 'bronze',  goal: 5,  progress: 0, isUnlocked: false, reward: 1500,
  },
  {
    id: 'level_10',      title: 'Thủ Lĩnh Khoa Học',          emoji: '🔬',
    description: 'Đạt cấp độ 10.',
    category: 'mastery', rarity: 'silver',  goal: 10, progress: 0, isUnlocked: false, reward: 4000,
  },

  // ── Economy ──
  {
    id: 'coins_10000',   title: 'Đại Thương Gia',             emoji: '💰',
    description: 'Tích lũy 10,000 Vàng.',
    category: 'economy', rarity: 'silver',  goal: 10000, progress: 0, isUnlocked: false, reward: 1000,
  },
  {
    id: 'coins_50000',   title: 'Triệu Phú Toán Học',         emoji: '💎',
    description: 'Tích lũy 50,000 Vàng.',
    category: 'economy', rarity: 'gold',    goal: 50000, progress: 0, isUnlocked: false, reward: 5000,
  },
  {
    id: 'first_gem',     title: 'Đá Quý Đầu Tiên',            emoji: '💎',
    description: 'Sở hữu viên Kim Cương đầu tiên.',
    category: 'economy', rarity: 'bronze',  goal: 1,     progress: 0, isUnlocked: false, reward: 500,
  },

  // ── Epic Milestones ──
  {
    id: 'win_100',       title: 'Vua Chiến Trận',             emoji: '👑',
    description: 'Thắng 100 trận tổng cộng.',
    category: 'combat',  rarity: 'gold',    goal: 100, progress: 0, isUnlocked: false, reward: 15000,
  },
  {
    id: 'streak_10',     title: 'Thần Thánh',                emoji: '⚡',
    description: 'Thắng 10 trận liên tiếp.',
    category: 'combat',  rarity: 'gold',    goal: 10,  progress: 0, isUnlocked: false, reward: 10000,
  },
  {
    id: 'level_20',      title: 'Giáo Sư Ưu Tú',              emoji: '🎓',
    description: 'Đạt cấp độ 20.',
    category: 'mastery', rarity: 'gold',    goal: 20,  progress: 0, isUnlocked: false, reward: 10000,
  },
  {
    id: 'level_50',      title: 'Đại Hiền Triết',             emoji: '🧙',
    description: 'Đạt cấp độ 50.',
    category: 'mastery', rarity: 'gold',    goal: 50,  progress: 0, isUnlocked: false, reward: 50000,
  }
];

/**
 * Định nghĩa các cột mốc thông thạo cho từng lá bài (Card Mastery Milestones).
 * Hệ thống này được dùng chung cho cả bản Desktop và Mobile.
 */
export const MASTERY_MILESTONES = [
  { level: 1, requirement: 10,  rewards: { coins: 1000,  gems: 10 } },
  { level: 2, requirement: 20,  rewards: { coins: 2500,  gems: 25 } },
  { level: 3, requirement: 50,  rewards: { coins: 7500,  gems: 75 } },
  { level: 4, requirement: 100, rewards: { coins: 20000, gems: 200 } },
  { level: 5, requirement: 200, rewards: { coins: 50000, gems: 500 } },
];
