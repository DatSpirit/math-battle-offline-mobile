import type { CardMetadata, Rarity } from '../types/game';

/**
 * Lấy đúng mô tả kỹ năng theo phẩm chất (rarity).
 * Dùng khi card không được tạo qua makeCard (vd: LibraryCard từ store).
 */
export function resolveAbilityDesc(
  value: string,
  rarity: Rarity | undefined
): string {
  const meta = CARD_METADATA[value];
  if (!meta) return '';
  if (!rarity || rarity === 'normal') return 'Thẻ thường: Không có nội tại.';
  if (meta.abilities) {
    if (rarity === 'ultra') return meta.abilities.ultra || meta.abilities.super || meta.abilities.rare || '';
    if (rarity === 'super') return meta.abilities.super || meta.abilities.rare || '';
    return meta.abilities.rare || '';
  }
  return meta.abilityDesc || '';
}

export const CARD_METADATA: Record<string, CardMetadata> = {
  '0': {
    name: 'Gốc Tọa Độ',
    flavorText: 'Điểm bắt đầu của mọi không gian và phép tính.',
    abilityName: 'Vô Hiệu',
    abilities: {
      rare:  'Vô hiệu kỹ năng của 1 lá đối thủ.',
      super: 'Vô hiệu giá trị của đối thủ (về 0).',
      ultra: 'Vô hiệu cả kỹ năng lẫn giá trị của đối thủ.',
    },
    activationCond: 'Kích hoạt: Khi lá 0 xuất hiện.'
  },
  '1': {
    name: 'Phần Tử Đơn Vị',
    flavorText: 'Giá trị duy nhất không làm thay đổi bản chất phép nhân.',
    abilityName: 'Đồng Nhất',
    abilities: {
      rare:  'Vô hiệu lá Nhân (*) của đối thủ.',
      super: 'Vô hiệu lá Chia (/) của đối thủ.',
      ultra: 'Vô hiệu cả lá Nhân (*) và Chia (/) của đối thủ.',
    },
    activationCond: 'Kích hoạt: Tự động trong lượt đấu.'
  },
  '2': {
    name: 'Phép Đối Xứng',
    flavorText: 'Chia đôi sự khác biệt để tìm thấy sự cân bằng.',
    abilityName: 'Phân Đôi',
    abilities: {
      rare:  'Chia đôi điểm của cả 2 bên.',
      super: 'Chỉ chia đôi điểm của đối thủ.',
      ultra: 'Chia đôi điểm đối thủ và cộng phần đó vào điểm mình.',
    },
    activationCond: 'Kích hoạt: Tự động khi so điểm.'
  },
  '3': {
    name: 'Hình Tam Giác',
    flavorText: 'Ba điểm tạo nên một mặt phẳng vững chắc nhất.',
    abilityName: 'Tam Hợp',
    abilities: {
      rare:  'Nhân 3 (x3) giá trị của 1 thẻ số ngẫu nhiên.',
      super: 'Nhân 3 (x3) giá trị của 1 thẻ số lớn nhất.',
      ultra: 'Nhân 3 (x3) lá lớn nhất và tăng +30% điểm thưởng.',
    },
    activationCond: 'Kích hoạt: Tự động khi có 3 thẻ số.'
  },
  '4': {
    name: 'Góc Vuông',
    flavorText: 'Sự ổn định tuyệt đối trong hệ trục tọa độ.',
    abilityName: 'Trực Giao',
    abilities: {
      rare:  'Chặn tối đa 1 kỹ năng; mỗi lần chặn cộng 25% điểm lượt.',
      super: 'Chặn tối đa 2 kỹ năng; mỗi lần chặn cộng 25% điểm lượt.',
      ultra: 'Chặn tối đa 3 kỹ năng; mỗi lần chặn cộng 25% điểm lượt.',
    },
    activationCond: 'Kích hoạt: Tự động.'
  },
  '5': {
    name: 'Ngũ Giác Đều',
    flavorText: 'Sự hoàn hảo của các góc và cạnh tương ứng.',
    abilityName: 'Đảo Chiều',
    abilities: {
      rare:  'Khi đang thua: Nhân đôi (x2) điểm lượt (chỉ trước lượt 4).',
      super: 'Khi đang thua: Nhân đôi (x2) điểm lượt (chỉ trước lượt 5).',
      ultra: 'Khi đang thua: Nhân đôi (x2) điểm lượt (không điều kiện).',
    },
    activationCond: 'Kích hoạt: Khi tổng điểm đang thấp hơn đối thủ.'
  },
  '6': {
    name: 'Số Hoàn Hảo',
    flavorText: 'Tổng các ước số tạo nên chính thực thể đó.',
    abilityName: 'Biến Số',
    abilities: {
      rare:  'Thêm giá trị ngẫu nhiên từ -6 đến +6 vào thẻ này.',
      super: 'Thêm giá trị ngẫu nhiên từ -6 đến +12 vào thẻ này.',
      ultra: 'Thêm giá trị ngẫu nhiên từ -6 đến +18 vào thẻ này.',
    },
    activationCond: 'Kích hoạt: Khi lá 6 xuất hiện trên sân.'
  },
  '7': {
    name: 'Số Nguyên Tố',
    flavorText: 'Thực thể cô độc, không thể bị chia cắt bởi bất kỳ ai.',
    abilityName: 'Truy Vết Lẻ',
    abilities: {
      rare:  'Vô hiệu 1 lá số lẻ <7 của đối thủ và cộng thêm 10% điểm.',
      super: 'Vô hiệu 1 lá số lẻ ≤7 của đối thủ và cộng thêm 20% điểm.',
      ultra: 'Vô hiệu 1 lá số lẻ bất kỳ của đối thủ và cộng thêm 30% điểm.',
    },
    activationCond: 'Kích hoạt: Khi so thẻ số lẻ.'
  },
  '8': {
    name: 'Vô Cực',
    flavorText: 'Vòng lặp không hồi kết của thời gian và không gian.',
    abilityName: 'Tích Lũy',
    abilities: {
      rare:  'Cộng thêm +20% điểm cho 2 lượt tiếp theo.',
      super: 'Cộng thêm +20% điểm cho 3 lượt tiếp theo.',
      ultra: 'Cộng thêm +40% điểm cho 3 lượt tiếp theo.',
    },
    activationCond: 'Kích hoạt: Tự động, hiệu ứng dồn lượt.'
  },
  '9': {
    name: 'Tiệm Cận',
    flavorText: 'Giá trị lớn nhất, luôn tiến tới nhưng không thể chạm.',
    abilityName: 'Kho Điểm',
    abilities: {
      rare:  'Nếu thắng lượt: Trích 30% tổng điểm 2 bên vào kho cho lượt sau.',
      super: 'Nếu thắng lượt: Trích 60% tổng điểm 2 bên vào kho cho lượt sau.',
      ultra: 'Nếu thắng lượt: Trích 90% tổng điểm 2 bên vào kho cho lượt sau.',
    },
    activationCond: 'Kích hoạt: Sau khi thắng lượt. Cộng vào tổng điểm cuối.'
  },
  '+': {
    name: 'Phép Hội Tụ',
    flavorText: 'Tích lũy các giá trị để tạo nên tổng thể lớn hơn.',
    abilityName: 'Bồi Đắp',
    abilities: {
      rare:  'Tăng +10% giá trị kết quả phép tính.',
      super: 'Tăng +20% giá trị kết quả phép tính.',
      ultra: 'Tăng +40% giá trị kết quả phép tính.',
    },
    activationCond: 'Kích hoạt: Tự động khi có dấu +.'
  },
  '-': {
    name: 'Phép Biến Hiệu',
    flavorText: 'Sự sai lệch giữa hai thực thể trong không gian.',
    abilityName: 'Thanh Lọc',
    abilities: {
      rare:  'Trừ đi 10% điểm lượt của đối thủ.',
      super: 'Trừ đi 25% điểm lượt của đối thủ.',
      ultra: 'Trừ đi 50% điểm lượt của đối thủ.',
    },
    activationCond: 'Kích hoạt: Khi so điểm.'
  },
  '*': {
    name: 'Phép Cấp Số',
    flavorText: 'Gia tăng sức mạnh theo cấp số nhân của hỗn loạn.',
    abilityName: 'Khuếch Đại',
    abilities: {
      rare:  'Nhân hệ số điểm lượt lên x1.5.',
      super: 'Nhân hệ số điểm lượt lên x2.0.',
      ultra: 'Nhân hệ số điểm lượt lên x2.5.',
    },
    activationCond: 'Kích hoạt: Tự động khi có dấu *.'
  },
  '/': {
    name: 'Phép Phân Rã',
    flavorText: 'Chia nhỏ cấu trúc để tìm kiếm giá trị cốt lõi.',
    abilityName: 'Thấu Thị',
    abilities: {
      rare:  'Giảm 15% hệ số điểm của đối thủ.',
      super: 'Giảm 30% hệ số điểm của đối thủ.',
      ultra: 'Chia đôi (50%) toàn bộ hệ số điểm của đối thủ.',
    },
    activationCond: 'Kích hoạt: Tự động khi có dấu /.'
  }
};
