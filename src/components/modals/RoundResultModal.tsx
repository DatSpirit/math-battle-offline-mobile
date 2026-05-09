import React, { useEffect, useState } from 'react';
import { motion, animate } from 'framer-motion';
import type { TurnResult } from '../../types/game';
import { useGameStore } from '../../store/gameStore';
import './RoundResultModal.css';

const RollingNumber: React.FC<{ value: number }> = ({ value }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(Math.floor(latest))
    });
    return () => controls.stop();
  }, [value]);

  return <>{display.toLocaleString()}</>;
};

interface RoundResultProps {
  result: TurnResult;
  onNext: () => void;
}

const RoundResult: React.FC<RoundResultProps> = ({ result, onNext }) => {
  const { turn, winner, playerCards, aiCards } = result;

  const gameMode = useGameStore(s => s.gameMode);
  const isPassPlay = gameMode === 'pass_play';
  const oppName = isPassPlay ? 'NGƯỜI CHƠI 2' : 'MÁY (AI)';
  const playerName = isPassPlay ? 'NGƯỜI CHƠI 1' : 'BẠN';

  const winnerLabel: Record<'player' | 'ai' | 'tie', string> = {
    player: isPassPlay ? 'NGƯỜI CHƠI 1 THẮNG!' : 'BẠN THẮNG!',
    ai: isPassPlay ? 'NGƯỜI CHƠI 2 THẮNG!' : `${oppName} THẮNG`,
    tie: 'HÒA',
  };

  const winnerClass: Record<'player' | 'ai' | 'tie', string> = {
    player: 'winner-player',
    ai: 'winner-ai',
    tie: 'winner-tie',
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.25,
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      className="rr-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="rr-card glass"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Header */}
        <div className="rr-header">
          <span className="rr-turn-badge">VÒNG {turn}</span>
          <span className={`rr-winner-label ${winnerClass[winner]}`}>
            {winnerLabel[winner]}
          </span>
        </div>

        {/* Main Content Area (Scrollable) */}
        <div className="rr-main-content">
          {/* Side-by-side comparison */}
          <div className="rr-comparison">
            {/* Player side */}
            <motion.div 
              className={`rr-side ${winner === 'player' ? 'rr-side--win' : ''}`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.p className="rr-side-label" variants={itemVariants}>{playerName}</motion.p>
              <motion.div className="rr-mini-cards" variants={itemVariants}>
                {playerCards.map((c, idx) => {
                  const isSkill = result.events.some(e => e.sourceCardId === c.id && e.type !== 'NEUTRALIZED');
                  const isNeutralized = result.events.some(e => (e.targetCardId === c.id || e.sourceCardId === c.id) && e.type === 'NEUTRALIZED');
                  return (
                    <span key={`${c.id}-${idx}`} className={`rr-mini-card rr-mini-card--${c.type} rr-mini-card--${c.rarity} relative ${isSkill ? 'shadow-[0_0:8px_#FF9900] border-[#FF9900]' : ''}`}>
                      {c.value === '*' ? '×' : c.value === '/' ? '÷' : c.value}
                      {isSkill && !isNeutralized && <span className="absolute -top-1 -right-1 bg-[#FF9900] text-[#2A1A12] text-[6px] font-black px-1 rounded-sm shadow-md z-10 border border-[#FF9900]">SKILL</span>}
                      {isNeutralized && <span className="absolute inset-0 flex items-center justify-center text-red-500 font-black text-sm bg-black/60 rounded-sm z-10">X</span>}
                    </span>
                  );
                })}
              </motion.div>
              <motion.p className="rr-expression" variants={itemVariants}>{result.playerExpression}</motion.p>
  
              {/* Score Breakdown */}
              <div className="rr-score-breakdown">
                <motion.div className="rr-score-item" variants={itemVariants}>
                  <span>Kết quả:</span>
                  <span className="rr-val-base"><RollingNumber value={result.playerValue || 0} /></span>
                </motion.div>
                <motion.div className="rr-score-item" variants={itemVariants}>
                  <span>Logic:</span>
                  <span className="rr-val-logic"><RollingNumber value={result.playerLogicScore} /></span>
                </motion.div>
                <motion.div className="rr-score-item" variants={itemVariants}>
                  <span>Bonus:</span>
                  <span className="rr-val-bonus">+<RollingNumber value={result.playerTacticalScore} /></span>
                </motion.div>
                <motion.div className="rr-score-total" variants={itemVariants}>
                  <span>TỔNG:</span>
                  <span className="rr-val-total"><RollingNumber value={result.playerPointsEarned} /></span>
                </motion.div>
              </div>
            </motion.div>
  
            <div className="rr-vs">VS</div>
  
            {/* AI / Player 2 side */}
            <motion.div 
              className={`rr-side ${winner === 'ai' ? 'rr-side--win' : ''}`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.p className="rr-side-label" variants={itemVariants}>{oppName}</motion.p>
              <motion.div className="rr-mini-cards" variants={itemVariants}>
                {aiCards.map((c, idx) => {
                  const isSkill = result.events.some(e => e.sourceCardId === c.id && e.type !== 'NEUTRALIZED');
                  const isNeutralized = result.events.some(e => (e.targetCardId === c.id || e.sourceCardId === c.id) && e.type === 'NEUTRALIZED');
                  return (
                    <span key={`${c.id}-${idx}`} className={`rr-mini-card rr-mini-card--${c.type} rr-mini-card--${c.rarity} relative ${isSkill ? 'shadow-[0_0:8px_#FF9900] border-[#FF9900]' : ''}`}>
                      {c.value === '*' ? '×' : c.value === '/' ? '÷' : c.value}
                      {isSkill && !isNeutralized && <span className="absolute -top-1 -right-1 bg-[#FF9900] text-[#2A1A12] text-[6px] font-black px-1 rounded-sm shadow-md z-10 border border-[#FF9900]">SKILL</span>}
                      {isNeutralized && <span className="absolute inset-0 flex items-center justify-center text-red-500 font-black text-sm bg-black/60 rounded-sm z-10">X</span>}
                    </span>
                  );
                })}
              </motion.div>
              <motion.p className="rr-expression" variants={itemVariants}>{result.aiExpression}</motion.p>
  
              {/* Score Breakdown */}
              <div className="rr-score-breakdown">
                <motion.div className="rr-score-item" variants={itemVariants}>
                  <span>Kết quả:</span>
                  <span className="rr-val-base"><RollingNumber value={result.aiValue || 0} /></span>
                </motion.div>
                <motion.div className="rr-score-item" variants={itemVariants}>
                  <span>Logic:</span>
                  <span className="rr-val-logic"><RollingNumber value={result.aiLogicScore} /></span>
                </motion.div>
                <motion.div className="rr-score-item" variants={itemVariants}>
                  <span>Bonus:</span>
                  <span className="rr-val-bonus">+<RollingNumber value={result.aiTacticalScore} /></span>
                </motion.div>
                <motion.div className="rr-score-total" variants={itemVariants}>
                  <span>TỔNG:</span>
                  <span className="rr-val-total"><RollingNumber value={result.aiPointsEarned} /></span>
                </motion.div>
              </div>
            </motion.div>
          </div>
  
          {/* Timeline Logs Section */}
          <div className="rr-battle-logs">
            <p className="rr-logs-title">CÂY THỜI GIAN KỸ NĂNG</p>
            <div className="rr-timeline-container">
              {result.events.length > 0 ? (
                Object.entries(
                  result.events.reduce((acc, ev) => {
                    if (!acc[ev.priority]) acc[ev.priority] = [];
                    acc[ev.priority].push(ev);
                    return acc;
                  }, {} as Record<number, typeof result.events>)
                )
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([prioStr, events]) => {
                  const prio = Number(prioStr);
                  const PHASES: Record<number, string> = {
                    1: 'TƯỚC ĐOẠT & PHÒNG NGỰ',
                    2: 'BIẾN THIÊN GIÁ TRỊ',
                    3: 'TÍNH TOÁN BỔ TRỢ',
                    4: 'KHUẾCH ĐẠI HỆ SỐ',
                    5: 'HIỆU ỨNG TOÀN CỤC',
                    6: 'LƯU TRỮ KHO ĐIỂM'
                  };
  
                  return (
                    <div key={prio} className="rr-timeline-phase">
                      <div className="rr-phase-header">
                        <div className="rr-phase-line"></div>
                        <span className="rr-phase-badge">
                          <span className="rr-phase-number">P{prio}</span>
                          <span className="rr-phase-name">{PHASES[prio] || `GIAI ĐOẠN ${prio}`}</span>
                        </span>
                        <div className="rr-phase-line"></div>
                      </div>
                      
                      <div className="rr-phase-body">
                        {events.map((ev, i) => {
                          let owner = 'neutral';
                          let sourceCard = null;
                          if (ev.sourceCardId) {
                            sourceCard = result.playerCards.find(c => c.id === ev.sourceCardId) || result.aiCards.find(c => c.id === ev.sourceCardId);
                            if (result.playerCards.some(c => c.id === ev.sourceCardId)) owner = 'player';
                            else if (result.aiCards.some(c => c.id === ev.sourceCardId)) owner = 'ai';
                          }
                          if (owner === 'neutral') {
                             if (ev.targetPlayer === 'player1') owner = 'player';
                             if (ev.targetPlayer === 'player2') owner = 'ai';
                          }
  
                          const rarityNames: Record<string, string> = {
                            'normal': 'Normal',
                            'rare': 'Rare',
                            'super': 'Super',
                            'ultra': 'Ultra'
                          };
  
                          const cardTag = sourceCard && sourceCard.rarity && sourceCard.rarity !== 'normal'
                            ? <span className={`font-bold mr-1 ${sourceCard.rarity === 'ultra' ? 'text-rose-600' : sourceCard.rarity === 'super' ? 'text-orange-500' : 'text-emerald-500'}`}>[Thẻ {sourceCard.value === '*' ? '×' : sourceCard.value === '/' ? '÷' : sourceCard.value} - {rarityNames[sourceCard.rarity]}]</span>
                            : null;
  
                          return (
                            <motion.div 
                              key={i} 
                              className={`rr-timeline-item rr-timeline-${owner}`}
                              variants={itemVariants}
                              initial="hidden"
                              whileInView="visible"
                              viewport={{ once: true }}
                            >
                              <div className={`rr-log-card rr-log-${ev.type.toLowerCase()}`}>
                                <span className="rr-log-icon">
                                  {ev.type === 'NEUTRALIZED' ? '🚫' : 
                                   ev.type === 'SKILL_ACTIVATED' ? '✨' : 
                                   ev.type === 'VALUE_MODIFIED' ? '🔢' : 
                                   ev.type === 'BONUS_APPLIED' ? (ev.description.includes('Trừ') || ev.description.includes('Giảm') ? '➖' : '➕') : 
                                   ev.type === 'MULTIPLIER_HIT' ? (ev.description.includes('Phân Rã') || ev.description.includes('Giảm') ? '➗' : '✖️') : 
                                   ev.type === 'GLOBAL_EFFECT' ? '🌍' : 
                                   ev.type === 'POOL_TRANSFER' ? '💰' : '📝'}
                                </span>
                                <span className="rr-log-desc">{cardTag} {ev.description}</span>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="rr-no-logs">Không có kỹ năng nào được kích hoạt trong lượt này.</p>
              )}
            </div>
          </div>
        </div>

        {/* Next button */}
        <motion.button
          className="rr-next-btn"
          onClick={onNext}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          {turn === 6 ? 'XEM KẾT QUẢ CUỐI →' : `LƯỢT TIẾP THEO (${turn + 1}/6) →`}
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default RoundResult;
