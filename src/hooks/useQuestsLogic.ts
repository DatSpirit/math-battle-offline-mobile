import { useState, useEffect } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { useSound } from './useSound';

export const useQuestsLogic = () => {
  const { activeQuests, claimQuestReward, lastQuestReset, lastWeeklyReset } = usePlayerStore();
  const { playSound } = useSound();
  const [dailyTimeLeft, setDailyTimeLeft] = useState('');
  const [weeklyTimeLeft, setWeeklyTimeLeft] = useState('');
  const [rewardModal, setRewardModal] = useState<{ isOpen: boolean; rewards: { coins: number; gems: number } } | null>(null);

  const dailyQuests = activeQuests.filter(q => q.type === 'daily');
  const weeklyQuests = activeQuests.filter(q => q.type === 'weekly');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      
      // Daily Timer
      const lastDR = new Date(lastQuestReset);
      const nextDR = new Date(lastDR.getTime() + 24 * 60 * 60 * 1000);
      const diffD = nextDR.getTime() - now.getTime();
      
      if (diffD <= 0) {
        setDailyTimeLeft('00:00:00');
      } else {
        const h = Math.floor(diffD / (1000 * 60 * 60));
        const m = Math.floor((diffD % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diffD % (1000 * 60)) / 1000);
        setDailyTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      }

      // Weekly Timer
      const lastWR = new Date(lastWeeklyReset || lastQuestReset);
      const nextWR = new Date(lastWR.getTime() + 7 * 24 * 60 * 60 * 1000);
      const diffW = nextWR.getTime() - now.getTime();

      if (diffW <= 0) {
        setWeeklyTimeLeft('0d 00h');
      } else {
        const d = Math.floor(diffW / (1000 * 60 * 60 * 24));
        const h = Math.floor((diffW % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        setWeeklyTimeLeft(`${d}d ${h}h`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lastQuestReset, lastWeeklyReset]);

  // Play-time tracker: Cập nhật 'd9' mỗi phút (goal 10 phút)
  useEffect(() => {
    const playTimer = setInterval(() => {
      usePlayerStore.getState().updateQuestProgress('d9', 1);
    }, 60000);
    return () => clearInterval(playTimer);
  }, []);

  const handleClaim = (id: string) => {
    const result = claimQuestReward(id);
    if (result.success) {
      setRewardModal({ isOpen: true, rewards: { coins: result.reward, gems: result.gems || 0 } });
      playSound('reward');
    }
  };

  return {
    dailyQuests,
    weeklyQuests,
    dailyTimeLeft,
    weeklyTimeLeft,
    handleClaim,
    rewardModal,
    setRewardModal
  };
};
