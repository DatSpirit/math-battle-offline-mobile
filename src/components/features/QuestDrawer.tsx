import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import QuestPanel from './QuestPanel';
import { useSound } from '../../hooks/useSound';

interface QuestDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuestDrawer: React.FC<QuestDrawerProps> = ({ isOpen, onClose }) => {
  const { playSound } = useSound();

  useEffect(() => {
    if (isOpen) {
      playSound('drawer_open');
    }
  }, [isOpen, playSound]);

  const handleClose = () => {
    playSound('drawer_close');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - starts after sidebar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            style={{
              position: 'fixed',
              top: 0,
              left: '288px',
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(4px)',
              zIndex: 60,
            }}
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '420px',
              maxWidth: 'calc(100vw - 288px)',
              background: '#ffffff',
              zIndex: 70,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
            }}
          >
            {/* Drawer Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b-2 border-surface-variant flex-none">
              <h2 className="text-2xl font-black font-headline text-primary tracking-tighter uppercase">
                Quest Log
              </h2>
              <button
                onClick={handleClose}
                className="w-10 h-10 rounded-xl bg-surface-variant flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-5">
              <QuestPanel />
            </div>

            {/* Drawer Footer */}
            <div className="flex-none px-5 pb-5">
              <div className="p-4 bg-surface-variant/30 rounded-2xl border border-surface-variant text-center">
                <p className="text-[10px] font-bold text-on-surface/50 uppercase tracking-widest leading-relaxed">
                  Complete quests to earn Coins and upgrade your math powers!
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QuestDrawer;
