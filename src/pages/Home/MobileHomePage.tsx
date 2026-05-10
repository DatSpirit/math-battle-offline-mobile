import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Map, Users, Zap, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HomePageMobileProps {
  onStartAIBattle: (difficulty: 'easy' | 'medium' | 'hard') => void;
  onStartPassPlay: () => void;
  onStartLogicMode: () => void;
  onStartTutorial: () => void;
  onOpenRules: () => void;
  hasCompletedTutorial: boolean;
}

const HomePageMobile: React.FC<HomePageMobileProps> = ({
  onStartAIBattle,
  onStartPassPlay,
  onStartLogicMode,
  onStartTutorial,
  onOpenRules,
  hasCompletedTutorial
}) => {
  const navigate = useNavigate();
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<'easy' | 'medium' | 'hard'>('easy');

  return (
    <div className="home-premium-container flex-1 flex flex-col pb-safe overflow-y-auto custom-scrollbar items-center">
      <main className="flex flex-col px-4 home-mobile-main pt-4 w-full max-w-2xl min-h-0">
        {/* Header Section */}
        <section className="text-center space-y-2 home-header py-8 sm:py-12 shrink-0">
          {!hasCompletedTutorial && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onStartTutorial}
              className="bg-primary/10 text-primary border border-primary/30 px-6 py-2 rounded-full text-[12px] sm:text-sm font-black uppercase tracking-widest mx-auto mb-6"
            >
              ✨ CHƠI HƯỚNG DẪN
            </motion.button>
          )}
          <h1 className="text-3xl sm:text-6xl font-black font-headline tracking-tight text-primary uppercase italic">CHỌN CHẾ ĐỘ CHƠI</h1>
          <p className="text-on-surface-variant font-medium text-sm sm:text-xl opacity-60">Bắt đầu hành trình chinh phục toán học</p>
        </section>

        {/* Stacked Layout */}
        <div className="flex flex-col home-mode-stack gap-4 sm:gap-8 py-6 mb-12">
          
          {/* Main Mode: Đấu với AI */}
          <motion.div 
            className="glass-panel rounded-4xl p-5 shadow-xl relative overflow-hidden flex flex-col items-center text-center border-4 border-black home-main-card"
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            id="home-mode-ai"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Bot size={80} />
            </div>
            
            <div className="p-3 bg-secondary/10 text-secondary rounded-2xl mb-3">
              <Bot size={28} />
            </div>
            
            <h2 className="text-2xl font-black font-headline text-on-surface mb-2">Đấu với AI</h2>
            <p className="text-xs text-on-surface-variant mb-6 px-4 font-medium">Rèn luyện tư duy cùng đối thủ máy thông minh</p>
            
            {/* Difficulty Selector */}
            <div className="flex justify-center gap-2 mb-6 w-full difficulty-selector">
              {(['easy', 'medium', 'hard'] as const).map((diff) => (
                <button 
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`flex-1 py-3.5 px-2 rounded-2xl border-2 font-bold text-xs transition-all active:scale-95 ${
                    selectedDifficulty === diff 
                      ? 'border-secondary bg-secondary text-white shadow-lg shadow-secondary/20' 
                      : 'border-surface-container text-on-surface-variant'
                  }`}
                >
                  {diff === 'easy' ? 'Dễ' : diff === 'medium' ? 'Vừa' : 'Khó'}
                </button>
              ))}
            </div>

            <motion.button 
              id="home-start-ai-btn"
              onClick={() => onStartAIBattle(selectedDifficulty)}
              className="w-full py-4 bg-linear-to-br from-primary to-primary-fixed-dim rounded-full text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-transform uppercase tracking-wider"
            >
              <Zap size={20} fill="currentColor" />
              BẮT ĐẦU NGAY
            </motion.button>
          </motion.div>

          {/* Campaign Mode */}
          <motion.div 
            id="home-mode-campaign"
            className="glass-panel rounded-4xl p-4 shadow-lg flex gap-4 items-center border-4 border-black compact-mode-card"
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/campaign')}
          >
            <div className="bg-tertiary/10 p-3 rounded-xl flex items-center justify-center shrink-0">
              <Map size={24} className="text-tertiary" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-lg font-black font-headline text-on-surface">Vượt ải</h3>
                <p className="text-xs text-on-surface-variant font-medium">Khám phá thế giới toán học theo cốt truyện...</p>
              </div>
              <button className="w-full py-3 bg-tertiary text-white rounded-full text-xs font-black active:scale-95 transition-transform uppercase tracking-widest">
                TIẾP TỤC
              </button>
            </div>
          </motion.div>

          {/* Pass & Play */}
          <motion.div 
            id="home-mode-pass-play"
            className="glass-panel rounded-4xl p-4 shadow-lg flex gap-4 items-center border-4 border-black compact-mode-card"
            whileTap={{ scale: 0.98 }}
            onClick={onStartPassPlay}
          >
            <div className="bg-primary/10 p-3 rounded-xl flex items-center justify-center shrink-0">
              <Users size={24} className="text-primary" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-lg font-black font-headline text-on-surface">Pass & Play</h3>
                <p className="text-xs text-on-surface-variant font-medium">Đối đầu trực tiếp trên cùng thiết bị...</p>
              </div>
              <button className="w-full py-3 bg-primary text-white rounded-full text-xs font-black active:scale-95 transition-transform uppercase tracking-widest">
                CHƠI CÙNG BẠN
              </button>
            </div>
          </motion.div>

          {/* Logic Mode */}
          <motion.div 
            id="home-mode-logic"
            className="relative glass-panel rounded-4xl p-4 shadow-lg overflow-hidden border-4 border-black compact-mode-card"
            whileTap={{ scale: 0.98 }}
            onClick={onStartLogicMode}
          >
            <div className="absolute top-0 right-0 px-4 py-1.5 bg-indigo-600 text-white text-[8px] font-black italic rounded-bl-xl uppercase tracking-widest">
              PURE MATH
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Zap size={28} className="text-indigo-600" />
                <h3 className="text-lg font-black font-headline text-on-surface">Chế độ Logic</h3>
              </div>
              <p className="text-xs text-on-surface-variant font-medium">So tài tính toán thuần túy. Không kỹ năng, không bonus, chỉ có tư duy.</p>
              <button className="w-full py-4 bg-surface-container border-2 border-indigo-600 text-indigo-600 rounded-full text-sm font-black flex items-center justify-center gap-2 active:scale-95 transition-all">
                <Bot size={16} fill="currentColor" />
                THỬ SỨC NGAY
              </button>
            </div>
          </motion.div>

        </div>
      </main>

      {/* Rules Button */}
      <motion.button
        className="fixed bottom-[calc(7rem+var(--sab)+var(--bottom-compensation))] right-6 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-all z-40 border-2 border-white"
        whileTap={{ scale: 0.9 }}
        onClick={onOpenRules}
      >
        <Info size={24} />
      </motion.button>
    </div>
  );
};

export default HomePageMobile;
