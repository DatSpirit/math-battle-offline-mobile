import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '../../store/playerStore';
import { useUIStore } from '../../store/uiStore';
import Card from '../shared/Card';
import { StarIcon, ZapIcon, CoinsIcon, XIcon, PlusIcon, MinusIcon, ScrollIcon, PackageIcon } from '../shared/Icons';
import type { LibraryCard } from '../../hooks/useDecksLogic';


interface EvolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCard: LibraryCard;
  targetKey: string;
  onConfirm: (materials: Record<string, number>, cost: number, pointsToAdd: number, selectedBooks: number) => void;
  currentBankPoints: number;
  cost: number;
}// BẢNG CHI PHÍ CHUẨN
const YELLOW_COSTS = [1, 2, 3, 4, 5];
const RED_COSTS = [2, 4, 6, 8, 10];


const EvolutionModal: React.FC<EvolutionModalProps> = ({
  isOpen, onClose, targetCard, targetKey, onConfirm, currentBankPoints, cost
}) => {
  const { collection, coins, redAscensionBooks } = usePlayerStore();
  const { showNotification } = useUIStore();
  const [selectedMaterials, setSelectedMaterials] = useState<Record<string, number>>({});
  const [selectedBooks, setSelectedBooks] = useState(0);

  const isRedStarMode = targetCard.stars === 5;
  const currentRedStars = targetCard.redStars || 0;
  const maxRedStarsAllowed = Math.min(5, Math.max(0, Math.floor((targetCard.level - 40) / 10)));
  const isLevelCapped = isRedStarMode && currentRedStars >= maxRedStarsAllowed;



  const effectiveNeededPoints = isRedStarMode 
    ? (RED_COSTS[currentRedStars] || 10)
    : (YELLOW_COSTS[targetCard.stars] || 1);

  const fodderOptions = useMemo(() => {
    return Object.entries(collection)
      .filter(([, card]) => {
        // QUY TẮC MỚI: Chỉ thẻ Cùng Giá Trị (số) VÀ Cùng Phẩm Chất (Rarity)
        return card.value === targetCard.value && 
               card.rarity === targetCard.rarity && 
               card.rarity !== 'normal';
      })
      .map(([fodderKey, card]) => ({
        fodderKey, ...card, isOwned: true,
        // Nếu là chính thẻ đang chọn thì phải trừ đi 1 (để lại bản gốc), nếu thẻ khác thì dùng hết count
        available: fodderKey === targetKey ? card.count - 1 : card.count,
        weight: 1 // LUẬT MỚI: LUÔN LÀ 1 ĐIỂM
      }))
      .filter(f => f.available > 0);
  }, [collection, targetCard.value, targetCard.rarity, targetKey]);

  const pointsToAdd = useMemo(() => {
    return Object.entries(selectedMaterials).reduce((acc, [key, count]) => {
      const fodder = fodderOptions.find(f => f.fodderKey === key);
      return acc + (fodder ? fodder.weight * count : 0);
    }, 0);
  }, [selectedMaterials, fodderOptions]);

  // Giả lập số Sao Đỏ có thể tăng dựa trên điểm
  const simulatedRedStarsGained = useMemo(() => {
    if (!isRedStarMode) return 0;
    let tempPoints = currentBankPoints + pointsToAdd;
    let tempRedStars = currentRedStars;
    let gained = 0;
    while (tempRedStars < 5 && tempRedStars < maxRedStarsAllowed) {
      const needed = RED_COSTS[tempRedStars];
      if (tempPoints >= needed) {
        tempPoints -= needed;
        tempRedStars++;
        gained++;
      } else break;
    }
    return gained;
  }, [isRedStarMode, currentBankPoints, pointsToAdd, currentRedStars, maxRedStarsAllowed]);

  // Giả lập số Sao Vàng có thể tăng dựa trên điểm
  const simulatedYellowStarsGained = useMemo(() => {
    if (isRedStarMode) return 0;
    let tempPoints = currentBankPoints + pointsToAdd;
    let tempStars = targetCard.stars;
    let gained = 0;
    while (tempStars < 5 && tempStars < Math.floor(targetCard.level / 10)) {
      const needed = YELLOW_COSTS[tempStars];
      if (tempPoints >= needed) {
        tempPoints -= needed;
        tempStars++;
        gained++;
      } else break;
    }
    return gained;
  }, [isRedStarMode, currentBankPoints, pointsToAdd, targetCard.stars, targetCard.level]);

  const isBreakthrough = isRedStarMode 
    ? (simulatedRedStarsGained > 0 && selectedBooks === simulatedRedStarsGained) 
    : (simulatedYellowStarsGained > 0 && !isLevelCapped);

  const handleAdjustMaterial = (key: string, delta: number) => {
    const fodder = fodderOptions.find(f => f.fodderKey === key);
    if (!fodder) return;
    setSelectedMaterials(prev => {
      const current = prev[key] || 0;
      const next = Math.max(0, Math.min(fodder.available, current + delta));
      return { ...prev, [key]: next };
    });
  };

  const handleAdjustBooks = (delta: number) => {
    const next = Math.max(0, Math.min(redAscensionBooks, simulatedRedStarsGained, selectedBooks + delta));
    setSelectedBooks(next);
  };

  const progressPct = Math.min(100, (currentBankPoints / effectiveNeededPoints) * 100);
  const addedPct = Math.min(100 - progressPct, (pointsToAdd / effectiveNeededPoints) * 100);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div 
            initial={{ scale: 0.95, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 30 }}
            className="w-full max-w-[580px] bg-[#fcfae4] rounded-[48px] border-[4px] border-black shadow-[0_12px_0_#1c1c0f] overflow-hidden flex flex-col max-h-[85vh] relative"
          >
            {/* DECORATIVE LIGHTS - Adjusted for light theme */}
            <div className="absolute top-[-10%] left-[-10%] size-64 bg-amber-200/50 blur-[80px] pointer-events-none" />
            <div className={`absolute bottom-[-10%] right-[-10%] size-64 blur-[80px] pointer-events-none ${isRedStarMode ? 'bg-red-200/50' : 'bg-primary-200/50'}`} />

            {/* HEADER - Fixed */}
            <div className="px-8 pt-10 pb-4 flex items-center justify-between shrink-0 relative z-20 bg-[#fcfae4]">
              <div className="flex flex-col">
                <h2 className="text-2xl font-black text-black italic uppercase tracking-tighter m-0 flex items-center gap-2">
                  <ZapIcon size={20} className={isRedStarMode ? 'text-red-500' : 'text-amber-500'} />
                  Lễ Thăng Hoa
                </h2>
                <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.4em] mt-1">Ascension Ritual Protocol</p>
              </div>
              <button onClick={onClose} className="size-11 flex items-center justify-center bg-white text-black rounded-2xl border-2 border-black hover:bg-gray-100 transition-all active:scale-90 shadow-[0_4px_0_#1c1c0f]"><XIcon size={22}/></button>
            </div>

            {/* CONTENT - Scrollable */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-8 pb-20 flex flex-col gap-10 relative z-10">
              
              {/* TARGET PREVIEW SECTION */}
              <div className="flex flex-col items-center gap-6 pt-16">
                <div className="relative group">
                   {/* Glow behind target card */}
                   <div className={`absolute inset-[-20px] blur-3xl opacity-40 transition-all duration-1000 ${isRedStarMode ? 'bg-red-400' : 'bg-amber-300'}`} />
                   
                   <div className="w-[120px] py-10 transition-transform duration-500 group-hover:scale-[1.05] flex justify-center">
                      <Card id="target-evolution-preview" {...targetCard} isDraggable={false} />
                   </div>
                </div>

                {/* STAR VISUALIZER */}
                <div className="bg-white px-10 py-5 rounded-[32px] border-4 border-black flex flex-col items-center gap-3 w-full shadow-[4px_4px_0_#1c1c0f]">
                  <div className="flex gap-4">
                    {Array.from({ length: 5 }).map((_, i) => {
                      if (isRedStarMode) {
                        const isExistingRed = i < currentRedStars;
                        const isNewRed = i >= currentRedStars && i < currentRedStars + selectedBooks;
                        return (
                          <div key={i} className="relative size-10 flex items-center justify-center">
                            <StarIcon size={40} className="text-gray-200 absolute" fill="currentColor" />
                            {(isExistingRed || isNewRed) && (
                              <motion.div 
                                initial={isNewRed ? { scale: 0, opacity: 0 } : false}
                                animate={{ scale: 1, opacity: 1 }}
                                className="absolute text-red-500"
                              >
                                <StarIcon size={40} fill="currentColor" className={isNewRed ? "animate-pulse drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" : ""} />
                              </motion.div>
                            )}
                          </div>
                        );
                      } else {
                        const isExistingYellow = i < targetCard.stars;
                        const isNewYellow = i >= targetCard.stars && i < targetCard.stars + simulatedYellowStarsGained;
                        return (
                          <div key={i} className="relative size-10 flex items-center justify-center">
                            <StarIcon size={40} className="text-gray-200 absolute" fill="currentColor" />
                            {(isExistingYellow || isNewYellow) && (
                              <motion.div 
                                initial={isNewYellow ? { scale: 0, opacity: 0 } : false}
                                animate={{ scale: 1, opacity: 1 }}
                                className="absolute text-amber-500"
                              >
                                <StarIcon size={40} fill="currentColor" className={isNewYellow ? "animate-pulse drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" : ""} />
                              </motion.div>
                            )}
                          </div>
                        );
                      }
                    })}
                  </div>
                  
                  <AnimatePresence>
                    {isBreakthrough && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                        className={`px-5 py-1.5 rounded-full mt-1 border-2 font-black uppercase tracking-widest italic text-[10px] ${isRedStarMode ? 'bg-red-500 text-white border-red-700' : 'bg-amber-400 text-black border-black'}`}
                      >
                        {isRedStarMode ? `Tiến hóa Sao Đỏ ${currentRedStars + selectedBooks} ★` : `Lên ${targetCard.stars + simulatedYellowStarsGained} sao ★`}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* PROGRESS HUD */}
                <div className="w-full flex flex-col gap-4 bg-white p-5 rounded-[28px] border-4 border-black shadow-[4px_4px_0_#1c1c0f]">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-black text-black/60 uppercase tracking-widest">
                      Năng lượng {isRedStarMode ? 'Hiến Tế (SAO ĐỎ)' : 'thăng hoa (SAO VÀNG)'}
                    </span>
                    <div className="flex items-baseline gap-1">
                       <span className={`text-xl font-black italic ${isRedStarMode ? 'text-red-600' : 'text-amber-500'}`}>
                         {Math.floor(currentBankPoints)}
                         {pointsToAdd > 0 && <span className="opacity-80"> +{pointsToAdd}</span>}
                       </span>
                       <span className="text-[11px] font-black text-black/40 uppercase">/ {effectiveNeededPoints}</span>
                    </div>
                  </div>
                  
                  <div className="h-6 bg-gray-200 rounded-full overflow-hidden flex border-2 border-black p-1 relative">
                    <div style={{ width: `${progressPct}%` }} className={`h-full rounded-full transition-all duration-700 ease-out border-r-2 border-black ${isRedStarMode ? 'bg-red-500' : 'bg-primary'}`} />
                    {addedPct > 0 && (
                      <motion.div 
                        animate={{ opacity: [0.6, 1, 0.6] }} 
                        transition={{ duration: 1.5, repeat: Infinity }} 
                        style={{ width: `${addedPct}%` }} 
                        className={`h-full rounded-full border-r-2 border-black ${isRedStarMode ? 'bg-red-400' : 'bg-amber-400'}`} 
                      />
                    )}
                  </div>

                  {/* SPECIAL MATERIAL: RED BOOKS (Compact) */}
                  {isRedStarMode && (
                    <div className="mt-2 pt-4 border-t-2 border-dashed border-gray-300">
                      <div className={`flex items-center justify-between px-5 py-4 rounded-2xl border-4 transition-all ${selectedBooks > 0 ? 'bg-red-50 border-red-500' : 'bg-gray-50 border-gray-300'}`}>
                        <div className="flex items-center gap-4">
                           <div className={`p-2.5 rounded-xl border-2 border-black ${selectedBooks > 0 ? 'bg-red-500 text-white shadow-[2px_2px_0_#1c1c0f]' : 'bg-white text-gray-400'}`}>
                              <ScrollIcon size={20} />
                           </div>
                           <div className="flex flex-col">
                              <span className={`text-[11px] font-black uppercase tracking-widest ${selectedBooks > 0 ? 'text-black' : 'text-gray-500'}`}>Sách Thăng Hoa Đỏ</span>
                              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter mt-1">
                                {simulatedRedStarsGained > 0 ? `Cần bỏ vào ${simulatedRedStarsGained} sách` : 'Chưa đủ điểm thăng hoa'}
                              </span>
                           </div>
                        </div>

                        <div className="flex items-center gap-3 bg-white rounded-xl p-1.5 border-2 border-black shadow-inner">
                           <button onClick={() => handleAdjustBooks(-1)} disabled={selectedBooks <= 0} className="size-9 flex items-center justify-center rounded-lg bg-gray-100 text-black hover:bg-gray-200 disabled:opacity-30 transition-all active:scale-90 border-2 border-transparent"><MinusIcon size={16} /></button>
                           <div className="flex flex-col items-center min-w-[34px]">
                              <span className={`text-base font-black ${selectedBooks === simulatedRedStarsGained && selectedBooks > 0 ? 'text-green-600' : 'text-black'}`}>{selectedBooks}</span>
                              <span className="text-[9px] font-black text-gray-400">/{redAscensionBooks}</span>
                           </div>
                           <button onClick={() => handleAdjustBooks(1)} disabled={selectedBooks >= redAscensionBooks || selectedBooks >= simulatedRedStarsGained} className={`size-9 flex items-center justify-center rounded-lg transition-all active:scale-90 border-2 ${selectedBooks < simulatedRedStarsGained ? 'bg-red-500 text-white border-black shadow-sm' : 'bg-gray-100 text-gray-400 border-transparent disabled:opacity-30'}`}><PlusIcon size={16} /></button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* SKILL & FLAVOR TEXT SECTION */}
                <div className="w-full flex flex-col gap-4 bg-primary/10 p-6 rounded-[32px] border-4 border-primary border-dashed relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                      <ZapIcon size={80} className="text-primary" />
                   </div>
                   
                   <div className="flex flex-col gap-2 relative z-10">
                      <div className="flex items-center gap-3">
                         <div className="px-3 py-1 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-[2px_2px_0_#1c1c0f]">
                            Kỹ Năng & Giới Thiệu
                         </div>
                         <h4 className="text-sm font-black text-black uppercase italic tracking-tight m-0">
                           {targetCard.abilityName || "CHƯA KHAI MỞ"}
                         </h4>
                      </div>
                      
                      <p className="text-[11px] font-bold text-black/80 leading-relaxed m-0 mt-2">
                        {targetCard.abilityDesc || "Thẻ này chưa đạt phẩm chất để kích hoạt nội tại đặc biệt."}
                      </p>

                      {targetCard.flavorText && (
                        <div className="mt-4 pt-4 border-t-2 border-primary/20">
                           <p className="text-[10px] font-bold text-primary italic leading-relaxed m-0">
                             "{targetCard.flavorText}"
                           </p>
                        </div>
                      )}
                   </div>
                </div>
              </div>

              {/* FODDER SELECTION SECTION */}
              <div className="flex flex-col gap-5 pt-4">
                <div className="flex items-center justify-between px-1">
                  <p className="text-[11px] font-black text-black/50 uppercase tracking-[0.3em] flex items-center gap-2.5 m-0">
                    <PackageIcon size={14} className={isRedStarMode ? 'text-red-500' : 'text-amber-500'} />
                    Chọn Thẻ Phôi
                  </p>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border-2 ${isRedStarMode ? 'bg-red-50 text-red-600 border-red-500' : 'bg-amber-50 text-amber-600 border-amber-500'}`}>
                    Same Value & {targetCard.rarity}
                  </span>
                </div>

                {fodderOptions.length > 0 ? (
                  <div className="flex flex-wrap justify-center gap-6">
                    {fodderOptions.map(f => {
                      const { fodderKey, ...cardProps } = f;
                      const selected = selectedMaterials[fodderKey] || 0;
                      const isAtLimit = selected >= f.available || isBreakthrough;
                      return (
                        <div key={fodderKey} className={`flex flex-col items-center bg-white border-4 rounded-[32px] p-4 transition-all duration-300 w-[140px] relative mb-4 ${selected > 0 ? (isRedStarMode ? 'border-red-500 shadow-[4px_4px_0_rgba(239,68,68,1)]' : 'border-amber-500 shadow-[4px_4px_0_rgba(245,158,11,1)]') : 'border-black shadow-[4px_4px_0_#1c1c0f]'}`}>
                          
                          <div className="w-[70px] mb-2 origin-top drop-shadow-[0_8px_15px_rgba(0,0,0,0.2)] flex justify-center">
                            <Card id={`fodder-${fodderKey}`} {...cardProps} isDraggable={false} />
                          </div>
                          
                          <div className={`px-3 py-1 rounded-full mb-4 border-2 font-black text-[9px] italic ${isRedStarMode ? 'bg-red-100 border-red-400 text-red-600' : 'bg-amber-100 border-amber-400 text-amber-600'}`}>
                             +1 POINT
                          </div>

                          <div className="flex items-center justify-between w-full bg-gray-50 rounded-2xl p-1.5 border-2 border-black shadow-inner">
                            <button onClick={() => handleAdjustMaterial(fodderKey, -1)} disabled={!selected} className="size-8 flex items-center justify-center rounded-lg bg-white border-2 border-gray-200 text-black hover:bg-gray-100 disabled:opacity-30 transition-all active:scale-90"><MinusIcon size={12} /></button>
                            <div className="flex flex-col items-center"><span className="text-sm font-black text-black">{selected}</span><span className="text-[9px] text-gray-500 font-black">/{f.available}</span></div>
                            <button onClick={() => handleAdjustMaterial(fodderKey, 1)} disabled={isAtLimit} className={`size-8 flex items-center justify-center rounded-lg border-2 transition-all active:scale-90 ${!isAtLimit ? (isRedStarMode ? 'bg-red-500 text-white border-black' : 'bg-primary text-white border-black') : 'bg-gray-100 text-gray-400 border-transparent disabled:opacity-30'}`}><PlusIcon size={12} /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center bg-white rounded-[32px] border-4 border-dashed border-gray-300">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest italic">Hệ thống phôi trống</p>
                  </div>
                )}
              </div>
            </div>

            {/* FOOTER - Fixed and Flush */}
            <div className="shrink-0 bg-[#fcfae4] border-t-4 border-black p-8 pt-6 flex flex-col gap-6 relative z-20 shadow-[0_-4px_15px_rgba(0,0,0,0.05)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-black/50 uppercase tracking-[0.2em] leading-none">Phí Thăng Hoa</span>
                    <div className="flex items-center gap-2.5">
                       <div className="p-1 bg-amber-100 border-2 border-amber-300 rounded-lg"><CoinsIcon size={18} className="text-amber-600" /></div>
                       <span className={`text-2xl font-black italic leading-none tracking-tighter ${coins < cost ? 'text-red-500' : 'text-black'}`}>{cost.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="w-[2px] h-10 bg-gray-300 rounded-full" />
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-black/50 uppercase tracking-[0.2em] leading-none">Năng lượng nạp</span>
                    <div className="flex items-center gap-2.5">
                       <div className="p-1 bg-primary/20 border-2 border-primary/30 rounded-lg"><ZapIcon size={18} className="text-primary" /></div>
                       <span className="text-2xl font-black italic leading-none tracking-tighter text-black">+{pointsToAdd}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1.5">
                  <motion.div 
                    animate={isBreakthrough ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 shadow-sm ${isBreakthrough && !isLevelCapped ? 'bg-green-100 text-green-600 border-green-500' : 'bg-gray-100 text-gray-500 border-gray-300'}`}
                  >
                    {isLevelCapped ? 'LEVEL CAP REACHED' : isBreakthrough ? 'RITUAL READY' : 'ACCUMULATING'}
                  </motion.div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (isLevelCapped) return showNotification(`Cần đạt cấp ${50 + (currentRedStars * 10)} để thăng hoa tiếp`, "error");
                  if (isRedStarMode && redAscensionBooks < 1) return showNotification("Cần ít nhất 1 Sách Thăng Hoa Đỏ", "error");
                  if (pointsToAdd <= 0 && currentBankPoints < effectiveNeededPoints) return showNotification("Chưa chọn nguyên liệu", "error");
                  if (coins < cost) return showNotification("Không đủ vàng", "error");
                  onConfirm(selectedMaterials, cost, pointsToAdd, selectedBooks);
                }}
                disabled={(pointsToAdd <= 0 && currentBankPoints < effectiveNeededPoints) || isLevelCapped}
                className={`w-full h-18 rounded-[28px] font-black uppercase tracking-[0.3em] text-lg shadow-[0_8px_0_#1c1c0f] active:shadow-none active:translate-y-2 disabled:grayscale disabled:opacity-30 transition-all flex items-center justify-center gap-4 relative overflow-hidden group border-4 border-black ${isBreakthrough && !isLevelCapped ? (isRedStarMode ? 'bg-red-500 text-white' : 'bg-amber-400 text-black') : 'bg-primary text-white'}`}
              >
                {/* Button Shine Effect */}
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                
                <span className="relative z-10">
                  {isLevelCapped ? 'GIỚI HẠN CẤP ĐỘ' : isBreakthrough ? (isRedStarMode ? 'KHAI MỞ SAO ĐỎ' : 'THĂNG HOA NGAY') : 'NẠP NĂNG LƯỢNG'}
                </span>
                <ZapIcon size={20} className={`relative z-10 transition-transform group-hover:scale-125 ${isBreakthrough && !isLevelCapped && !isRedStarMode ? 'fill-black' : 'fill-white'}`} />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EvolutionModal;
