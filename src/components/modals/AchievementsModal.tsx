/**
 * ORGANISM: Achievements Modal
 * Phase 27A — Hiển thị toàn bộ 20 huy chương theo 5 danh mục
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '../../store/playerStore';
import type { AchievementCategory } from '../../types/player.types';
import { CoinIcon } from '../shared/Icons';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_CONFIG: Record<AchievementCategory, { label: string; emoji: string }> = {
  combat:     { label: 'Chiến Đấu',    emoji: '⚔️' },
  collection: { label: 'Sưu Tập',      emoji: '📚' },
  social:     { label: 'Xã Hội',       emoji: '👥' },
  economy:    { label: 'Kinh Tế',      emoji: '🪙' },
  mastery:    { label: 'Thành Thạo',   emoji: '🔬' },
};

const RARITY_COLORS: Record<string, string> = {
  bronze:  '#cd7f32',
  silver:  '#a0a0b0',
  gold:    '#f59e0b',
  diamond: '#60a5fa',
};

const AchievementsModal: React.FC<AchievementsModalProps> = ({ isOpen, onClose }) => {
  const { achievements } = usePlayerStore();
  const [activeCategory, setActiveCategory] = useState<AchievementCategory | 'all'>('all');

  const categories = Object.keys(CATEGORY_CONFIG) as AchievementCategory[];
  const unlockedCount = achievements.filter(a => a.isUnlocked).length;

  const filtered = activeCategory === 'all'
    ? achievements
    : achievements.filter(a => a.category === activeCategory);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-10000 flex items-center justify-center p-4 md:p-6"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="bg-surface rounded-[48px] w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.2)] border-2 border-white relative"
            onClick={e => e.stopPropagation()}
          >
            {/* Header HUD */}
            <div className="px-8 pt-10 pb-6 border-b border-on-surface/5 flex items-center justify-between shrink-0 bg-primary/5">
              <div>
                <h2 className="text-2xl font-black text-on-surface italic uppercase tracking-tighter m-0 flex items-center gap-3">
                  <span className="text-amber-500">🏅</span> Bảng Huy Chương
                </h2>
                <p className="text-[10px] font-black text-on-surface/30 uppercase tracking-[0.4em] mt-1.5">
                   Merit Recognition Protocol — {unlockedCount}/{achievements.length} DEPLOYED
                </p>
              </div>
              <div className="flex items-center gap-5">
                <div className="hidden sm:flex flex-col items-end gap-1.5">
                   <span className="text-[8px] font-black text-on-surface/20 uppercase tracking-widest">Ritual Progress</span>
                   <div className="w-32 h-2 bg-black/5 rounded-full overflow-hidden border border-black/5">
                    <motion.div
                      className="h-full rounded-full shadow-[0_0_10px_rgba(var(--color-primary-rgb),0.5)]"
                      style={{ background: 'var(--color-primary)' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
                      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="size-11 rounded-2xl bg-black/5 flex items-center justify-center text-on-surface/30 hover:text-on-surface hover:bg-black/10 border border-black/10 transition-all active:scale-90"
                >
                  <span className="text-2xl leading-none">×</span>
                </button>
              </div>
            </div>

            {/* Sub-Header: Stats Summary */}
            <div className="px-8 py-4 bg-black/3 flex gap-4 overflow-x-auto no-scrollbar border-b border-on-surface/5">
               <div className="shrink-0 flex items-center gap-3 bg-white/40 px-4 py-2 rounded-xl border border-black/5">
                  <div className="size-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-[9px] font-black text-on-surface/60 uppercase tracking-widest">Active Data</span>
               </div>
               {categories.map(cat => (
                 <div key={cat} className="shrink-0 flex items-center gap-2 bg-white/40 px-4 py-2 rounded-xl border border-black/5">
                    <span className="text-xs">{CATEGORY_CONFIG[cat].emoji}</span>
                    <span className="text-[9px] font-black text-on-surface/40 uppercase tracking-widest">{CATEGORY_CONFIG[cat].label}</span>
                 </div>
               ))}
            </div>

            {/* Category tabs */}
            <div className="flex gap-2.5 px-8 pt-6 pb-4 shrink-0 overflow-x-auto no-scrollbar bg-surface">
              <button
                onClick={() => setActiveCategory('all')}
                className={`shrink-0 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                  activeCategory === 'all' ? 'bg-primary text-white border-primary shadow-lg' : 'bg-black/3 text-on-surface/30 border-black/5 hover:border-black/10'
                }`}
              >
                Tất Cả ({achievements.length})
              </button>
              {categories.map(cat => {
                const cfg = CATEGORY_CONFIG[cat];
                const count = achievements.filter(a => a.category === cat).length;
                const unlocked = achievements.filter(a => a.category === cat && a.isUnlocked).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`shrink-0 flex items-center gap-2.5 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                      activeCategory === cat ? 'bg-primary text-white border-primary shadow-lg' : 'bg-black/3 text-on-surface/30 border-black/5 hover:border-black/10'
                    }`}
                  >
                    <span>{cfg.emoji}</span>
                    {cfg.label}
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-lg border ${activeCategory === cat ? 'bg-white/20 border-white/20' : 'bg-black/10 border-black/5'}`}>
                      {unlocked}/{count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Achievement list */}
            <div className="flex-1 overflow-y-auto px-8 pb-10 space-y-4 no-scrollbar bg-surface">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {filtered.map((ach, i) => {
                    const rarityColor = RARITY_COLORS[ach.rarity];
                    const progress    = Math.min(ach.progress, ach.goal);
                    const pct         = ach.goal === 1 ? (ach.isUnlocked ? 100 : 0) : Math.round((progress / ach.goal) * 100);

                    return (
                      <motion.div
                        key={ach.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="rounded-[32px] p-5 flex gap-5 border-2 transition-all relative overflow-hidden group"
                        style={{
                          background: ach.isUnlocked ? 'rgba(var(--color-primary-rgb), 0.05)' : 'rgba(0,0,0,0.02)',
                          borderColor: ach.isUnlocked ? `${rarityColor}44` : 'rgba(0,0,0,0.03)',
                          opacity: ach.isUnlocked ? 1 : 0.6,
                        }}
                      >
                        {/* Status Light */}
                        <div className={`absolute top-4 right-4 size-1.5 rounded-full ${ach.isUnlocked ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-black/10'}`} />

                        {/* Icon Block */}
                        <div
                          className="size-16 rounded-[22px] flex items-center justify-center text-4xl shrink-0 border-2 shadow-inner"
                          style={{
                            background: ach.isUnlocked ? 'white' : 'rgba(0,0,0,0.03)',
                            borderColor: ach.isUnlocked ? `${rarityColor}66` : 'rgba(0,0,0,0.05)',
                            filter: ach.isUnlocked ? 'none' : 'grayscale(1) brightness(0.9)',
                          }}
                        >
                          <span className="drop-shadow-lg">{ach.emoji}</span>
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <p className="font-black text-[13px] text-on-surface uppercase italic leading-tight tracking-tight">{ach.title}</p>
                          <p className="text-[10px] font-bold text-on-surface/40 mt-1.5 leading-snug line-clamp-2 italic">{ach.description}</p>

                          {/* Progress HUD */}
                          {ach.goal > 1 && (
                            <div className="mt-3.5 bg-black/3 p-2 rounded-xl border border-black/5">
                              <div className="h-1.5 bg-black/5 rounded-full overflow-hidden border border-black/5">
                                <motion.div
                                  className="h-full rounded-full transition-all duration-1000"
                                  style={{ width: `${pct}%`, background: ach.isUnlocked ? rarityColor : 'var(--color-primary)' }}
                                />
                              </div>
                              <div className="flex justify-between items-center mt-1.5 px-0.5">
                                 <span className="text-[8px] font-black text-on-surface/20 uppercase tracking-widest">{pct}% SYNCED</span>
                                 <p className="text-[9px] text-on-surface/40 font-black">
                                   {(progress || 0).toLocaleString()} / {(ach.goal || 0).toLocaleString()}
                                 </p>
                              </div>
                            </div>
                          )}

                          {/* Footer Info */}
                          <div className="flex items-center justify-between mt-3">
                             <div className="flex items-center gap-1.5 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                                <CoinIcon size={11} className="text-amber-500" />
                                <span className="text-[10px] font-black text-amber-500">{(ach.reward || 0).toLocaleString()}</span>
                             </div>
                             {ach.isUnlocked && ach.unlockedAt && (
                               <span className="text-[8px] font-black text-on-surface/20 uppercase tracking-tighter">
                                 {new Date(ach.unlockedAt).toLocaleDateString('vi-VN')}
                               </span>
                             )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AchievementsModal;
