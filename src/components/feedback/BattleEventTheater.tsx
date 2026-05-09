import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Shield, XCircle, TrendingUp, Hash } from 'lucide-react';
import type { BattleEvent } from '../../engine/types';
import { usePlayerStore } from '../../store/playerStore';

interface BattleEventTheaterProps {
  event: BattleEvent | null;
  isVisible: boolean;
  eventIndex: number;
  lastResult?: { 
    playerCards: { id: string }[]; 
    aiCards: { id: string }[] 
  } | null;
  isFixed?: boolean;
}

const BattleEventTheater: React.FC<BattleEventTheaterProps> = ({ event, isVisible, eventIndex, lastResult, isFixed = false }) => {
  const performanceMode = usePlayerStore(s => s.performanceMode);
  
  if (!isVisible || !event) return null;

  const isEco = performanceMode === 'ECO';
  const isUltra = performanceMode === 'ULTRA';

  // Determine styles based on event source/target side
  let displaySide = event.displaySide || event.targetPlayer;
  
  // RE-CALCULATE logic to ensure stability if missing from event object
  if (!event.displaySide && event.sourceCardId && lastResult) {
     const isP1Card = lastResult.playerCards?.some((c) => c.id === event.sourceCardId);
     displaySide = isP1Card ? 'player1' : 'player2';
  }

  const isP1 = displaySide === 'player1';
  const isP2 = displaySide === 'player2';

  let theme = {
    bg: 'from-slate-900 to-slate-950',
    border: 'border-slate-500/40',
    accent: 'text-slate-300',
    icon: <Hash size={24} />,
    glow: 'shadow-slate-500/30'
  };

  if (event.type === 'NEUTRALIZED' || event.type === 'TEXT_POPUP') {
    theme = {
      bg: 'from-gray-800 to-slate-950',
      border: 'border-gray-400/50',
      accent: 'text-gray-200',
      icon: <XCircle size={24} className="text-gray-300" />,
      glow: 'shadow-gray-500/40'
    };
  } else if (isP1) {
    theme = {
      bg: 'from-emerald-950 to-slate-950',
      border: 'border-emerald-500/60',
      accent: 'text-emerald-300',
      icon: <Zap size={24} className="text-amber-400" />,
      glow: 'shadow-emerald-500/50'
    };
  } else if (isP2) {
    theme = {
      bg: 'from-rose-950 to-slate-950',
      border: 'border-rose-500/60',
      accent: 'text-rose-300',
      icon: <Zap size={24} className="text-purple-400" />,
      glow: 'shadow-rose-500/50'
    };
  } else if (event.type === 'MULTIPLIER_HIT') {
    theme = {
      bg: 'from-indigo-900/90 to-slate-950/95',
      border: 'border-indigo-500/50',
      accent: 'text-indigo-400',
      icon: <TrendingUp size={24} />,
      glow: 'shadow-indigo-500/40'
    };
  } else if (event.type === 'SKILL_ACTIVATED' && event.skillName === 'TRỰC GIAO') {
    theme = {
        bg: 'from-blue-900/90 to-slate-950/95',
        border: 'border-blue-400/50',
        accent: 'text-blue-300',
        icon: <Shield size={24} />,
        glow: 'shadow-blue-500/40'
      };
  }

  return (
    <AnimatePresence mode="popLayout">
      {isVisible && event && (
        <div className={`${isFixed ? 'fixed' : 'absolute'} inset-0 z-50 flex justify-center pointer-events-none ${
          isP2 ? 'items-start pt-[10%]' : isP1 ? 'items-end pb-[15%]' : 'items-center'
        }`}>
            <motion.div
            key={eventIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`absolute w-[320px] sm:w-[380px] md:w-[400px] min-h-[140px] h-auto flex flex-col justify-center rounded-[24px] border-2 ${theme.border} bg-linear-to-br ${theme.bg} p-6 md:p-7 shadow-2xl ${isEco ? 'bg-slate-950' : 'backdrop-blur-xl'} ${isUltra ? `shadow-[0_0_40px_rgba(255,255,255,0.1)]` : ''} ${theme.glow}`}
          >
            {/* Animated Background Elements */}
            {!isEco && (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute -right-20 -top-20 size-64 rounded-full bg-white/5 blur-3xl"
              />
            )}
            {!isEco && <div className="absolute -left-10 -bottom-10 size-40 rounded-full bg-white/5 blur-2xl" />}
  
            {/* Header Area */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="mb-2 flex items-center gap-2">
                <div className={`p-1.5 rounded-lg bg-white/10 ${theme.accent}`}>
                  {React.cloneElement(theme.icon as React.ReactElement<{ size?: number }>, { size: 16 })}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${theme.accent} opacity-80`}>
                  {event.type.replace('_', ' ')}
                </span>
              </div>
  
              {/* Skill Name - Added pr-2 to avoid italic clipping */}
              <h2 className="m-0 text-xl md:text-4xl font-black italic tracking-tighter text-white uppercase drop-shadow-lg pr-2">
                {event.skillName || 'HIỆU ỨNG'}
              </h2>
  
              {/* Description Container with Background for visibility */}
              <div className="mt-3 w-full px-4 py-2 rounded-xl bg-black/30 border border-white/5 shadow-inner min-h-[50px] flex items-center justify-center overflow-visible">
                <p className="m-0 text-[9px] md:text-sm font-bold text-white italic tracking-normal leading-snug line-clamp-2 pr-4 overflow-visible">
                  {event.description}
                </p>
              </div>
  
              {/* Value Display (if any) */}
              {event.valueTo !== undefined && (
                <div className="mt-4 flex items-center gap-4 rounded-3xl bg-white/5 px-6 py-1.5 shadow-inner">
                  <div className="flex flex-col items-center">
                    <span className="text-[7px] font-black uppercase tracking-widest text-white/30">KẾT QUẢ</span>
                    <span className="text-xl font-black text-white">
                      {event.valueTo > (event.valueFrom || 0) ? '+' : ''}
                      {event.valueTo.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
  
            {/* Scanning Line Effect */}
            {!isEco && (
              <motion.div
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-px bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.3)] z-0"
              />
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BattleEventTheater;
