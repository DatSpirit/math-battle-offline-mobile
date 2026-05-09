import React from 'react';
import { motion } from 'framer-motion';
import { usePlayerStore } from '../../store/playerStore';

interface AttackEffectProps {
  attacker: 'player' | 'ai';
  isCritical: boolean;
  score: number;
  onComplete?: () => void;
}

const AttackEffect: React.FC<AttackEffectProps> = ({ attacker, isCritical, score, onComplete }) => {
  const performanceMode = usePlayerStore(s => s.performanceMode);
  const isEco = performanceMode === 'ECO';
  const isUltra = performanceMode === 'ULTRA';
  // Screen Crack paths for SVG
  const crackPaths = [
    "M0,0 L100,100 M100,0 L0,100",
    "M50,0 L50,100 M0,50 L100,50",
    "M20,0 L80,100 M80,0 L20,100",
    "M0,30 L100,70 M0,70 L100,30"
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-100 overflow-hidden">
      {/* 1. Center Sequence: Points -> Blast -> Result */}
      <div className="absolute inset-0 flex items-center justify-center">
        
        {/* PHASE 1: Power Gathering + Score (0s - 1s) */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: [0, 2.5, 0], 
            opacity: [0, 1, 0],
          }}
          transition={{ duration: 1.2, times: [0, 0.7, 1], ease: "circIn" }}
          className="absolute flex flex-col items-center"
        >
          <span className={`text-9xl font-black italic drop-shadow-[0_0_${isUltra ? '60px' : '30px'}_rgba(255,255,255,0.8)] ${isCritical ? 'text-orange-500' : 'text-primary'}`}>
            +{score}
          </span>
          <span className="text-2xl font-bold text-white uppercase tracking-[1em] mt-2 opacity-60">
            TOTAL SCORE
          </span>
        </motion.div>

        {/* PHASE 2: Atomic Explosion (Starts at 1s) */}
        {!isEco && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 0, 20], 
              opacity: [0, 0, 1, 0] 
            }}
            transition={{ duration: 3, times: [0, 0.33, 0.35, 1], ease: "easeOut" }}
            className={`absolute w-[512px] h-[512px] rounded-full blur-md z-40 ${isCritical ? 'bg-orange-400' : 'bg-white'}`}
          />
        )}

        {/* Screen Flash */}
        {!isEco && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 1, 0] }}
            transition={{ duration: 3, times: [0, 0.33, 0.35, 1] }}
            className="absolute inset-0 bg-white z-50"
          />
        )}

        {/* PHASE 3: Final Result (Starts at 1.2s - stays for 2s) */}
        <motion.div
          initial={{ scale: 0, opacity: 0, y: 50 }}
          animate={{ 
            scale: [0, 0, 1.2, 1, 1, 0], 
            opacity: [0, 0, 1, 1, 1, 0],
            y: [50, 50, 0, 0, 0, -20]
          }}
          transition={{ 
            duration: 3.5, 
            times: [0, 0.35, 0.45, 0.5, 0.9, 1],
            ease: "easeOut" 
          }}
          onAnimationComplete={onComplete}
          className="absolute inset-0 flex flex-col items-center justify-center z-70"
        >
          {attacker === 'player' ? (
            <>
              <span className="text-9xl font-black italic text-green-500 drop-shadow-[0_10px_50px_rgba(34,197,94,0.8)] uppercase tracking-tighter">
                YOU WIN!
              </span>
              <span className="text-3xl font-bold text-white mt-4 tracking-[0.5em] opacity-80 uppercase">
                Dominance Established
              </span>
            </>
          ) : (
            <>
              <span className="text-9xl font-black italic text-red-600 drop-shadow-[0_10px_50px_rgba(220,38,38,0.8)] uppercase tracking-tighter">
                DEFEAT
              </span>
              <span className="text-3xl font-bold text-white mt-4 tracking-[0.5em] opacity-80 uppercase">
                AI Outsmarted You
              </span>
            </>
          )}
        </motion.div>
      </div>

      {/* Screen Crack Effect (Triggered by isCritical) */}
      {isCritical && !isEco && (
        <div className="absolute inset-0 z-60 flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {crackPaths.map((path, i) => (
              <motion.path
                key={i}
                d={path}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
                transition={{ delay: 1, duration: 2, times: [0, 0.1, 0.8, 1] }}
                stroke="white"
                strokeWidth="0.5"
                fill="none"
              />
            ))}
          </svg>
        </div>
      )}
    </div>
  );
};

export default AttackEffect;
