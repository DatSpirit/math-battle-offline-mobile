import React from 'react';
import { motion } from 'framer-motion';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Đang tải dữ liệu...' }) => {
  return (
    <div className="fixed inset-0 z-999 flex flex-col items-center justify-center bg-[#fffcf7] p-8">
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="w-24 h-24 bg-primary/10 rounded-[32px] flex items-center justify-center text-primary mb-8 shadow-inner"
      >
        <span className="text-4xl">🔮</span>
      </motion.div>
      
      <h2 className="text-xl font-black text-primary italic uppercase tracking-tighter mb-2">{message}</h2>
      <div className="w-48 h-1 bg-primary/5 rounded-full overflow-hidden">
        <motion.div
          animate={{ x: [-200, 200] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-full h-full bg-primary/20"
        />
      </div>
    </div>
  );
};

export default LoadingScreen;
