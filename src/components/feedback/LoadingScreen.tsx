import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './LoadingScreen.css';

interface LoadingScreenProps {
  isLoading: boolean;
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isLoading, message = "ĐANG TẢI..." }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-9999 bg-[#0f172a] flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Main Content */}
          <div className="flex flex-col items-center">
            {/* Minimalist Math Spinner */}
            <div className="relative w-20 h-20 mb-8 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-2 border-primary/20 border-t-primary rounded-full"
              />
              <span className="text-2xl font-black text-primary italic">∑</span>
            </div>

            {/* Simple Progress Indicator */}
            <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden relative mb-4">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-primary/40"
              />
            </div>

            <p className="text-[10px] font-bold text-primary/40 uppercase tracking-[0.3em]">
              {message}{dots}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
