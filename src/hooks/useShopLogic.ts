import { useState } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { SHOP_PRODUCTS } from '../data/shopData';
import type { ShopItem, ShopPackReward } from '../types/shop.types';
import { useSound } from '../hooks/useSound';
import { generatePackCards } from '../core/shop/gachaService';
import type { CollectionCard } from '../types/player.types';
import { useUIStore } from '../store/uiStore';

export const useShopLogic = () => {
  const { coins, gems, buyWithCurrency, buyPack } = usePlayerStore();
  const { playSound } = useSound();
  const { showNotification } = useUIStore();

  const [isOpening, setIsOpening] = useState(false);
  const [openedCards, setOpenedCards] = useState<CollectionCard[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedCashItem, setSelectedCashItem] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [filter, setFilter] = useState<'all' | 'gems' | 'packs' | 'coins'>('all');
  const [rewardModal, setRewardModal] = useState<{ isOpen: boolean; rewards: { coins: number; gems: number } } | null>(null);

  const handlePurchase = (item: ShopItem) => {
    if (item.currency === 'cash') {
      setSelectedCashItem(item.id);
      return;
    }

    const { success, msg } = buyWithCurrency(item.id);
    if (!success) {
      showNotification(msg, 'error');
      return;
    }

    if (item.rewardType === 'card_pack' && typeof item.rewardValue === 'object') {
      const reward = item.rewardValue as ShopPackReward;
      const newCardsRaw = generatePackCards(item.id, reward.cards);
      const newCards: CollectionCard[] = newCardsRaw.map(c => ({
        ...c,
        count: 1,
        level: 1,
        stars: 0
      }));
      setOpenedCards(newCards);
      setIsOpening(true);
      playSound('summon');

      setTimeout(() => {
        playSound('reward');
        if (newCards.some(c => c.rarity === 'super' || c.rarity === 'ultra')) {
          setShowConfetti(true);
          playSound('combo');
          setTimeout(() => setShowConfetti(false), 5000);
        }
        buyPack(newCards);
      }, 1500);
    } else {
      playSound('reward');
      setRewardModal({ 
        isOpen: true, 
        rewards: { 
          coins: item.rewardType === 'coins' ? Number(item.rewardValue) : 0, 
          gems: item.rewardType === 'gems' ? Number(item.rewardValue) : 0 
        } 
      });
    }
  };

  const filteredItems = SHOP_PRODUCTS.filter((item: ShopItem) => {
    if (filter === 'all') return true;
    if (filter === 'gems') return item.rewardType === 'gems';
    if (filter === 'coins') return item.rewardType === 'coins';
    if (filter === 'packs') return item.rewardType === 'card_pack';
    return true;
  });

  return {
    coins, gems,
    isOpening, setIsOpening,
    openedCards,
    showConfetti,
    selectedCashItem, setSelectedCashItem,
    showHistory, setShowHistory,
    filter, setFilter,
    handlePurchase,
    filteredItems,
    rewardModal,
    setRewardModal
  };
};
