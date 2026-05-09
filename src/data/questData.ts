import type { Quest } from '../types/player.types';

export const DAILY_QUESTS: Quest[] = [
  { id: 'd1', type: 'daily', title: 'Chào Buổi Sáng', description: 'Đăng nhập vào game', goal: 1, current: 0, reward: 50, rewardGems: 50, claimed: false, completed: false },
  { id: 'd2', type: 'daily', title: 'Toán Học Cơ Bản', description: 'Giải đúng 10 phép tính', goal: 10, current: 0, reward: 100, rewardGems: 50, claimed: false, completed: false },
  { id: 'd3', type: 'daily', title: 'Chiến Binh Tập Sự', description: 'Thắng 3 trận đấu', goal: 3, current: 0, reward: 150, rewardGems: 50, claimed: false, completed: false },
  { id: 'd4', type: 'daily', title: 'Nhà Thông Thái', description: 'Giải đúng liên tiếp 5 phép tính', goal: 5, current: 0, reward: 200, rewardGems: 50, claimed: false, completed: false },
  { id: 'd5', type: 'daily', title: 'Người Chi Tiêu', description: 'Sử dụng 500 Vàng trong Shop', goal: 500, current: 0, reward: 100, rewardGems: 50, claimed: false, completed: false },
  { id: 'd6', type: 'daily', title: 'Triệu Hồi Sư', description: 'Thực hiện 1 lần triệu hồi', goal: 1, current: 0, reward: 100, rewardGems: 50, claimed: false, completed: false },
  { id: 'd7', type: 'daily', title: 'Thăng Cấp Thẻ Bài', description: 'Nâng cấp thẻ bài 1 lần', goal: 1, current: 0, reward: 120, rewardGems: 50, claimed: false, completed: false },
  { id: 'd8', type: 'daily', title: 'Thợ Săn Phép Tính', description: 'Sử dụng 5 thẻ Nhân hoặc Chia', goal: 5, current: 0, reward: 150, rewardGems: 50, claimed: false, completed: false },
  { id: 'd9', type: 'daily', title: 'Kiên Trì', description: 'Chơi game trong 10 phút', goal: 10, current: 0, reward: 80, rewardGems: 50, claimed: false, completed: false },
  { id: 'd10', type: 'daily', title: 'Chuyên Gia Toán Học', description: 'Thắng 1 trận AI cấp độ Khó', goal: 1, current: 0, reward: 300, rewardGems: 50, claimed: false, completed: false },
];

export const WEEKLY_QUESTS: Quest[] = [
  { id: 'w1', type: 'weekly', title: 'Bậc Thầy Toán Học', description: 'Giải đúng 100 phép tính', goal: 100, current: 0, reward: 1000, rewardGems: 100, claimed: false, completed: false },
  { id: 'w2', type: 'weekly', title: 'Chiến Thần', description: 'Thắng 30 trận đấu', goal: 30, current: 0, reward: 1500, rewardGems: 100, claimed: false, completed: false },
  { id: 'w3', type: 'weekly', title: 'Sưu Tầm Đại Tài', description: 'Sở hữu 5 thẻ bài mới', goal: 5, current: 0, reward: 800, rewardGems: 100, claimed: false, completed: false },
  { id: 'w4', type: 'weekly', title: 'Lễ Thăng Hoa', description: 'Tiến hóa thẻ bài 1 lần', goal: 1, current: 0, reward: 1200, rewardGems: 100, claimed: false, completed: false },
  { id: 'w5', type: 'weekly', title: 'Đại Phú Ông', description: 'Kiếm được 5000 Vàng', goal: 5000, current: 0, reward: 1000, rewardGems: 100, claimed: false, completed: false },
  { id: 'w6', type: 'weekly', title: 'Phá Đảo Chiến Dịch', description: 'Vượt qua 5 màn Campaign', goal: 5, current: 0, reward: 1500, rewardGems: 100, claimed: false, completed: false },
  { id: 'w7', type: 'weekly', title: 'Đại Sư Triệu Hồi', description: 'Triệu hồi 10 lần', goal: 10, current: 0, reward: 2000, rewardGems: 100, claimed: false, completed: false },
  { id: 'w8', type: 'weekly', title: 'Đại Lễ Phép Tính', description: 'Sử dụng 50 thẻ phép tính', goal: 50, current: 0, reward: 1000, rewardGems: 100, claimed: false, completed: false },
  { id: 'w9', type: 'weekly', title: 'Kiên Trì Bền Bỉ', description: 'Đăng nhập đủ 5 ngày', goal: 5, current: 0, reward: 800, rewardGems: 100, claimed: false, completed: false },
  { id: 'w10', type: 'weekly', title: 'Chuỗi Chiến Thắng', description: 'Thắng 5 trận liên tiếp', goal: 5, current: 0, reward: 1200, rewardGems: 100, claimed: false, completed: false },
  { id: 'w11', type: 'weekly', title: 'Bứt Phá Giới Hạn', description: 'Thắng AI cấp độ Khó 3 lần', goal: 3, current: 0, reward: 2000, rewardGems: 100, claimed: false, completed: false },
  { id: 'w12', type: 'weekly', title: 'Sức Mạnh Tuyệt Đối', description: 'Sở hữu thẻ bài cấp 5', goal: 1, current: 0, reward: 1500, rewardGems: 100, claimed: false, completed: false },
  { id: 'w13', type: 'weekly', title: 'Chinh Phục Thử Thách', description: 'Hoàn thành 20 nhiệm vụ ngày', goal: 20, current: 0, reward: 2500, rewardGems: 100, claimed: false, completed: false },
  { id: 'w14', type: 'weekly', title: 'Khách Hàng Thân Thiết', description: 'Mở 10 gói bài Shop', goal: 10, current: 0, reward: 1000, rewardGems: 100, claimed: false, completed: false },
  { id: 'w15', type: 'weekly', title: 'Nhà Khoa Học', description: 'Sử dụng 1000 EXP Bank', goal: 1000, current: 0, reward: 1200, rewardGems: 100, claimed: false, completed: false },
];

export const QUEST_POOL: Quest[] = [...DAILY_QUESTS, ...WEEKLY_QUESTS];
