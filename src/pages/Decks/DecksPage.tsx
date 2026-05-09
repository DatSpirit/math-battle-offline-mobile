/**
 * PAGE: Card Decks & Evolution (Mobile Premium Bento)
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useDecksLogic } from '../../hooks/useDecksLogic';
import EvolutionModal from '../../components/modals/EvolutionModal';
import { TrophyIcon, StarIcon } from '../../components/shared/Icons';
import { usePlayerStore } from '../../store/playerStore';
import RewardClaimModal from '../../components/modals/RewardClaimModal';

// Mobile Components
import CardGridTab from './components/CardGridTab';
import ResonanceTab from './components/ResonanceTab';
import AchievementsTab from './components/AchievementsTab';
import CardInspector from './components/CardInspector';
import Card from '../../components/shared/Card';

import './Decks.css';

const MobileDecks: React.FC = () => {
  const d = useDecksLogic();
  
  const [filterRarity, setFilterRarity] = React.useState<string | 'all'>('all');
  const [sortBy, setSortBy] = React.useState<'level' | 'stars' | 'rarity'>('level');

  // Filter & Sort Logic
  const filteredCards = React.useMemo(() => {
    let list = [...d.collectionList];
    
    if (filterRarity !== 'all') {
      list = list.filter(([, card]) => card.rarity === filterRarity);
    }
    
    list.sort((a, b) => {
      if (sortBy === 'level') return b[1].level - a[1].level;
      if (sortBy === 'stars') return b[1].stars - a[1].stars;
      // Rarity sort
      const order = { 'ultra': 3, 'super': 2, 'rare': 1, 'normal': 0 };
      return order[b[1].rarity as keyof typeof order] - order[a[1].rarity as keyof typeof order];
    });
    
    return list;
  }, [d.collectionList, filterRarity, sortBy]);


  return (
    <div className="flex flex-col h-full bg-[#fcf9f2] relative font-body overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] hologram-grid"></div>
      <div className="math-particle-decks text-4xl top-40 right-10 opacity-[0.05]">∫</div>
      <div className="math-particle-decks text-6xl bottom-60 left-10 opacity-[0.05]">δx</div>

      {d.showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={200} gravity={0.2} style={{ zIndex: 1200 }} />}

      {/* Premium HUD Header (Fixed) */}
      <header className="z-40 bg-[#fcf9f2]/80 backdrop-blur-xl px-5 pt-10 pb-4 border-b border-primary/5 shadow-sm shrink-0">
        <div className="flex justify-between items-center mb-4">
           <div>
              <h1 className="text-2xl font-black text-primary italic uppercase tracking-tighter m-0 leading-none">BỘ SƯU TẬP</h1>
              <p className="text-[8px] font-black text-primary/30 uppercase tracking-[0.3em] mt-1.5">Kho lưu trữ thực thể</p>
           </div>
           <div className="bg-white p-2.5 rounded-xl shadow-sm text-primary/40 border border-primary/5 flex items-center gap-2">
              <span className="text-[9px] font-black">{Object.values(usePlayerStore.getState().collection).filter(c => c.count > 0).length} / 56</span>
              <TrophyIcon size={16}/>
           </div>
        </div>

        {/* Category Tabs (Segmented Scrollable) */}
        <nav className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
           {(['library', 'owned', 'resonance', 'achievements'] as const).map(tab => (
              <button 
                key={tab}
                onClick={() => d.setActiveTab(tab)}
                className={`shrink-0 px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all relative active:scale-95 shadow-md ${d.activeTab === tab ? 'bg-primary text-white border-2 border-black' : 'bg-white text-primary/40 border-2 border-black/10'}`}
              >
                {tab === 'library' ? 'Thư viện' : tab === 'owned' ? 'Sở hữu' : tab === 'resonance' ? 'Cộng hưởng' : 'Thành tựu'}
                {tab !== 'owned' && d.notifications[tab] && (
                   <div className="absolute -top-1 -right-1 size-4 bg-red-600 rounded-full border-2 border-white shadow-sm" />
                )}
              </button>
           ))}
        </nav>

        {/* Filter Bar - Ultra Compact Single Row */}
        <AnimatePresence>
          {(d.activeTab === 'library' || d.activeTab === 'owned') && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-2 pt-2 border-t border-primary/5 overflow-hidden"
            >
               <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1 items-center">
                  {/* Rarity Group */}
                  <div className="flex gap-2 shrink-0 border-r border-primary/5 pr-3">
                    {(['all', 'normal', 'rare', 'super', 'ultra'] as const).map(r => (
                      <button 
                        key={r}
                        onClick={() => setFilterRarity(r)}
                        className={`shrink-0 px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest border-2 transition-all active:scale-90 shadow-sm ${filterRarity === r ? 'bg-amber-500 border-black text-white' : 'bg-[#f0ede4] text-on-surface border-black/20'}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>

                  {/* Sort Group */}
                  <div className="flex gap-2 shrink-0">
                    {(['level', 'stars', 'rarity'] as const).map(s => (
                      <button 
                        key={s}
                        onClick={() => setSortBy(s)}
                        className={`shrink-0 px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest border-2 transition-all active:scale-90 shadow-sm ${sortBy === s ? 'bg-primary border-black text-white' : 'bg-[#f0ede4] text-on-surface border-black/20'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content Area with Cream Background */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-32 deck-cream-bg shadow-inner border-t-2 border-black/5">
        <AnimatePresence mode="wait">
          <motion.div
            key={d.activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {d.activeTab === 'library' || d.activeTab === 'owned' ? (
              <CardGridTab 
                cards={filteredCards}
                selectedCardKey={d.selectedCardKey}
                setSelectedCardKey={d.setSelectedCardKey}
                activeTab={d.activeTab}
                onViewCard={(key: string) => usePlayerStore.getState().viewCardInLibrary(key)}
              />
            ) : d.activeTab === 'resonance' ? (
              <ResonanceTab 
                handleClaimResonanceReward={d.handleClaimResonanceReward} 
              />
            ) : (
              <AchievementsTab 
                handleClaimMasteryReward={d.handleClaimMasteryReward} 
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

       {/* Floating Inspector HUD - Only for Library and Owned tabs */}
      <AnimatePresence>
        {d.selectedCardKey && d.selectedCard && !d.isEvolutionModalOpen && (d.activeTab === 'library' || d.activeTab === 'owned') && (
           <CardInspector 
              card={d.selectedCard}
              activeTab={d.activeTab}
              onClose={() => d.setSelectedCardKey(null)}
              onLevelUp={d.handleLevelUp}
              onEvolve={d.handleEvolve}
              onClaimReward={d.handleClaimLibraryReward}
              getLevelUpCost={d.getLevelUpCost}
              getEvolutionCost={d.getEvolutionCost}
              isRewardClaimed={d.libraryRewardsClaimed.includes(d.selectedCardKey)}
              coins={usePlayerStore.getState().coins}
           />
        )}
      </AnimatePresence>

      {/* Global Evolution Animation Overlay */}
      <AnimatePresence>
        {(d.isEvolving || d.isEvolutionSuccess) && d.selectedCard && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-1000 bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-6 cursor-pointer"
             onClick={() => {
               if (d.isEvolutionSuccess) {
                 d.setIsEvolving(false);
                 d.setIsEvolutionSuccess(false);
                 d.setShowConfetti(false);
               }
             }}
           >
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
                 <div className={`w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px] animate-pulse ${d.isEvolutionSuccess ? 'bg-amber-500/30' : ''}`}></div>
              </div>

              <motion.div 
                animate={d.isEvolutionSuccess ? {
                  rotateY: [0, 360],
                  scale: [1, 1.05, 1],
                  filter: ["drop-shadow(0 0 30px rgba(245,158,11,0.6))", "drop-shadow(0 0 60px rgba(245,158,11,0.9))", "drop-shadow(0 0 30px rgba(245,158,11,0.6))"]
                } : { 
                  scale: [1, 1.05, 1],
                  rotate: [0, 1, -1, 0],
                  filter: ["drop-shadow(0 0 30px rgba(139,80,0,0.4))", "drop-shadow(0 0 60px rgba(139,80,0,0.8))", "drop-shadow(0 0 30px rgba(139,80,0,0.4))"]
                }}
                transition={d.isEvolutionSuccess ? {
                  rotateY: { duration: 4, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity },
                  filter: { duration: 2, repeat: Infinity }
                } : { duration: 3, repeat: Infinity }}
                className="scale-[2] mb-32"
              >
                 <Card id="evolving-preview-mobile" {...d.selectedCard} value={d.selectedCard.value} isDraggable={false} stars={d.isEvolutionSuccess ? d.selectedCard.stars : d.selectedCard.stars - 1} />
              </motion.div>

              {!d.isEvolutionSuccess ? (
                <>
                  <h3 className="text-2xl font-display font-black text-primary uppercase tracking-tighter mb-8 italic drop-shadow-[0_0_15px_rgba(139,80,0,0.5)] z-10 text-center">ĐANG CỘNG HƯỞNG NĂNG LƯỢNG...</h3>
                  
                  <div className="flex gap-4 justify-center z-10">
                    {Array.from({ length: 5 }).map((_, i) => {
                       /**
                        * LOGIC THĂNG HOA TUẦN TỰ (Sequential Evolution Logic)
                        * Mục đích: Lấp đầy các ngôi sao mới lần lượt thay vì cùng lúc.
                        * Tổng thời gian cố định là 7 giây cho toàn bộ quá trình.
                        */
                       const newStarsGained = d.selectedCard!.stars - d.previousStars;
                       const isNewStar = i >= d.previousStars && i < d.selectedCard!.stars;
                       const isOldStar = i < d.previousStars;
                       
                       // Chia đều 7 giây cho tổng số sao mới nhận được
                       const durationPerStar = newStarsGained > 0 ? 7 / newStarsGained : 7;
                       // Ngôi sao thứ n sẽ bắt đầu lấp đầy sau khi ngôi sao thứ n-1 hoàn tất
                       const delay = isNewStar ? (i - d.previousStars) * durationPerStar : 0;
                       
                       return (
                         <div key={i} className="relative size-10 flex items-center justify-center">
                           {/* Ngôi sao rỗng làm nền */}
                           <StarIcon size={40} className="text-white/5 absolute" />
                           
                           {/* Hoạt ảnh lấp đầy cho các ngôi sao mới */}
                           {isNewStar && (
                             <motion.div 
                               initial={{ clipPath: 'inset(100% 0 0 0)', filter: 'brightness(1) drop-shadow(0 0 0px rgba(139,80,0,0))' }}
                               animate={{ 
                                  clipPath: 'inset(0% 0 0 0)',
                                  filter: ['brightness(1) drop-shadow(0 0 0px rgba(139,80,0,0))', 'brightness(2) drop-shadow(0 0 20px rgba(245,158,11,0.8))']
                               }}
                               transition={{ 
                                  clipPath: { duration: durationPerStar, delay, ease: "linear" },
                                  filter: { duration: durationPerStar, delay, ease: "linear" }
                               }}
                               className="absolute text-primary"
                             >
                               <StarIcon size={40} fill="currentColor" />
                             </motion.div>
                           )}
                           
                           {/* Hiển thị các ngôi sao đã có từ trước (không chạy hoạt ảnh) */}
                           {isOldStar && (
                             <StarIcon size={40} className="text-primary absolute" fill="currentColor" />
                           )}
                         </div>
                       );
                    })}
                  </div>
                  <p className="text-white/40 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse z-10 mt-8">ASCENSION IN PROGRESS</p>
                </>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center z-10 px-6 text-center"
                >
                  <h3 className="text-4xl font-display font-black text-amber-500 uppercase tracking-tighter mb-2 italic drop-shadow-[0_0_25px_rgba(245,158,11,0.6)]">THĂNG HOA THÀNH CÔNG!</h3>
                  <p className="text-white/60 font-black uppercase tracking-[0.3em] text-xs mb-10">THỰC THỂ ĐÃ ĐẠT ĐẾN TẦNG THỨ MỚI</p>
                  <motion.p 
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-amber-500/80 font-black uppercase tracking-[0.6em] text-[10px]"
                  >
                    CHẠM ĐỂ TIẾP TỤC
                  </motion.p>
                </motion.div>
              )}
           </motion.div>
        )}
      </AnimatePresence>

      {/* Evolution Modal Integration */}
      {d.selectedCard && (
        <EvolutionModal 
          isOpen={d.isEvolutionModalOpen}
          onClose={() => d.setIsEvolutionModalOpen(false)}
          targetCard={d.selectedCard}
          targetKey={d.selectedCardKey!}
          onConfirm={d.executeInjection}
          currentBankPoints={d.getEvolutionProgress(d.selectedCard).points}
          cost={d.getEvolutionCost(d.selectedCard.stars)}
        />
      )}

      {/* Reward Claim Modal Integration */}
      <AnimatePresence>
        {d.rewardModal?.isOpen && (
           <RewardClaimModal 
              rewards={d.rewardModal.rewards}
              onComplete={() => d.setRewardModal(null)}
           />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileDecks;
