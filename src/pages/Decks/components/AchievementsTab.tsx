import React from 'react';
import Card from '../../../components/shared/Card';
import { usePlayerStore } from '../../../store/playerStore';
import { MASTERY_MILESTONES } from '../../../data/achievementData';
import type { LibraryCard } from '../../../hooks/useDecksLogic';

interface AchievementsTabProps {
  handleClaimMasteryReward: (key: string, lvl: number) => void;
}

const AchievementsTab: React.FC<AchievementsTabProps> = ({ handleClaimMasteryReward }) => {
  const collection = usePlayerStore(state => state.collection);
  const cardMastery = usePlayerStore(state => state.cardMastery);

  const filteredCards = Object.entries(collection).filter(([, c]) => {
    const rarity = (c as LibraryCard).rarity;
    return rarity === 'rare' || rarity === 'super' || rarity === 'ultra';
  });

  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="bg-white/40 backdrop-blur-md p-6 rounded-[32px] border-2 border-black/5 shadow-sm mb-6">
        <h3 className="text-[12px] font-black text-primary uppercase italic tracking-[0.2em] mb-2 flex items-center gap-3">
          <div className="size-2 bg-amber-500 rounded-full animate-pulse" /> NHIỆM VỤ THÔNG THẠO
        </h3>
        <p className="text-[9px] font-bold text-primary/40 uppercase leading-relaxed tracking-wider">
          Sử dụng thẻ bài trong các trận đấu để tích lũy điểm thông thạo và mở khóa các mốc phần thưởng.
        </p>
      </div>

      {filteredCards.map(([key, card]) => {
        const typedCard = card as LibraryCard;
        const mastery = cardMastery[key] || { matchesPlayed: 0, completedLevels: [] };
        
        return (
          <div key={key} className="bg-white/60 backdrop-blur-md p-5 rounded-[40px] border-2 border-black shadow-sm flex flex-col gap-4">
            <div className="flex gap-6 items-center">
              <div className="scale-[0.75] shrink-0 -m-6">
                 <div className="p-1 rounded-[28px] bg-white border-2 border-black shadow-xl">
                    <Card id={key + "_m_mst"} {...typedCard} isDraggable={false} />
                 </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-[18px] font-black text-primary uppercase italic leading-none">
                      {['+', '-', '*', '/'].includes(typedCard.value) ? 'PHÉP' : 'SỐ'} {typedCard.value}
                    </h4>
                    <span className="text-[8px] font-black text-primary/20 uppercase tracking-widest">{typedCard.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[7px] font-black text-primary/30 uppercase block">TRẬN ĐẤU</span>
                    <span className="text-sm font-black text-primary">{mastery.matchesPlayed}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Milestones Grid */}
            <div className="grid grid-cols-5 gap-2">
              {MASTERY_MILESTONES.map(m => {
                const isDone = mastery.completedLevels.includes(m.level);
                const req = m.requirement;
                const canClaim = mastery.matchesPlayed >= req && !isDone;
                
                return (
                  <button 
                    key={m.level}
                    onClick={() => handleClaimMasteryReward(key, m.level)}
                    disabled={!canClaim && !isDone}
                    className={`
                      relative flex flex-col items-center justify-center py-2.5 rounded-2xl border-2 transition-all
                      ${isDone ? 'bg-green-500/5 border-green-500/20 opacity-40' : 
                        canClaim ? 'bg-amber-400 border-black shadow-[0_4px_0_#000] -translate-y-0.5 active:translate-y-0 active:shadow-none' : 
                        'bg-white border-black/5'}
                    `}
                  >
                    <span className={`text-[7px] font-black uppercase mb-1 ${canClaim ? 'text-white' : 'text-primary/20'}`}>MỐC {m.level}</span>
                    <span className={`text-[9px] font-black ${canClaim ? 'text-white' : 'text-primary/40'}`}>{req}</span>
                    
                    {canClaim && (
                      <div className="absolute -top-1 -right-1 z-10 size-2.5 bg-red-600 rounded-full border-2 border-white shadow-sm animate-bounce" />
                    )}
                    {isDone && <span className="absolute -top-1 -right-1 text-[10px]">✅</span>}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AchievementsTab;
