export interface ShopPackReward {
  cards: number;
  rarity: 'normal' | 'rare' | 'super';
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'coins' | 'gems' | 'cash';
  rewardType: 'gems' | 'coins' | 'card_pack';
  rewardValue: number | ShopPackReward;
  color: string;
  icon: string;
  tag?: string;
  originalPrice?: number;
  dailyLimit?: number;
  /** Giá USD dùng cho backend Stripe/MoMo (1 USD ≈ 25,000 VND) */
  priceUsd?: number;
}

export interface Transaction {
  id: string;
  itemId: string;
  amount: number;
  currency: 'coins' | 'gems' | 'cash';
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
}
