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
        className="w-full h-auto max-h-[85vh] flex flex-col bg-[#2a2a24] rounded-t-[48px] shadow-[0_-20px_100px_rgba(0,0,0,0.9)] border-t-4 border-primary pointer-events-auto overflow-hidden"
      >
        {/* Header HUD - Ultra Sleek */}
        <div className="bg-primary/5 backdrop-blur-xl px-6 py-5 border-b border-primary/10 flex items-center justify-between shrink-0">
           <div className="flex items-center gap-4">
              <button onClick={onClose} className="size-14 flex items-center justify-center bg-black text-white rounded-2xl active:scale-90 transition-all shadow-xl border border-white/20">
                <ChevronLeftIcon size={24} />
              </button>
               <div className="flex flex-col min-w-0">
                  <h2 className="text-xl font-black text-white uppercase tracking-tighter leading-tight wrap-break-word">{card.name}</h2>
                  <span className="text-[0.7rem] font-black text-white/40 uppercase tracking-[0.2em] mt-1">{activeTab === 'library' ? 'LIBRARY-ARCHIVE' : 'OWNED-PROTOCOL'}</span>
               </div>
           </div>
           <div className="flex items-center gap-3">
              <div className="px-3.5 py-1.5 bg-primary text-white rounded-xl shadow-sm border border-white/20">
                 <span className="text-[9px] font-black uppercase tracking-widest">{card.rarity}</span>
              </div>
           </div>
        </div>

        <div className="overflow-y-auto no-scrollbar p-4 space-y-4">
          <div className="flex gap-4 items-stretch">
             {/* Left Column (40%): Card Visual ONLY */}
             <div className="w-[40%] flex flex-col shrink-0">
                <div className="aspect-3/4 w-full flex justify-center items-center relative bg-white/5 rounded-3xl shadow-inner overflow-hidden h-full">
                   <div className="w-[90%] relative z-10 drop-shadow-[0_0_20px_rgba(0,0,0,0.5)] flex justify-center">
                     <Card id="m-inspect" {...card} isDraggable={false} />
                   </div>
                   {/* Card count badge (xN) - Mirrored from Desktop */}
                   <div className="absolute bottom-2 right-2 bg-black text-white px-2 py-0.5 rounded-lg border border-white/20 font-black text-[10px] shadow-xl z-20">
                     x{card.count}
                   </div>
                   <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-50 opacity-40"></div>
                </div>
             </div>

             {/* Right Column (2/3): Level, Stars, Info Blocks */}
             <div className="flex-1 flex flex-col gap-2.5">
                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-2">
                   <div className="bg-black/40 p-3 rounded-lg border-2 border-white/10 flex flex-col items-center justify-center shadow-lg">
                      <span className="text-[7px] font-black text-white/90 uppercase tracking-widest mb-1">LEVEL</span>
                      <div className="flex items-baseline gap-1">
                         <span className="text-[16px] font-black text-white italic leading-none">{card.level}</span>
                         <span className="text-[9px] font-black text-white/20">/{50 + (card.redStars || 0) * 10}</span>
                      </div>
                   </div>
                   <div className="bg-[#1a1a1a] p-3 rounded-lg border-2 border-white/10 flex flex-col items-center justify-center shadow-lg">
                      <span className="text-[7px] font-black text-white/90 uppercase tracking-widest mb-1">STARS</span>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <StarIcon key={i} size={10} className={i < card.stars ? 'text-amber-500 fill-amber-500' : 'text-white/90 shadow-sm'} />
                        ))}
                      </div>
                   </div>
                </div>

                 {/* Flavor Text Block - Highlighted */}
                 <div className="bg-primary/10 p-3.5 rounded-xl border border-primary/20 flex flex-col justify-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-8 h-8 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <p className="text-[11px] font-bold text-white/80 leading-relaxed italic text-center relative z-10">
                       "{CARD_METADATA[card.value]?.flavorText || "Dữ liệu giới thiệu đang cập nhật..."}"
                    </p>
                 </div>

                {/* Ability Block - Removed Black Background */}
                <div className="bg-black/60 p-4 rounded-xl border-2 border-white/5 shadow-xl relative overflow-hidden flex-1 flex flex-col justify-center">
                   <div className="absolute top-0 right-0 w-16 h-16 bg-primary/20 blur-3xl"></div>
                   <div className="flex items-center gap-2 mb-2">
                      <div className="size-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]"></div>
                      <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">{card.abilityName || "PROTOCOL-A"}</span>
                   </div>
                   <p className="text-[12px] font-bold text-white/90 leading-snug italic line-clamp-3">
                    {resolveAbilityDesc(card.value, card.rarity) || "Dữ liệu kỹ năng đang được cập nhật..."}
                   </p>
                </div>

                {/* Activation Block */}
                <div className="bg-[#1a1a1a] p-4 rounded-xl border-2 border-white/5 shadow-inner relative overflow-hidden flex flex-col justify-center">
                   <div className="flex items-center gap-2 mb-2">
                      <div className="size-5 bg-white/10 rounded-lg flex items-center justify-center shadow-sm border border-white/10">
                         <InfoIcon size={10} className="text-white/60"/>
                      </div>
                      <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">ACTIVATION</span>
                   </div>
                   <p className="text-[11px] font-bold text-white/60 leading-snug italic line-clamp-2">
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
                    <div className="bg-black/40 p-3 rounded-xl border-2 border-white/10 shadow-lg space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Evolution Progress</span>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${isReady ? 'bg-green-500 text-white' : 'text-primary'}`}>
                          {isReady ? 'READY' : `${card.level}/${nextRequiredLevel}`}
                        </span>
                      </div>
                      <div className="h-3 bg-black rounded-full border border-white/10 p-0.5 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className={`h-full rounded-full ${isReady ? 'bg-green-500 glow-green' : 'bg-primary'}`}
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
                  className={`flex-1 py-4.5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-[0_5px_0_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 transition-all border-2 border-black flex items-center justify-center gap-2 ${isRewardClaimed || !card.isOwned ? 'bg-gray-200 text-gray-400 border-gray-300 opacity-50' : 'bg-linear-to-r from-amber-400 to-orange-500 text-white animate-pulse-slow'}`}
                >
                  {isRewardClaimed ? 'ĐÃ NHẬN THƯỞNG' : !card.isOwned ? 'CHƯA SỞ HỮU' : 'NHẬN QUÀ KHAI PHÁ'}
                </button>
             ) : (
                <>
                  {card.rarity === 'normal' ? (
                    <div className="flex-1 bg-white/5 border-2 border-white/10 rounded-xl py-6 flex items-center justify-center">
                       <span className="text-[11px] font-black text-white/30 uppercase tracking-[0.3em]">KHÔNG THỂ NÂNG CẤP</span>
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
                        className={`flex-1 py-5 rounded-xl font-black uppercase text-sm tracking-widest shadow-[0_6px_0_#000] active:shadow-none active:translate-y-1 transition-all border-2 border-black flex flex-col items-center justify-center gap-1 disabled:grayscale disabled:opacity-50 ${isMaxLevel ? 'bg-gray-400' : coins >= levelUpCost ? 'bg-green-500 text-white' : 'bg-white text-black'}`}
                      >
                        <span>{isMaxLevel ? 'TỐI ĐA' : 'NÂNG CẤP'}</span>
                        {!isMaxLevel && (
                          <div className="bg-black/20 text-current px-3 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 border border-black/10">
                            {levelUpCost.toLocaleString()}
                            <CoinIcon size={10} />
                          </div>
                        )}
                      </button>
                      
                      <button 
                        onClick={onEvolve}
                        disabled={isMaxStars}
                        className="flex-1 bg-amber-500 text-white py-5 rounded-xl font-black uppercase text-sm tracking-widest shadow-[0_6px_0_#000] active:shadow-none active:translate-y-1 transition-all border-2 border-black flex flex-col items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span>THĂNG HOA</span>
                        <div className="bg-black/40 text-white px-3 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 border border-white/10">
                          {evolutionCost.toLocaleString()}
                          <CoinIcon size={10} />
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
