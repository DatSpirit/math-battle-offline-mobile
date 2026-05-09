import type { StoreApi } from 'zustand';
import type { CampaignStage, UserStageProgress, CampaignState } from '../../types/campaign.types';

/**
 * Interface cho các hành động trong chế độ Chiến dịch (Campaign).
 */
export interface CampaignActions {
  /** Mở khóa một màn chơi cụ thể */
  unlockStage: (stageId: number) => void;
  /** Cập nhật tiến độ của một màn chơi (số sao, điểm số cao nhất) */
  updateProgress: (stageId: number, stars: number, score: number) => void;
  /** Thiết lập màn chơi hiện tại mà người chơi đang chọn */
  setCurrentStage: (stageId: number | null) => void;
}

/** Hợp nhất trạng thái và hành động của Campaign */
export type CampaignSlice = CampaignState & CampaignActions;

/** Dữ liệu các màn chơi chính (Thế giới 1) */
const MAIN_STAGES: CampaignStage[] = [
  { id: 1, type: 'regular', theme: 'Cộng Trừ Phối Hợp', quote: 'Mọi hành trình đều bắt đầu từ những con số.', name: 'Tập sự Toán học', targetScore: 1000, rewards: { gold: 2000, gems: 20, packType: null } },
  { id: 2, type: 'regular', theme: 'Phép Trừ Thần Tốc', quote: 'Nhanh hơn, chính xác hơn.', name: 'Phép trừ thần tốc', targetScore: 1500, rewards: { gold: 3000, gems: 30, packType: null } },
  { id: 3, type: 'regular', theme: 'Nhân Chia Khám Phá', quote: 'Nhân đôi sức mạnh, chia sẻ niềm vui.', name: 'Nhân chia khám phá', targetScore: 2000, rewards: { gold: 4000, gems: 40, packType: null } },
  { id: 4, type: 'regular', theme: 'Hỗn hợp sơ cấp', quote: 'Kết hợp linh hoạt các phép tính.', name: 'Hỗn hợp sơ cấp', targetScore: 2500, rewards: { gold: 5000, gems: 50, packType: null } },
  { id: 5, type: 'boss', theme: 'Thử Thách Cuối Cùng', quote: 'Kẻ gác cổng thế giới số đang chờ bạn.', name: 'Thử thách Boss 1', targetScore: 4000, rewards: { gold: 10000, gems: 100, packType: 'R' } },
  { id: 6, type: 'regular', theme: 'Ma Trận Số Lẻ', quote: 'Số lẻ mang lại những biến số bất ngờ.', name: 'Ma trận số lẻ', targetScore: 3000, rewards: { gold: 6000, gems: 60, packType: null } },
  { id: 7, type: 'regular', theme: 'Đấu Trường Số Chẵn', quote: 'Sự cân bằng hoàn hảo trong từng nước đi.', name: 'Đấu trường số chẵn', targetScore: 3500, rewards: { gold: 7000, gems: 70, packType: null } },
  { id: 8, type: 'regular', theme: 'Phân Số Cơ Bản', quote: 'Chia nhỏ vấn đề để giải quyết dễ dàng.', name: 'Phân số cơ bản', targetScore: 4000, rewards: { gold: 8000, gems: 80, packType: null } },
  { id: 9, type: 'regular', theme: 'Đại Lộ Thập Phân', quote: 'Sự chính xác đến từng con số nhỏ nhất.', name: 'Đại lộ thập phân', targetScore: 4500, rewards: { gold: 9000, gems: 90, packType: null } },
  { id: 10, type: 'boss', theme: 'Kẻ Thống Trị Số Học', quote: 'Chỉ những bộ não nhanh nhất mới có thể vượt qua.', name: 'Thử thách Boss 2', targetScore: 6000, rewards: { gold: 20000, gems: 200, packType: 'SR' } },
  { id: 11, type: 'regular', theme: 'Căn Bậc Hai Tốc Độ', quote: 'Tìm ra căn nguyên của sức mạnh.', name: 'Căn bậc hai tốc độ', targetScore: 5000, rewards: { gold: 11000, gems: 110, packType: null } },
  { id: 12, type: 'regular', theme: 'Lũy Thừa Vô Tận', quote: 'Sức mạnh tăng trưởng theo cấp số nhân.', name: 'Lũy thừa vô tận', targetScore: 5500, rewards: { gold: 12000, gems: 120, packType: null } },
  { id: 13, type: 'regular', theme: 'Tỉ Lệ Thần Thánh', quote: 'Sự hài hòa trong các phép tính đối xứng.', name: 'Tỉ lệ thần thánh', targetScore: 6000, rewards: { gold: 13000, gems: 130, packType: null } },
  { id: 14, type: 'regular', theme: 'Hàm Số Bí Ẩn', quote: 'Giải mã những quy luật của tự nhiên.', name: 'Hàm số bí ẩn', targetScore: 6500, rewards: { gold: 14000, gems: 140, packType: null } },
  { id: 15, type: 'boss', theme: 'Chúa Tể Giải Thuật', quote: 'Logic tối thượng đang đợi bạn ở đỉnh cao.', name: 'Thử thách Boss 3', targetScore: 8000, rewards: { gold: 30000, gems: 300, packType: 'SR' } },
  { id: 16, type: 'regular', theme: 'Ma Trận Số Nguyên', quote: 'Vững chắc như những con số nguyên thủy.', name: 'Ma trận số nguyên', targetScore: 7000, rewards: { gold: 15000, gems: 150, packType: null } },
  { id: 17, type: 'regular', theme: 'Định Lý Bất Diệt', quote: 'Những quy luật không bao giờ thay đổi.', name: 'Định lý bất diệt', targetScore: 7500, rewards: { gold: 16000, gems: 160, packType: null } },
  { id: 18, type: 'regular', theme: 'Hình Học Trực Quan', quote: 'Nhìn nhận toán học dưới góc độ không gian.', name: 'Hình học trực quan', targetScore: 8000, rewards: { gold: 17000, gems: 170, packType: null } },
  { id: 19, type: 'regular', theme: 'Xác Suất May Rủi', quote: 'Làm chủ vận may bằng sự tính toán.', name: 'Xác suất may rủi', targetScore: 8500, rewards: { gold: 18000, gems: 180, packType: null } },
  { id: 20, type: 'boss', theme: 'Đại Ma Vương Logic', quote: 'Một sai lầm nhỏ sẽ dẫn đến thất bại lớn.', name: 'Thử thách Boss 4', targetScore: 10000, rewards: { gold: 50000, gems: 500, packType: 'UR' } },
  { id: 21, type: 'regular', theme: 'Chuỗi Số Vô Tận', quote: 'Không bao giờ dừng lại, không bao giờ kết thúc.', name: 'Chuỗi số vô tận', targetScore: 9000, rewards: { gold: 20000, gems: 200, packType: null } },
  { id: 22, type: 'regular', theme: 'Tích Phân Thần Bí', quote: 'Tổng hợp mọi nguồn lực cho đòn đánh cuối.', name: 'Tích phân thần bí', targetScore: 9500, rewards: { gold: 22000, gems: 220, packType: null } },
  { id: 23, type: 'regular', theme: 'Đạo Hàm Sắc Bén', quote: 'Thay đổi nhịp độ trận đấu tức thì.', name: 'Đạo hàm sắc bén', targetScore: 10000, rewards: { gold: 24000, gems: 240, packType: null } },
  { id: 24, type: 'regular', theme: 'Lý Thuyết Trò Chơi', quote: 'Đọc suy nghĩ của đối thủ.', name: 'Lý thuyết trò chơi', targetScore: 11000, rewards: { gold: 26000, gems: 260, packType: null } },
  { id: 25, type: 'boss', theme: 'Vị Thần Toán Học', quote: 'Chào mừng bạn đến với đỉnh cao của trí tuệ.', name: 'Trận chiến cuối cùng', targetScore: 15000, rewards: { gold: 100000, gems: 1000, packType: 'UR' } },
];

/** Tự động tạo các màn chơi phụ (Side Branches) dựa trên các màn chính */
const SIDE_STAGES: CampaignStage[] = [1, 2, 3, 4, 5].map(parentId => {
  const i = parentId;
  return {
    id: 100 + i,
    type: 'regular',
    theme: 'Thử Thách Phụ',
    quote: 'Khám phá những bí ẩn bên lề.',
    name: `Thử thách phụ ${i}`,
    targetScore: 1500 + (i * 500),
    isSideBranch: true,
    parentStageId: parentId,
    rewards: {
      gold: 20000,
      gems: 200,
      packType: 'OPERATOR',
    }
  };
});

/** Tổng hợp toàn bộ màn chơi khởi tạo cho Campaign */
const INITIAL_STAGES: CampaignStage[] = [...MAIN_STAGES, ...SIDE_STAGES];

/**
 * SLICE: Chế độ Chiến dịch (Campaign)
 * Quản lý danh sách màn chơi và tiến trình vượt ải của người chơi.
 */
export const createCampaignSlice = <T extends CampaignSlice>(
  set: StoreApi<T>['setState']
) => ({
  /** ID màn chơi hiện tại người chơi đang ở trong đó */
  currentStageId: null,
  /** Toàn bộ dữ liệu cấu hình các màn chơi */
  stages: INITIAL_STAGES,
  /** Lưu trữ tiến độ của người chơi (id màn -> thông tin tiến độ) */
  progress: {
    1: { stageId: 1, stars: 0, isUnlocked: true, bestScore: 0, dailyAttempts: 0, lastAttemptDate: null }
  } as Record<number, UserStageProgress>,

  /** Cập nhật màn chơi đang chọn */
  setCurrentStage: (stageId: number | null) => set({ currentStageId: stageId } as Partial<T>),

  /** Mở khóa màn chơi mới nếu chưa được mở */
  unlockStage: (stageId: number) => set((state: T) => {
    const newProgress = { ...state.progress };
    if (!newProgress[stageId]) {
      newProgress[stageId] = { stageId, stars: 0, isUnlocked: true, bestScore: 0, dailyAttempts: 0, lastAttemptDate: null };
    } else {
      newProgress[stageId].isUnlocked = true;
    }
    return { progress: newProgress } as Partial<T>;
  }),

  /** 
   * Cập nhật kết quả sau khi người chơi hoàn thành màn chơi.
   * Đồng thời tự động mở khóa màn chơi kế tiếp hoặc màn chơi phụ nếu đạt điều kiện.
   */
  updateProgress: (stageId: number, stars: number, score: number) => set((state: T) => {
    const stage = state.stages.find(s => s.id === stageId);
    const isBoss = stage?.type === 'boss';
    const today = new Date().toISOString().split('T')[0];
    
    const current = state.progress[stageId] || { 
      stageId, 
      stars: 0, 
      isUnlocked: true, 
      bestScore: 0,
      dailyAttempts: 0,
      lastAttemptDate: null
    };
    
    // Reset lượt chơi nếu qua ngày mới
    let attempts = current.dailyAttempts || 0;
    if (current.lastAttemptDate !== today) {
      attempts = 0;
    }

    const newProgress = {
      ...state.progress,
      [stageId]: {
        ...current,
        stars: Math.max(current.stars, stars),
        bestScore: Math.max(current.bestScore, score),
        dailyAttempts: isBoss ? attempts + 1 : attempts,
        lastAttemptDate: today
      }
    };

    // Nếu vượt qua màn chơi (ít nhất 1 sao)
    if (stars > 0) {
      // Tìm màn chơi phụ liên kết với màn này
      const sideBranch = state.stages.find(s => s.isSideBranch && s.parentStageId === stageId);
      if (sideBranch && !newProgress[sideBranch.id]) {
        newProgress[sideBranch.id] = { 
          stageId: sideBranch.id, 
          stars: 0, 
          isUnlocked: true, 
          bestScore: 0,
          dailyAttempts: 0,
          lastAttemptDate: null
        };
      }

      // Tự động mở khóa màn chính kế tiếp (giới hạn tạm thời 25 màn)
      const isMainStage = stageId < 100;
      if (isMainStage && stageId < 25) {
        const nextId = stageId + 1;
        if (!newProgress[nextId]) {
          newProgress[nextId] = { 
            stageId: nextId, 
            stars: 0, 
            isUnlocked: true, 
            bestScore: 0,
            dailyAttempts: 0,
            lastAttemptDate: null
          };
        }
      }
    }

    return { progress: newProgress } as Partial<T>;
  }),
});
