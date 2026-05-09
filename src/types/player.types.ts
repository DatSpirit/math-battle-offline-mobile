export interface CollectionCard {
  value: string;
  type: 'number' | 'operator';
  rarity: 'normal' | 'rare' | 'super' | 'ultra';
  count: number;
  level: number;
  stars: number;
  name?: string;
  flavorText?: string;
  abilityName?: string;
  abilityDesc?: string;
  activationCond?: string;
  evoPoints?: number;
  redStars?: number;
}

export interface Quest {
  id: string;
  type: 'daily' | 'weekly';
  title: string;
  description: string;
  goal: number;
  current: number;
  reward: number;
  rewardGems: number;
  claimed: boolean;
  completed: boolean;
}

export type AchievementCategory = 'combat' | 'collection' | 'social' | 'economy' | 'mastery';
export type AchievementRarity = 'bronze' | 'silver' | 'gold' | 'diamond';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  /** Total steps required (e.g. 5 wins). 1 = binary unlock. */
  goal: number;
  /** Current progress toward goal */
  progress: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  /** Coin reward on unlock */
  reward: number;
}
