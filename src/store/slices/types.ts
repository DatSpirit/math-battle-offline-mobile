import type { Rarity, CardType } from '../../types/game';
import type { CollectionCard, Quest, Achievement } from '../../types/player.types';
import type { Transaction } from '../../types/shop.types';
import type { CampaignStage, UserStageProgress } from '../../types/campaign.types';
import type { ShopItem } from '../../types/shop.types';

/**
 * Trạng thái của chế độ Chiến dịch (Campaign).
 */
export interface CampaignSliceState {
  /** ID màn chơi hiện tại */
  currentStageId: number | null;
  /** Danh sách dữ liệu các màn chơi */
  stages: CampaignStage[];
  /** Tiến độ của người chơi trong từng màn */
  progress: Record<number, UserStageProgress>;
  /** Thiết lập màn chơi hiện tại */
  setCurrentStage: (stageId: number | null) => void;
  /** Mở khóa màn chơi mới */
  unlockStage: (stageId: number) => void;
  /** Cập nhật tiến trình vượt ải */
  updateProgress: (stageId: number, stars: number, score: number) => void;
}

/**
 * Interface tổng hợp toàn bộ trạng thái của Người chơi (Player State).
 * Đây là cấu trúc dữ liệu chính được lưu trữ trong Zustand store.
 */
export interface PlayerState extends CampaignSliceState {
  // --- Tiền tệ & Chỉ số cơ bản ---
  /** Số lượng Vàng */
  coins: number;
  /** Số lượng Kim cương */
  gems: number;
  /** Số lượng Sách Thăng Hoa Đỏ */
  redAscensionBooks: number;
  /** Cấp độ tài khoản */
  level: number;
  /** Kinh nghiệm (XP) hiện có */
  xp: number;
  /** Chỉ số Elo xếp hạng */
  elo: number;
  /** Thứ hạng Rank */
  rank: number;

  // --- Bộ sưu tập & Thẻ bài ---
  /** Danh sách thẻ bài sở hữu */
  collection: Record<string, CollectionCard>;
  /** Dữ liệu thông thạo thẻ bài */
  cardMastery: Record<string, {
     matchesPlayed: number;
     starsReached: number;
     matchesWon: number;
     completedLevels: number[];
  }>;
  /** Phần thưởng thư viện đã nhận */
  libraryRewardsClaimed: string[];
  /** Thẻ mới mở khóa (chưa xem) */
  newlyUnlockedCards: string[];
  /** Thưởng cộng hưởng đã nhận */
  resonanceRewardsClaimed: string[];

  // --- Hệ thống Nhiệm vụ ---
  /** Nhiệm vụ hàng ngày đang hoạt động */
  activeQuests: Quest[];
  /** Kho mẫu nhiệm vụ */
  questPool: Quest[];
  /** Nhiệm vụ đã hoàn thành */
  completedQuests: string[];
  /** Lần cuối reset nhiệm vụ hàng ngày */
  lastQuestReset: string;
  /** Lần cuối reset nhiệm vụ hàng tuần */
  lastWeeklyReset: string;

  // --- Cửa hàng & Giao dịch ---
  /** Danh sách sản phẩm trong Shop */
  shopProducts: ShopItem[]; 
  /** Lịch sử giao dịch */
  transactions: Transaction[];
  /** Giới hạn mua hàng ngày (itemId -> count) */
  shopDailyLimits: Record<string, number>;
  /** Lần cuối reset giới hạn shop */
  lastShopReset: string;

  // --- Thành tựu & Tiến trình ---
  /** Danh sách thành tựu */
  achievements: Achievement[];
  /** Các mục vừa mở khóa chờ thông báo */
  pendingUnlocks: string[];
  
  // --- Cài đặt & Hệ thống ---
  /** Chế độ đồ họa (ECO, BALANCED, ULTRA) */
  performanceMode: 'ECO' | 'BALANCED' | 'ULTRA';
  /** Trạng thái tắt tiếng */
  isMuted: boolean;
  /** Trạng thái dữ liệu đã được tải lên từ LocalStorage */
  hasHydrated: boolean;
  /** Trạng thái đã cấu hình hiệu năng lần đầu */
  isPerformanceSet: boolean;
  /** Phần thưởng hàng ngày đã nhận */
  lastDailyRewardClaimed: string | null;
  /** Phần thưởng hàng tuần đã nhận */
  lastWeeklyRewardClaimed: string | null;
  /** Chuỗi thắng */
  winStreak: number;
  /** Tổng trận thắng */
  wins: number;
  /** Số phép tính đúng liên tiếp */
  consecutiveSuccess: number;

  // --- Các hàm Hành động (Actions) ---
  /** Thiết lập chế độ hiệu năng */
  setPerformanceMode: (mode: 'ECO' | 'BALANCED' | 'ULTRA') => void;
  /** Thiết lập trạng thái Hydrated */
  setHasHydrated: (val: boolean) => void;
  /** Thiết lập trạng thái đã cấu hình hiệu năng */
  setIsPerformanceSet: (val: boolean) => void;
  /** Xóa toàn bộ dữ liệu tài khoản (Reset Account) */
  resetAccount: () => void;
  /** Chỉ reset tiến trình chơi (giữ lại thẻ/tiền nếu cần) */
  resetProgress: () => void;
  
  /** Quản lý Thành tựu */
  unlockAchievement: (id: string) => void;
  updateAchievementProgress: (id: string, progress: number) => void;
  clearPendingUnlocks: () => void;
  
  /** Quản lý Kinh tế */
  addCoins: (amount: number) => void;
  addGems: (amount: number) => void;
  addRedAscensionBooks: (amount: number) => void;
  addXP: (amount: number) => void;
  incrementConsecutiveSuccess: () => void;
  resetConsecutiveSuccess: () => void;
  toggleMute: () => void;
  claimDailyReward: () => { success: boolean; reward?: number; msg?: string };
  claimWeeklyReward: () => { success: boolean; reward?: number; msg?: string };

  /** Quản lý Thẻ bài */
  buyPack: (cards: { value: string; type: 'number' | 'operator'; rarity: Rarity }[]) => void;
  upgradeCardLevel: (cardKey: string, cost: number) => boolean;
  injectEvoPoints: (payload: { cardKey: string, materials: Record<string, number>, cost: number, pointsToAdd: number, providedBooks?: number }) => boolean;
  ensureStarterCollection: () => void;
  
  /** Quản lý Nhiệm vụ */
  updateQuestProgress: (id: string, amount: number) => void;
  setQuestProgress: (id: string, amount: number) => void;
  checkAndResetQuests: () => void;
  refreshQuests: (type: 'daily' | 'weekly') => void;
  claimQuestReward: (id: string) => { success: boolean, reward: number, gems: number };

  /** Quản lý Shop & Thanh toán */
  initiatePayment: (itemId: string) => string; 
  completePayment: (transactionId: string) => void;
  buyWithCurrency: (itemId: string) => { success: boolean; msg: string };
  checkShopReset: () => void;
  /** Reset toàn bộ hệ thống hàng ngày (Quest, Shop, Summon) */
  checkDailyReset: () => void;
  /** Lần cuối reset toàn hệ thống */
  lastDailyReset: string;
  /** Trạng thái đã dùng lượt triệu hồi miễn phí (packId -> boolean) */
  freeSummonsUsed: Record<string, boolean>;

  /** Xử lý kết quả trận đấu */
  processMatchResult: (winner: 'player' | 'ai' | 'tie', usedCards: string[]) => { coins: number; xp: number; elo: number; streak: number };
  processCampaignResult: (stageId: number, newStars: number, previousStars: number, gold: number, gems: number, packType: 'R' | 'SR' | 'UR' | 'OPERATOR' | null, usedCards: string[]) => { coins: number, gems: number, pack: string | null, cards: { value: string; type: CardType; rarity: Rarity; id?: string }[] };

  /** Xử lý Thư viện & Mastery */
  claimLibraryReward: (cardId: string) => { success: boolean; coins: number; gems: number };
  viewCardInLibrary: (cardId: string) => void;
  claimMasteryReward: (cardId: string, level: number) => { success: boolean; coins: number; gems: number; card?: string };
  claimResonanceReward: (resonanceId: string) => { success: boolean; coins: number; gems: number };
}
