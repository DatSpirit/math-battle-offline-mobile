import type { Rarity } from '../types/game';

export interface ResonanceCombo {
  id: string;
  name: string;
  description: string;
  requiredCards: string[]; // Values like '1', '2', '+', etc.
  requiredRarity?: Rarity;
  minRarity?: Rarity; // Supports "at least" this rarity
  category: 'energy' | 'collection';
  difficulty: 'normal' | 'hard' | 'very_hard';
  rewards: {
    coins: number;
    gems: number;
  };
}

export const RESONANCE_COMBOS: ResonanceCombo[] = [
  // ==========================================
  // --- NĂNG LƯỢNG (ENERGY - 15 Combos) ---
  // ==========================================
  
  // LV1: Cơ bản (Normal - Yêu cầu Rare trở lên)
  {
    id: 'e1_odd_trio',
    name: 'Lẻ Sơ Cấp',
    description: 'Sở hữu bộ ba số lẻ cơ bản (1, 3, 5) phẩm chất Rare trở lên',
    requiredCards: ['1', '3', '5'],
    minRarity: 'rare',
    category: 'energy',
    difficulty: 'normal',
    rewards: { coins: 5000, gems: 50 }
  },
  {
    id: 'e2_even_trio',
    name: 'Chẵn Sơ Cấp',
    description: 'Sở hữu bộ ba số chẵn cơ bản (2, 4, 6) phẩm chất Rare trở lên',
    requiredCards: ['2', '4', '6'],
    minRarity: 'rare',
    category: 'energy',
    difficulty: 'normal',
    rewards: { coins: 5000, gems: 50 }
  },
  {
    id: 'e3_low_stretch',
    name: 'Khởi Đầu Số Nhỏ',
    description: 'Sở hữu các số nhỏ nhất (0, 1, 2) phẩm chất Rare trở lên',
    requiredCards: ['0', '1', '2'],
    minRarity: 'rare',
    category: 'energy',
    difficulty: 'normal',
    rewards: { coins: 5000, gems: 50 }
  },
  {
    id: 'e4_mid_stretch',
    name: 'Trung Tâm Hệ Số',
    description: 'Sở hữu bộ ba số trung tâm (4, 5, 6) phẩm chất Rare trở lên',
    requiredCards: ['4', '5', '6'],
    minRarity: 'rare',
    category: 'energy',
    difficulty: 'normal',
    rewards: { coins: 5000, gems: 50 }
  },
  {
    id: 'e5_high_stretch',
    name: 'Đỉnh Cao Số Lớn',
    description: 'Sở hữu bộ ba số lớn nhất (7, 8, 9) phẩm chất Rare trở lên',
    requiredCards: ['7', '8', '9'],
    minRarity: 'rare',
    category: 'energy',
    difficulty: 'normal',
    rewards: { coins: 5000, gems: 50 }
  },

  // LV2: Thử thách (Hard - Yêu cầu Super trở lên)
  {
    id: 'e6_op_trio',
    name: 'Bộ Ba Phép Tính',
    description: 'Sở hữu các phép tính (+, -, *) phẩm chất Super trở lên',
    requiredCards: ['+', '-', '*'],
    minRarity: 'super',
    category: 'energy',
    difficulty: 'hard',
    rewards: { coins: 15000, gems: 150 }
  },
  {
    id: 'e7_prime_squad',
    name: 'Đội Quân Nguyên Tố',
    description: 'Sở hữu các số nguyên tố (2, 3, 5, 7) phẩm chất Super trở lên',
    requiredCards: ['2', '3', '5', '7'],
    minRarity: 'super',
    category: 'energy',
    difficulty: 'hard',
    rewards: { coins: 20000, gems: 200 }
  },
  {
    id: 'e8_fibonacci_flow',
    name: 'Dòng Chảy Fibonacci',
    description: 'Sở hữu dãy số Fibonacci (1, 2, 3, 5, 8) phẩm chất Super trở lên',
    requiredCards: ['1', '2', '3', '5', '8'],
    minRarity: 'super',
    category: 'energy',
    difficulty: 'hard',
    rewards: { coins: 25000, gems: 250 }
  },
  {
    id: 'e9_square_logic',
    name: 'Logic Bình Phương',
    description: 'Sở hữu các số chính phương (1, 4, 9) phẩm chất Super trở lên',
    requiredCards: ['1', '4', '9'],
    minRarity: 'super',
    category: 'energy',
    difficulty: 'hard',
    rewards: { coins: 18000, gems: 180 }
  },
  {
    id: 'e10_golden_ratio',
    name: 'Tỷ Lệ Vàng',
    description: 'Sở hữu bộ ba cân bằng (3, 4, 5) phẩm chất Super trở lên',
    requiredCards: ['3', '4', '5'],
    minRarity: 'super',
    category: 'energy',
    difficulty: 'hard',
    rewards: { coins: 15000, gems: 150 }
  },

  // LV3: Cực khó (Very Hard - Yêu cầu Ultra trở lên)
  {
    id: 'e11_perfect_operators',
    name: 'Bậc Thầy Toán Tử',
    description: 'Sở hữu đầy đủ bộ tứ phép tính (+, -, *, /) phẩm chất Ultra Rare',
    requiredCards: ['+', '-', '*', '/'],
    minRarity: 'ultra',
    category: 'energy',
    difficulty: 'very_hard',
    rewards: { coins: 40000, gems: 400 }
  },
  {
    id: 'e12_lucky_twins',
    name: 'Cặp Bài Trùng',
    description: 'Sở hữu hai con số may mắn (6, 9) phẩm chất Ultra Rare',
    requiredCards: ['6', '9'],
    minRarity: 'ultra',
    category: 'energy',
    difficulty: 'very_hard',
    rewards: { coins: 30000, gems: 300 }
  },
  {
    id: 'e13_binary_code',
    name: 'Mã Nhị Phân',
    description: 'Sở hữu bộ thẻ nhị phân gốc (0, 1) phẩm chất Ultra Rare',
    requiredCards: ['0', '1'],
    minRarity: 'ultra',
    category: 'energy',
    difficulty: 'very_hard',
    rewards: { coins: 25000, gems: 250 }
  },
  {
    id: 'e14_rainbow_set',
    name: 'Thất Tinh Hội Tụ',
    description: 'Sở hữu chuỗi số từ 1 đến 7 phẩm chất Ultra Rare',
    requiredCards: ['1', '2', '3', '4', '5', '6', '7'],
    minRarity: 'ultra',
    category: 'energy',
    difficulty: 'very_hard',
    rewards: { coins: 60000, gems: 600 }
  },
  {
    id: 'e15_omega_collection',
    name: 'Vũ Trụ Toàn Năng',
    description: 'Sở hữu toàn bộ con số từ 0 đến 9 phẩm chất Ultra Rare',
    requiredCards: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    minRarity: 'ultra',
    category: 'energy',
    difficulty: 'very_hard',
    rewards: { coins: 100000, gems: 1000 }
  },

  // ==========================================
  // --- PHẨM CHẤT (COLLECTION - 15 Combos) ---
  // ==========================================

  // LV1: Thu thập (Normal)
  {
    id: 'c1_rare_start',
    name: 'Khởi Đầu Rare',
    description: 'Sở hữu 3 lá bài bất kỳ phẩm chất Rare trở lên',
    requiredCards: [],
    minRarity: 'rare',
    category: 'collection',
    difficulty: 'normal',
    rewards: { coins: 8000, gems: 80 }
  },
  {
    id: 'c2_rare_odds',
    name: 'Tập Hợp Số Lẻ (Rare)',
    description: 'Sở hữu các số lẻ (1, 3, 5, 7, 9) cùng phẩm chất Rare trở lên',
    requiredCards: ['1', '3', '5', '7', '9'],
    minRarity: 'rare',
    category: 'collection',
    difficulty: 'normal',
    rewards: { coins: 15000, gems: 150 }
  },
  {
    id: 'c3_rare_evens',
    name: 'Tập Hợp Số Chẵn (Rare)',
    description: 'Sở hữu các số chẵn (0, 2, 4, 6, 8) cùng phẩm chất Rare trở lên',
    requiredCards: ['0', '2', '4', '6', '8'],
    minRarity: 'rare',
    category: 'collection',
    difficulty: 'normal',
    rewards: { coins: 15000, gems: 150 }
  },
  {
    id: 'c4_rare_operators',
    name: 'Toán Tử Rare',
    description: 'Sở hữu 3 phép tính (+, -, *) phẩm chất Rare trở lên',
    requiredCards: ['+', '-', '*'],
    minRarity: 'rare',
    category: 'collection',
    difficulty: 'normal',
    rewards: { coins: 12000, gems: 120 }
  },
  {
    id: 'c5_rarity_diversity',
    name: 'Đa Dạng Phẩm Chất',
    description: 'Sở hữu ít nhất 1 lá Rare, 1 lá Super và 1 lá Ultra',
    requiredCards: [],
    category: 'collection',
    difficulty: 'normal',
    rewards: { coins: 20000, gems: 200 }
  },

  // LV2: Tinh anh (Hard)
  {
    id: 'c6_super_trio',
    name: 'Tam Hoa Super',
    description: 'Sở hữu 3 lá bài bất kỳ phẩm chất Super trở lên',
    requiredCards: [],
    minRarity: 'super',
    category: 'collection',
    difficulty: 'hard',
    rewards: { coins: 30000, gems: 300 }
  },
  {
    id: 'c7_super_numbers',
    name: 'Ngũ Đại Super',
    description: 'Sở hữu 5 lá số (0-9) phẩm chất Super trở lên',
    requiredCards: [],
    minRarity: 'super',
    category: 'collection',
    difficulty: 'hard',
    rewards: { coins: 45000, gems: 450 }
  },
  {
    id: 'c8_super_operators',
    name: 'Toán Tử Tối Thượng',
    description: 'Sở hữu đủ 4 phép tính phẩm chất Super trở lên',
    requiredCards: ['+', '-', '*', '/'],
    minRarity: 'super',
    category: 'collection',
    difficulty: 'hard',
    rewards: { coins: 50000, gems: 500 }
  },
  {
    id: 'c9_super_sequence',
    name: 'Chuỗi Số Super',
    description: 'Sở hữu bộ số 1, 2, 3 phẩm chất Super trở lên',
    requiredCards: ['1', '2', '3'],
    minRarity: 'super',
    category: 'collection',
    difficulty: 'hard',
    rewards: { coins: 35000, gems: 350 }
  },
  {
    id: 'c10_rare_full_house',
    name: 'Thập Toàn Rare',
    description: 'Sở hữu đầy đủ 10 lá số từ 0 đến 9 phẩm chất Rare trở lên',
    requiredCards: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    minRarity: 'rare',
    category: 'collection',
    difficulty: 'hard',
    rewards: { coins: 60000, gems: 600 }
  },

  // LV3: Huyền thoại (Very Hard)
  {
    id: 'c11_ultra_duo',
    name: 'Song Long Ultra',
    description: 'Sở hữu 2 lá bài bất kỳ phẩm chất Ultra Rare',
    requiredCards: [],
    minRarity: 'ultra',
    category: 'collection',
    difficulty: 'very_hard',
    rewards: { coins: 50000, gems: 500 }
  },
  {
    id: 'c12_ultra_trio',
    name: 'Tam Đại Ultra',
    description: 'Sở hữu 3 lá bài bất kỳ phẩm chất Ultra Rare',
    requiredCards: [],
    minRarity: 'ultra',
    category: 'collection',
    difficulty: 'very_hard',
    rewards: { coins: 80000, gems: 800 }
  },
  {
    id: 'c13_ultra_operators',
    name: 'Huyền Thoại Phép Tính',
    description: 'Sở hữu đầy đủ các phép tính phẩm chất Ultra Rare',
    requiredCards: ['+', '-', '*', '/'],
    minRarity: 'ultra',
    category: 'collection',
    difficulty: 'very_hard',
    rewards: { coins: 150000, gems: 1500 }
  },
  {
    id: 'c14_ultra_numbers',
    name: 'Quân Đoàn Ultra',
    description: 'Sở hữu 5 lá bài số bất kỳ phẩm chất Ultra Rare',
    requiredCards: [],
    minRarity: 'ultra',
    category: 'collection',
    difficulty: 'very_hard',
    rewards: { coins: 120000, gems: 1200 }
  },
  {
    id: 'c15_absolute_collection',
    name: 'Đội Quân Bất Diệt',
    description: 'Sở hữu toàn bộ 14 lá bài (số & phép tính) phẩm chất Ultra Rare',
    requiredCards: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '-', '*', '/'],
    minRarity: 'ultra',
    category: 'collection',
    difficulty: 'very_hard',
    rewards: { coins: 500000, gems: 5000 }
  }
];
