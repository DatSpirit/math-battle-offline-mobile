import type { ShopItem } from '../types/shop.types';

export const SHOP_PRODUCTS: ShopItem[] = [
  // ─── SPECIAL OFFERS ────────────────────────────────────────────────────────
  { 
    id: 'gems_limited_100k', name: 'Rương Báu Vĩnh Cửu', description: 'Gói ưu đãi lớn cho nhà sưu tầm', 
    price: 100000, originalPrice: 300000, currency: 'cash', rewardType: 'gems', rewardValue: 10000,
    priceUsd: 4.00,
    color: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)', icon: 'gem', tag: 'KHUYÊN DÙNG', dailyLimit: 3
  },
  { 
    id: 'gems_limited_daily', name: 'Siêu Cấp Giới Hạn', description: 'Ưu đãi cực khủng, reset mỗi ngày', 
    price: 20000, originalPrice: 50000, currency: 'cash', rewardType: 'gems', rewardValue: 1500,
    priceUsd: 0.80,
    color: 'linear-gradient(135deg, #f43f5e 0%, #9f1239 100%)', icon: 'gem', tag: 'SIÊU CẤP', dailyLimit: 3
  },
  { 
    id: 'gems_limited_500k', name: 'Di Sản Đế Vương', description: 'Sức mạnh tuyệt đối, giá trị tối thượng', 
    price: 500000, originalPrice: 1500000, currency: 'cash', rewardType: 'gems', rewardValue: 75000,
    priceUsd: 20.00,
    color: 'linear-gradient(135deg, #facc15 0%, #ca8a04 100%)', icon: 'gem', tag: 'MAX VALUE', dailyLimit: 3
  },

  // ─── DIAMOND PACKAGES (VND → Gems) ───────────────────────────────────────
  { 
    id: 'gems_1', name: 'Gói Khởi Đầu', description: 'Gói cơ bản cho tân thủ', 
    price: 10000, currency: 'cash', rewardType: 'gems', rewardValue: 200,
    priceUsd: 0.40,
    color: 'linear-gradient(135deg, #94a3b8 0%, #475569 100%)', icon: 'gem' 
  },
  { 
    id: 'gems_2', name: 'Gói Phổ Thông', description: 'Thêm 25% giá trị (+100)', 
    price: 20000, currency: 'cash', rewardType: 'gems', rewardValue: 500,
    priceUsd: 0.80,
    color: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)', icon: 'gem', tag: 'HỜI NHẤT'
  },
  { 
    id: 'gems_3', name: 'Túi Kim Cương', description: 'Thêm 50% giá trị (+500)', 
    price: 50000, currency: 'cash', rewardType: 'gems', rewardValue: 1500,
    priceUsd: 2.00,
    color: 'linear-gradient(135deg, #34d399 0%, #059669 100%)', icon: 'gem' 
  },
  { 
    id: 'gems_4', name: 'Rương Thợ Mỏ', description: 'Thêm 75% giá trị (+1500)', 
    price: 100000, currency: 'cash', rewardType: 'gems', rewardValue: 3500,
    priceUsd: 4.00,
    color: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)', icon: 'gem', tag: 'PHỔ BIẾN'
  },
  { 
    id: 'gems_5', name: 'Hũ Kim Cương', description: 'Gấp đôi giá trị cơ bản!', 
    price: 200000, currency: 'cash', rewardType: 'gems', rewardValue: 8000,
    priceUsd: 8.00,
    color: 'linear-gradient(135deg, #f472b6 0%, #db2777 100%)', icon: 'gem' 
  },
  { 
    id: 'gems_6', name: 'Kho Báu Hoàng Gia', description: 'Bonus cực khủng (+10000)', 
    price: 500000, currency: 'cash', rewardType: 'gems', rewardValue: 25000,
    priceUsd: 20.00,
    color: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', icon: 'gem', tag: 'VALUE!'
  },
  { 
    id: 'gems_7', name: 'Di Sản Đại Sư', description: 'Đặc quyền cho cao thủ', 
    price: 1000000, currency: 'cash', rewardType: 'gems', rewardValue: 60000,
    priceUsd: 40.00,
    color: 'linear-gradient(135deg, #f87171 0%, #dc2626 100%)', icon: 'gem' 
  },
  { 
    id: 'gems_8', name: 'Thánh Tích Thư Viện', description: 'Nguồn năng lượng vô tận', 
    price: 2000000, currency: 'cash', rewardType: 'gems', rewardValue: 150000,
    priceUsd: 80.00,
    color: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)', icon: 'gem' 
  },
  { 
    id: 'gems_9', name: 'Bí Thuật Thần Thánh', description: 'Gần như vô hạn', 
    price: 5000000, currency: 'cash', rewardType: 'gems', rewardValue: 500000,
    priceUsd: 200.00,
    color: 'linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)', icon: 'gem', tag: 'DIVINE'
  },
  { 
    id: 'gems_10', name: 'Vương Miện Hoàng Đế', description: 'Chúa tể đấu trường', 
    price: 10000000, currency: 'cash', rewardType: 'gems', rewardValue: 1200000,
    priceUsd: 400.00,
    color: 'linear-gradient(135deg, #facc15 0%, #ca8a04 100%)', icon: 'gem', tag: 'EMPEROR'
  },

  // ─── GOLD PACKAGES (Gems → Coins) ────────────────────────────────────────
  { 
    id: 'coins_1', name: 'Ít Vàng Lẻ', description: 'Vừa đủ mua 1 quyển sách', 
    price: 20, currency: 'gems', rewardType: 'coins', rewardValue: 2000, 
    color: 'linear-gradient(135deg, #d1d5db 0%, #6b7280 100%)', icon: 'coin' 
  },
  { 
    id: 'coins_2', name: 'Túi Vàng Nhỏ', description: 'Thêm 25% vàng (+500)', 
    price: 50, currency: 'gems', rewardType: 'coins', rewardValue: 6250, 
    color: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', icon: 'coin' 
  },
  { 
    id: 'coins_3', name: 'Thỏi Vàng Đúc', description: 'Thêm 50% vàng (+5000)', 
    price: 100, currency: 'gems', rewardType: 'coins', rewardValue: 15000, 
    color: 'linear-gradient(135deg, #fcd34d 0%, #b45309 100%)', icon: 'coin' 
  },
  { 
    id: 'coins_4', name: 'Rương Vàng Đầy', description: 'Gấp đôi giá trị lẻ!', 
    price: 200, currency: 'gems', rewardType: 'coins', rewardValue: 40000, 
    color: 'linear-gradient(135deg, #fde68a 0%, #92400e 100%)', icon: 'coin', tag: 'PHỔ BIẾN'
  },
  { 
    id: 'coins_5', name: 'Xe Chở Vàng', description: 'Ưu đãi lớn cho nhà đầu tư', 
    price: 500, currency: 'gems', rewardType: 'coins', rewardValue: 125000, 
    color: 'linear-gradient(135deg, #a78bfa 0%, #6d28d9 100%)', icon: 'coin' 
  },
  { 
    id: 'coins_6', name: 'Kho Vàng Thư Viện', description: 'Nâng cấp toàn bộ bộ bài', 
    price: 1000, currency: 'gems', rewardType: 'coins', rewardValue: 300000, 
    color: 'linear-gradient(135deg, #f472b6 0%, #db2777 100%)', icon: 'coin', tag: 'VALUE'
  },
  { 
    id: 'coins_7', name: 'Mỏ Vàng Bất Tận', description: 'Không bao giờ lo thiếu hụt', 
    price: 2500, currency: 'gems', rewardType: 'coins', rewardValue: 850000, 
    color: 'linear-gradient(135deg, #34d399 0%, #059669 100%)', icon: 'coin' 
  },
  { 
    id: 'coins_8', name: 'Gia Sản Tỉ Phú', description: 'Sở hữu mọi cuốn sách', 
    price: 5000, currency: 'gems', rewardType: 'coins', rewardValue: 2000000, 
    color: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)', icon: 'coin' 
  },
  { 
    id: 'coins_9', name: 'Kho Tàng Math Battle', description: 'Vàng tràn ngập đấu trường', 
    price: 10000, currency: 'gems', rewardType: 'coins', rewardValue: 5000000, 
    color: 'linear-gradient(135deg, #facc15 0%, #854d0e 100%)', icon: 'coin', tag: 'RICH!'
  },
  { 
    id: 'coins_10', name: 'Huyền Thoại Phục Hưng', description: 'Khai sinh thời đại mới', 
    price: 25000, currency: 'gems', rewardType: 'coins', rewardValue: 15000000, 
    color: 'linear-gradient(135deg, #1e293b 0%, #000000 100%)', icon: 'coin', tag: 'MYTHIC'
  },
];
