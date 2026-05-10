import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/uiStore';
import './LoadingScreen.css';

interface LoadingScreenProps {
  isLoading: boolean;
  message?: string;
}

const GAME_TIPS = [
  "Mẹo: Thẻ 'Sát Thủ' gây sát thương lớn nhưng máu rất thấp.",
  "Mẹo: Kết hợp thẻ Số và Phép để tạo ra các combo hủy diệt.",
  "Mẹo: Thăng hoa thẻ bài sẽ giúp mở khóa các kỹ năng ẩn.",
  "Mẹo: Đừng quên kiểm tra Nhiệm vụ hàng ngày để nhận Kim cương.",
  "Mẹo: Cộng hưởng (Resonance) giúp tăng chỉ số cho toàn bộ bộ bài.",
  "Mẹo: Phép nhân luôn mạnh hơn phép cộng trong giai đoạn cuối game."
];

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isLoading, message = "ĐANG KHỞI TẠO HỆ THỐNG" }) => {
  const { loadingProgress } = useUIStore();
  const [currentTip] = useState(() => Math.floor(Math.random() * GAME_TIPS.length));

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, delay: 0.2 } }}
          className="fixed inset-0 z-9999 bg-[#0c0c0b] flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Background Ambient Effect */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,80,0,0.1)_0%,transparent_70%)]" />
          
          <div className="relative z-10 flex flex-col items-center w-full max-w-[280px]">
            {/* Logo/Icon Area */}
            <div className="relative w-24 h-24 mb-10 flex items-center justify-center">
               {/* Orbital Rings */}
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                 className="absolute inset-0 border-b-2 border-primary/40 rounded-full"
               />
               <motion.div 
                 animate={{ rotate: -360 }}
                 transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                 className="absolute inset-2 border-t-2 border-primary/20 rounded-full"
               />
               {/* Central Core */}
               <motion.div 
                 animate={{ scale: [1, 1.1, 1] }}
                 transition={{ duration: 2, repeat: Infinity }}
                 className="text-4xl font-black text-primary drop-shadow-[0_0_15px_rgba(139,80,0,0.5)] italic"
               >
                 ∑
               </motion.div>
            </div>

            {/* Progress Area */}
            <div className="w-full space-y-4">
               <div className="flex justify-between items-end px-1">
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{message}</span>
                  <span className="text-[12px] font-mono font-bold text-primary italic">{Math.round(loadingProgress)}%</span>
               </div>
               
               {/* Modern Progress Bar */}
               <div className="h-2 bg-white/5 rounded-full border border-white/10 p-0.5 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${loadingProgress}%` }}
                    transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                    className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(139,80,0,0.5)]"
                  />
               </div>
            </div>

            {/* Tip Area */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-12 text-center"
            >
               <p className="text-[11px] font-medium text-white/50 italic leading-relaxed px-4">
                 {GAME_TIPS[currentTip]}
               </p>
            </motion.div>

            {/* Bottom Deco */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 opacity-20">
               <div className="h-px w-12 bg-linear-to-r from-transparent to-primary" />
               <span className="text-[8px] font-black tracking-[0.5em] text-primary">OFFLINE SYSTEM</span>
               <div className="h-px w-12 bg-linear-to-l from-transparent to-primary" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
