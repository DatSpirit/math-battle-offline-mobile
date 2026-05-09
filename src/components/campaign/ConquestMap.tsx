import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/gameStore';
import { 
  StarIcon, TrophyIcon, LockIcon, 
  ChevronLeftIcon, ChevronRightIcon
} from '../shared/Icons';

// Random Math Doodles to scatter on the page
const DOODLES = [
  { text: "a² + b² = c²", x: '10%', y: '15%', rotate: -15 },
  { text: "∫ f(x) dx", x: '80%', y: '20%', rotate: 10 },
  { text: "E = mc²", x: '15%', y: '80%', rotate: 5 },
  { text: "Δ = b² - 4ac", x: '75%', y: '85%', rotate: -8 },
  { text: "sin²θ + cos²θ = 1", x: '45%', y: '10%', rotate: 2 },
  { text: "log(xy) = log x + log y", x: '30%', y: '90%', rotate: -3 },
  { text: "x = (-b ± √Δ) / 2a", x: '85%', y: '50%', rotate: 12 },
  { text: "1 + 1 = 2?", x: '5%', y: '45%', rotate: -20 },
  { text: "∑ xᵢ / n", x: '60%', y: '75%', rotate: 7 },
  { text: "A = πr²", x: '20%', y: '30%', rotate: -10 },
];

export const ConquestMap: React.FC = () => {
  const navigate = useNavigate();
  const { stages, progress, setCurrentStage, startGame } = useGameStore();
  const [currentPage, setCurrentPage] = useState(0);

  const STAGES_PER_PAGE = 5;
  const mainStagesOnPage = stages.filter(s => !s.isSideBranch).slice(currentPage * STAGES_PER_PAGE, (currentPage + 1) * STAGES_PER_PAGE);
  const sideStagesOnPage = stages.filter(s => s.isSideBranch && s.parentStageId && 
    mainStagesOnPage.some(m => m.id === s.parentStageId)
  );

  const totalPages = Math.ceil(stages.filter(s => !s.isSideBranch).length / STAGES_PER_PAGE);

  // Staggered positions for zig-zag (x, y percentages)
  const POSITIONS = [
    { x: '15%', y: '30%' },
    { x: '35%', y: '70%' },
    { x: '55%', y: '25%' },
    { x: '75%', y: '65%' },
    { x: '90%', y: '40%' },
  ];

  // Side Branch Position (Relative to Stage 1)
  const SIDE_POS = { x: '15%', y: '75%' };

  const handleSelectStage = (stageId: number) => {
    const stageProgress = progress[stageId];
    if (!stageProgress || !stageProgress.isUnlocked) return;
    
    setCurrentStage(stageId);
    startGame('campaign', 'medium');
    navigate('/battle/arena');
  };

  const nextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage(v => v + 1);
  };

  const prevPage = () => {
    if (currentPage > 0) setCurrentPage(v => v - 1);
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto flex flex-col gap-8">
      {/* Notebook Container */}
      <div className="relative aspect-video bg-[#fdfdfd] rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-l-40 border-[#e0e0e0] overflow-hidden">
        {/* Notebook Spiral Decoration */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-black/10 z-10" />
        <div className="absolute left-[-35px] top-0 bottom-0 flex flex-col justify-around py-4 z-20">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="w-6 h-6 rounded-full bg-[#fdfdfd] border-2 border-gray-300 shadow-inner" />
          ))}
        </div>

        {/* Grid Background */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        {/* Page Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="relative h-full p-16 flex flex-col"
            style={{ transformOrigin: 'left center', perspective: '2000px' }}
          >
            {/* Background Doodles */}
            {DOODLES.map((d, i) => (
              <div 
                key={i} 
                className="absolute text-primary/10 font-mono font-bold select-none pointer-events-none whitespace-nowrap text-lg"
                style={{ left: d.x, top: d.y, transform: `rotate(${d.rotate}deg)` }}
              >
                {d.text}
              </div>
            ))}

            {/* Red Margin Line */}
            <div className="absolute left-[80px] top-0 bottom-0 w-[2px] bg-red-400/30" />

            {/* Header */}
            <div className="mb-12 relative">
              <div className="inline-block relative">
                <h2 className="text-4xl font-black text-primary/80 italic font-serif border-b-2 border-primary/20 pb-2">
                  Bài Tập: {mainStagesOnPage[0]?.theme}
                </h2>
                <div className="absolute -right-16 top-0 w-12 h-12 rounded-full border-4 border-red-500/40 flex items-center justify-center text-red-500/40 font-black -rotate-12 select-none">
                  10/10
                </div>
              </div>
              <p className="mt-2 text-primary/40 font-bold uppercase tracking-widest text-xs">Học sinh: [Người Chơi] - Lớp: Đấu Trường Toán Học</p>
            </div>

            {/* Zig-Zag Stages Path */}
            <div className="flex-1 relative">
              {/* Path Connector SVG */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Main Path */}
                <motion.path 
                  d="M 15,30 L 35,70 L 55,25 L 75,65 L 90,40" 
                  fill="none" 
                  stroke="var(--primary)" 
                  strokeWidth="0.5" 
                  strokeDasharray="1,1"
                  className="opacity-20"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5 }}
                />
                {/* Branch Path */}
                {sideStagesOnPage.length > 0 && (
                  <motion.path 
                    d="M 15,30 L 15,75" 
                    fill="none" 
                    stroke="#3B82F6" 
                    strokeWidth="1.5" 
                    strokeDasharray="4,4"
                    className="opacity-40"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 1 }}
                  />
                )}
              </svg>

              {/* Render Main Stages */}
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
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-30 group"
                  >
                    {/* Tooltip: Quote */}
                    <AnimatePresence>
                      {isUnlocked && (
                        <motion.div 
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-white border-2 border-primary/20 p-3 rounded-xl shadow-xl w-48 text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                        >
                          <p className="text-[11px] font-bold italic leading-tight text-primary/70">"{stage.quote}"</p>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b-2 border-r-2 border-primary/20 rotate-45 -mt-1.5" />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Stage Button */}
                    <div 
                      onClick={() => handleSelectStage(stage.id)}
                      className={`
                        relative w-20 h-20 flex flex-col items-center justify-center rounded-2xl cursor-pointer
                        transition-all duration-300
                        ${isUnlocked 
                          ? 'bg-white border-4 border-black shadow-[6px_6px_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none' 
                          : 'bg-gray-100 border-4 border-gray-300 grayscale opacity-40 cursor-not-allowed'}
                        ${isBoss ? 'scale-125 rotate-6' : ''}
                      `}
                    >
                      {isBoss ? (
                        <TrophyIcon size={40} className={isUnlocked ? 'text-orange-500' : 'text-gray-400'} />
                      ) : (
                        <div className="font-serif font-black text-3xl text-primary/80">{stage.id}</div>
                      )}

                      {/* Stars */}
                      <div className="absolute -bottom-3 flex gap-0.5">
                        {[1, 2, 3].map((star) => (
                          <StarIcon 
                            key={star} 
                            size={14} 
                            fill={(prog?.stars || 0) >= star ? '#FFD700' : '#E2E8F0'}
                            className="drop-shadow-sm"
                          />
                        ))}
                      </div>

                      {!isUnlocked && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <LockIcon size={24} className="text-gray-400" />
                        </div>
                      )}

                      {/* Handwritten Grade/Label */}
                      <div className="absolute top-full mt-4 whitespace-nowrap text-[10px] font-black uppercase tracking-tighter text-primary/40 italic">
                        {isBoss ? 'BÀI TẬP CUỐI KÌ' : `BÀI TẬP ${stage.id}`}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Render Side Branches */}
              {sideStagesOnPage.map((stage) => {
                const prog = progress[stage.id];
                const isUnlocked = prog?.isUnlocked;
                
                return (
                  <motion.div
                    key={stage.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    style={{ left: SIDE_POS.x, top: SIDE_POS.y }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-30 group"
                  >
                    <div 
                      onClick={() => handleSelectStage(stage.id)}
                      className={`
                        relative w-20 h-20 flex flex-col items-center justify-center rounded-full cursor-pointer
                        transition-all duration-300
                        ${isUnlocked 
                          ? 'bg-blue-50 border-4 border-blue-600 shadow-[6px_6px_0_rgba(59,130,246,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none' 
                          : 'bg-gray-100 border-4 border-gray-300 grayscale opacity-40 cursor-not-allowed'}
                      `}
                    >
                      <div className="font-serif font-black text-2xl text-blue-600">S</div>
                      
                      <div className="absolute -bottom-3 flex gap-0.5">
                        {[1, 2, 3].map((star) => (
                          <StarIcon 
                            key={star} 
                            size={12} 
                            fill={(prog?.stars || 0) >= star ? '#3B82F6' : '#E2E8F0'}
                          />
                        ))}
                      </div>

                      {!isUnlocked && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <LockIcon size={20} className="text-gray-400" />
                        </div>
                      )}

                      {/* Side Label */}
                      <div className="absolute top-full mt-4 whitespace-nowrap text-[10px] font-black uppercase tracking-tighter text-blue-600 italic">
                        BÀI TẬP THÊM (x2)
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Handwritten Note at bottom */}
            <div className="mt-auto flex justify-between items-end border-t-2 border-primary/5 pt-6 italic font-serif text-primary/40 text-sm">
              <div className="max-w-[250px]">
                * Chú ý: Hãy kiểm tra kĩ các phép tính trước khi nộp bài. Mỗi sai sót sẽ làm giảm số sao nhận được.
              </div>
              <div className="text-right">
                <span className="block text-xs font-sans font-black uppercase tracking-widest mb-1">Mã số học sinh</span>
                <span className="text-lg">#MATH-2026-STU</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between px-12">
        <button 
          onClick={prevPage}
          disabled={currentPage === 0}
          className="group flex items-center gap-4 py-4 px-10 bg-[#f8f8f8] border-4 border-black rounded-full font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:grayscale"
        >
          <ChevronLeftIcon size={24} />
          <span>Trang Trước</span>
        </button>

        <button 
          onClick={nextPage}
          disabled={currentPage === totalPages - 1}
          className="group flex items-center gap-4 py-4 px-10 bg-primary text-white border-4 border-black rounded-full font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:grayscale shadow-[0_10px_20px_rgba(var(--primary-rgb),0.3)]"
        >
          <span>Lật Trang</span>
          <ChevronRightIcon size={24} />
        </button>
      </div>
    </div>
  );
};
