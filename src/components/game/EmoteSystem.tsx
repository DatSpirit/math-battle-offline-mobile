import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';

const EMOTES = [
  { id: 'hello', emoji: '👋', label: 'Chào' },
  { id: 'laugh', emoji: '😂', label: 'Haha' },
  { id: 'victory', emoji: '🏆', label: 'Thắng' },
  { id: 'thinking', emoji: '🤔', label: 'Tính...' },
  { id: 'angry', emoji: '💢', label: 'Tức' },
];

export const EmotePicker: React.FC<{ className?: string; onSelect?: () => void }> = ({ className, onSelect }) => {
  const sendEmote = useGameStore(s => s.sendEmote);
  const isProcessing = useGameStore(s => s.isProcessing);

  if (isProcessing) return null;

  return (
    <div className={`flex gap-1 p-1 bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl ${className}`}>
      {EMOTES.map(emote => (
        <motion.button
          key={emote.id}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            sendEmote(1, emote.id);
            if (onSelect) onSelect();
          }}
          className="w-8 h-8 flex items-center justify-center text-lg bg-white/5 rounded-lg hover:bg-white/20 transition-colors"
          title={emote.label}
        >
          {emote.emoji}
        </motion.button>
      ))}
    </div>
  );
};

export const EmoteDisplay: React.FC<{ isOpponent?: boolean }> = ({ isOpponent = false }) => {
  const activeEmote = useGameStore(s => s.activeEmote);
  const playerNum = isOpponent ? 2 : 1;

  const currentEmote = EMOTES.find(e => e.id === activeEmote?.id);
  const show = activeEmote?.player === playerNum;

  return (
    <div className="relative h-20 w-20 flex items-center justify-center">
      <AnimatePresence>
        {show && currentEmote && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: -20 }}
            className={`absolute z-50 p-4 bg-white rounded-2xl shadow-xl flex items-center justify-center text-4xl
              ${isOpponent ? 'rounded-tr-none' : 'rounded-bl-none'}
            `}
          >
            {/* Speech bubble tail */}
            <div className={`absolute w-4 h-4 bg-white rotate-45 
              ${isOpponent ? '-top-2 right-4' : '-bottom-2 left-4'}
            `} />
            {currentEmote.emoji}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
