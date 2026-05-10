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
  CheckIcon, GemIcon, CoinIcon, ScrollIcon,
  TargetIcon, SwordIcon, ZapIcon
} from '../../components/shared/Icons';
import { useInteractionDelay } from '../../hooks/useInteractionDelay';
import './Campaign.css';

const MobileCampaign: React.FC = () => {
  const navigate = useNavigate();
  const showContent = useInteractionDelay(150);
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

  if (!showContent) {
    return <div className="h-screen w-full bg-[#fcf9f2]" />;
  }

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
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  className="fixed inset-x-0 bottom-0 z-100 inspector-modal rounded-t-[48px] p-6 pb-10 shadow-[0_-20px_80px_rgba(0,0,0,0.3)] border-t-4 border-white flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar"
                >
                  {/* Handlebar */}
                  <div className="w-12 h-1.5 bg-primary/10 rounded-full mx-auto mb-6 shrink-0"></div>
                  
                  {/* Header Section */}
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-primary/5">
                           BÀI TẬP {currentStage.id}
                        </div>
                        <div className="flex gap-0.5">
                           {[1, 2, 3, 4, 5].map(i => (
                             <StarIcon key={i} size={10} className={i <= Math.ceil(currentStage.id / 5) ? 'text-amber-500' : 'text-primary/10'} />
                           ))}
                        </div>
                    </div>
                    <h3 className="text-4xl font-black text-primary italic uppercase tracking-tighter leading-none mb-3 drop-shadow-sm">{currentStage.theme}</h3>
                    <p className="text-[11px] text-primary/40 font-bold italic px-10 leading-relaxed">"{currentStage.quote}"</p>
                  </div>

                  {/* Information Grid */}
                  <div className="space-y-4 mb-8">
                    {/* Main Objective Card */}
                    <div className="objective-card flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="size-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                             <TargetIcon size={24} />
                          </div>
                          <div className="flex flex-col">
                             <span className="text-[9px] font-black text-primary/30 uppercase tracking-widest leading-none mb-1">Mục tiêu chính</span>
                             <span className="text-sm font-black text-primary uppercase italic">Đạt mốc {currentStage.targetScore.toLocaleString()} điểm</span>
                          </div>
                       </div>
                       <div className="best-record-badge flex flex-col items-center">
                          <span className="text-[8px] font-black text-primary/30 uppercase tracking-widest leading-none mb-1">Kỷ lục</span>
                          <span className="text-xs font-black text-primary italic">{progress[currentStage.id]?.bestScore?.toLocaleString() || 0}</span>
                       </div>
                    </div>

                    {/* Enemy Intel Section (Simulated) */}
                    <div className="enemy-intel-card">
                       <div className="size-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                          {currentStage.type === 'boss' ? <TrophyIcon size={24} className="text-amber-400" /> : <SwordIcon size={24} className="text-white/60" />}
                       </div>
                       <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                             <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Lực lượng địch</span>
                             <span className="text-[9px] font-black text-amber-400 uppercase italic">{currentStage.type === 'boss' ? 'CỰC KHÓ' : 'TRUNG BÌNH'}</span>
                          </div>
                          <p className="text-[10px] font-bold text-white/80 italic leading-tight">
                             {currentStage.type === 'boss' 
                                ? 'Cẩn thận! Boss có khả năng sử dụng các phép tính phức tạp để đảo ngược tình thế.'
                                : 'Các quái vật toán học ở đây sử dụng chủ yếu phép cộng và trừ cơ bản.'}
                          </p>
                       </div>
                    </div>

                    {/* Rewards Bento */}
                    <div className="space-y-3">
                       <div className="flex justify-between items-center px-1">
                          <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Phần thưởng vượt ải</span>
                          <span className="text-[9px] font-black text-green-600 uppercase italic">Lần đầu: x2</span>
                       </div>
                       <div className="reward-bento-grid">
                          <div className="reward-bento-item">
                             <CoinIcon size={20} className="text-amber-500" />
                             <span className="text-xs font-black text-primary italic">+{currentStage.rewards.gold.toLocaleString()}</span>
                          </div>
                          <div className="reward-bento-item">
                             <GemIcon size={20} className="text-blue-500" />
                             <span className="text-xs font-black text-primary italic">+{currentStage.rewards.gems}</span>
                          </div>
                          <div className="reward-bento-item">
                             <div className="relative">
                                <ScrollIcon size={20} className={currentStage.rewards.packType ? 'text-red-500' : 'text-primary/10'} />
                                {currentStage.rewards.packType && (
                                   <div className="absolute -top-1 -right-1 size-3 bg-red-500 rounded-full border border-white text-[6px] font-black flex items-center justify-center text-white">{currentStage.rewards.packType}</div>
                                )}
                             </div>
                             <span className="text-xs font-black text-primary italic">{currentStage.rewards.packType ? 'Mảnh hiếm' : 'Không có'}</span>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Action Section */}
                  <div className="mt-auto space-y-4">
                     <motion.button
                       whileTap={{ scale: 0.96 }}
                       onClick={handleStartGame}
                       className="deploy-btn-premium group"
                     >
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-active:opacity-100 transition-opacity"></div>
                        <div className="flex items-center justify-center gap-4">
                           <span>XUẤT QUÂN NGAY</span>
                           <div className="ap-cost-tag flex items-center gap-1.5">
                              <ZapIcon size={10} />
                              <span>10 AP</span>
                           </div>
                        </div>
                     </motion.button>
                     
                     <div className="text-center opacity-30">
                        <span className="text-[8px] font-black uppercase tracking-[0.4em]">Đấu trường Trí tuệ Offline</span>
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
