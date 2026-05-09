/**
 * PAGE: Quests (Mobile Premium Bento)
 */
import React from 'react';
import { motion } from 'framer-motion';
import { useQuestsLogic } from '../../hooks/useQuestsLogic';
import type { Quest } from '../../types/player.types';
import { 
  CheckCircleIcon, TimerIcon, 
  SparklesIcon, TrophyIcon, CoinsIcon, GemIcon
} from '../../components/shared/Icons';
import RewardClaimModal from '../../components/modals/RewardClaimModal';
import { AnimatePresence } from 'framer-motion';
import './Quests.css';

const MobileQuests: React.FC = () => {
  const q = useQuestsLogic();
  const [activeTab, setActiveTab] = React.useState<'daily' | 'weekly'>('daily');
  
  const currentQuests = activeTab === 'daily' ? q.dailyQuests : q.weeklyQuests;
  const timeLeft = activeTab === 'daily' ? q.dailyTimeLeft : q.weeklyTimeLeft;
  
  const completedCount = currentQuests.filter((qu: Quest) => qu.completed).length;
  const totalCount = currentQuests.length;
  const overallProgress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="flex flex-col h-full bg-[#fcf9f2] relative font-body overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] hologram-grid"></div>
      
      {/* Premium HUD Header */}
      <header className="z-40 bg-[#fcf9f2]/40 backdrop-blur-3xl px-5 pt-8 pb-4 border-b-4 border-white shadow-xl shrink-0">
        <div className="flex justify-between items-center mb-4">
           <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[7px] font-black uppercase tracking-widest w-fit mb-1 border border-primary/5">OPERATIONS</div>
              <h1 className="text-2xl font-black text-primary italic uppercase tracking-tighter m-0 leading-none">NHIỆM VỤ</h1>
           </motion.div>
           
           <div className="flex bg-white/60 p-1 rounded-xl border border-white shadow-inner">
              <button 
                onClick={() => setActiveTab('daily')}
                className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${activeTab === 'daily' ? 'bg-primary text-white shadow-lg' : 'text-primary/40'}`}
              >
                 NGÀY
              </button>
              <button 
                onClick={() => setActiveTab('weekly')}
                className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${activeTab === 'weekly' ? 'bg-primary text-white shadow-lg' : 'text-primary/40'}`}
              >
                 TUẦN
              </button>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
           <div className="bg-white/60 p-3 rounded-2xl border-2 border-white shadow-sm flex items-center gap-3 backdrop-blur-md">
              <div className="size-8 bg-primary/5 rounded-lg flex items-center justify-center text-primary border border-primary/5">
                 <TrophyIcon size={14} />
              </div>
              <div className="flex flex-col min-w-0">
                 <span className="text-[6px] font-black text-primary/30 uppercase tracking-widest leading-none mb-1">Tiến độ</span>
                 <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-primary italic leading-none">{completedCount}/{totalCount}</span>
                    <div className="flex-1 bg-primary/10 h-1 rounded-full w-12 overflow-hidden">
                       <motion.div animate={{ width: `${overallProgress}%` }} className="h-full bg-primary" />
                    </div>
                 </div>
              </div>
           </div>
           <div className="bg-primary p-3 rounded-2xl border-2 border-primary/5 shadow-2xl shadow-primary/30 flex items-center gap-3 text-white">
              <div className="size-8 bg-white/10 rounded-lg flex items-center justify-center text-white border border-white/10">
                 <TimerIcon size={14} />
              </div>
              <div className="flex flex-col min-w-0">
                 <span className="text-[6px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">{activeTab === 'daily' ? 'Làm mới sau' : 'Kết thúc sau'}</span>
                 <span className="text-[10px] font-black italic font-mono tracking-tighter">{timeLeft}</span>
              </div>
           </div>
        </div>
      </header>

      {/* Quest List Container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 pb-32 no-scrollbar">
         {currentQuests.map((quest: Quest, i: number) => {
            const isCompleted = quest.completed;
            const progress = Math.min(quest.current / quest.goal, 1);

            return (
              <motion.div 
                key={quest.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`relative bg-white/80 backdrop-blur-sm rounded-2xl p-3 border-2 transition-all flex items-center gap-3 ${isCompleted ? 'border-green-400/50 bg-green-50/30' : 'border-white shadow-sm'}`}
              >
                 {/* Icon Status */}
                 <div className={`size-10 rounded-xl flex items-center justify-center text-xs font-black italic shrink-0 border border-primary/5 ${isCompleted ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-white text-primary/20 shadow-inner'}`}>
                    {isCompleted ? <CheckCircleIcon size={16} /> : <span>{i + 1}</span>}
                 </div>

                 {/* Quest Content */}
                 <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2 mb-1">
                       <div>
                          <h4 className="text-[11px] font-black text-primary italic uppercase tracking-tighter leading-none mb-1">{quest.title}</h4>
                          <p className="text-[8px] text-primary/40 font-bold leading-tight">{quest.description}</p>
                       </div>
                       <div className="flex flex-col gap-1 items-end shrink-0">
                          <div className="flex items-center gap-1 bg-amber-400/10 px-1.5 py-0.5 rounded-lg border border-amber-400/10">
                             <CoinsIcon size={10} className="text-amber-500" />
                             <span className="text-[10px] font-black text-amber-600">+{quest.reward}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-blue-400/10 px-1.5 py-0.5 rounded-lg border border-blue-400/10">
                             <GemIcon size={10} className="text-blue-500" />
                             <span className="text-[10px] font-black text-blue-600">+{quest.rewardGems}</span>
                          </div>
                       </div>
                    </div>

                    <div className="flex items-center gap-2">
                       <div className="flex-1 bg-primary/5 h-1.5 rounded-full overflow-hidden border border-primary/5">
                          <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: `${progress * 100}%` }} 
                            className={`h-full ${isCompleted ? 'bg-green-500' : 'bg-primary'}`} 
                          />
                       </div>
                       <span className={`text-[9px] font-black italic shrink-0 ${isCompleted ? 'text-green-600' : 'text-primary/40'}`}>
                          {quest.current}/{quest.goal}
                       </span>
                    </div>
                 </div>

                 {/* Claim Action */}
                 {isCompleted && (
                    <div className="shrink-0">
                       {quest.claimed ? (
                          <div className="size-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center border border-green-200">
                             <CheckCircleIcon size={14} />
                          </div>
                       ) : (
                          <motion.button 
                            whileTap={{ scale: 0.9 }}
                            onClick={() => q.handleClaim(quest.id)}
                            className="px-3 py-2 bg-green-500 text-white rounded-xl font-black text-[8px] uppercase tracking-wider shadow-lg shadow-green-500/20"
                          >
                             LẤY
                          </motion.button>
                       )}
                    </div>
                 )}
              </motion.div>
            );
         })}

         {/* Info Banner */}
         <div className="p-5 rounded-[24px] mt-4 mb-6 relative overflow-hidden bg-primary shadow-2xl shadow-primary/20">
            <SparklesIcon className="absolute -bottom-2 -right-2 text-white/5" size={60} />
            <div className="relative z-10">
               <h4 className="text-[9px] font-black uppercase tracking-widest text-white/90 mb-2 italic flex items-center gap-2">
                  <SparklesIcon size={10} className="text-amber-400" />
                  Mẹo Chiến Thuật
               </h4>
               <p className="text-[8px] text-white/70 font-bold leading-relaxed italic">
                  {activeTab === 'daily' 
                    ? "Hoàn thành tất cả nhiệm vụ ngày để nhận thêm rương báu từ thư viện."
                    : "Nhiệm vụ tuần có phần thưởng cực lớn, hãy tập trung vào việc tiến hóa thẻ bài."}
               </p>
            </div>
         </div>
      </div>

      <AnimatePresence>
         {q.rewardModal?.isOpen && (
            <RewardClaimModal 
               rewards={q.rewardModal.rewards}
               onComplete={() => q.setRewardModal(null)}
            />
         )}
      </AnimatePresence>
    </div>
  );
};

export default MobileQuests;
