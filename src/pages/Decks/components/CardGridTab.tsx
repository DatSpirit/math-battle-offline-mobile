import React from 'react';
import Card from '../../../components/shared/Card';
import { usePlayerStore } from '../../../store/playerStore';
import type { LibraryCard } from '../../../hooks/useDecksLogic';

interface CardGridTabProps {
  cards: [string, LibraryCard][];
  selectedCardKey: string | null;
  setSelectedCardKey: (key: string | null) => void;
  activeTab: 'library' | 'owned' | 'resonance' | 'achievements';
  onViewCard?: (key: string) => void;
}

const CardGridTab: React.FC<CardGridTabProps> = ({ 
  cards, 
  selectedCardKey, 
  setSelectedCardKey, 
  activeTab,
  onViewCard
}) => {
  const newlyUnlockedCards = usePlayerStore(state => state.newlyUnlockedCards);
  const libraryRewardsClaimed = usePlayerStore(state => state.libraryRewardsClaimed);

  return (
    <div className="grid grid-cols-3 gap-3 p-3 pb-10">
      {cards.map(([key, card]) => {
        const isNew = newlyUnlockedCards.includes(key);
        const isClaimable = activeTab === 'library' && card.isOwned && !libraryRewardsClaimed.includes(key);
        const isSelected = selectedCardKey === key;

        return (
          <div
            key={key}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedCardKey(key);
              if (activeTab === 'library' && onViewCard) onViewCard(key);
            }}
            className={`
              relative cursor-pointer transition-transform active:scale-95
              ${isSelected ? 'z-20 scale-[1.05]' : ''}
              ${card.isOwned ? 'opacity-100' : 'opacity-40 grayscale'}
            `}
          >
            <div className="w-full h-full flex items-center justify-center">
              <div className="relative w-full max-w-[95px]">
                {isNew && (
                  <div className="absolute -top-1 -left-1 z-50">
                    <div className="bg-red-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-sm shadow-md animate-pulse uppercase tracking-tighter border border-white/20">
                      NEW
                    </div>
                  </div>
                )}
                {isClaimable && (
                  <div className="absolute -top-1 -right-1 z-30">
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600 border-2 border-white shadow-sm animate-pulse"></span>
                  </div>
                )}
                
                <Card 
                  id={key + "_m_grid"} 
                  {...card} 
                  isDraggable={false} 
                  isSelected={isSelected} 
                />

                {!card.isOwned && activeTab !== 'library' && (
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center rounded-[12px] overflow-hidden">
                    <div className="bg-black/60 backdrop-blur-sm text-white px-1.5 py-0.5 rounded-lg text-[6px] font-black uppercase">KHÓA</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CardGridTab;
