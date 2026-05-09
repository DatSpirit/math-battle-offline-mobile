/**
 * PAGE: Campaign Map (Mobile Premium Bento)
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/gameStore';
import { usePlayerStore } from '../../store/playerStore';
import { 
  StarIcon, TrophyIcon, LockIcon, 
  ChevronLeftIcon, ChevronRightIcon,
  MapIcon, SparklesIcon, CheckIcon,
  GemIcon, CoinIcon, ScrollIcon
} from '../../components/shared/Icons';
import './Campaign.css';

const MobileCampaign: React.FC = () => {
  const navigate = useNavigate();
  // stages từ gameStore (static config)
  const { stages, setCurrentStage, startGame } = useGameStore();
  // progress từ playerStore (persisted)
  const { progress, setCurrentStage: setPlayerStage, updateProgress } = usePlayerStore();

  const [currentPage, setCurrentPage] = useState(0);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null);

  const STAGES_PER_PAGE = 5;
  const mainStages = stages.filter(s => !s.isSideBranch);
  const mainStagesOnPage = mainStages.slice(currentPage * STAGES_PER_PAGE, (currentPage + 1) * STAGES_PER_PAGE);
  const totalPages = Math.ceil(mainStages.length / STAGES_PER_PAGE);

  // Vertical zig-zag positions for mobile
  const POSITIONS = [
    { x: '25%', y: '10%' },
    { x: '75%', y: '30%' },
    { x: '25%', y: '50%' },
    { x: '75%', y: '70%' },
    { x: '50%', y: '90%' },
  ];

  const currentStage = selectedStageId ? stages.find(s => s.id === selectedStageId) : null;

  const handleSelectStage = (stageId: number) => {
    if (!progress[stageId]?.isUnlocked) return;
    setSelectedStageId(stageId);
    setIsInspectorOpen(true);
  };

  const handleStartGame = () => {
    if (!selectedStageId || !currentStage) return;
    
    // Kiểm tra lượt chơi đối với ải Boss
    const isBoss = currentStage.type === 'boss';
    const stageProg = progress[selectedStageId];
    const attempts = stageProg?.dailyAttempts || 0;
    const today = new Date().toISOString().split('T')[0];
    const isSameDay = stageProg?.lastAttemptDate === today;
    const remainingAttempts = isBoss ? (isSameDay ? 3 - attempts : 3) : Infinity;

    if (isBoss && remainingAttempts <= 0) {
      alert("Bạn đã hết lượt chơi Boss hôm nay! Hãy quay lại vào ngày mai.");
      return;
    }

    // Ghi ID ải vào cả 2 store
    setCurrentStage(selectedStageId);
    setPlayerStage?.(selectedStageId);
    startGame('campaign', 'medium');
    navigate('/battle/arena');
  };

  const totalStars = Object.values(progress).reduce((acc, p) => acc + (p.stars || 0), 0);

  // Debug: unlock ngay ải 1 nếu chưa có (edge case khi store chưa hydrate)
  useEffect(() => {
    if (!progress[1]) {
      updateProgress(1, 0, 0);
    }
  }, [progress, updateProgress]);

  return (
    <div className="flex flex-col h-screen bg-[#fcf9f2] relative font-body overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] hologram-grid"></div>
      
      {/* Premium HUD Header */}
      <header className="z-40 bg-[#fcf9f2]/60 backdrop-blur-2xl px-6 pt-12 pb-5 border-b-4 border-white shadow-lg shrink-0">
        <div className="flex justify-between items-center mb-4">
           <div>
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest w-fit mb-2">OPERATIONAL MAP</div>
              <h1 className="text-3xl font-black text-primary italic uppercase tracking-tighter m-0 leading-none">HẢI TRÌNH</h1>
           </div>
           <div className="bg-white px-5 py-2.5 rounded-2xl shadow-md text-primary flex items-center gap-3 border-2 border-white">
              <StarIcon size={18} fill="currentColor" />
              <span className="text-sm font-black">{totalStars}</span>
           </div>
        </div>

        {/* Chapter Tabs */}
        <div className="flex bg-white/50 p-1.5 rounded-[24px] border-2 border-white shadow-sm gap-2">
           <button 
             onClick={() => currentPage > 0 && setCurrentPage(currentPage - 1)}
             disabled={currentPage === 0}
             className="size-11 bg-white rounded-xl flex items-center justify-center text-primary/40 shadow-sm disabled:opacity-20 active:scale-90 transition-transform"
           >
              <ChevronLeftIcon size={20} />
           </button>
           <div className="flex-1 flex items-center justify-center">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">CHƯƠNG {currentPage + 1} <span className="text-primary/20">/ {totalPages}</span></span>
           </div>
           <button 
             onClick={() => currentPage < totalPages - 1 && setCurrentPage(currentPage + 1)}
             disabled={currentPage === totalPages - 1}
             className="size-11 bg-white rounded-xl flex items-center justify-center text-primary/40 shadow-sm disabled:opacity-20 active:scale-90 transition-transform"
           >
              <ChevronRightIcon size={20} />
           </button>
        </div>
      </header>

      {/* Main Strategic Table (Scrollable) */}
      <div className="flex-1 relative overflow-y-auto p-4 custom-scrollbar">
         <div className="hologram-table min-h-[900px] rounded-[48px] border-4 border-white shadow-2xl flex flex-col p-6 overflow-hidden bg-white/20 backdrop-blur-sm relative">
            <div className="scanline-map"></div>
            
            {/* HUD Decorations */}
            <div className="hud-corner hud-corner-tl top-6! left-6! scale-75 opacity-40"></div>
            <div className="hud-corner hud-corner-tr top-6! right-6! scale-75 opacity-40"></div>
            <div className="hud-corner hud-corner-bl bottom-6! left-6! scale-75 opacity-40"></div>
            <div className="hud-corner hud-corner-br bottom-6! right-6! scale-75 opacity-40"></div>

            <div className="flex-1 relative">
               {/* Vertical Path SVG */}
               <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                   <path 
                      d="M 25,10 C 50,15 75,25 75,30 C 75,35 25,45 25,50 C 25,55 75,65 75,70 C 75,75 50,85 50,90" 
                      fill="none" 
                      stroke="#8b5000" 
                      strokeWidth="1.5" 
                      className="map-path-glow"
                   />
               </svg>

               {/* Stage Nodes */}
               {mainStagesOnPage.map((stage, idx) => {
                  const prog = progress[stage.id];
                  const isUnlocked = prog?.isUnlocked;
                  const isBoss = stage.type === 'boss';
                  const pos = POSITIONS[idx];

                  return (
                    <motion.div
                      key={stage.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      style={{ left: pos.x, top: pos.y }}
                      onClick={() => handleSelectStage(stage.id)}
                      className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
                    >
                       <div className={`stage-node ${isBoss ? 'boss-node' : ''} ${isUnlocked ? 'unlocked' : 'locked'} scale-95`}>
                          {isBoss ? (
                             <TrophyIcon size={40} className={isUnlocked ? 'text-primary' : 'text-primary/20'} />
                          ) : isUnlocked ? (
                             <span className="text-2xl font-black text-primary italic leading-none">{stage.id}</span>
                          ) : (
                             <LockIcon size={20} className="text-primary/20" />
                          )}
                          
                          {/* Stars */}
                          {isUnlocked && (
                             <div className="absolute -bottom-4 flex gap-0.5 z-20">
                                {[1, 2, 3].map((s) => (
                                   <StarIcon 
                                      key={s} size={12} 
                                      fill={(prog?.stars || 0) >= s ? "#f59e0b" : "transparent"} 
                                      className={(prog?.stars || 0) >= s ? "text-amber-500 shadow-glow" : "text-primary/10"} 
                                   />
                                ))}
                             </div>
                          )}

                          {/* Completed Check */}
                          {prog?.stars > 0 && (
                             <div className="absolute -top-3 -right-3 size-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center text-white shadow-xl z-30">
                                <CheckIcon size={12} />
                             </div>
                          )}
                       </div>
                    </motion.div>
                  );
               })}
            </div>
         </div>
      </div>

      {/* Bottom Sheet Inspector */}
      <AnimatePresence>
         {isInspectorOpen && currentStage && (
            <>
               <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 onClick={() => setIsInspectorOpen(false)}
                 className="fixed inset-0 bg-black/60 backdrop-blur-md z-50"
               />
               <motion.div
                 initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                 transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                 className="fixed inset-x-0 bottom-0 z-100 bg-white/90 backdrop-blur-3xl rounded-t-[48px] p-8 pb-10 shadow-[0_-20px_60px_rgba(0,0,0,0.2)] border-t-4 border-white"
               >
                  <div className="w-16 h-1 bg-gray-200/50 rounded-full mx-auto mb-6 shadow-inner"></div>
                  
                  <div className="mb-6 text-center relative">
                     <div className="absolute -top-4 right-0 opacity-20">
                        <SparklesIcon size={24} />
                     </div>
                     <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="bg-primary/10 text-primary px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.3em] border border-primary/10">
                           BÀI TẬP {currentStage.id}
                        </div>
                        <div className="flex flex-col items-start gap-1">
                           <div className="flex items-center gap-2">
                              <span className="text-[8px] font-black text-primary/30 uppercase tracking-widest">Tiến độ</span>
                              <span className="text-[8px] font-black text-primary/60 italic">{Math.round((Object.keys(progress).filter(id => parseInt(id) <= (currentPage + 1) * 5).length / 5) * 100)}%</span>
                           </div>
                           <div className="w-16 h-1 bg-primary/5 rounded-full overflow-hidden">
                              <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${(Object.keys(progress).filter(id => parseInt(id) <= (currentPage + 1) * 5).length / 5) * 100}%` }}
                                 className="h-full bg-primary/40"
                              />
                           </div>
                        </div>
                     </div>
                     <h3 className="text-3xl font-black text-primary italic uppercase tracking-tighter leading-none mb-3">{currentStage.theme}</h3>
                     <p className="text-xs text-primary/40 font-bold italic px-8 leading-relaxed">"{currentStage.quote}"</p>
                  </div>

                  <div className="flex flex-col gap-3 mb-8">
                    <div className="bg-white/50 p-6 rounded-[32px] flex items-center justify-between border-2 border-white shadow-sm">
                       <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Thành tích tốt nhất</span>
                       <div className="flex flex-col items-end gap-1">
                          <div className="flex gap-0.5">
                             {[1, 2, 3].map(s => (
                               <StarIcon key={s} size={14} fill={(progress[currentStage.id]?.stars || 0) >= s ? "#f59e0b" : "transparent"} className={(progress[currentStage.id]?.stars || 0) >= s ? "text-amber-500" : "text-primary/10"} />
                             ))}
                          </div>
                          <span className="text-sm font-black text-primary">
                             {progress[currentStage.id]?.bestScore?.toLocaleString() || 0} pts
                          </span>
                       </div>
                    </div>
                    {currentStage.type === 'boss' && (
                       <div className="bg-primary/5 p-6 rounded-[32px] flex items-center justify-between border-2 border-primary/10 shadow-sm">
                          <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Lượt chơi Boss trong ngày</span>
                          <span className={`text-sm font-black ${(progress[currentStage.id]?.lastAttemptDate === new Date().toISOString().split('T')[0] ? progress[currentStage.id]?.dailyAttempts : 0) >= 3 ? 'text-red-500' : 'text-primary'}`}>
                             {3 - (progress[currentStage.id]?.lastAttemptDate === new Date().toISOString().split('T')[0] ? (progress[currentStage.id]?.dailyAttempts || 0) : 0)} / 3
                          </span>
                       </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-4">
                     {/* Red Star Material Info (Boss only) */}
                     {currentStage.type === 'boss' && (
                       <div className="bg-red-500/5 border border-red-500/10 rounded-[32px] p-5 flex items-center gap-5 mb-2">
                         <div className="size-14 bg-red-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-500/30 shrink-0">
                           <ScrollIcon size={28} />
                         </div>
                         <div className="flex flex-col flex-1">
                           <div className="flex items-center gap-2 mb-1">
                             <span className="text-sm font-black text-red-600 uppercase tracking-tighter">SÁCH TOÁN CỔ</span>
                           </div>
                           <span className="text-[10px] font-bold text-red-900/40 italic leading-tight">
                             "Tri thức cổ xưa được phong ấn, tương truyền có thể phá vỡ giới hạn cuối cùng của thẻ bài..."
                           </span>
                         </div>
                       </div>
                     )}

                     {/* Reward Banner */}
                     <div className="bg-linear-to-r from-amber-500 to-orange-600 p-5 rounded-[28px] shadow-2xl shadow-orange-500/20 flex items-center justify-between text-white relative overflow-hidden border-2 border-white/30">
                        <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                        <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] relative z-10">
                           {progress[currentStage.id]?.stars >= 3 ? 'Thưởng cày lại (REPLAY)' : 'Phần thưởng ải'}
                        </span>
                        <div className="flex items-center gap-3 relative z-10">
                           {progress[currentStage.id]?.stars >= 3 ? <CoinIcon size={20} className="text-white" /> : <GemIcon size={20} className="text-white drop-shadow-sm" />}
                           <span className="text-xl font-black italic">
                             {progress[currentStage.id]?.stars >= 3 
                                ? (currentStage.type === 'boss' ? '10,000' : '5,000') 
                                : (currentStage.rewards.gems || 50)}
                           </span>
                        </div>
                     </div>

                     <motion.button
                       whileTap={{ scale: 0.96 }}
                       onClick={handleStartGame}
                       className="w-full py-6 bg-linear-to-r from-primary to-[#a66000] text-white rounded-[28px] font-black text-xl uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(139,80,0,0.4)] border-2 border-white/30"
                     >
                        XUẤT QUÂN NGAY
                     </motion.button>
                     <div className="flex justify-center items-center gap-3 opacity-20">
                        <MapIcon size={12} />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">AP tiêu hao: 10</span>
                     </div>
                  </div>
               </motion.div>
            </>
         )}
      </AnimatePresence>
    </div>
  );
};

export default MobileCampaign;
