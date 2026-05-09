import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/uiStore';
import { CheckCircleIcon, XCircleIcon } from '../shared/Icons';

const NotificationToast: React.FC = () => {
  const { notifications, removeNotification } = useUIStore();


  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-2000 flex flex-col gap-3 w-full max-w-sm px-6 pointer-events-none">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`
              pointer-events-auto
              relative overflow-hidden
              bg-black/95 backdrop-blur-xl
              border-2 border-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.3)]
              rounded-2xl p-5
              flex items-center gap-4
            `}
            onClick={() => removeNotification(n.id)}
          >
            {/* Ambient Background Glow */}
            <div className={`absolute inset-0 opacity-10 bg-linear-to-r from-transparent via-amber-500/40 to-transparent animate-pulse`} />
            
            <div className="shrink-0">
               {n.type === 'error' ? <XCircleIcon className="text-red-500" size={24} /> : <CheckCircleIcon className="text-amber-500" size={24} />}
            </div>
            <div className="flex-1">
              <p className="text-white font-black text-sm uppercase italic tracking-wider leading-tight">
                {n.message}
              </p>
            </div>
            
            {/* Progress bar timer */}
            <motion.div 
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 4, ease: 'linear' }}
              className="absolute bottom-0 left-0 h-1 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]"
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationToast;
