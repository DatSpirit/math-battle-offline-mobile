import React from 'react';
import { motion } from 'framer-motion';


import { usePlayerStore } from '../../store/playerStore';

interface FloatingPointsProps {
  points: number;
  x: number;
  y: number;
  onComplete: () => void;
}

const FloatingPoints: React.FC<FloatingPointsProps> = ({ points, x, y, onComplete }) => {
  const performanceMode = usePlayerStore(s => s.performanceMode);
  const isEco = performanceMode === 'ECO';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y }}
      animate={{ opacity: 1, scale: isEco ? 1 : 1.2, y: y - (isEco ? 50 : 100) }}
      exit={{ opacity: 0, scale: 0.8, y: y - (isEco ? 70 : 150) }}
      transition={{ duration: isEco ? 0.4 : 0.8, ease: "easeOut" }}
      onAnimationComplete={onComplete}
      style={{
        position: 'fixed',
        left: x,
        top: y,
        pointerEvents: 'none',
        zIndex: 2000,
        color: points >= 0 ? '#4ade80' : '#f87171',
        fontWeight: '900',
        fontSize: isEco ? '1.5rem' : '2rem',
        textShadow: isEco ? 'none' : '0 0 10px rgba(0,0,0,0.3), 0 0 20px rgba(74, 222, 128, 0.2)',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}
    >
      {points >= 0 ? `+${points}` : points}
    </motion.div>
  );
};

export default FloatingPoints;
