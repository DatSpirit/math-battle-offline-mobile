import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '../../store/playerStore';

const RewardToast: React.FC = () => {
  const { pendingUnlocks, clearPendingUnlocks } = usePlayerStore();

  useEffect(() => {
    if (pendingUnlocks.length > 0) {
      const timer = setTimeout(() => {
        clearPendingUnlocks();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [pendingUnlocks, clearPendingUnlocks]);

  return (
    <div className="fixed bottom-24 right-8 z-999 flex flex-col gap-3">
      <AnimatePresence>
        {pendingUnlocks.map((msg, index) => (
          <motion.div
            key={`${msg}-${index}`}
            initial={{ opacity: 0, x: 50, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className="bg-indigo-600 text-white px-6 py-4 rounded-2xl shadow-2xl border-2 border-white/20 flex items-center gap-4"
          >
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
              🎁
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Phần Thưởng Bộ Sưu Tập</p>
              <p className="font-black text-sm">{msg}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default RewardToast;
