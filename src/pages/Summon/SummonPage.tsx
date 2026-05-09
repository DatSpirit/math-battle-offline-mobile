import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSummonLogic, type SummonTier } from '../../hooks/useSummonLogic';
import { BookOpenIcon, SparklesIcon, CoinIcon, GemIcon, ZapIcon } from '../../components/shared/Icons';
import GachaRevealOverlay from '../../components/modals/GachaRevealOverlay';
import RewardClaimModal from '../../components/modals/RewardClaimModal';
import Confetti from 'react-confetti';
import summonBg from '../../assets/summon_grand.webp';
import './Summon.css';

// Hằng số các lá bài phẩm chất khác nhau cho Mobile
const STATIC_MOBILE_DECOYS = [...Array(10)].map((_, i) => {
  const rand = Math.random();
  let rarity: 'normal' | 'rare' | 'ultimate' = 'normal';
  if (rand > 0.85) rarity = 'ultimate';
  else if (rand > 0.5) rarity = 'rare';

  return {
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 2}s`,
    scale: 0.5 + Math.random() * 1.0, // Tỷ lệ từ 0.5 đến 1.5
    rarity
  };
});

const SummonPageMobile: React.FC = () => {
  const s = useSummonLogic();
  const [selectedTier, setSelectedTier] = useState<SummonTier | null>(null);

  return (
    <div className="summon-page mobile flex flex-col h-full overflow-hidden relative bg-[#fcf9f2]">
      {/* Magnificent Library Background (Brightened for synchronization) */}
      <div 
        className="library-bg absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${summonBg})` }}
      >
      </div>

      {/* Subtle Ambient Background Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] hologram-grid"></div>
      <div className="math-particle-summon text-4xl top-40 right-10 opacity-[0.05]">Σ</div>

      <div className="relative z-10 flex-1 flex flex-col items-center p-4 summon-mobile-container">
        <header className="text-center mb-6 summon-mobile-header mt-8">
          <motion.h1 
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl font-black text-white uppercase italic leading-none mb-2 tracking-tighter"
          >
            Thư Viện Số
          </motion.h1>

           {/* Librarian Quote at Bottom */}
        <div className="mt-auto pb-8 px-8 text-center librarian-quote-mobile">
           <p className="text-white font-black italic uppercase text-[9px] tracking-[0.2em] leading-relaxed">
              "Đây là thư viện kiến thức toán học, bạn có thể học được nhiều điều. Bạn muốn thuê quyển sách nào?"
           </p>
        </div>
        </header>

        <div className="flex-1 flex flex-col justify-center w-full max-w-xs relative z-20 summon-bookshelf-mobile">
           {/* Ultimate Book */}
           <motion.div 
             whileTap={{ scale: 0.95 }}
             onClick={() => setSelectedTier('summon_ultimate')}
             className="flex items-center bg-white/30 border-2 border-white/30 rounded-[24px] p-3 gap-4 shadow-xl backdrop-blur-xl summon-book-item mb-3"
           >
              <div className="summon-book m-0! w-16! h-24! shadow-2xl shadow-black/40">
                 <div className="book-cover book-ultimate border-l-8!">
                    <ZapIcon size={20} />
                 </div>
                 <div className="book-pages w-4!"></div>
                 <div className="book-bottom h-4!"></div>
              </div>
              <div className="flex-1">
                 <h3 className="text-black font-black uppercase italic text-[11px] leading-tight">Giao Ước Tối Thượng</h3>
                 <div className="flex items-center gap-1 mt-1">
                    <span className="text-black font-black text-sm">250</span>
                    <GemIcon size={12} className="text-amber-600" />
                 </div>
              </div>
           </motion.div>

           {/* Rare Book */}
           <motion.div 
             whileTap={{ scale: 0.95 }}
             onClick={() => setSelectedTier('summon_rare')}
             className="flex items-center bg-white/30 border-2 border-white/30 rounded-[24px] p-3 gap-4 shadow-xl backdrop-blur-xl summon-book-item mb-3"
           >
              <div className="summon-book m-0! w-16! h-24! shadow-2xl shadow-black/40">
                 <div className="book-cover book-rare border-l-8!">
                    <SparklesIcon size={20} />
                 </div>
                 <div className="book-pages w-4!"></div>
                 <div className="book-bottom h-4!"></div>
              </div>
              <div className="flex-1">
                 <h3 className="text-black font-black uppercase italic text-[11px] leading-tight">Mật Tịch Hiếm</h3>
                 <div className="flex items-center gap-1 mt-1">
                    <span className="text-black font-black text-sm">100</span>
                    <GemIcon size={12} className="text-sky-600" />
                 </div>
              </div>
           </motion.div>

           {/* Normal Book */}
           <motion.div 
             whileTap={{ scale: 0.95 }}
             onClick={() => setSelectedTier('summon_normal')}
             className="flex items-center bg-white/30 border-2 border-white/30 rounded-[24px] p-3 gap-4 shadow-xl backdrop-blur-xl summon-book-item"
           >
              <div className="summon-book m-0! w-16! h-24! shadow-2xl shadow-black/40">
                 <div className="book-cover book-normal border-l-8!">
                    <BookOpenIcon size={20} />
                 </div>
                 <div className="book-pages w-4!"></div>
                 <div className="book-bottom h-4!"></div>
              </div>
              <div className="flex-1">
                 <h3 className="text-black font-black uppercase italic text-[11px] leading-tight">Bản Thảo Phổ Thông</h3>
                 <div className="flex items-center gap-1 mt-1">
                    <span className="text-black font-black text-sm">200</span>
                    <CoinIcon size={12} className="text-amber-600" />
                 </div>
              </div>
           </motion.div>
        </div>

       
      </div>

      <AnimatePresence>
        {selectedTier && !s.isSolving && !s.isWormholeActive && !s.isOpening && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={() => setSelectedTier(null)} />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }} 
              className="summon-selection-modal relative rounded-[32px] p-6 w-full max-w-sm text-center"
            >
               <h2 className="text-2xl font-black text-primary uppercase italic mb-6">Triệu Hồi</h2>
               
               <div className="flex flex-col gap-4">
                  <button 
                    onClick={() => s.initiateSummon(selectedTier, 'x1')} 
                    className="summon-option-btn x1"
                  >
                     <span className="btn-label text-sm!">THUÊ 1 QUYỂN</span>
                     <div className="flex items-center gap-2">
                        {s.freeSummonsUsed[selectedTier] ? (
                          <>
                            <span className="font-black text-amber-500 text-xl">{selectedTier === 'summon_normal' ? '200' : selectedTier === 'summon_rare' ? '100' : '250'}</span>
                            {selectedTier === 'summon_normal' ? <CoinIcon size={16} /> : <GemIcon size={16} />}
                          </>
                        ) : (
                          <div className="bg-rose-600 px-3 py-1 rounded-lg text-white font-black text-sm animate-pulse">MIỄN PHÍ</div>
                        )}
                     </div>
                  </button>
                  <button 
                    onClick={() => s.initiateSummon(selectedTier, 'x10')} 
                    className="summon-option-btn x10"
                  >
                     <div className="flex flex-col items-start leading-none">
                        <span className="btn-label text-sm!">THUÊ 10 QUYỂN</span>
                        <span className="text-[8px] font-black text-black/60 uppercase tracking-widest mt-1">GIẢM 10%</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <span className="font-black text-black text-xl">{selectedTier === 'summon_normal' ? '1,800' : selectedTier === 'summon_rare' ? '900' : '2,250'}</span>
                        {selectedTier === 'summon_normal' ? <CoinIcon size={16} className="text-black" /> : <GemIcon size={16} className="text-black" />}
                     </div>
                  </button>
               </div>
               
               <p className="mt-6 text-primary/30 text-[8px] font-black uppercase tracking-widest">Chạm ra ngoài để đóng</p>
            </motion.div>
          </div>
        )}

        {s.isSolving && s.currentProblem && (
          <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-lg" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              className="summon-math-challenge relative p-6 w-full max-sm text-center"
            >
              <div className="math-challenge-header mb-4!">
                 <span className="text-amber-500 text-[8px] font-black uppercase tracking-widest mb-2 block">Giải mã phong ấn</span>
                 <h2 className="math-question-text text-4xl!">{s.currentProblem.question}</h2>
              </div>

              <div className="math-timer-container h-1! mb-4!">
                 <div className="math-timer-fill" style={{ width: `${(s.timeLeft / 5) * 100}%` }}></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 {s.currentProblem.options.map((opt, i) => (
                    <motion.button 
                      key={i} 
                      whileTap={{ scale: 0.95 }}
                      onClick={() => s.handleAnswer(opt.isCorrect)} 
                      className="math-option-btn p-4! text-2xl!"
                    >
                       {opt.text}
                    </motion.button>
                 ))}
              </div>
            </motion.div>
          </div>
        )}

        {s.isWormholeActive && (
          <div className="wormhole-container">
            <div className="wormhole-tunnel">
               <div className="wormhole-vortex"></div>
               
               <div className="wormhole-numbers">
                  {STATIC_MOBILE_DECOYS.map((card) => (
                    <div
                      key={card.id}
                      className={`floating-card-decoy w-12! h-18! halo-${card.rarity}`}
                      style={{ 
                        left: card.left, 
                        top: card.top, 
                        animationDelay: card.delay,
                        transform: `scale(${card.scale})`
                      }}
                    />
                  ))}
               </div>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <h2 className="text-xl font-black text-white italic uppercase tracking-widest mt-6">Triệu Hồi...</h2>
                  <button onClick={s.skipWormhole} className="mt-12 bg-white/10 px-6 py-3 rounded-full text-white text-[10px] font-black uppercase border border-white/10 pointer-events-auto">Bỏ qua</button>
               </div>
            </div>
          </div>
        )}

        {s.isOpening && <GachaRevealOverlay cards={s.openedCards} onClose={() => { s.setIsOpening(false); setSelectedTier(null); }} />}
        {s.rewardModal?.isOpen && <RewardClaimModal rewards={s.rewardModal.rewards} onComplete={() => s.setRewardModal(null)} />}
        {s.showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={200} gravity={0.15} style={{ zIndex: 1200 }} />}
      </AnimatePresence>
    </div>
  );
};

export default SummonPageMobile;
