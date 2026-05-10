/**
 * PAGE: Game Shop (Mobile Premium Bento)
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useShopLogic } from '../../hooks/useShopLogic';
import { usePlayerStore } from '../../store/playerStore';
import { 
  CoinIcon, GemIcon, ClockIcon, TrendingUpIcon, StarIcon
} from '../../components/shared/Icons';
import MomoPaymentModal from '../../components/features/MomoPaymentModal';
import TransactionHistory from '../../components/features/TransactionHistory';
import GachaRevealOverlay from '../../components/modals/GachaRevealOverlay';
import RewardClaimModal from '../../components/modals/RewardClaimModal';
import { useInteractionDelay } from '../../hooks/useInteractionDelay';
import type { ShopItem } from '../../types/shop.types';
import './Shop.css';

// Images
import diamondBanner from '../../assets/images/shop/diamond_vault.webp';
import goldBanner from '../../assets/images/shop/gold_treasury.webp';

const MobileShop: React.FC = () => {
  const s = useShopLogic();
  const showContent = useInteractionDelay(100);
  const { shopDailyLimits } = usePlayerStore();
  if (!showContent) {
    return <div className="flex-1 bg-[#fcf9f2]" />;
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#fcf9f2] pb-40 relative font-body overflow-y-auto custom-scrollbar overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] hologram-grid"></div>
      <div className="math-particle-shop text-4xl top-40 right-10 opacity-[0.05]">Σ</div>
      <div className="math-particle-shop text-6xl bottom-60 left-10 opacity-[0.05]">√π</div>

      {s.showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={200} gravity={0.2} style={{ zIndex: 200 }} />}

      {/* Premium HUD Header */}
      <div className="sticky top-0 z-40 hud-glass px-5 pt-6 pb-4">
        <div className="flex justify-between items-center">
           <div>
              <h1 className="text-xl font-black text-primary italic uppercase tracking-tighter m-0 leading-none">CỬA HÀNG</h1>
              <p className="text-[8px] font-black text-primary/30 uppercase tracking-[0.3em] mt-1.5">Đại lộ giao thương</p>
           </div>
           <motion.button 
             whileTap={{ scale: 0.9 }}
             onClick={() => s.setShowHistory(true)} 
             className="p-2 bg-white rounded-xl shadow-sm text-primary/40 border border-primary/5"
           >
             <ClockIcon size={16}/>
           </motion.button>
        </div>
      </div>

      <div className="p-4">
        {/* Category Navigation */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2">
           {[ 
              { id: 'all', l: 'TẤT CẢ', i: <TrendingUpIcon size={12}/> }, 
              { id: 'gems', l: 'KIM CƯƠNG', i: <GemIcon size={12}/> },
              { id: 'coins', l: 'VÀNG', i: <CoinIcon size={12}/> }
           ].map(t => (
             <button 
                key={t.id} 
                onClick={() => s.setFilter(t.id as 'all' | 'gems' | 'coins')} 
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-black text-[8px] uppercase tracking-widest whitespace-nowrap transition-all border-2 ${s.filter === t.id ? 'bg-primary text-white border-primary shadow-lg scale-105' : 'bg-white text-primary/40 border-white shadow-sm'}`}
             >
                {t.i}
                {t.l}
             </button>
           ))}
        </div>

        {/* Bento Grid Layout - 2 Columns */}
        <div className="flex flex-col gap-3">
             {(s.filter === 'all' || s.filter === 'gems') && (
               <div className="relative h-24 rounded-2xl overflow-hidden mb-2 shadow-lg">
                 <img src={diamondBanner} alt="Diamond Vault" className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-linear-to-r from-black/70 to-transparent flex flex-col justify-center px-4">
                   <h2 className="text-lg font-black text-white italic uppercase leading-none">Kho Kim Cương</h2>
                 </div>
               </div>
             )}

             {s.filteredItems.filter(i => i.rewardType === 'gems').map((item: ShopItem, idx: number) => {
                  const discount = item.originalPrice ? Math.round((1 - item.price / item.originalPrice) * 100) : 0;
                  const currentLimit = shopDailyLimits[item.id] || 0;
                  const isLimited = item.dailyLimit !== undefined;
                  const isSoldOut = isLimited && currentLimit >= (item.dailyLimit || 0);

                  // Base rate calculation (10k = 200 gems -> 1đ = 0.02 gems)
                  const baseReward = Math.floor(item.price * 0.02);

                  return (
                    <motion.div 
                       key={item.id} 
                       initial={{ opacity: 0, x: -10 }}
                       animate={isLimited && !isSoldOut ? { opacity: 1, x: 0, y: [0, -3, 0] } : { opacity: 1, x: 0 }}
                       transition={isLimited ? { y: { repeat: Infinity, duration: 3, ease: "easeInOut" }, delay: idx * 0.05 } : { delay: idx * 0.05 }}
                       onClick={() => !isSoldOut && s.handlePurchase(item)} 
                       className={`shop-item-compact p-3! relative ${isLimited ? 'border-2 border-amber-400! bg-amber-50/10 shadow-lg shadow-amber-400/5' : ''} ${isSoldOut ? 'opacity-50 grayscale' : ''}`}
                    >
                       {item.tag && <div className={`compact-tag ${isLimited ? 'bg-amber-500! shadow-md' : ''}`}>{item.tag}</div>}
                       {discount > 0 && <div className="absolute -left-1 top-0 bg-rose-600 text-white font-black text-[8px] px-2 py-1 rounded shadow-lg z-20">-{discount}%</div>}
                       
                       <div className="compact-icon-box w-10! h-10! rounded-xl!" style={{ background: item.color }}>
                          {isLimited ? <StarIcon size={20} className="text-white" /> : <GemIcon size={20} className="text-white" />}
                       </div>
                       <div className="compact-info">
                          <h4 className="font-black text-primary italic uppercase tracking-tighter leading-tight text-[11px] mb-0.5">{item.name}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-primary/30 line-through tracking-tighter">{baseReward.toLocaleString()}</span>
                            <span className="text-[14px] font-black text-primary">{(item.rewardValue as number).toLocaleString()}</span>
                            {isLimited && <span className="text-[7px] font-bold text-amber-600">{(item.dailyLimit || 0) - currentLimit} CÒN LẠI</span>}
                          </div>
                       </div>
                       <button className={`compact-price-btn min-w-[80px]! py-2! text-[9px]! ${isSoldOut ? 'bg-gray-400' : ''} ${isLimited ? 'bg-amber-500!' : ''}`}>
                          {isSoldOut ? 'HẾT HÀNG' : `${item.price.toLocaleString()}đ`}
                       </button>
                    </motion.div>
                  );
              })}

             {(s.filter === 'all' || s.filter === 'coins') && (
               <div className="relative h-24 rounded-2xl overflow-hidden mt-6 mb-2 shadow-lg">
                 <img src={goldBanner} alt="Gold Treasury" className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-linear-to-r from-black/70 to-transparent flex flex-col justify-center px-4">
                   <h2 className="text-lg font-black text-white italic uppercase leading-none">Đại Lộ Vàng</h2>
                 </div>
               </div>
             )}

             {s.filteredItems.filter(i => i.rewardType === 'coins').map((item: ShopItem, idx: number) => (
                 <motion.div 
                    key={item.id} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => s.handlePurchase(item)} 
                    className="shop-item-compact p-3!"
                 >
                    {item.tag && <div className="compact-tag bg-amber-500!">{item.tag}</div>}
                    <div className="compact-icon-box w-10! h-10! rounded-xl!" style={{ background: item.color }}>
                       <CoinIcon size={20} className="text-white" />
                    </div>
                    <div className="compact-info">
                       <h4 className="font-black text-primary italic uppercase tracking-tighter leading-tight text-[11px] mb-0.5">{item.name}</h4>
                       <span className="text-[12px] font-black text-primary">{(item.rewardValue as number).toLocaleString()}</span>
                    </div>
                    <button className="compact-price-btn min-w-[80px]! py-2! text-[9px]! flex items-center justify-center gap-1">
                       {item.price.toLocaleString()} <GemIcon size={10} />
                    </button>
                 </motion.div>
             ))}
        </div>
      </div>

      <AnimatePresence>
        {s.selectedCashItem && <MomoPaymentModal itemId={s.selectedCashItem} onClose={() => s.setSelectedCashItem(null)} onSuccess={() => {}} />}
        {s.showHistory && (
           <div className="fixed inset-0 z-50 flex items-end">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => s.setShowHistory(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
              <TransactionHistory onClose={() => s.setShowHistory(false)} />
           </div>
        )}
        {s.isOpening && (
           <GachaRevealOverlay 
             cards={s.openedCards} 
             onClose={() => s.setIsOpening(false)} 
             title="KẾT QUẢ KHAI PHÁ"
           />
        )}
        {s.rewardModal?.isOpen && (
           <RewardClaimModal 
             rewards={s.rewardModal.rewards} 
             onComplete={() => s.setRewardModal(null)} 
           />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileShop;
