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

const RARITY_BG: Record<string, string> = {
  bronze:  'rgba(205,127,50,0.08)',
  silver:  'rgba(160,160,176,0.08)',
  gold:    'rgba(245,158,11,0.08)',
  diamond: 'rgba(96,165,250,0.08)',
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
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: 'rgba(28,28,15,0.6)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.94, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="bg-white rounded-3xl w-full max-w-3xl max-h-[86vh] flex flex-col overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-2xl font-black text-primary italic uppercase tracking-tighter m-0">
                  🏅 Bảng Huy Chương
                </h2>
                <p className="text-[10px] font-black text-primary/30 uppercase tracking-widest mt-1">
                  {unlockedCount} / {achievements.length} đã mở khóa
                </p>
              </div>
              {/* Progress bar */}
              <div className="flex items-center gap-4">
                <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'var(--color-primary)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-primary/30 hover:text-primary hover:bg-gray-100 transition-all font-bold text-lg"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Category filters */}
            <div className="flex gap-1.5 px-6 pt-4 pb-3 shrink-0 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveCategory('all')}
                className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeCategory === 'all' ? 'bg-primary text-white shadow-sm' : 'bg-gray-50 text-primary/40 hover:text-primary'
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
                    className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      activeCategory === cat ? 'bg-primary text-white shadow-sm' : 'bg-gray-50 text-primary/40 hover:text-primary'
                    }`}
                  >
                    {cfg.emoji} {cfg.label}
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${activeCategory === cat ? 'bg-white/20' : 'bg-primary/10'}`}>
                      {unlocked}/{count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Achievement grid */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 no-scrollbar">
              <div className="grid grid-cols-2 gap-3">
                <AnimatePresence mode="popLayout">
                  {filtered.map((ach, i) => {
                    const rarityColor = RARITY_COLORS[ach.rarity];
                    const rarityBg    = RARITY_BG[ach.rarity];
                    const progress    = Math.min(ach.progress, ach.goal);
                    const pct         = ach.goal === 1 ? (ach.isUnlocked ? 100 : 0) : Math.round((progress / ach.goal) * 100);

                    return (
                      <motion.div
                        key={ach.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.04 }}
                        className="rounded-2xl p-4 flex gap-4 border transition-all"
                        style={{
                          background: ach.isUnlocked ? rarityBg : 'rgba(0,0,0,0.02)',
                          borderColor: ach.isUnlocked ? rarityColor : 'transparent',
                          opacity: ach.isUnlocked ? 1 : 0.6,
                        }}
                      >
                        {/* Emoji */}
                        <div
                          className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0"
                          style={{
                            background: ach.isUnlocked ? rarityBg : '#f5f5f5',
                            filter: ach.isUnlocked ? 'none' : 'grayscale(1)',
                          }}
                        >
                          {ach.emoji}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <p className="font-black text-sm text-primary italic leading-tight">{ach.title}</p>
                            {ach.isUnlocked && (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0"
                                style={{ background: rarityBg, color: rarityColor }}>
                                ✓
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-primary/40 mt-0.5 leading-tight line-clamp-2">{ach.description}</p>

                          {/* Progress bar */}
                          {ach.goal > 1 && (
                            <div className="mt-2">
                              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-700"
                                  style={{ width: `${pct}%`, background: ach.isUnlocked ? rarityColor : 'var(--color-primary)' }}
                                />
                              </div>
                              <p className="text-[9px] text-primary/30 font-bold mt-0.5">
                                {(progress || 0).toLocaleString()} / {(ach.goal || 0).toLocaleString()}
                              </p>
                            </div>
                          )}

                          {/* Reward */}
                          <p className="text-[10px] font-black mt-1.5 flex items-center gap-1" style={{ color: '#d97706', opacity: ach.isUnlocked ? 1 : 0.5 }}>
                            <CoinIcon size={12} className="text-amber-600" />
                            {(ach.reward || 0).toLocaleString()} Vàng
                          </p>

                          {/* Unlocked date */}
                          {ach.isUnlocked && ach.unlockedAt && (
                            <p className="text-[9px] text-primary/20 mt-0.5">
                              {new Date(ach.unlockedAt).toLocaleDateString('vi-VN')}
                            </p>
                          )}
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
