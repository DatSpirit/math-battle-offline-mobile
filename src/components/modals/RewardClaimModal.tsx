import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, CoinIcon, GemIcon } from '../shared/Icons';
import GachaRevealOverlay from './GachaRevealOverlay';
import type { GachaCard } from './GachaRevealOverlay';
import './RewardClaimModal.css';

interface RewardClaimModalProps {
  rewards: {
    coins: number;
    gems: number;
    cards?: GachaCard[];
  };
  onComplete: () => void;
}

const RewardClaimModal: React.FC<RewardClaimModalProps> = ({ rewards, onComplete }) => {
  const [step, setStep] = useState<'preview' | 'collecting' | 'gacha' | 'done'>('preview');

  const cardCount = rewards.cards?.length || 0;

  const handleTap = () => {
    if (step === 'preview') {
      setStep('collecting');
      setTimeout(() => {
        if (cardCount > 0) setStep('gacha');
        else { setStep('done'); onComplete(); }
      }, 1500);
    }
  };

  return (
    <motion.div 
      className="rc-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleTap}
    >
      {/* Dynamic Background FX */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[150px] animate-pulse"></div>
      </div>

      <div className="rc-content z-10">
        <AnimatePresence mode="wait">
          {(step === 'preview' || step === 'collecting') ? (
             <motion.div 
               key="rewards"
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 1.2, opacity: 0 }}
               className="rc-rewards-grid"
             >
               <div className="flex flex-col items-center gap-4 mb-8">
                 <h2 className="rc-title">PHẦN THƯỞNG CHIẾN TÍCH</h2>
                 <div className="h-1.5 w-48 bg-linear-to-r from-transparent via-white/40 to-transparent rounded-full"></div>
               </div>

               <div className="rc-items">
                 {rewards.coins > 0 && (
                   <motion.div className="rc-item" animate={step === 'collecting' ? { y: -500, x: -500, opacity: 0, scale: 0.5 } : {}}>
                     <div className="rc-premium-icon gold">
                       <CoinIcon size={48} />
                       <div className="rc-icon-glow"></div>
                     </div>
                     <span className="rc-val">+{rewards.coins.toLocaleString()}</span>
                     <span className="rc-label">Vàng</span>
                   </motion.div>
                 )}

                 {rewards.gems > 0 && (
                   <motion.div className="rc-item" animate={step === 'collecting' ? { y: -500, x: 500, opacity: 0, scale: 0.5 } : {}}>
                     <div className="rc-premium-icon gems">
                       <GemIcon size={48} />
                       <div className="rc-icon-glow"></div>
                     </div>
                     <span className="rc-val">+{rewards.gems}</span>
                     <span className="rc-label">Kim Cương</span>
                   </motion.div>
                 )}

                 {cardCount > 0 && (
                   <motion.div className="rc-item" animate={step === 'collecting' ? { scale: 1.5, opacity: 0 } : {}}>
                     <div className="rc-premium-icon pack">
                       <SparklesIcon size={48} />
                       <div className="rc-icon-glow"></div>
                     </div>
                     <span className="rc-val">BỘ BÀI MỚI</span>
                     <span className="rc-label">Khai phá</span>
                   </motion.div>
                 )}
               </div>

               <motion.div 
                 className="rc-tap-hint mt-16"
                 animate={{ opacity: [0.4, 1, 0.4], y: [0, -5, 0] }}
                 transition={{ duration: 2, repeat: Infinity }}
               >
                 <span className="text-white/60 font-black uppercase tracking-[0.5em] text-sm">Chạm để nhận tất cả</span>
               </motion.div>
             </motion.div>
          ) : step === 'gacha' ? (
            <GachaRevealOverlay 
                cards={rewards.cards || []} 
                onClose={onComplete}
                title="KẾT QUẢ KHAI PHÁ"
            />
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default RewardClaimModal;
