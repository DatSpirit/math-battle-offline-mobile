import type { Rarity } from '../types/game';

export interface GachaTemplate {
  value: string;
  type: 'number' | 'operator';
  rarity: Rarity;
}

export const GACHA_CARD_POOL: GachaTemplate[] = [
  // Numbers 0-9
  ...Array.from({ length: 10 }, (_, i) => ({ value: String(i), type: 'number' as const, rarity: 'normal' as Rarity })),
  // Operators
  { value: '+', type: 'operator' as const, rarity: 'normal' as Rarity },
  { value: '-', type: 'operator' as const, rarity: 'normal' as Rarity },
  { value: '*', type: 'operator' as const, rarity: 'normal' as Rarity },
  { value: '/', type: 'operator' as const, rarity: 'normal' as Rarity },
];

export const GACHA_PACK_CONFIG = {
  // Triệu hồi thường (Vàng): Tỉ lệ UR cực thấp
  summon_normal: { ultra: 0.1, super: 4.0, rare: 100 },
  // Triệu hồi hiếm (Kim cương - Gói SR): Tỉ lệ Super cao
  summon_rare: { ultra: 1.5, super: 20.0, rare: 100 },
  // Triệu hồi tối thượng (Kim cương - Gói UR): Tỉ lệ UR cao hơn nhưng vẫn khó sưu tầm hết
  summon_ultimate: { ultra: 5.0, super: 40.0, rare: 100 },
  
  pack_standard: { ultra: 0.5, super: 6.0, rare: 100 },
  pack_rare: { ultra: 2.0, super: 22.0, rare: 100 },
  pack_super: { ultra: 7.0, super: 45.0, rare: 100 },
  pack_ur: { ultra: 60, super: 100 },
  pack_operator: { ultra: 10, super: 40, rare: 100 },
};
