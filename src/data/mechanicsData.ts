import type { Rarity } from '../types/game';

export const RARITY_POWER_MAP: Record<Rarity, number> = {
  'normal': 0,
  'rare': 0.1,
  'super': 0.5,
  'ultra': 1.0
};

export const STAR_MULTIPLIER_MODS = [0, 0.2, 0.5, 1.0, 1.5, 3.0];

export const LEVEL_BONUS_MOD = 0.01;

export const SYNERGY_SEQUENCE_MOD = 0.1;
export const SYNERGY_PARITY_MOD = 0.1;
export const SYNERGY_OPERATOR_MASTER_MOD = 0.1;
export const SYNERGY_OPERATOR_GRANDMASTER_MOD = 0.3;

export const ECONOMY_CONSTANTS = {
  INITIAL_COINS: 10000,
  INITIAL_GEMS: 50,
  XP_PER_LEVEL: 1000,
  BASE_WIN_COINS: 100,
  LOSE_XP: 15,
  WIN_XP: 50,
  TIE_XP: 20,
  ELO_GAIN: 20,
  ELO_LOSS: -15,
  DAILY_REWARD_BASE: 1000,
  WEEKLY_REWARD_BASE: 10000,
};
