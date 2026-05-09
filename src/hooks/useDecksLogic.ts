import { useState, useMemo } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { useSound } from '../hooks/useSound';
import { useUIStore } from '../store/uiStore';
import { CARD_METADATA } from '../data/cardMetadata';
import { RESONANCE_COMBOS } from '../data/resonanceData';
import type { Rarity } from '../types/game';
import type { CollectionCard } from '../types/player.types';

export type LibraryCard = CollectionCard & { isOwned: boolean; [key: string]: unknown };

const rarityOrder = { 'normal': 0, 'rare': 1, 'super': 2, 'ultra': 3 };

/**
 * Hook quản lý logic cho trang Kho thẻ và Thư viện.
 * Bao gồm: Lọc, sắp xếp, nâng cấp, thăng hoa và nhận thưởng.
 */
export const useDecksLogic = () => {
  // Lấy dữ liệu và các hàm hành động từ Player Store
  const { 
    collection, 
    upgradeCardLevel, 
    injectEvoPoints,
    libraryRewardsClaimed,
    resonanceRewardsClaimed,
    cardMastery,
    claimLibraryReward,
    claimResonanceReward,
    claimMasteryReward
  } = usePlayerStore();
  
  const { playSound } = useSound();
  const { showNotification } = useUIStore();
  
  // State quản lý thẻ đang chọn và hiệu ứng
  const [selectedCardKey, setSelectedCardKey] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isEvolving, setIsEvolving] = useState(false);
  const [isEvolutionSuccess, setIsEvolutionSuccess] = useState(false);
  const [isEvolutionModalOpen, setIsEvolutionModalOpen] = useState(false);
  
  /** 
   * previousStars: Lưu trữ số lượng sao của thẻ trước khi thực hiện thăng hoa.
   * Mục đích: Giúp tính toán số lượng sao mới được thêm vào để chạy hiệu ứng lấp đầy tuần tự (7 giây).
   */
  const [previousStars, setPreviousStars] = useState(0);
  const [previousRedStars, setPreviousRedStars] = useState(0);

  // State quản lý bộ lọc và sắp xếp
  const [sortBy, setSortBy] = useState<'rarity' | 'value' | 'level' | 'stars'>('value');
  const [filterRarity, setFilterRarity] = useState<'all' | Rarity>('all');
  const [filterOwnership, setFilterOwnership] = useState<'all' | 'owned'>('all');
  const [activeTab, setActiveTab] = useState<'owned' | 'library' | 'resonance' | 'achievements'>('owned');

  /**
   * Tạo danh sách toàn bộ thẻ trong trò chơi (Thư viện).
   * Kết hợp thông tin từ CARD_METADATA và dữ liệu sở hữu trong collection.
   */
  const fullLibrary = useMemo(() => {
    const ALL_RARITIES: Rarity[] = ['normal', 'rare', 'super', 'ultra'];
    const baseCards = Object.entries(CARD_METADATA);
    const library: [string, LibraryCard][] = [];

    baseCards.forEach(([value]) => {
      const type = ['+', '-', '*', '/'].includes(value) ? 'operator' : 'number';
      ALL_RARITIES.forEach(rarity => {
        const key = `${type}_${value}_${rarity}`;
        const owned = collection[key];
        
        // Hỗ trợ tương thích ngược cho các bản lưu cũ
        const oldKey = `${type}_${value}`;
        const fallback = collection[oldKey] && collection[oldKey].rarity === rarity ? collection[oldKey] : null;
        
        const cardData = owned || fallback;
        const latestMeta = CARD_METADATA[value] || {};

        if (cardData && cardData.count > 0) {
          library.push([key, { 
            ...cardData, 
            ...latestMeta,
            isOwned: true 
          }]);
        } else {
          library.push([key, { 
            value, type, rarity, 
            ...latestMeta, 
            count: 0, level: 1, stars: 0, isOwned: false 
          }]);
        }
      });
    });

    return library;
  }, [collection]);

  /**
   * Danh sách thẻ sau khi đã áp dụng bộ lọc và sắp xếp.
   * Dùng để hiển thị lên Grid giao diện.
   */
  const collectionList = useMemo(() => {
    let list = fullLibrary;
    if (activeTab === 'owned') {
      list = list.filter(([, card]) => card.isOwned);
    }
    if (filterRarity !== 'all') {
      list = list.filter(([, card]) => card.rarity === filterRarity);
    }

    return list.sort((a, b) => {
      const cardA = a[1];
      const cardB = b[1];
      
      if (sortBy === 'rarity') {
        if (cardA.rarity !== cardB.rarity) {
          return rarityOrder[cardB.rarity as keyof typeof rarityOrder] - rarityOrder[cardA.rarity as keyof typeof rarityOrder];
        }
        return cardA.value.localeCompare(cardB.value);
      }
      if (sortBy === 'level') return cardB.level - cardA.level;
      if (sortBy === 'stars') return cardB.stars - cardA.stars;
      
      if (cardA.type !== cardB.type) return cardA.type === 'number' ? -1 : 1;
      return cardA.value.localeCompare(cardB.value);
    });
  }, [fullLibrary, filterRarity, sortBy, activeTab]);

  /**
   * Dữ liệu chi tiết của thẻ đang được chọn để hiển thị trong Inspector.
   */
  const selectedCard = useMemo(() => {
    return selectedCardKey ? fullLibrary.find(c => c[0] === selectedCardKey)?.[1] || null : null;
  }, [selectedCardKey, fullLibrary]);

  // State quản lý Modal hiển thị phần thưởng nhận được
  const [rewardModal, setRewardModal] = useState<{ isOpen: boolean; rewards: { coins: number; gems: number } } | null>(null);

  // --- Logic Thông báo (Notifications) ---

  /**
   * Kiểm tra xem có thẻ mới nào trong thư viện chưa nhận thưởng khai phá không.
   */
  const hasLibraryReward = useMemo(() => {
    return fullLibrary.some(([key, card]) => {
      return card.isOwned && !libraryRewardsClaimed.includes(key);
    });
  }, [fullLibrary, libraryRewardsClaimed]);

  /**
   * Kiểm tra xem có bộ cộng hưởng (Combo) nào đủ điều kiện nhận thưởng không.
   */
  const hasResonanceReward = useMemo(() => {
    return RESONANCE_COMBOS.some(combo => {
      const isClaimed = resonanceRewardsClaimed.includes(combo.id);
      const canClaim = combo.requiredCards.every(val => 
        Object.values(collection).some(c => {
          const tc = c as LibraryCard;
          return tc.value === val && (!combo.requiredRarity || tc.rarity === combo.requiredRarity);
        })
      );
      return canClaim && !isClaimed;
    });
  }, [collection, resonanceRewardsClaimed]);

  /**
   * Kiểm tra xem có thành tựu Mastery (thông thạo) nào đủ điều kiện nhận thưởng không.
   */
  const hasAchievementReward = useMemo(() => {
    return Object.entries(collection).some(([key, card]) => {
      if ((card as LibraryCard).rarity === 'normal') return false;
      const m = cardMastery[key] || { matchesPlayed: 0, completedLevels: [] };
      return [1, 2, 3, 4, 5].some(lvl => {
        const isDone = m.completedLevels.includes(lvl);
        const req = lvl === 1 ? 10 : lvl === 2 ? 25 : lvl === 3 ? 50 : lvl === 4 ? 100 : 250;
        return m.matchesPlayed >= req && !isDone;
      });
    });
  }, [collection, cardMastery]);

  const hasAnyReward = hasLibraryReward || hasResonanceReward || hasAchievementReward;

  /**
   * Tính toán chi phí Gold để nâng cấp cấp độ thẻ.
   */
  const getLevelUpCost = (level: number) => level * 100;
  
  /**
   * Tính toán tiến trình thăng hoa (điểm kinh nghiệm sao) của thẻ.
   */
  const getEvolutionProgress = useMemo(() => {
    return (card: LibraryCard | null) => {
      if (!card || card.rarity === 'normal' || card.stars >= 5) return { points: 0, needed: 1, percent: 0, hasHalfStar: false };
      
      const needed = [1, 2, 4, 8, 16][card.stars];
      const points = card.evoPoints || 0;

      const finalPoints = Math.min(points, needed);
      return { 
          points, 
          needed, 
          percent: (finalPoints / needed) * 100,
          hasHalfStar: points >= (needed * 0.5)
      };
    };
  }, []);

  /**
   * Lấy hệ số sức mạnh dựa trên số sao.
   */
  const getStarMultiplier = (stars: number, hasHalfStar: boolean = false) => {
    const m = [1, 1.2, 1.5, 2.0, 2.5, 4.0];
    const base = m[stars] || 1;
    if (hasHalfStar && stars < 5) {
      const next = m[stars + 1] || base;
      return (base + next) / 2;
    }
    return base;
  };

  /**
   * Chi phí Gold để thực hiện nghi lễ thăng hoa lên sao tiếp theo.
   */
  const getEvolutionCost = (stars: number) => {
    return [10000, 25000, 50000, 100000, 250000][stars] || 0;
  };

  /**
   * Xử lý nâng cấp cấp độ (Level Up) cho thẻ đang chọn.
   */
  const handleLevelUp = () => {
    if (!selectedCardKey || !selectedCard) return;
    if (selectedCard.rarity === 'normal') return;
    const cost = getLevelUpCost(selectedCard.level);
    
    // Check gold before calling store
    const currentCoins = usePlayerStore.getState().coins;
    if (currentCoins < cost) {
      showNotification(`Không đủ vàng để nâng cấp (Cần ${cost.toLocaleString()})`, 'error');
      playSound('loss'); // Hoặc tiếng cảnh báo lỗi khác
      return;
    }

    if (upgradeCardLevel(selectedCardKey, cost)) {
      playSound('upgrade');
    } else {
      playSound('loss');
    }
  };

  /**
   * Mở giao diện (Modal) Nghi lễ thăng hoa.
   */
  const handleEvolve = () => {
    if (!selectedCardKey || !selectedCard) return;
    if (selectedCard.rarity === 'normal') return;
    
    // Kiểm tra yêu cầu cấp độ tối thiểu
    // Cấp 10 -> 1*, 40 -> 4*, 50 -> 5* (Vàng)
    // 5* Vàng -> 1* Đỏ: Cần Cấp 50
    // 1* Đỏ -> 2* Đỏ: Cần Cấp 60...
    let requiredLevel = (selectedCard.stars + 1) * 10;
    if (selectedCard.stars === 5) {
      requiredLevel = 50 + (selectedCard.redStars || 0) * 10;
    }

    if (selectedCard.level < requiredLevel) {
        showNotification(`Chưa đủ điều kiện thăng hoa (Cần đạt Cấp ${requiredLevel})`, 'error');
        playSound('loss');
        return;
    }

    setIsEvolutionModalOpen(true);
  };

  /**
   * Thực hiện nạp nguyên liệu và tăng điểm thăng hoa cho thẻ.
   * Kích hoạt hiệu ứng thăng hoa nếu thành công.
   */
  const executeInjection = (materials: Record<string, number>, cost: number, pointsToAdd: number, selectedBooks: number = 0) => {
    if (!selectedCardKey || !selectedCard) return;
    setPreviousStars(selectedCard.stars);
    setPreviousRedStars(selectedCard.redStars || 0);
    if (injectEvoPoints({ cardKey: selectedCardKey, materials, cost, pointsToAdd, providedBooks: selectedBooks })) {
      setIsEvolutionModalOpen(false);
      setIsEvolving(true);
      playSound('upgrade');
      
      setTimeout(() => {
        setIsEvolutionSuccess(true);
        setShowConfetti(true);
        playSound('win');
      }, 7000);
    } else {
      playSound('loss');
    }
  };

  /**
   * Nhận thưởng khai phá cho thẻ trong Thư viện.
   */
  const handleClaimLibraryReward = () => {
    if (!selectedCardKey) return;
    const res = claimLibraryReward(selectedCardKey);
    if (res.success) {
      setRewardModal({ isOpen: true, rewards: { coins: res.coins, gems: res.gems } });
      playSound('reward');
    }
  };

  /**
   * Nhận thưởng cho bộ Cộng hưởng (Resonance).
   */
  const handleClaimResonanceReward = (id: string) => {
    const res = claimResonanceReward(id);
    if (res.success) {
      setRewardModal({ isOpen: true, rewards: { coins: res.coins, gems: res.gems } });
      playSound('reward');
    }
  };

  /**
   * Nhận thưởng cho thành tựu Mastery của thẻ.
   */
  const handleClaimMasteryReward = (key: string, lvl: number) => {
    const res = claimMasteryReward(key, lvl);
    if (res.success) {
      setRewardModal({ isOpen: true, rewards: { coins: res.coins, gems: res.gems } });
      playSound('reward');
    }
  };

  return {
    collectionList,
    selectedCard,
    selectedCardKey,
    setSelectedCardKey,
    sortBy,
    setSortBy,
    filterRarity,
    setFilterRarity,
    activeTab,
    setActiveTab,
    showConfetti,
    setShowConfetti,
    isEvolving,
    setIsEvolving,
    isEvolutionSuccess,
    setIsEvolutionSuccess,
    previousStars,
    previousRedStars,
    isEvolutionModalOpen,
    setIsEvolutionModalOpen,
    handleLevelUp,
    handleEvolve,
    executeInjection,
    getLevelUpCost,
    getEvolutionCost,
    getStarMultiplier,
    getEvolutionProgress,
    playSound,
    filterOwnership,
    setFilterOwnership,
    rewardModal,
    setRewardModal,
    handleClaimLibraryReward,
    handleClaimResonanceReward,
    handleClaimMasteryReward,
    libraryRewardsClaimed,
    notifications: {
      library: hasLibraryReward,
      resonance: hasResonanceReward,
      achievements: hasAchievementReward,
      any: hasAnyReward
    }
  };
};
