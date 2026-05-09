import { useState, useCallback, useEffect, useRef } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { useSound } from '../hooks/useSound';
import { generatePackCards } from '../core/shop/gachaService';
import type { CollectionCard } from '../types/player.types';
import { useUIStore } from '../store/uiStore';

/**
 * Ý TƯỞNG CỐT LÕI - THƯ VIỆN SỐ HỌC (SUMMON LIBRARY):
 * 1. Cấu trúc kệ sách 3D: Phân chia 3 cấp bậc triệu hồi (Thường - ngăn dưới, Hiếm - ngăn giữa, Tối thượng - ngăn trên).
 * 2. Thử thách toán học: Mỗi lần triệu hồi cần giải mã phong ấn trong 5 giây. 
 *    - Trả lời đúng: Tăng 50% tỉ lệ ra thẻ hiếm (+% rarity bonus).
 *    - Trả lời sai/Hết giờ: Giảm 50% tỉ lệ ra thẻ hiếm (-% rarity penalty).
 * 3. Độ khó toán học (Difficulty Scaling): 
 *    - Thường: Phép tính 1 chữ số.
 *    - Hiếm: Hỗn hợp 1 & 2 chữ số.
 *    - Tối thượng: Phép tính 2 chữ số khó.
 * 4. Du hành Hố Giun (Wormhole): Hiệu ứng lật trang thẻ bài thông qua không gian số học kéo dài 10s (có thể Skip).
 */

export type SummonTier = 'summon_normal' | 'summon_rare' | 'summon_ultimate';
export type SummonMethod = 'x1' | 'x10';

interface MathProblem {
  question: string;
  options: { text: string; isCorrect: boolean }[];
}

export const useSummonLogic = () => {
  const { coins, gems, addCoins, addGems, buyPack } = usePlayerStore();
  const { playSound, stopSound } = useSound();
  const { showNotification } = useUIStore();

  // State quản lý việc mở thẻ và phần thưởng
  const [isOpening, setIsOpening] = useState(false);
  const [openedCards, setOpenedCards] = useState<CollectionCard[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [rewardModal, setRewardModal] = useState<{ isOpen: boolean; rewards: { coins: number; gems: number } } | null>(null);

  // State quản lý luồng triệu hồi (Flow)
  const [activeTier, setActiveTier] = useState<SummonTier | null>(null);
  const [activeMethod, setActiveMethod] = useState<SummonMethod | null>(null);
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
  const [isSolving, setIsSolving] = useState(false);
  const [isWormholeActive, setIsWormholeActive] = useState(false);
  
  // Timer cho câu hỏi toán học (5 giây)
  const [timeLeft, setTimeLeft] = useState(5);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wormholeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hàm tạo câu hỏi theo độ khó của từng loại sách
  const generateProblem = useCallback((tier: SummonTier) => {
    let a, b;
    if (tier === 'summon_normal') {
      // Phép tính 1 chữ số
      a = Math.floor(Math.random() * 9) + 1;
      b = Math.floor(Math.random() * 9) + 1;
    } else if (tier === 'summon_rare') {
      // Hỗn hợp 1 và 2 chữ số
      a = Math.floor(Math.random() * 15) + 5;
      b = Math.floor(Math.random() * 9) + 1;
    } else {
      // Phép tính 2 chữ số
      a = Math.floor(Math.random() * 40) + 10;
      b = Math.floor(Math.random() * 40) + 10;
    }

    const isSum = Math.random() > 0.5;
    const result = isSum ? a + b : a * b;
    // Tạo đáp án sai gần đúng để đánh lừa
    const wrongResult = result + (Math.random() > 0.5 ? (Math.random() > 0.5 ? 10 : 1) : -1);
    
    const options = [
      { text: String(result), isCorrect: true },
      { text: String(wrongResult), isCorrect: false }
    ].sort(() => Math.random() - 0.5);

    return {
      question: `${a} ${isSum ? '+' : '×'} ${b} = ?`,
      options
    };
  }, []);

  const finishSummon = useCallback((cards: CollectionCard[]) => {
    stopSound('summon');
    setIsWormholeActive(false);
    setIsOpening(true);


    // Hiển thị pháo hoa nếu trúng thẻ cực hiếm
    setTimeout(() => {
      playSound('reward');
      if (cards.some(c => c.rarity === 'super' || c.rarity === 'ultra')) {
        setShowConfetti(true);
        playSound('combo');
        setTimeout(() => setShowConfetti(false), 5000);
      }
      buyPack(cards);
    }, 1500);
  }, [buyPack, playSound]);

  // Xử lý khi người dùng chọn đáp án hoặc hết giờ
  const handleAnswer = useCallback((isCorrect: boolean) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsSolving(false);
    setIsWormholeActive(true);
    playSound(isCorrect ? 'win' : 'loss'); // Âm thanh báo kết quả giải toán
    playSound('summon'); // Bắt đầu âm thanh triệu hồi hố giun


    // Áp dụng Bonus 50% nếu đúng, Penalty 50% nếu sai
    const bonus = isCorrect ? 1.5 : 0.5;
    const cardCount = activeMethod === 'x1' ? 1 : 10;

    const newCardsRaw = generatePackCards(activeTier!, cardCount, bonus);
    const newCards: CollectionCard[] = newCardsRaw.map(c => ({
      ...c,
      count: 1,
      level: 1,
      stars: 0
    }));

    setOpenedCards(newCards);

    // Tự động kết thúc du hành sau 5 giây nếu không bấm Skip
    wormholeTimerRef.current = setTimeout(() => {
      finishSummon(newCards);
    }, 5000);
  }, [activeMethod, activeTier, finishSummon, playSound]);

  const initiateSummon = (tier: SummonTier, method: SummonMethod) => {
    const state = usePlayerStore.getState();
    const isFree = method === 'x1' && !state.freeSummonsUsed[tier];

    const basePrices = {
      summon_normal: { x1: 200, currency: 'coins' as const },
      summon_rare: { x1: 100, currency: 'gems' as const },
      summon_ultimate: { x1: 250, currency: 'gems' as const }
    };

    const config = basePrices[tier];
    const rawCost = method === 'x1' ? config.x1 : config.x1 * 10;
    // Giảm giá 10% khi thuê 10 quyển (triệu hồi x10)
    const finalCost = method === 'x10' ? Math.floor(rawCost * 0.9) : rawCost;

    // Nếu là lượt miễn phí, không trừ tiền
    if (isFree) {
      console.log(`[Summon] Using free daily spin for ${tier}`);
      // Đánh dấu đã dùng lượt miễn phí
      usePlayerStore.setState((s) => ({
        freeSummonsUsed: { ...s.freeSummonsUsed, [tier]: true }
      }));
    } else {
      if (config.currency === 'coins' && coins < finalCost) {
        showNotification('Không đủ Vàng!', 'error');
        return;
      }
      if (config.currency === 'gems' && gems < finalCost) {
        showNotification('Không đủ Kim cương!', 'error');
        return;
      }

      if (config.currency === 'coins') addCoins(-finalCost);
      else addGems(-finalCost);
    }

    setActiveTier(tier);
    setActiveMethod(method);
    setCurrentProblem(generateProblem(tier));
    setIsSolving(true);
    setTimeLeft(5);
    playSound('click');
  };

  // Vòng lặp Timer cho câu hỏi
  useEffect(() => {
    if (isSolving && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (isSolving && timeLeft === 0) {
      // Sử dụng setTimeout 0 để chuyển việc cập nhật state sang lượt tiếp theo của event loop
      // Tránh lỗi "Calling setState synchronously within an effect"
      setTimeout(() => handleAnswer(false), 0);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isSolving, timeLeft, handleAnswer]);

  const skipWormhole = () => {
    if (wormholeTimerRef.current) clearTimeout(wormholeTimerRef.current);
    finishSummon(openedCards);
  };

  const { freeSummonsUsed } = usePlayerStore();

  return {
    coins, gems,
    isOpening, setIsOpening,
    openedCards,
    showConfetti,
    rewardModal, setRewardModal,
    isSolving, currentProblem, timeLeft,
    isWormholeActive,
    initiateSummon, handleAnswer, skipWormhole,
    freeSummonsUsed, stopSound
  };
};
