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
    <div className="grid grid-cols-4 gap-1.5 p-1.5 pb-10">
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
              relative cursor-pointer rounded-xl overflow-visible transition-transform active:scale-95 border-2 border-black
              ${isSelected ? 'ring-2 ring-primary ring-inset z-20 bg-primary/5 shadow-2xl scale-[1.05]' : 'bg-white/80 shadow-sm'}
              ${card.isOwned ? 'opacity-100' : 'opacity-40 grayscale'}
            `}
          >
            {isNew && (
              <div className="absolute -top-1 -left-1 z-50">
                <div className="bg-red-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-sm shadow-md animate-pulse uppercase tracking-tighter border border-white/20">
                  NEW
                </div>
              </div>
            )}
            {isClaimable && (
              <div className="absolute top-1.5 right-1.5 z-30">
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600 border border-white shadow-sm"></span>
              </div>
            )}
            
            <div className="aspect-[3/4.2] flex flex-col items-center justify-center p-0.5 overflow-hidden rounded-lg">
              <div className="scale-[0.82] origin-center">
                <Card 
                  id={key + "_m_grid"} 
                  {...card} 
                  isDraggable={false} 
                  isSelected={isSelected} 
                />
              </div>
            </div>
            
            {!card.isOwned && activeTab !== 'library' && (
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                <div className="bg-black/60 backdrop-blur-sm text-white px-1.5 py-0.5 rounded-lg text-[6px] font-black uppercase">KHÓA</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CardGridTab;
