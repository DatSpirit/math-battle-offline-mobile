/**
 * PAGE: History (Mobile Premium Bento)
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHistoryStore } from '../../store/historyStore';
import { usePlayerStore } from '../../store/playerStore';
import type { MatchRecord } from '../../types/history.types';
import { 
  TrophyIcon, TargetIcon, 
  ChevronRightIcon, ActivityIcon
} from '../../components/shared/Icons';
import DetailedHistory from '../../components/game/DetailedHistory';
import LoadingScreen from '../../components/shared/LoadingScreen.tsx';
import './History.css';

const MobileHistory: React.FC = () => {
  const { matches, stats } = useHistoryStore();
  const hasHydrated = usePlayerStore(s => s.hasHydrated);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'high_score' | 'low_score'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(() => {
    const h = typeof window !== 'undefined' ? window.innerHeight : 800;
    if (h > 850) return 10;
    if (h < 700) return 6;
    return 8;
  });
  const itemsPerPageRef = React.useRef(itemsPerPage);

  React.useEffect(() => {
    itemsPerPageRef.current = itemsPerPage;
  }, [itemsPerPage]);

  if (!hasHydrated) return <LoadingScreen message="Đang nạp lịch sử đấu..." />;

  // Sort logic
  const sortedMatches = [...matches].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
    if (sortBy === 'high_score') return Math.max(b.player1.score, b.player2.score) - Math.max(a.player1.score, a.player2.score);
    if (sortBy === 'low_score') return Math.min(a.player1.score, a.player2.score) - Math.min(b.player1.score, b.player2.score);
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedMatches.length / itemsPerPage);
  const paginatedMatches = sortedMatches.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const newestMatchId = matches.length > 0 ? [...matches].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].id : null;

  return (
    <div className="flex flex-col h-full bg-[#fcf9f2] relative font-body overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] hologram-grid"></div>
      
      {/* Premium HUD Header */}
      <header className="z-40 bg-[#fcf9f2]/40 backdrop-blur-3xl px-6 pt-12 pb-6 border-b-4 border-white shadow-xl shrink-0">
        <div className="flex justify-between items-end mb-6">
           <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest w-fit mb-2 border border-primary/5">LOG ARCHIVE</div>
              <h1 className="text-3xl font-black text-primary italic uppercase tracking-tighter m-0 leading-none">LỊCH SỬ ĐẤU</h1>
           </motion.div>
        </div>

        {/* Quick Analytics Summary */}
        <div className="grid grid-cols-2 gap-3 mb-6">
           <div className="bg-white/60 p-4 rounded-[24px] border-2 border-white shadow-sm flex items-center gap-3 backdrop-blur-md">
              <div className="size-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-500/5">
                 <TrophyIcon size={18} />
              </div>
              <div className="flex flex-col">
                 <span className="text-[7px] font-black text-primary/30 uppercase tracking-widest leading-none mb-1">Thắng</span>
                 <span className="text-lg font-black text-primary italic leading-none">{stats.wins}</span>
              </div>
           </div>
           <div className="bg-white/60 p-4 rounded-[24px] border-2 border-white shadow-sm flex items-center gap-3 backdrop-blur-md">
              <div className="size-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 border border-amber-500/5">
                 <TargetIcon size={18} />
              </div>
              <div className="flex flex-col">
                 <span className="text-[7px] font-black text-primary/30 uppercase tracking-widest leading-none mb-1">Tỉ lệ</span>
                 <span className="text-lg font-black text-primary italic leading-none">{(stats.winRate || 0).toFixed(0)}%</span>
              </div>
           </div>
        </div>

        {/* Sort Bar */}
        <div className="flex overflow-x-auto gap-2 pb-2 custom-scrollbar">
           {(['newest', 'oldest', 'high_score', 'low_score'] as const).map((s) => (
              <button 
                 key={s}
                 onClick={() => { setSortBy(s); setCurrentPage(1); }}
                 className={`px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest whitespace-nowrap border-2 transition-all ${sortBy === s ? 'bg-primary text-white border-primary shadow-lg' : 'bg-white/60 text-primary/40 border-white'}`}
              >
                 {s === 'newest' ? 'Mới' : s === 'oldest' ? 'Cũ' : s === 'high_score' ? 'Điểm cao' : 'Thấp'}
              </button>
           ))}
        </div>
      </header>

      {/* History List Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar history-list-scroll flex flex-col pb-24">
         {matches.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center opacity-20 mt-10">
               <ActivityIcon size={64} />
               <p className="mt-6 text-[10px] font-black uppercase tracking-[0.3em]">Dữ liệu trống</p>
            </div>
         ) : (
            <>
               {paginatedMatches.map((match, i) => (
                 <MobileMatchRow 
                   key={match.id} 
                   match={match} 
                   index={i} 
                   displayIndex={(currentPage - 1) * itemsPerPage + i + 1}
                   isNew={match.id === newestMatchId}
                 />
               ))}

               {/* Pagination */}
               {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 pt-4 pb-10">
                     <button 
                       disabled={currentPage === 1}
                       onClick={() => setCurrentPage(prev => prev - 1)}
                       className="p-3 rounded-xl bg-white border border-primary/10 text-primary disabled:opacity-30"
                     >
                       <ChevronRightIcon size={16} className="rotate-180" />
                     </button>
                     <span className="text-[10px] font-black text-primary/40 uppercase">Trang {currentPage} / {totalPages}</span>
                     <button 
                       disabled={currentPage === totalPages}
                       onClick={() => setCurrentPage(prev => prev + 1)}
                       className="p-3 rounded-xl bg-white border border-primary/10 text-primary disabled:opacity-30"
                     >
                       <ChevronRightIcon size={16} />
                     </button>
                  </div>
               )}
            </>
         )}
      </div>
    </div>
  );
};

const MobileMatchRow: React.FC<{ match: MatchRecord, index: number, displayIndex: number, isNew: boolean }> = ({ match, index, displayIndex, isNew }) => {
  const [showDetail, setShowDetail] = useState(false);
  const isWin = match.winner === 'player1';
  const isLoss = match.winner === 'player2';
  
  return (
    <>
      <motion.div 
        layout 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="relative"
      >
        <motion.div 
          layout
          onClick={() => setShowDetail(true)}
          className="history-card p-4 flex items-center gap-4 bg-white/40 backdrop-blur-2xl relative"
        >
          {isNew && <div className="badge-new text-[6px]! px-2! py-1! -top-2! -right-2!">NEW</div>}
          
          <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-5 h-5 bg-white border border-primary/10 rounded-full flex items-center justify-center text-[8px] font-black text-primary/30 z-20 shadow-sm">
             {displayIndex}
          </div>

          <div className={`result-badge size-10 rounded-xl shrink-0 text-lg ${isWin ? 'win' : isLoss ? 'loss' : 'draw'}`}>
             {isWin ? 'W' : isLoss ? 'L' : 'D'}
          </div>

          <div className="flex-1 min-w-0">
             <div className="flex justify-between items-center mb-1">
                <span className="text-[7px] font-black uppercase tracking-widest text-amber-600">
                   {match.mode === 'vs_ai' ? `AI UNIT` : 'LOCAL'}
                </span>
                <span className="text-[7px] text-primary/40 font-bold uppercase tracking-widest">
                   {new Date(match.date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </span>
             </div>
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <span className="text-lg font-black text-primary font-display">{match.player1.score}</span>
                   <span className="text-[10px] font-black text-primary/10">VS</span>
                   <span className="text-lg font-black text-primary font-display">{match.player2.score}</span>
                </div>
                <h4 className="text-[10px] font-black text-primary italic uppercase tracking-tighter truncate opacity-60">
                   Vs {match.player2.name}
                </h4>
             </div>
          </div>

          <ChevronRightIcon size={14} className="text-primary/10" />
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showDetail && (
          <MatchDetailModal match={match} onClose={() => setShowDetail(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

const MatchDetailModal: React.FC<{ match: MatchRecord, onClose: () => void }> = ({ match, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-primary/20 backdrop-blur-md"
    onClick={onClose}
  >
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="glass-panel w-full max-h-[90vh] overflow-hidden flex flex-col relative bg-white shadow-2xl border-t-4 border-x-4 border-white rounded-t-[40px]"
      onClick={e => e.stopPropagation()}
    >
      <div className="p-4 pb-2 flex justify-between items-start border-b border-primary/5">
        <div className="flex gap-3 items-center">
           <div className="size-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <ActivityIcon size={20} />
           </div>
           <div>
              <h2 className="text-base font-black text-primary italic uppercase tracking-tighter leading-none mb-1">CHI TIẾT TRẬN ĐẤU</h2>
              <span className="text-[7px] font-black text-amber-600 uppercase tracking-widest">{new Date(match.date).toLocaleString('vi-VN')}</span>
           </div>
        </div>
        <button 
          onClick={onClose}
          className="size-8 bg-white hover:bg-red-500 hover:text-white transition-all rounded-lg flex items-center justify-center text-primary/20 border-2 border-white shadow-sm"
        >
          ✕
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 pt-2 custom-scrollbar">
         <div className="mb-4 flex items-center justify-around bg-primary/5 p-3 rounded-2xl border border-primary/10">
            <div className="text-center">
               <h3 className="text-[10px] font-black text-primary uppercase italic truncate w-20 mb-0.5 leading-none">{match.player1.name}</h3>
               <span className="text-2xl font-black text-primary font-display leading-none">{match.player1.score}</span>
            </div>
            <div className="text-xs font-black text-primary/10 italic">VS</div>
            <div className="text-center">
               <h3 className="text-[10px] font-black text-primary uppercase italic truncate w-20 mb-0.5 leading-none">{match.player2.name}</h3>
               <span className="text-2xl font-black text-primary font-display leading-none">{match.player2.score}</span>
            </div>
         </div>

        <DetailedHistory history={match.turns} />
      </div>

      <div className="p-4 bg-white border-t border-primary/5 flex justify-center">
        <button 
          onClick={onClose}
          className="w-full py-3 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 active:scale-95 transition-all"
        >
          ĐÓNG BÁO CÁO
        </button>
      </div>
    </motion.div>
  </motion.div>
);

export default MobileHistory;
