import React from 'react';
import { TargetIcon, StarIcon, AwardIcon, CoinIcon, GemIcon } from '../../../components/shared/Icons';
import Card from '../../../components/shared/Card';
import { RESONANCE_COMBOS } from '../../../data/resonanceData';
import { CARD_METADATA } from '../../../data/cardMetadata';
import { usePlayerStore } from '../../../store/playerStore';
import type { LibraryCard } from '../../../hooks/useDecksLogic';
import type { Rarity, CardType } from '../../../types/game';
import type { ResonanceCombo } from '../../../data/resonanceData';
import type { CollectionCard } from '../../../types/player.types';

interface ResonanceTabProps {
  handleClaimResonanceReward: (id: string) => void;
}

const rarityOrder: Record<Rarity, number> = { 'normal': 0, 'rare': 1, 'super': 2, 'ultra': 3 };

const ResonanceTab: React.FC<ResonanceTabProps> = ({ handleClaimResonanceReward }) => {
  const collection = usePlayerStore(state => state.collection);
  const resonanceRewardsClaimed = usePlayerStore(state => state.resonanceRewardsClaimed);

  const energyCombos = RESONANCE_COMBOS.filter(c => c.category === 'energy');
  const collectionSets = RESONANCE_COMBOS.filter(c => c.category === 'collection');

  const checkIsOwned = (combo: typeof RESONANCE_COMBOS[0]) => {
    if (combo.requiredCards.length === 0) {
      return (Object.values(collection) as CollectionCard[]).filter(c => 
        (c.count > 0) && 
        (combo.requiredRarity ? c.rarity === combo.requiredRarity : true) &&
        (combo.minRarity ? rarityOrder[c.rarity as Rarity] >= rarityOrder[combo.minRarity as Rarity] : true)
      ).length >= 3;
    }
    return combo.requiredCards.every((val: string) => 
      (Object.values(collection) as CollectionCard[]).some(c => 
        c.value === val && (c.count > 0) && 
        (combo.requiredRarity ? c.rarity === combo.requiredRarity : true) &&
        (combo.minRarity ? rarityOrder[c.rarity as Rarity] >= rarityOrder[combo.minRarity as Rarity] : true)
      )
    );
  };

  const renderComboCard = (val: string, combo: ResonanceCombo) => {
    const matchedCard = (Object.values(collection) as CollectionCard[]).find(c => 
      c.value === val && (c.count > 0) && 
      (combo.requiredRarity ? c.rarity === combo.requiredRarity : true) &&
      (combo.minRarity ? rarityOrder[c.rarity as Rarity] >= rarityOrder[combo.minRarity as Rarity] : true)
    ) as LibraryCard | undefined;
    
    const hasCard = !!matchedCard;
    const meta = CARD_METADATA[val] || {};
    
    const cardToRender = {
      value: val,
      type: (['+', '-', '*', '/'].includes(val) ? 'operator' : 'number') as CardType,
      rarity: matchedCard?.rarity || combo.requiredRarity || combo.minRarity || 'normal',
      stars: matchedCard?.stars || 1,
      level: matchedCard?.level || 1,
      ...meta
    };
    
    return (
      <div key={val} className={`relative transition-all duration-500 shrink-0 ${hasCard ? 'scale-100' : 'opacity-40 grayscale scale-90'}`}>
         <div className={`p-0.5 rounded-[12px] bg-white border-2 transition-all ${hasCard ? 'border-amber-500 shadow-md' : 'border-black/5'}`}>
            <div className="w-[50px] h-[70px] overflow-hidden rounded-[10px]">
              <Card id={val + "_m_res"} {...cardToRender} isDraggable={false} />
            </div>
         </div>
         {!hasCard && <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-black/10 pointer-events-none">?</span>}
      </div>
    );
  };

  const renderCollectionSlot = (val: string | null, isOwned: boolean, rarity: Rarity) => {
    const rarityColor = rarity === 'rare' ? 'from-blue-400 to-indigo-600' : 
                        rarity === 'super' ? 'from-purple-400 to-pink-600' : 
                        rarity === 'ultra' ? 'from-amber-400 to-orange-600' : 'from-gray-400 to-gray-600';

    return (
      <div className={`size-10 rounded-full border flex items-center justify-center transition-all duration-500 ${isOwned ? `bg-linear-to-br ${rarityColor} border-white shadow-sm scale-110` : 'bg-black/5 border-black/5'}`}>
        {isOwned ? (
          <span className="text-white font-black text-[10px] italic">{val}</span>
        ) : (
          <span className="text-black/10 font-black text-xs">?</span>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 space-y-12 pb-24">
      {/* Energy Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="size-8 bg-primary/10 rounded-xl flex items-center justify-center"><TargetIcon size={16} className="text-primary"/></div>
             <h3 className="text-sm font-black text-primary uppercase italic">Cộng hưởng năng lượng</h3>
          </div>
        </div>
        
        <div className="space-y-4">
          {energyCombos.map((combo: ResonanceCombo) => {
            const isOwned = checkIsOwned(combo);
            const isClaimed = resonanceRewardsClaimed.includes(combo.id);
            const canClaim = isOwned && !isClaimed;
            
            // Calculate progress
            const ownedCount = combo.requiredCards.filter((val: string) => 
              Object.values(collection).some((c: CollectionCard) => c.value === val && c.count > 0 && (combo.requiredRarity ? c.rarity === combo.requiredRarity : true))
            ).length;
            const totalRequired = combo.requiredCards.length;

            return (
              <div key={combo.id} className={`bg-white p-5 rounded-[40px] border-2 transition-all flex flex-col gap-4 ${isOwned ? 'border-primary/20 shadow-md' : 'border-black/5 opacity-80'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-[12px] font-black text-primary uppercase italic leading-none truncate">{combo.name}</h4>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${ownedCount === totalRequired ? 'bg-green-100 text-green-700' : 'bg-primary/5 text-primary/40'}`}>
                        {ownedCount}/{totalRequired}
                      </span>
                    </div>
                    <p className="text-[8px] font-bold text-primary/30 uppercase tracking-tight">Thu thập đủ bộ {totalRequired} thẻ để kích hoạt</p>
                  </div>
                  {isClaimed && <div className="bg-green-100 p-1.5 rounded-full"><AwardIcon size={14} className="text-green-600" /></div>}
                </div>

                <div className="bg-primary/5 p-4 rounded-3xl flex gap-3 overflow-x-auto no-scrollbar items-center justify-center border border-primary/5">
                  {combo.requiredCards.map((val: string) => renderComboCard(val, combo))}
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                       {combo.rewards.coins > 0 && (
                         <span className="text-[10px] font-black text-primary italic bg-primary/5 px-3 py-1.5 rounded-xl flex items-center gap-1">
                           {combo.rewards.coins.toLocaleString()} 
                           <CoinIcon size={12} className="text-amber-600" />
                         </span>
                       )}
                       {combo.rewards.gems > 0 && (
                         <span className="text-[10px] font-black text-primary italic bg-primary/5 px-3 py-1.5 rounded-xl flex items-center gap-1">
                           {combo.rewards.gems} 
                           <GemIcon size={12} className="text-sky-500" />
                         </span>
                       )}
                    </div>
                    {canClaim && (
                      <div className="relative">
                        <button 
                           onClick={() => handleClaimResonanceReward(combo.id)}
                           className="bg-amber-500 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase shadow-[0_4px_0_#8b5000] active:shadow-none active:translate-y-1 transition-all"
                        >
                           NHẬN QUÀ
                        </button>
                        <div className="absolute -top-1 -right-1 size-3 bg-red-600 rounded-full border-2 border-white shadow-sm animate-pulse" />
                      </div>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Collection Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
           <div className="size-8 bg-amber-500/10 rounded-xl flex items-center justify-center"><StarIcon size={16} className="text-amber-600"/></div>
           <h3 className="text-sm font-black text-primary uppercase italic">Phẩm chất tối thượng</h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {collectionSets.map((set: ResonanceCombo) => {
            const isOwned = checkIsOwned(set);
            const isClaimed = resonanceRewardsClaimed.includes(set.id);
            const canClaim = isOwned && !isClaimed;
            
            const targetOwned = Object.values(collection).filter((c: CollectionCard) => 
              (c.count > 0) && 
              (set.requiredRarity ? c.rarity === set.requiredRarity : true) &&
              (set.minRarity ? rarityOrder[c.rarity as Rarity] >= rarityOrder[set.minRarity as Rarity] : true)
            ).length;
            const totalRequired = set.requiredCards.length || 3;

            return (
              <div key={set.id} className={`bg-white p-6 rounded-[40px] border-2 transition-all flex flex-col gap-5 ${isOwned ? 'border-black shadow-lg' : 'border-black/5 opacity-80'}`}>
                <div className="flex justify-between items-start">
                   <div>
                     <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-[12px] font-black text-primary uppercase italic leading-none">{set.name}</h4>
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${targetOwned >= totalRequired ? 'bg-amber-100 text-amber-700' : 'bg-primary/5 text-primary/40'}`}>
                          {Math.min(totalRequired, targetOwned)}/{totalRequired}
                        </span>
                     </div>
                     <p className="text-[8px] font-bold text-primary/30 uppercase tracking-widest">Yêu cầu: {set.requiredRarity || set.minRarity} hoặc cao hơn</p>
                   </div>
                   {isClaimed && <div className="bg-green-100 p-1.5 rounded-full"><AwardIcon size={14} className="text-green-600" /></div>}
                </div>

                <div className="bg-primary/5 p-5 rounded-2xl flex gap-4 items-center justify-center">
                  {Array.from({ length: totalRequired }).map((_, idx) => {
                    const rarity = set.requiredRarity || set.minRarity || 'rare';
                    const val = set.requiredCards[idx] || null;
                    const hasCard = idx < targetOwned;

                    return <React.Fragment key={idx}>{renderCollectionSlot(val, hasCard, rarity)}</React.Fragment>;
                  })}
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                       {set.rewards.coins > 0 && (
                         <span className="text-[10px] font-black text-primary italic bg-primary/5 px-3 py-1.5 rounded-xl flex items-center gap-1">
                           {set.rewards.coins.toLocaleString()} 
                           <CoinIcon size={12} className="text-amber-600" />
                         </span>
                       )}
                       {set.rewards.gems > 0 && (
                         <span className="text-[10px] font-black text-primary italic bg-primary/5 px-3 py-1.5 rounded-xl flex items-center gap-1">
                           {set.rewards.gems} 
                           <GemIcon size={12} className="text-sky-500" />
                         </span>
                       )}
                    </div>
                    {canClaim && (
                      <div className="relative">
                        <button 
                           onClick={() => handleClaimResonanceReward(set.id)}
                           className="bg-amber-500 text-white px-5 py-2.5 rounded-xl text-[9px] font-black uppercase border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
                        >
                           NHẬN THƯỞNG
                        </button>
                        <div className="absolute -top-1 -right-1 size-3 bg-red-600 rounded-full border-2 border-white shadow-sm animate-pulse" />
                      </div>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ResonanceTab;
