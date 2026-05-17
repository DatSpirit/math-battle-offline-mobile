import React from 'react';
import { motion } from 'framer-motion';
import { 
  StarIcon, InfoIcon, ChevronLeftIcon, CoinIcon 
} from '../../../components/shared/Icons';
import Card from '../../../components/shared/Card';
import type { LibraryCard } from '../../../hooks/useDecksLogic';
import { CARD_METADATA, resolveAbilityDesc } from '../../../data/cardMetadata';

interface CardInspectorProps {
  card: LibraryCard | null;
  activeTab: 'library' | 'owned' | 'resonance' | 'achievements';
  onClose: () => void;
  onLevelUp: () => void;
  onEvolve: () => void;
  onClaimReward?: () => void;
  getLevelUpCost: (lvl: number) => number;
  getEvolutionCost: (stars: number) => number;
  isRewardClaimed?: boolean;
  coins: number;
}

const CardInspector: React.FC<CardInspectorProps> = ({ 
  card, 
  activeTab,
  onClose, 
  onLevelUp, 
  onEvolve, 
  onClaimReward,
  getLevelUpCost,
  getEvolutionCost,
  isRewardClaimed = false,
  coins
}) => {
  // Lấy dữ liệu người chơi từ store (nếu cần dùng trực tiếp)
  // const { coins } = usePlayerStore(); 

  // --- LOGIC TÍNH TOÁN CƠ BẢN (Phải đặt trên các Hooks) ---
  const levelUpCost = getLevelUpCost(card?.level || 1); // Chi phí lên cấp
  const evolutionCost = getEvolutionCost(card?.stars || 0); // Chi phí thăng sao
  const isMaxLevel = (card?.level || 0) >= 50; // Đã đạt cấp tối đa?
  const isMaxStars = (card?.stars || 0) >= 5; // Đã đạt sao tối đa?

  // --- LÓGIC NÂNG CẤP TỰ ĐỘNG (LONG PRESS) ---
  const upgradeIntervalRef = React.useRef<ReturnType<typeof setTimeout> | null>(null); // Quản lý vòng lặp setInterval
  const upgradeTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null); // Quản lý độ trễ ban đầu setTimeout

  /**
   * Hàm dừng nâng cấp tự động, dọn dẹp các timer đang chạy
   */
  const stopAutoUpgrade = React.useCallback(() => {
    if (upgradeTimeoutRef.current) clearTimeout(upgradeTimeoutRef.current);
    if (upgradeIntervalRef.current) clearInterval(upgradeIntervalRef.current);
    upgradeTimeoutRef.current = null;
    upgradeIntervalRef.current = null;
  }, []);

  /**
   * Hàm bắt đầu nâng cấp tự động khi nhấn giữ (hỗ trợ cả Chuột và Cảm ứng)
   */
  const startAutoUpgrade = React.useCallback(() => {
    // Kiểm tra điều kiện: chưa đạt cấp tối đa và đủ tiền
    if (isMaxLevel || coins < levelUpCost) return;
    
    // Thực hiện nâng cấp ngay lập tức lần đầu
    onLevelUp();

    // Thiết lập vòng lặp sau 500ms nhấn giữ
    upgradeTimeoutRef.current = setTimeout(() => {
      upgradeIntervalRef.current = setInterval(() => {
        onLevelUp();
      }, 100); // Tốc độ: 10 cấp mỗi giây
    }, 500);
  }, [onLevelUp, isMaxLevel, coins, levelUpCost]);

  /**
   * Tự động dọn dẹp khi đóng giao diện
   */
  React.useEffect(() => {
    return () => stopAutoUpgrade();
  }, [stopAutoUpgrade]);

  if (!card) return null;

  return (
    <div className="fixed left-0 right-0 bottom-[calc(5rem+var(--sab))] z-100 pointer-events-none flex items-end justify-center px-4">
      <motion.div 
        initial={{ y: '100%', opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        exit={{ y: '100%', opacity: 0 }} 
        transition={{ type: 'spring', damping: 25, stiffness: 200 }} 
        className="w-full h-auto max-h-[85vh] flex flex-col bg-[#fcfae4] rounded-t-3xl border-t-4 border-x-4 border-black shadow-[0_-8px_0_#1c1c0f] pointer-events-auto overflow-hidden"
      >
        {/* Header HUD */}
        <div className="bg-primary px-6 py-5 border-b-4 border-black flex items-center justify-between shrink-0">
           <div className="flex items-center gap-4">
              <button onClick={onClose} className="size-12 flex items-center justify-center bg-white text-black rounded-xl active:scale-90 transition-all border-2 border-black shadow-[0_4px_0_#1c1c0f]">
                <ChevronLeftIcon size={24} />
              </button>
               <div className="flex flex-col min-w-0">
                  <h2 className="text-xl font-black text-white uppercase tracking-tighter leading-tight wrap-break-word drop-shadow-md">{card.name}</h2>
                  <span className="text-[0.7rem] font-black text-white/80 uppercase tracking-[0.2em] mt-1">{activeTab === 'library' ? 'LIBRARY-ARCHIVE' : 'OWNED-PROTOCOL'}</span>
               </div>
           </div>
           <div className="flex items-center gap-3">
              <div className="px-3.5 py-1.5 bg-white text-primary rounded-xl border-2 border-black shadow-[0_3px_0_#1c1c0f]">
                 <span className="text-[10px] font-black uppercase tracking-widest">{card.rarity}</span>
              </div>
           </div>
        </div>

        <div className="overflow-y-auto no-scrollbar p-4 space-y-4">
          <div className="flex gap-4 items-stretch">
             {/* Left Column (40%): Card Visual ONLY */}
             <div className="w-[40%] flex flex-col shrink-0">
                <div className="aspect-3/4 w-full flex justify-center items-center relative bg-white border-4 border-black shadow-[4px_4px_0_#1c1c0f] rounded-2xl overflow-hidden h-full">
                   <div className="w-[90%] relative z-10 flex justify-center">
                     <Card id="m-inspect" {...card} isDraggable={false} />
                   </div>
                   {/* Card count badge (xN) - Mirrored from Desktop */}
                   <div className="absolute bottom-2 right-2 bg-black text-white px-2 py-0.5 rounded-lg border-2 border-white font-black text-[10px] shadow-md z-20">
                     x{card.count}
                   </div>
                </div>
             </div>

             {/* Right Column (2/3): Level, Stars, Info Blocks */}
             <div className="flex-1 flex flex-col gap-2.5">
                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-2">
                   <div className="bg-white p-3 rounded-xl border-2 border-black flex flex-col items-center justify-center shadow-[2px_2px_0_#1c1c0f]">
                      <span className="text-[8px] font-black text-black/60 uppercase tracking-widest mb-1">LEVEL</span>
                      <div className="flex items-baseline gap-1">
                         <span className="text-[18px] font-black text-primary italic leading-none">{card.level}</span>
                         <span className="text-[10px] font-black text-black/40">/{50 + (card.redStars || 0) * 10}</span>
                      </div>
                   </div>
                   <div className="bg-white p-3 rounded-xl border-2 border-black flex flex-col items-center justify-center shadow-[2px_2px_0_#1c1c0f]">
                      <span className="text-[8px] font-black text-black/60 uppercase tracking-widest mb-1">STARS</span>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <StarIcon key={i} size={12} className={i < card.stars ? 'text-amber-500 fill-amber-500' : 'text-gray-300'} />
                        ))}
                      </div>
                   </div>
                </div>

                 {/* Flavor Text Block - Highlighted */}
                 <div className="bg-primary/10 p-3.5 rounded-xl border-2 border-primary border-dashed flex flex-col justify-center relative overflow-hidden">
                    <p className="text-[11px] font-bold text-primary leading-relaxed italic text-center relative z-10">
                       "{CARD_METADATA[card.value]?.flavorText || "Dữ liệu giới thiệu đang cập nhật..."}"
                    </p>
                 </div>

                {/* Ability Block */}
                <div className="bg-white p-4 rounded-xl border-2 border-black shadow-[4px_4px_0_#1c1c0f] relative overflow-hidden flex-1 flex flex-col justify-center">
                   <div className="flex items-center gap-2 mb-2">
                      <div className="size-2 bg-red-500 rounded-full animate-pulse border border-black"></div>
                      <span className="text-[10px] font-black text-black uppercase tracking-[0.2em]">{card.abilityName || "PROTOCOL-A"}</span>
                   </div>
                   <p className="text-[12px] font-bold text-black/80 leading-snug line-clamp-3">
                    {resolveAbilityDesc(card.value, card.rarity) || "Dữ liệu kỹ năng đang được cập nhật..."}
                   </p>
                </div>

                {/* Activation Block */}
                <div className="bg-[#f1efd9] p-4 rounded-xl border-2 border-black shadow-[2px_2px_0_#1c1c0f] flex flex-col justify-center">
                   <div className="flex items-center gap-2 mb-2">
                      <div className="size-5 bg-white rounded-lg flex items-center justify-center border-2 border-black">
                         <InfoIcon size={12} className="text-black"/>
                      </div>
                      <span className="text-[10px] font-black text-black/60 uppercase tracking-[0.2em]">ACTIVATION</span>
                   </div>
                   <p className="text-[11px] font-bold text-black/80 leading-snug italic line-clamp-2">
                      {card.rarity === 'normal' ? "Không có điều kiện" : (card.activationCond || "Executes upon deployment into the computational grid.")}
                   </p>
                </div>

                {/* EVOLUTION PROGRESS BAR - New for Mobile */}
                {card.rarity !== 'normal' && activeTab === 'owned' && (() => {
                  const isRedAscension = card.stars === 5;
                  const nextRequiredLevel = isRedAscension 
                    ? (50 + (card.redStars || 0) * 10) 
                    : (card.stars + 1) * 10;
                  const progress = Math.min((card.level / nextRequiredLevel) * 100, 100);
                  const isReady = card.level >= nextRequiredLevel;

                  return (
                    <div className="bg-white p-3 rounded-xl border-2 border-black shadow-[4px_4px_0_#1c1c0f] space-y-2 mt-1">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[9px] font-black text-black/60 uppercase tracking-widest">TIẾN ĐỘ THĂNG HOA</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border-2 border-black ${isReady ? 'bg-green-500 text-white' : 'bg-[#f1efd9] text-black'}`}>
                          {isReady ? 'SẴN SÀNG' : `${card.level}/${nextRequiredLevel}`}
                        </span>
                      </div>
                      <div className="h-4 bg-gray-200 rounded-full border-2 border-black overflow-hidden relative">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className={`h-full border-r-2 border-black ${isReady ? 'bg-green-500' : 'bg-primary'}`}
                          />
                      </div>
                    </div>
                  );
                })()}
             </div>
          </div>

          {/* Actions - Context Aware */}
          <div className="flex gap-2.5 pt-1">
             {activeTab === 'library' ? (
                <button 
                  onClick={onClaimReward}
                  disabled={isRewardClaimed || !card.isOwned}
                  className={`flex-1 py-4.5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] active:translate-y-1 transition-all border-4 border-black flex items-center justify-center gap-2 ${isRewardClaimed || !card.isOwned ? 'bg-gray-200 text-gray-400 opacity-50 shadow-none' : 'bg-amber-400 text-black shadow-[0_6px_0_#1c1c0f] active:shadow-[0_0px_0_#1c1c0f] animate-pulse-slow'}`}
                >
                  {isRewardClaimed ? 'ĐÃ NHẬN THƯỞNG' : !card.isOwned ? 'CHƯA SỞ HỮU' : 'NHẬN QUÀ KHAI PHÁ'}
                </button>
             ) : (
                <>
                  {card.rarity === 'normal' ? (
                    <div className="flex-1 bg-gray-200 border-4 border-black rounded-2xl py-6 flex items-center justify-center shadow-[inset_0_4px_0_rgba(0,0,0,0.1)]">
                       <span className="text-[12px] font-black text-black/40 uppercase tracking-[0.3em]">KHÔNG THỂ NÂNG CẤP</span>
                    </div>
                  ) : (
                    <>
                      <button 
                        onMouseDown={startAutoUpgrade}
                        onMouseUp={stopAutoUpgrade}
                        onMouseLeave={stopAutoUpgrade}
                        onTouchStart={startAutoUpgrade}
                        onTouchEnd={stopAutoUpgrade}
                        disabled={isMaxLevel || coins < levelUpCost}
                        className={`flex-1 py-4 rounded-2xl font-black uppercase text-sm tracking-widest active:translate-y-1 transition-all border-4 border-black flex flex-col items-center justify-center gap-1 disabled:grayscale disabled:opacity-50 ${isMaxLevel ? 'bg-gray-300 shadow-none' : coins >= levelUpCost ? 'bg-green-500 text-white shadow-[0_6px_0_#1c1c0f] active:shadow-none' : 'bg-white text-black shadow-[0_6px_0_#1c1c0f] active:shadow-none'}`}
                      >
                        <span>{isMaxLevel ? 'TỐI ĐA' : 'NÂNG CẤP'}</span>
                        {!isMaxLevel && (
                          <div className="bg-white text-black px-3 py-0.5 rounded-full text-[11px] font-black flex items-center gap-1 border-2 border-black shadow-[inset_0_2px_0_rgba(0,0,0,0.1)] mt-1">
                            {levelUpCost.toLocaleString()}
                            <CoinIcon size={12} />
                          </div>
                        )}
                      </button>
                      
                      <button 
                        onClick={onEvolve}
                        disabled={isMaxStars}
                        className="flex-1 bg-amber-400 text-black py-4 rounded-2xl font-black uppercase text-sm tracking-widest shadow-[0_6px_0_#1c1c0f] active:shadow-none active:translate-y-1 transition-all border-4 border-black flex flex-col items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span>THĂNG HOA</span>
                        <div className="bg-white text-black px-3 py-0.5 rounded-full text-[11px] font-black flex items-center gap-1 border-2 border-black shadow-[inset_0_2px_0_rgba(0,0,0,0.1)] mt-1">
                          {evolutionCost.toLocaleString()}
                          <CoinIcon size={12} />
                        </div>
                      </button>
                    </>
                  )}
                </>
             )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CardInspector;
