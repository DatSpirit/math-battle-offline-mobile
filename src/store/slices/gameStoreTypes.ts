import type { GameCard, GamePhase, TurnResult, GameMode, AIDifficulty, Rarity, CardType } from '../../types/game';
import type { CampaignState } from '../../types/campaign.types';
import type { BattleEvent } from '../../engine/types';

export interface CampaignActions {
  unlockStage: (stageId: number) => void;
  updateProgress: (stageId: number, stars: number, score: number) => void;
  setCurrentStage: (stageId: number | null) => void;
}

export type CampaignSlice = CampaignState & CampaignActions;

export interface GameBaseState {
  phase: GamePhase;
  currentTurn: number;
  player1Hand: GameCard[];
  player1Reserve: GameCard[];
  player2Hand: GameCard[];
  player2Reserve: GameCard[];
  player1Score: number;
  player2Score: number;
  player1Slots: (GameCard | null)[];
  player2Slots: (GameCard | null)[];
  history: TurnResult[];
  lastResult: TurnResult | null;
  timeLeft: number;
  hasUsedWildcard: boolean;
  hasUsedMulligan: boolean;
  skillMode: 'none' | 'wildcard_select' | 'mulligan_select';
  pendingWildcard: { cardId: string; newValue: string; newRarity: Rarity } | null;
  mulliganSelection: string[];
  gameMode: GameMode;
  difficulty: AIDifficulty;
  activePlayer: 1 | 2;
  isScreenHidden: boolean;
  lastMatchRewards: { 
    coins: number; 
    xp: number; 
    streak: number; 
    elo: number; 
    gems?: number; 
    stars?: number; 
    pack?: string | null;
    cards?: { value: string; type: CardType; rarity: Rarity; id?: string; stars?: number; level?: number }[];
  } | null;
  usedCards: string[];
  
  // Battle Engine v2.5 fields
  lastBattleEvents: BattleEvent[];
  player1PoolPoints: number;
  player2PoolPoints: number;
  player1ActiveBonuses: number; // Stacking % from card 8
  player2ActiveBonuses: number;
  
  // Processing and Interaction guards
  isProcessing: boolean;
  activeEmote: { player: 1 | 2; id: string } | null;

  // Tutorial fields
  isTutorial: boolean;
  tutorialStep: number;
  tutorialId: 'home' | 'battle' | null;
  isTutorialPaused: boolean;

  // Actions
  startGame: (mode: GameMode, difficulty?: AIDifficulty, isTutorial?: boolean) => void;
  placeCard: (cardId: string, slotIndex: number) => void;
  moveCardBetweenSlots: (fromIndex: number, toIndex: number) => void;
  removeCard: (slotIndex: number) => void;
  submitTurn: (isTimeout?: boolean) => void;
  nextTurn: () => void;
  playAgain: () => void;
  tickTimer: () => void;
  activateWildcard: () => void;
  confirmWildcard: () => void;
  activateMulligan: () => void;
  toggleMulliganCard: (cardId: string) => void;
  toggleSkillCard: (cardId: string) => void;
  confirmMulligan: () => void;
  cancelSkill: () => void;
  setScreenHidden: (hidden: boolean) => void;
  surrenderGame: () => void;
  setTutorialStep: (step: number) => void;
  setIsTutorial: (val: boolean) => void;
  setTutorialId: (id: 'home' | 'battle' | null) => void;
  setTutorialPaused: (paused: boolean) => void;
  setProcessing: (val: boolean) => void;
  sendEmote: (player: 1 | 2, emoteId: string) => void;
}

export type GameState = GameBaseState & CampaignSlice;
