/**
 * MOLECULE: Start Screen
 * SKILL_UI: Micro-interactions + Accessibility
 * Fully Vietnamese UI, proper entry animations.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Calculator, Play, Zap } from 'lucide-react';
import './StartScreen.css';

interface StartScreenProps {
  onStart: () => void;
}

const TURN_LABELS = [
  { turn: 1, desc: '1 Số',    pts: '+1' },
  { turn: 2, desc: '2 Nối',   pts: '+2' },
  { turn: 3, desc: '2 + Phép', pts: '+3' },
  { turn: 4, desc: '4 Thẻ',   pts: '+4' },
  { turn: 5, desc: '5 Thẻ',   pts: '+5' },
  { turn: 6, desc: 'Tổng Lực', pts: '+6' },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};

const itemVariants = {
  hidden:  { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' as const },
  },
};

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => (
  <div className="start-screen">
    <div className="start-glow-1" aria-hidden />
    <div className="start-glow-2" aria-hidden />

    <motion.div
      className="start-card glass"
      initial={{ opacity: 0, scale: 0.92, y: 28 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}
      >
        {/* Logo */}
        <motion.div variants={itemVariants} className="start-logo">
          <Calculator className="start-logo-icon" aria-hidden />
          <h1>
            MATH<span className="start-accent">BATTLE</span>
          </h1>
        </motion.div>

        {/* Tagline */}
        <motion.p variants={itemVariants} className="start-tagline">
          Xây dựng biểu thức · Đánh bại AI · Chinh phục 6 lượt đấu.
        </motion.p>

        {/* Stats */}
        <motion.div variants={itemVariants} className="start-stats">
          <div className="stat-pill">
            <span className="stat-num">21</span>
            <span className="stat-label">Thẻ</span>
          </div>
          <div className="stat-pill">
            <span className="stat-num">6</span>
            <span className="stat-label">Lượt</span>
          </div>
          <div className="stat-pill">
            <span className="stat-num">21</span>
            <span className="stat-label">Điểm tối đa</span>
          </div>
        </motion.div>

        {/* Turn progression */}
        <motion.div variants={itemVariants} className="turn-progression">
          {TURN_LABELS.map(({ turn, desc, pts }) => (
            <div key={turn} className="turn-cell">
              <span className="turn-cell-num">T{turn}</span>
              <span className="turn-cell-desc">{desc}</span>
              <span className="turn-cell-pts">{pts}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.button
          variants={itemVariants}
          className="start-btn"
          onClick={onStart}
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.96 }}
          aria-label="Bắt đầu trận đấu"
        >
          <Play size={20} aria-hidden />
          BẮT ĐẦU
        </motion.button>

        <motion.p variants={itemVariants} className="start-vs">
          Bạn vs <Zap size={14} className="zap-icon" aria-hidden /> AI
        </motion.p>
      </motion.div>
    </motion.div>
  </div>
);

export default StartScreen;
