import type { PlayerState } from './types';
import type { Transaction, ShopItem } from '../../types/shop.types';
import { SHOP_PRODUCTS } from '../../data/shopData';
import { generatePackCards } from '../../core/shop/gachaService';
import type { StoreApi } from 'zustand';

/**
 * SLICE: Cửa hàng (Shop)
 * Quản lý logic mua sắm bằng tiền tệ (Vàng/Kim cương) hoặc nạp tiền qua các cổng thanh toán.
 */
export const createShopSlice = (
  set: StoreApi<PlayerState>['setState'],
  get: StoreApi<PlayerState>['getState']
) => ({
  /** Danh sách lịch sử giao dịch của người chơi */
  transactions: [] as Transaction[],
  /** Danh sách các sản phẩm đang được bán trong shop (lấy từ dữ liệu mẫu) */
  shopProducts: SHOP_PRODUCTS as ShopItem[],

  /**
   * Khởi tạo quá trình thanh toán (thường dùng cho nạp tiền thật/kim cương).
   * @param itemId ID của sản phẩm trong shopData
   * @returns ID giao dịch (Transaction ID) được tạo ra
   */
  initiatePayment: (itemId: string) => {
    const product = SHOP_PRODUCTS.find((p: ShopItem) => p.id === itemId);
    if (!product) return '';
    
    const txId = `tx_${Date.now()}`;
    const newTx: Transaction = {
      id: txId,
      itemId,
      amount: product.price,
      currency: product.currency,
      status: 'pending',
      timestamp: new Date().toISOString()
    };

    set((s: PlayerState) => ({ 
      transactions: [newTx, ...(s.transactions || [])] 
    }) as Partial<PlayerState>);
    return txId;
  },

  /**
   * Kiểm tra và reset giới hạn mua hàng ngày nếu đã qua ngày mới.
   */
  checkShopReset: () => {
    const state = get();
    const today = new Date().toISOString().split('T')[0];
    const lastReset = state.lastShopReset?.split('T')[0];

    if (today !== lastReset) {
      set({ 
        shopDailyLimits: {}, 
        lastShopReset: new Date().toISOString() 
      } as Partial<PlayerState>);
    }
  },

  /**
   * Xác nhận thanh toán thành công và trao thưởng cho người chơi.
   * @param txId ID giao dịch cần hoàn tất
   */
  completePayment: (txId: string) => {
    const state = get();
    state.checkShopReset(); // Đảm bảo reset giới hạn trước khi kiểm tra

    const tx = state.transactions?.find((t: Transaction) => t.id === txId);
    if (!tx || tx.status !== 'pending') return;

    const product = SHOP_PRODUCTS.find((p: ShopItem) => p.id === tx.itemId);
    if (!product) return;

    // Kiểm tra giới hạn hàng ngày
    if (product.dailyLimit) {
      const currentCount = state.shopDailyLimits[product.id] || 0;
      if (currentCount >= product.dailyLimit) {
        // Giao dịch đã thanh toán nhưng vượt hạn mức? 
        // Trong thực tế cần xử lý hoàn tiền hoặc cộng bù sau.
        // Ở đây giả lập thông báo lỗi.
        return;
      }
      set((s: PlayerState) => ({
        shopDailyLimits: { ...s.shopDailyLimits, [product.id]: currentCount + 1 }
      }) as Partial<PlayerState>);
    }

    // Trao thưởng dựa trên loại sản phẩm (Kim cương hoặc Vàng)
    if (product.rewardType === 'gems') {
        set((s: PlayerState) => ({ gems: s.gems + (product.rewardValue as number) }) as Partial<PlayerState>);
    } else if (product.rewardType === 'coins') {
        set((s: PlayerState) => ({ coins: s.coins + (product.rewardValue as number) }) as Partial<PlayerState>);
    }

    // Cập nhật trạng thái giao dịch thành hoàn thành
    set((s: PlayerState) => ({
      transactions: s.transactions.map((t: Transaction) => t.id === txId ? { ...t, status: 'completed' } : t)
    }) as Partial<PlayerState>);
  },

  /**
   * Thực hiện mua hàng bằng tiền tệ trong game (Vàng/Kim cương).
   * @param itemId ID của sản phẩm
   * @returns Kết quả giao dịch (thành công/thất bại và thông báo)
   */
  buyWithCurrency: (itemId: string) => {
    const state = get();
    state.checkShopReset();

    const product = SHOP_PRODUCTS.find((p: ShopItem) => p.id === itemId);
    if (!product) return { success: false, msg: 'Sản phẩm không tồn tại' };

    // Kiểm tra giới hạn hàng ngày
    if (product.dailyLimit) {
      const currentCount = state.shopDailyLimits[product.id] || 0;
      if (currentCount >= product.dailyLimit) {
        return { success: false, msg: `Đã đạt giới hạn mua hôm nay (${product.dailyLimit}/${product.dailyLimit})` };
      }
    }

    // Kiểm tra số dư tài khoản
    if (product.currency === 'coins') {
      if (state.coins < product.price) return { success: false, msg: 'Không đủ Vàng' };
      set((s: PlayerState) => ({ coins: s.coins - product.price }) as Partial<PlayerState>);
      state.updateQuestProgress('d5', product.price); // Nhiệm vụ tiêu vàng
    } else if (product.currency === 'gems') {
      if (state.gems < product.price) return { success: false, msg: 'Không đủ Kim Cương' };
      set((s: PlayerState) => ({ gems: s.gems - product.price }) as Partial<PlayerState>);
    }

    // Xử lý giới hạn mua sau khi trừ tiền
    if (product.dailyLimit) {
      const currentCount = state.shopDailyLimits[product.id] || 0;
      set((s: PlayerState) => ({
        shopDailyLimits: { ...s.shopDailyLimits, [product.id]: currentCount + 1 }
      }) as Partial<PlayerState>);
    }

    // Xử lý phần thưởng nhận được
    if (product.rewardType === 'gems') {
      set((s: PlayerState) => ({ gems: s.gems + (product.rewardValue as number) }) as Partial<PlayerState>);
    } else if (product.rewardType === 'coins') {
      set((s: PlayerState) => ({ coins: s.coins + (product.rewardValue as number) }) as Partial<PlayerState>);
    } else if (product.rewardType === 'card_pack') {
      // Mở gói thẻ bài (Gacha)
      const { buyPack } = get();
      const packReward = product.rewardValue as { cards: number; rarity: string };
      const newCards = generatePackCards(product.id, packReward.cards);
      buyPack(newCards);
      
      // Track Quests cho Summon
      state.updateQuestProgress('d6', 1); // Triệu hồi 1 lần (Daily)
      state.updateQuestProgress('w7', 1); // Triệu hồi (Weekly)
      state.updateQuestProgress('w14', 1); // Mở 10 gói bài (Weekly)
    }

    // Ghi lại lịch sử giao dịch thành công
    const txId = `tx_${Date.now()}`;
    const newTx: Transaction = {
      id: txId,
      itemId,
      amount: product.price,
      currency: product.currency,
      status: 'completed',
      timestamp: new Date().toISOString()
    };
    set((s: PlayerState) => ({ 
      transactions: [newTx, ...(s.transactions || [])] 
    }) as Partial<PlayerState>);

    return { success: true, msg: 'Mua hàng thành công!' };
  }
});
