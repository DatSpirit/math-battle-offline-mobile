export type StageType = 'regular' | 'boss';

export interface CampaignStage {
  id: number;
  type: StageType;
  name: string;
  theme: string;
  quote: string;
  targetScore: number; // For scripting/target range
  bossId?: number;
  rewards: {
    gold: number;
    gems: number;
    packType: 'R' | 'SR' | 'UR' | 'OPERATOR' | null;
  };
  isSideBranch?: boolean;
  parentStageId?: number;
}

export interface UserStageProgress {
  stageId: number;
  stars: number; // 0, 1, 2, 3
  isUnlocked: boolean;
  bestScore: number;
  dailyAttempts: number; // Số lượt đã chơi trong ngày (chỉ dành cho Boss)
  lastAttemptDate: string | null; // Ngày cuối cùng thực hiện lượt chơi
}

export interface CampaignState {
  currentStageId: number | null;
  progress: Record<number, UserStageProgress>;
  stages: CampaignStage[];
}
