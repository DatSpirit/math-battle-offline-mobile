import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSummonLogic, type SummonTier, type SummonLogic } from '../../hooks/useSummonLogic';
import { useInteractionDelay } from '../../hooks/useInteractionDelay';
import { BookOpenIcon, SparklesIcon, CoinIcon, GemIcon, ZapIcon } from '../../components/shared/Icons';
import GachaRevealOverlay from '../../components/modals/GachaRevealOverlay';
import RewardClaimModal from '../../components/modals/RewardClaimModal';
import Confetti from 'react-confetti';
import summonBg from '../../assets/summon_grand.webp';
import './Summon.css';

// Pre-defined decoy cards for the hyperspace effect
const HYPERSPACE_DECOYS = [...Array(12)].map((_, i) => ({
  id: i,
  left: `${20 + Math.random() * 60}%`, // Concentrated in the center
  top: `${20 + Math.random() * 60}%`,
  delay: `${Math.random() * 2}s`,
  scale: 0.3 + Math.random() * 0.7,
  rarity: Math.random() > 0.9 ? 'ultimate' : Math.random() > 0.7 ? 'rare' : 'normal'
}));

const SummonPageMobile: React.FC = () => {
  const s = useSummonLogic();
  const showContent = useInteractionDelay(100);
  const [selectedTier, setSelectedTier] = useState<SummonTier | null>(null);

  if (!showContent) {
    return <div className="h-full w-full bg-[#0f0c08]" />;
  }

  return (
    <div className="summon-page mobile flex flex-col h-full overflow-hidden relative">
      {/* Magnificent Library Background */}
      <div 
        className="library-bg absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${summonBg})` }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
      </div>

      {/* Optimized Ambient Decor */}
      <div className="floating-dust" />
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] hologram-grid-library"></div>

      <div className="relative z-10 flex-1 flex flex-col items-center p-6 summon-mobile-container">
        <header className="text-center mb-10 mt-12">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
             <span className="text-amber-500/50 text-[10px] font-black uppercase tracking-[0.4em] mb-2 block">ANCIENT KNOWLEDGE</span>
             <h1 className="text-5xl font-black text-white uppercase italic leading-none tracking-tighter mb-4">THƯ VIỆN SỐ</h1>
             <div className="h-0.5 w-24 bg-linear-to-r from-transparent via-amber-500/50 to-transparent mx-auto" />
          </motion.div>
        </header>

        <div className="flex-1 flex flex-col justify-center w-full max-w-sm gap-4 summon-bookshelf-mobile">
           {/* Ultimate Book */}
           <BookItem 
             tier="summon_ultimate" 
             title="Giao Ước Tối Thượng" 
             cost={250} 
             currency="gem" 
             icon={<ZapIcon size={20} />} 
             onClick={() => setSelectedTier('summon_ultimate')} 
           />

           {/* Rare Book */}
           <BookItem 
             tier="summon_rare" 
             title="Mật Tịch Hiếm" 
             cost={100} 
             currency="gem" 
             icon={<SparklesIcon size={20} />} 
             onClick={() => setSelectedTier('summon_rare')} 
           />

           {/* Normal Book */}
           <BookItem 
             tier="summon_normal" 
             title="Bản Thảo Phổ Thông" 
             cost={200} 
             currency="gold" 
             icon={<BookOpenIcon size={20} />} 
             onClick={() => setSelectedTier('summon_normal')} 
           />
        </div>

        {/* Librarian Quote */}
        <div className="mt-auto pb-10 px-6 text-center librarian-quote-mobile rounded-2xl py-4">
           <p className="text-white/60 font-medium italic text-[10px] tracking-widest leading-relaxed uppercase">
              "Kiến thức là sức mạnh tối thượng. Quyển sách nào sẽ chọn bạn hôm nay?"
           </p>
        </div>
      </div>

      {/* Modals & Overlays */}
      <AnimatePresence>
        {selectedTier && !s.isSolving && !s.isWormholeActive && !s.isOpening && (
          <SummonSelectionModal 
            tier={selectedTier} 
            s={s} 
            onClose={() => setSelectedTier(null)} 
          />
        )}

        {s.isSolving && s.currentProblem && (
          <MathChallengeModal s={s} />
        )}

        {s.isWormholeActive && (
          <HyperspaceEffect onSkip={s.skipWormhole} />
        )}

        {s.isOpening && (
          <GachaRevealOverlay cards={s.openedCards} onClose={() => { s.setIsOpening(false); setSelectedTier(null); }} />
        )}
        
        {s.rewardModal?.isOpen && (
          <RewardClaimModal rewards={s.rewardModal.rewards} onComplete={() => s.setRewardModal(null)} />
        )}
        
        {s.showConfetti && (
          <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={200} gravity={0.15} style={{ zIndex: 1200 }} />
        )}
      </AnimatePresence>
    </div>
  );
};

// --- SUB-COMPONENTS FOR CLEANER CODE ---

const BookItem: React.FC<{
  tier: string;
  title: string;
  cost: number;
  currency: 'gold' | 'gem';
  icon: React.ReactNode;
  onClick: () => void;
}> = ({ tier, title, cost, currency, icon, onClick }) => (
  <motion.div 
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="flex items-center bg-black/40 border border-white/10 rounded-[28px] p-4 gap-5 shadow-2xl backdrop-blur-xl active:bg-white/5 transition-colors"
  >
    <div className="summon-book shrink-0 shadow-2xl shadow-black/60">
      <div className={`book-cover book-${tier.replace('summon_', '')} border-l-8!`}>
        {icon}
      </div>
      <div className="book-pages" />
      <div className="book-bottom" />
    </div>
    <div className="flex-1">
      <h3 className="text-white font-black uppercase italic text-xs tracking-wide mb-1">{title}</h3>
      <div className="flex items-center gap-1.5">
        <span className="text-amber-400 font-black text-lg">{cost}</span>
        {currency === 'gold' ? <CoinIcon size={14} className="text-amber-500" /> : <GemIcon size={14} className="text-blue-400" />}
      </div>
    </div>
  </motion.div>
);

const SummonSelectionModal: React.FC<{ tier: SummonTier; s: SummonLogic; onClose: () => void }> = ({ tier, s, onClose }) => (
  <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
    <motion.div 
      initial={{ scale: 0.9, opacity: 0, y: 30 }} 
      animate={{ scale: 1, opacity: 1, y: 0 }} 
      exit={{ scale: 0.9, opacity: 0, y: 30 }} 
      className="summon-selection-modal relative rounded-[40px] p-8 w-full max-w-sm text-center border-t border-white/10"
    >
       <div className="size-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20 text-amber-500">
          <ZapIcon size={32} />
       </div>
       <h2 className="text-3xl font-black text-white uppercase italic mb-8 tracking-tighter">Triệu Hồi</h2>
       
       <div className="flex flex-col gap-4">
          <button onClick={() => s.initiateSummon(tier, 'x1')} className="summon-option-btn x1">
             <span className="btn-label text-white/80">THUÊ 1 QUYỂN</span>
             <div className="flex items-center gap-2">
                {!s.freeSummonsUsed[tier] ? (
                  <div className="bg-rose-600 px-3 py-1 rounded-lg text-white font-black text-[10px] animate-pulse">MIỄN PHÍ</div>
                ) : (
                  <>
                    <span className="font-black text-amber-500 text-xl">{tier === 'summon_normal' ? '200' : tier === 'summon_rare' ? '100' : '250'}</span>
                    {tier === 'summon_normal' ? <CoinIcon size={16} /> : <GemIcon size={16} />}
                  </>
                )}
             </div>
          </button>
          <button onClick={() => s.initiateSummon(tier, 'x10')} className="summon-option-btn x10">
             <div className="flex flex-col items-start leading-none">
                <span className="btn-label">THUÊ 10 QUYỂN</span>
                <span className="text-[9px] font-black text-black/50 uppercase tracking-widest mt-1">GIẢM 10%</span>
             </div>
             <div className="flex items-center gap-2">
                <span className="font-black text-black text-xl">{tier === 'summon_normal' ? '1,800' : tier === 'summon_rare' ? '900' : '2,250'}</span>
                {tier === 'summon_normal' ? <CoinIcon size={16} className="text-black" /> : <GemIcon size={16} className="text-black" />}
             </div>
          </button>
       </div>
       <button onClick={onClose} className="mt-8 text-white/20 text-[10px] font-black uppercase tracking-[0.2em] hover:text-white/40 transition-colors">Đóng cửa sổ</button>
    </motion.div>
  </div>
);

const MathChallengeModal: React.FC<{ s: SummonLogic }> = ({ s }) => (
  <div className="fixed inset-0 z-110 flex items-center justify-center p-6">
    <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" />
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }} 
      animate={{ scale: 1, opacity: 1 }} 
      className="summon-math-challenge relative p-8 w-full max-w-sm text-center"
    >
      <div className="mb-8">
         <div className="bg-amber-500/10 text-amber-500 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em] w-fit mx-auto mb-4 border border-amber-500/20">GIẢI MÃ PHONG ẤN</div>
         <h2 className="math-question-text">{s.currentProblem?.question}</h2>
      </div>

      <div className="math-timer-container mb-8">
         <div className="math-timer-fill" style={{ width: `${(s.timeLeft / 5) * 100}%` }}></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
         {s.currentProblem?.options.map((opt: { text: string; isCorrect: boolean }, i: number) => (
            <motion.button 
              key={i} 
              whileTap={{ scale: 0.94 }}
              onClick={() => s.handleAnswer(opt.isCorrect)} 
              className="math-option-btn h-20"
            >
               {opt.text}
            </motion.button>
         ))}
      </div>
    </motion.div>
  </div>
);

const HyperspaceEffect: React.FC<{ onSkip: () => void }> = ({ onSkip }) => (
  <div className="wormhole-container">
    <div className="wormhole-tunnel">
       <div className="wormhole-vortex" />
       <div className="wormhole-portal" />
       
       <div className="wormhole-numbers">
          {HYPERSPACE_DECOYS.map((card) => (
            <div
              key={card.id}
              className={`floating-card-decoy halo-${card.rarity}`}
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
          <motion.h2 
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-2xl font-black text-white italic uppercase tracking-[0.5em] mt-32"
          >
            Triệu Hồi...
          </motion.h2>
          <button 
            onClick={onSkip} 
            className="mt-20 bg-white/5 px-10 py-4 rounded-2xl text-white/40 text-[10px] font-black uppercase border border-white/10 pointer-events-auto active:bg-white/10 active:text-white transition-all"
          >
            Bỏ qua hành trình
          </button>
       </div>
    </div>
  </div>
);

export default SummonPageMobile;
