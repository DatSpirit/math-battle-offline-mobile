/**
 * ORGANISM: Achievement Toast
 * Phase 27A — Hiện popup góc phải dưới khi mở khóa huy chương mới
 */
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '../../store/playerStore';
import { ACHIEVEMENTS_DATA } from '../../data/achievementData';
import type { Achievement } from '../../types/player.types';
import { CoinIcon } from '../shared/Icons';

const RARITY_STYLE: Record<string, { border: string; glow: string; badge: string }> = {
  bronze:  { border: '#cd7f32', glow: 'rgba(205,127,50,0.3)',  badge: '🥉' },
  silver:  { border: '#a0a0b0', glow: 'rgba(160,160,176,0.3)', badge: '🥈' },
  gold:    { border: '#f59e0b', glow: 'rgba(245,158,11,0.3)',  badge: '🥇' },
  diamond: { border: '#60a5fa', glow: 'rgba(96,165,250,0.35)', badge: '💎' },
};

interface ToastData {
  id: string;
  title: string;
  description: string;
  emoji: string;
  rarity: string;
  reward: number;
}

const AchievementToast: React.FC = () => {
  const { pendingUnlocks, clearPendingUnlocks } = usePlayerStore();
  const [queue, setQueue] = useState<ToastData[]>([]);
  const [current, setCurrent] = useState<ToastData | null>(null);

  // Convert pending unlock IDs → toast data
  useEffect(() => {
    if (pendingUnlocks.length === 0) return;
    const toasts = pendingUnlocks
      .map(id => ACHIEVEMENTS_DATA.find((a: Achievement) => a.id === id))
      .filter(Boolean)
      .map(a => ({
        id: a!.id,
        title: a!.title,
        description: a!.description,
        emoji: a!.emoji,
        rarity: a!.rarity,
        reward: a!.reward,
      }));
    // Defer to avoid cascading render warning
    setTimeout(() => {
      setQueue(prev => [...prev, ...toasts]);
      clearPendingUnlocks();
    }, 0);
  }, [pendingUnlocks, clearPendingUnlocks]);

  // Dequeue one at a time
  useEffect(() => {
    if (current || queue.length === 0) return;
    const [next, ...rest] = queue;
    setTimeout(() => {
      setCurrent(next);
      setQueue(rest);
    }, 0);
    const timer = setTimeout(() => setCurrent(null), 4500);
    return () => clearTimeout(timer);
  }, [current, queue]);

  if (!current) return null;

  const style = RARITY_STYLE[current.rarity] ?? RARITY_STYLE.bronze;

  return (
    <AnimatePresence>
      <motion.div
        key={current.id}
        initial={{ opacity: 0, x: 80, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 80, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-4 px-5 py-4 rounded-2xl"
        style={{
          background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(16px)',
          border: `2px solid ${style.border}`,
          boxShadow: `0 8px 32px ${style.glow}, 0 2px 8px rgba(0,0,0,0.08)`,
          maxWidth: 320,
        }}
      >
        {/* Glow pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          animate={{ opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ border: `2px solid ${style.border}` }}
        />

        {/* Emoji badge */}
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0"
          style={{ background: `${style.glow.replace('0.3', '0.12')}`, border: `1.5px solid ${style.border}` }}
        >
          {current.emoji}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.25em] mb-0.5"
            style={{ color: style.border }}>
            {style.badge} Huy Chương Mới!
          </p>
          <p className="font-black text-sm text-primary italic leading-tight truncate">{current.title}</p>
          <p className="text-[11px] text-primary/40 font-medium mt-0.5 leading-tight line-clamp-2">{current.description}</p>
          <p className="text-[10px] font-black mt-1.5 flex items-center gap-1" style={{ color: '#d97706' }}>
            <CoinIcon size={12} className="text-amber-600" />
            +{(current.reward || 0).toLocaleString()} Vàng
          </p>
        </div>

        {/* Close */}
        <button
          onClick={() => setCurrent(null)}
          className="shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-primary/30 hover:text-primary hover:bg-gray-200 transition-all text-xs self-start"
        >
          ×
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default AchievementToast;
