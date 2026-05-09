import { create } from 'zustand';
import type { GameState } from './slices/gameStoreTypes';

import { createGameMatchSlice } from './slices/gameMatchSlice';
import { createGameBoardSlice } from './slices/gameBoardSlice';
import { createGameSkillSlice } from './slices/gameSkillSlice';
import { createCampaignSlice } from './slices/campaignSlice';

/**
 * STORE TRẬN ĐẤU (Game Store)
 * Quản lý toàn bộ trạng thái của một trận đấu đang diễn ra.
 * Khác với PlayerStore, GameStore không sử dụng Persist vì dữ liệu trận đấu sẽ mất đi khi tải lại trang hoặc thoát game.
 */
export const useGameStore = create<GameState>((set, get) => ({
  // --- Trạng thái cơ bản của trận đấu ---
  /** Giai đoạn hiện tại của game (màn hình bắt đầu, trong trận, kết thúc...) */
  phase: 'start_screen',
  /** Lượt hiện tại */
  currentTurn: 1,
  /** Thẻ bài trên tay Người chơi 1 */
  player1Hand: [],
  /** Thẻ bài dự trữ của Người chơi 1 */
  player1Reserve: [],
  /** Thẻ bài trên tay Người chơi 2 (hoặc AI) */
  player2Hand: [],
  /** Thẻ bài dự trữ của Người chơi 2 (hoặc AI) */
  player2Reserve: [],
  /** Điểm số hiện tại của Người chơi 1 */
  player1Score: 0,
  /** Điểm số hiện tại của Người chơi 2 (hoặc AI) */
  player2Score: 0,
  /** Các ô (Slots) đặt thẻ bài của Người chơi 1 trên bàn cờ */
  player1Slots: new Array(6).fill(null),
  /** Các ô (Slots) đặt thẻ bài của Người chơi 2 trên bàn cờ */
  player2Slots: new Array(6).fill(null),
  /** Lịch sử các bước đi trong trận đấu */
  history: [],
  /** Kết quả của trận đấu cuối cùng */
  lastResult: null,
  /** Thời gian còn lại của lượt (giây) */
  timeLeft: 60,
  /** Đã sử dụng thẻ vạn năng (Wildcard) trong lượt này chưa */
  hasUsedWildcard: false,
  /** Đã sử dụng quyền đổi bài (Mulligan) chưa */
  hasUsedMulligan: false,
  /** Chế độ kỹ năng hiện tại */
  skillMode: 'none',
  /** Thẻ vạn năng đang chờ xử lý */
  pendingWildcard: null,
  /** Danh sách thẻ bài đang chọn để đổi (Mulligan) */
  mulliganSelection: [],
  /** Chế độ chơi (vs AI hoặc Pass & Play) */
  gameMode: 'vs_ai',
  /** Độ khó của AI (Dễ, Trung bình, Khó) */
  difficulty: 'medium',
  /** ID của người chơi đang thực hiện lượt */
  activePlayer: 1,
  /** Trạng thái ẩn màn hình (dùng trong Pass & Play để che bài đối thủ) */
  isScreenHidden: false,
  /** Phần thưởng nhận được từ trận đấu gần nhất */
  lastMatchRewards: null,
  /** Trạng thái đang xử lý logic (dùng để khóa tương tác UI) */
  isProcessing: false,
  /** Cảm xúc (Emote) đang hiển thị */
  activeEmote: null,
  /** Danh sách các thẻ bài đã được sử dụng trong suốt trận đấu (để tính Mastery) */
  usedCards: [],

  // --- Trạng thái mở rộng cho Battle Engine v2.5 ---
  /** Danh sách sự kiện diễn ra trong lượt gần nhất để UI Theater trình diễn */
  lastBattleEvents: [],
  /** Kho điểm tích lũy của Người chơi 1 (từ thẻ số 9) */
  player1PoolPoints: 0,
  /** Kho điểm tích lũy của Người chơi 2 (AI) */
  player2PoolPoints: 0,
  /** % Thưởng cộng dồn hiện tại của Người chơi 1 (từ thẻ số 8) */
  player1ActiveBonuses: 0,
  /** % Thưởng cộng dồn hiện tại của Người chơi 2 (AI) */
  player2ActiveBonuses: 0,
  
  // --- Tích hợp các Slice logic trận đấu ---
  /** Logic liên quan đến ghép trận và kết quả */
  ...createGameMatchSlice(set, get),
  /** Logic liên quan đến thao tác trên bàn cờ và tính toán điểm số */
  ...createGameBoardSlice(set, get),
  /** Logic liên quan đến kỹ năng đặc biệt của thẻ bài */
  ...createGameSkillSlice(set, get),
  /** Logic liên quan đến Chiến dịch (dùng chung cấu trúc slice) */
  ...createCampaignSlice(set),
}));
