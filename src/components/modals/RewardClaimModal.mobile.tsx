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

const RewardClaimModalMobile: React.FC<RewardClaimModalProps> = ({ rewards, onComplete }) => {
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
      className="rc-m-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleTap}
    >
      <div className="rc-m-content">
        <AnimatePresence mode="wait">
          {(step === 'preview' || step === 'collecting') ? (
             <motion.div 
               key="rewards"
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 1.1, opacity: 0 }}
               className="rc-m-rewards-container"
             >
               <div className="flex flex-col items-center gap-2 mb-10 text-center">
                 <h2 className="rc-m-title">PHẦN THƯỞNG</h2>
                 <div className="h-1 w-32 bg-linear-to-r from-transparent via-amber-500/50 to-transparent rounded-full"></div>
               </div>

               <div className="rc-m-items">
                 {rewards.coins > 0 && (
                   <motion.div 
                    className="rc-m-item" 
                    animate={step === 'collecting' ? { y: -800, opacity: 0, scale: 0.5 } : {}}
                    transition={{ duration: 0.8, ease: "circIn" }}
                   >
                     <div className="rc-m-icon-box gold">
                       <CoinIcon size={32} />
                       <div className="rc-m-glow"></div>
                     </div>
                     <div className="flex flex-col items-center">
                        <span className="rc-m-val">+{rewards.coins.toLocaleString()}</span>
                        <span className="rc-m-label">Vàng</span>
                     </div>
                   </motion.div>
                 )}

                 {rewards.gems > 0 && (
                   <motion.div 
                    className="rc-m-item" 
                    animate={step === 'collecting' ? { y: -800, opacity: 0, scale: 0.5 } : {}}
                    transition={{ duration: 0.8, delay: 0.1, ease: "circIn" }}
                   >
                     <div className="rc-m-icon-box gems">
                       <GemIcon size={32} />
                       <div className="rc-m-glow"></div>
                     </div>
                     <div className="flex flex-col items-center">
                        <span className="rc-m-val">+{rewards.gems}</span>
                        <span className="rc-m-label">Kim Cương</span>
                     </div>
                   </motion.div>
                 )}

                 {cardCount > 0 && (
                   <motion.div 
                    className="rc-m-item" 
                    animate={step === 'collecting' ? { scale: 2, opacity: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.2 }}
                   >
                     <div className="rc-m-icon-box pack">
                       <SparklesIcon size={32} />
                       <div className="rc-m-glow"></div>
                     </div>
                     <div className="flex flex-col items-center">
                        <span className="rc-m-val">THẺ MỚI</span>
                        <span className="rc-m-label">Khai phá</span>
                     </div>
                   </motion.div>
                 )}
               </div>

               <motion.div 
                 className="rc-m-tap-hint mt-16"
                 animate={{ opacity: [0.4, 1, 0.4] }}
                 transition={{ duration: 2, repeat: Infinity }}
               >
                 <span className="text-white/40 font-black uppercase tracking-[0.4em] text-[10px]">Chạm để nhận tất cả</span>
               </motion.div>
             </motion.div>
          ) : step === 'gacha' ? (
            <div className="w-full h-full p-4 overflow-y-auto no-scrollbar">
                <GachaRevealOverlay 
                    cards={rewards.cards || []} 
                    onClose={onComplete}
                    title="KẾT QUẢ"
                />
            </div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default RewardClaimModalMobile;
