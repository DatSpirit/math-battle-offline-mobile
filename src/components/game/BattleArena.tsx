/**
 * MOLECULE: Battle Arena
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ArenaSlot from './ArenaSlot';
import Card from '../shared/Card';
import DraggableCard from '../shared/DraggableCard';
import type { GameCard } from '../../types/game';
import { TURN_INFO } from '../../types/game';
import { fmtResult, evaluatePlay } from '../../core/game/matchEngine';
import { HelpModal } from '../modals/HelpModal';
import { usePlayerStore } from '../../store/playerStore';
import './BattleArena.css';
import { AlertCircle } from 'lucide-react';

interface BattleArenaProps {
  currentTurn: number;
  playerSlots: (GameCard | null)[];
  onRemoveCard: (index: number) => void;
  liveResult: number | null;
  liveError: string | null;
  history: { winner: 'player' | 'ai' | 'tie' }[];
  shakeClass?: string;
  onCardClick?: (cardId: string) => void;
  glowingCardId?: string | null;
  opponentSlots?: (GameCard | null)[];
  showOpponentCards?: boolean;
  battleCountdown?: number | null;
  orbP1Score?: number | null;
  orbP2Score?: number | null;
  orbP1Delta?: { id: number; val: number } | null;
  orbP2Delta?: { id: number; val: number } | null;
}

const ArenaDraggableCard: React.FC<{
  card: GameCard;
  slotIndex: number;
  onRemove: () => void;
  onCardClick?: (cardId: string) => void;
  isGlowing?: boolean;
}> = ({ card, slotIndex, onRemove, onCardClick, isGlowing }) => {
  return (
    <div className={`arena-card-wrap-fix ${isGlowing ? 'z-1000' : 'z-10'}`}>
      <DraggableCard 
        {...card} 
        id={card.id} 
        sourceSlot={slotIndex}
        layoutId={card.id}
        isGlowing={isGlowing}
        className={`math-card--in-game ${isGlowing ? 'scale-[1.4] sm:scale-[1.5] transition-transform duration-300 ease-out' : ''}`}
        onClick={() => onCardClick ? onCardClick(card.id) : onRemove()}
        onDoubleClick={onRemove}
      />
    </div>
  );
};

const BattleArena: React.FC<BattleArenaProps> = ({
  currentTurn,
  playerSlots,
  onRemoveCard,
  liveResult,
  liveError,
  history,
  shakeClass = '',
  onCardClick,
  glowingCardId,
  opponentSlots,
  showOpponentCards = false,
  battleCountdown = null,
  orbP1Score = null,
  orbP2Score = null,
  orbP1Delta = null,
  orbP2Delta = null,
}) => {
  const performanceMode = usePlayerStore(s => s.performanceMode);
  const isEco = performanceMode === 'ECO';

  const [isHelpOpen, setIsHelpOpen] = React.useState(false);
  const turnInfo = TURN_INFO[Math.max(0, Math.min(currentTurn - 1, 5))];
  const { slotsCount, description } = turnInfo;

  return (
    <div className={`battle-arena ${shakeClass} ${isEco ? 'lite-mode' : ''} h-full flex flex-col justify-between`}>
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} turn={currentTurn} />

      {/* Progress Pips - Giảm margin để làm gọn */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-1.5">
          {Array.from({ length: 6 }, (_, i) => {
            const r = history[i];
            let dotColor = 'bg-primary/20';
            if (r) {
                if (r.winner === 'player') dotColor = 'bg-green-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]';
                else if (r.winner === 'ai') dotColor = 'bg-red-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]';
                else dotColor = 'bg-amber-500';
            }
            return <div key={i} className={`w-2 h-2 rounded-full ${dotColor}`} />;
          })}
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80 hud-glass px-3 py-1 rounded-full">
          Vòng {currentTurn} / 6
        </span>
      </div>

      {/* Turn Hint - Giảm margin để làm gọn phía trên */}
      <div className="mt-1 flex flex-col items-center gap-2 relative z-50">
        <div id="arena-turn-req" className="hud-glass px-3 py-1.5 rounded-[24px] flex items-center gap-2 max-w-[85%] relative">
          <div className="flex items-center gap-1 shrink-0">
            <motion.button 
              id="arena-guide-btn"
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsHelpOpen(true)}
              className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              <AlertCircle size={14} strokeWidth={3} />
            </motion.button>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[9px] font-black text-amber-900/80 uppercase tracking-wider">
              Yêu cầu: {turnInfo.numCount} Thẻ Số & {turnInfo.opCount} Phép Tính
            </span>
            <span className="text-[8px] font-medium text-amber-900/60 italic">
              {description}
            </span>
          </div>
        </div>
        <p className="text-[7px] font-black uppercase tracking-[0.3em] text-primary/40">
          Kéo thẻ vào ô • Nhấn thẻ để gỡ ra
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-evenly gap-4 sm:gap-6 w-full mt-2 sm:mt-0">
        <div className="flex-1 flex flex-col items-center justify-evenly gap-4 sm:gap-6 w-full">
        {/* Opponent Side */}
        {opponentSlots && (
          <div className="flex flex-col items-center gap-2">
            <div
              className="slots-container mb-2 opacity-90"
              style={{ 
                  width: '100%',
                  maxWidth: Math.min(900, slotsCount * 150)
              }}
            >
              {Array.from({ length: slotsCount }, (_, i) => {
                const card = opponentSlots[i];
                const isGlowing = card?.id === glowingCardId;
                return (
                  <ArenaSlot key={`opp-slot-${i}`} id={`opp-slot-${i}`} isOccupied={!!card} isGlowing={isGlowing}>
                    {card ? (
                      <div className={`pointer-events-none arena-card-wrap-fix ${
                        isGlowing ? 'z-1000' : ''
                      }`}>
                        <Card
                          {...card}
                          id={`arena-visual-opp-${card.id}-${i}`}
                          isFaceDown={!showOpponentCards}
                          isGlowing={isGlowing}
                          className={`math-card--in-game ${isGlowing ? 'scale-[1.4] sm:scale-[1.5] transition-transform duration-300 ease-out' : ''}`}
                        />
                      </div>
                    ) : null}
                  </ArenaSlot>
                );
              })}
            </div>

            {/* AI Live Score */}
            <div className="arena-score-box ai-score">
              <span className="text-lg font-black text-rose-600/60">=</span>
              <span className="text-xl font-black text-rose-600">
                {battleCountdown !== null ? '?' : (opponentSlots.filter(Boolean).length === 0 ? '...' : (() => {
                  const played = opponentSlots.filter(Boolean) as GameCard[];
                  const res = evaluatePlay(played, currentTurn);
                  return res.value !== null ? fmtResult(res.value) : '...';
                })())}
              </span>
            </div>
          </div>
        )}

        {/* Central Divider with Scoring Orbs */}
        <div className="arena-divider w-full max-w-[280px] h-[2px] bg-primary/10 relative">
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-primary/20 to-transparent"></div>
          
          {/* Player Scoring Orb (left side) */}
          <AnimatePresence>
            {orbP1Score !== null && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute -left-14 sm:-left-20 top-1/2 -translate-y-1/2 flex flex-col items-center z-30"
              >
                <div className="relative">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-500/20 border-2 border-emerald-400/60 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.4)]">
                    <span className="text-xs sm:text-sm font-black text-emerald-400">{orbP1Score}</span>
                  </div>
                  {/* Floating +delta */}
                  <AnimatePresence>
                    {orbP1Delta && (
                      <motion.span
                        key={orbP1Delta.id}
                        initial={{ y: 0, opacity: 1 }}
                        animate={{ y: -24, opacity: 0 }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs font-black text-emerald-300 whitespace-nowrap pointer-events-none"
                      >
                        +{orbP1Delta.val}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Opponent Scoring Orb (right side) */}
          <AnimatePresence>
            {orbP2Score !== null && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute -right-14 sm:-right-20 top-1/2 -translate-y-1/2 flex flex-col items-center z-30"
              >
                <div className="relative">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-rose-500/20 border-2 border-rose-400/60 flex items-center justify-center shadow-[0_0_12px_rgba(244,63,94,0.4)]">
                    <span className="text-xs sm:text-sm font-black text-rose-400">{orbP2Score}</span>
                  </div>
                  {/* Floating +delta */}
                  <AnimatePresence>
                    {orbP2Delta && (
                      <motion.span
                        key={orbP2Delta.id}
                        initial={{ y: 0, opacity: 1 }}
                        animate={{ y: -24, opacity: 0 }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs font-black text-rose-300 whitespace-nowrap pointer-events-none"
                      >
                        +{orbP2Delta.val}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Player Slots Area - Khu vực đáy bàn đấu */}
        <div className="flex flex-col items-center gap-1 sm:gap-2 relative">
           {/* Player Live Score */}
           <div className="arena-score-box player-score">
              <span className="text-base font-black text-emerald-600/60">=</span>
              <span className="text-lg font-black text-emerald-600">
                {battleCountdown !== null ? '?' : (liveError ? '⚠️' : liveResult !== null ? fmtResult(liveResult) : '...')}
              </span>
            </div>

            <div
              className="slots-container"
              style={{ 
                  width: '100%',
                  maxWidth: Math.min(900, slotsCount * 150)
              }}
            >
              {Array.from({ length: slotsCount }, (_, i) => {
                const isGlowing = playerSlots[i]?.id === glowingCardId;
                return (
                  <ArenaSlot key={`slot-${i}`} id={`slot-${i}`} isOccupied={!!playerSlots[i]} isGlowing={isGlowing}>
                    {playerSlots[i] ? (
                      <ArenaDraggableCard
                        card={playerSlots[i]!}
                        slotIndex={i}
                        onRemove={() => onRemoveCard(i)}
                        onCardClick={onCardClick}
                        isGlowing={isGlowing}
                      />
                    ) : null}
                  </ArenaSlot>
                );
              })}
            </div>
        </div>
        </div>
      </div>


      {/* Countdown Overlay - Moved here for perfect centering in both Mobile & PC */}
      <AnimatePresence>
        {battleCountdown !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="absolute inset-0 z-100 flex items-center justify-center pointer-events-none"
          >
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-amber-500 flex items-center justify-center shadow-[0_0_60px_rgba(245,158,11,0.6)] border-4 border-white ring-8 ring-amber-500/20">
                <span className="text-7xl sm:text-8xl font-black text-white italic drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]">
                  {battleCountdown}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(BattleArena);
