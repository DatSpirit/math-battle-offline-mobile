/**
 * PAGE: Game Arena (Mobile Premium HUD)
 */
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { Flag, RefreshCw, Zap, X, Star, Bot, AlertCircle } from 'lucide-react';
import { HelpModal } from '../../components/modals/HelpModal';
import { useGameLogic } from '../../hooks/useGameLogic';
import Card from '../../components/shared/Card';
import DraggableCard from '../../components/shared/DraggableCard';
import BattleArena from '../../components/game/BattleArena';
import RoundResult from '../../components/modals/RoundResultModal';
import GameOver from '../../components/modals/GameOverModal';
import TutorialOverlay from '../../components/game/TutorialOverlay';
import DetailedHistory from '../../components/game/DetailedHistory';
import PlayerSwitchOverlay from '../../components/feedback/PlayerSwitchOverlay';
import FloatingPoints from '../../components/feedback/FloatingPoints';
import ComboParticles from '../../components/feedback/ComboParticles';
import { EmotePicker, EmoteDisplay } from '../../components/game/EmoteSystem';
import { useAuthStore } from '../../store/authStore';
import RulesModal from '../../components/modals/RulesModal';
import RollingNumber from '../../components/feedback/RollingNumber';
import BattleEventTheater from '../../components/feedback/BattleEventTheater';
import { resolveAbilityDesc } from '../../data/cardMetadata';
import { useUIStore } from '../../store/uiStore';
import { usePlayerStore } from '../../store/playerStore';
import { usePerformance } from '../../hooks/usePerformance';
import './Game.css';

const MobileGamePage: React.FC = () => {
  const g = useGameLogic();
  const { performanceMode } = usePlayerStore();
  const { isEco, isUltra } = usePerformance();
  const { user } = useAuthStore();
  const { showConfirm } = useUIStore();
  const [showTactics, setShowTactics] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isEmotePickerOpen, setIsEmotePickerOpen] = useState(false);

  React.useEffect(() => {
    // LOCK VIEWPORT
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, []);

  const playerName = user?.name || 'BẠN';
  const player2Name = g.gameMode === 'pass_play' ? 'ĐỐI THỦ' : 'MÁY (AI)';

  return (
    <DndContext 
      sensors={g.sensors} 
      onDragStart={g.handleDragStart} 
      onDragEnd={g.handleDragEnd}
      collisionDetection={closestCorners}
    >
      <div 
        className={`h-screen w-full bg-[#fcf9f2] text-primary flex flex-col pt-[env(safe-area-inset-top,1rem)] font-body overflow-hidden select-none relative ${g.shakeIntensity > 0 ? `shake-${g.shakeIntensity}` : ''}`}
        style={{ touchAction: g.activeId ? 'none' : 'pan-y' }}
      >
        {/* Background Elements */}
        {performanceMode !== 'ECO' && <div className="fixed inset-0 pointer-events-none opacity-5 hologram-grid"></div>}
        
        <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />

        {/* Premium HUD: Score & Timer */}
        <section className="relative z-20 mt-4 mb-3 px-2">
          <div className="flex items-center gap-2">
            {/* Player 2 */}
            <div id="arena-scores" className="flex-1 hud-glass rounded-2xl p-2 flex items-center gap-3 border border-white/50 relative overflow-hidden">
              <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center border-2 border-primary/20 shrink-0 relative">
                <Bot size={20} className="text-primary/60" />
                <div className="absolute -top-6 left-0"> <EmoteDisplay isOpponent /> </div>
              </div>
              <div className="flex-1 min-w-0">
                 <p className="text-[7px] font-black text-primary/40 uppercase truncate">{player2Name}</p>
                 <p className="text-xl font-black italic hud-score-text text-primary leading-tight">
                   <RollingNumber value={g.displayP2Score} />
                 </p>
              </div>
            </div>

            {/* Timer Hub */}
            <div id="arena-timer" className="relative shrink-0">
               <div className={`size-14 rounded-full border-[3px] flex items-center justify-center bg-white shadow-md ${g.timeLeft <= 10 ? 'border-rose-500' : 'border-primary'}`}>
                  <span className={`text-lg font-black italic ${g.timeLeft <= 10 ? 'text-rose-500' : 'text-primary'}`}>
                    {g.timeLeft === 999 ? '∞' : g.timeLeft}
                  </span>
               </div>
            </div>

            {/* Player 1 */}
            <div className="flex-1 hud-glass rounded-2xl p-2 flex flex-row-reverse items-center gap-3 border border-white/50 relative overflow-hidden text-right">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/40 shrink-0 relative">
                <span className="text-lg">🐼</span>
                <div className="absolute -top-6 right-0"> <EmoteDisplay /> </div>
              </div>
              <div className="flex-1 min-w-0">
                 <p className="text-[7px] font-black text-primary/40 uppercase truncate">BẠN</p>
                 <p className="text-xl font-black italic hud-score-text text-primary leading-tight">
                   <RollingNumber value={g.displayP1Score} />
                 </p>
              </div>
            </div>
          </div>
        </section>

        {/* Arena Layout & Controls Interaction Zone */}
        <div id="arena-interaction-zone" className="flex-1 flex flex-col overflow-hidden relative z-10">
          {/* Arena Layout */}
          <main className="flex-1 flex flex-col justify-start items-center pt-2 pb-2 relative">
             <BattleArena
               currentTurn={g.currentTurn}
               playerSlots={g.activeSlots}
               opponentSlots={g.player2Slots}
               showOpponentCards={(g.phase === 'round_result' && g.battleCountdown === null) || g.phase === 'game_over' || g.isAnimatingEvents}
               onRemoveCard={(i) => g.removeCard(i)}
               liveResult={g.liveResult}
               liveError={g.displayError}
               history={g.history}
               onCardClick={g.handleCardInteraction}
               glowingCardId={g.lastBattleEvents[g.currentEventIndex]?.sourceCardId}
               battleCountdown={g.battleCountdown}
               orbP1Score={g.orbP1Score}
               orbP2Score={g.orbP2Score}
               orbP1Delta={g.orbP1Delta}
               orbP2Delta={g.orbP2Delta}
             />
          </main>

          {/* Floating Controls & Hand Area */}
          <footer className="w-full px-2 sm:px-4 pb-[calc(env(safe-area-inset-bottom,16px)+8px)] z-50 shrink-0">
            <div className="hud-glass rounded-[32px] sm:rounded-[40px] p-2 sm:p-4 space-y-2 border-2 border-white/50 shadow-2xl relative overflow-visible">
              <div className="absolute inset-0 bg-primary/5 opacity-30 pointer-events-none rounded-[32px] sm:rounded-[40px] overflow-hidden"></div>
            
            {/* Action Row - Unified into single line for maximum vertical space */}
            <div className="flex items-center gap-1.5 relative z-10">
              {/* Secondary Actions */}
              <div className="flex gap-1 shrink-0">
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    showConfirm('Bạn chắc chắn muốn bỏ cuộc chứ? Kết quả trận đấu sẽ không được lưu lại.', () => {
                      g.surrenderGame();
                      g.navigate('/');
                    });
                  }} 
                  className="w-11 h-11 flex items-center justify-center hud-glass rounded-xl text-rose-500 shadow-sm border border-rose-100"
                >
                  <Flag size={20}/>
                </motion.button>
                <motion.button 
                  id="arena-rules-btn"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsRulesOpen(true)}
                  className="w-11 h-11 flex items-center justify-center hud-glass rounded-xl text-primary font-black text-xl shadow-sm border border-primary/10"
                >
                  ?
                </motion.button>
                <motion.button 
                  id="arena-guide-btn-top"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsHelpOpen(true)}
                  className="w-11 h-11 flex items-center justify-center bg-amber-500 text-white rounded-xl shadow-sm shadow-amber-500/20 active:scale-90 transition-all"
                >
                  <AlertCircle size={20} strokeWidth={3} />
                </motion.button>
              </div>

              {/* Deck Actions */}
              <div id="arena-skills" className="flex-1 flex gap-1">
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => g.activateMulligan()}
                  disabled={g.hasUsedMulligan || g.placedCards.length > 0 || g.isProcessing}
                  className="flex-1 py-1 h-11 hud-glass rounded-xl text-[8px] font-black text-primary uppercase border border-primary/10 disabled:opacity-30 flex flex-col items-center justify-center leading-none"
                >
                  <RefreshCw size={14} className="opacity-60 mb-0.5"/>
                  <span>ĐỔI BÀI</span>
                </motion.button>
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => g.activateWildcard()}
                  disabled={g.hasUsedWildcard || g.isProcessing}
                  className="flex-1 py-1 h-11 hud-glass rounded-xl text-[8px] font-black text-primary uppercase border border-primary/10 disabled:opacity-30 flex flex-col items-center justify-center leading-none"
                >
                  <Zap size={14} fill="currentColor" className="text-amber-500 mb-0.5"/>
                  <span>KỸ NĂNG</span>
                </motion.button>
              </div>

              {/* Emote & Submit */}
              <div className="flex items-center gap-1 shrink-0">
                <div className="relative">
                  <AnimatePresence>
                    {isEmotePickerOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.8 }}
                        className="absolute bottom-full right-0 mb-4 z-200"
                      >
                        <EmotePicker className="shadow-2xl ring-4 ring-black/5" onSelect={() => setIsEmotePickerOpen(false)} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                    <motion.button
                      id="arena-emotes"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsEmotePickerOpen(!isEmotePickerOpen)}
                      className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${isEmotePickerOpen ? 'bg-primary text-white' : 'bg-white/80 text-primary border border-primary/20 shadow-sm'}`}
                    >
                      <span className="text-xl">😊</span>
                    </motion.button>
                </div>

                <motion.button
                  id="arena-confirm-btn"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => g.submitTurn()}
                  disabled={!g.playValid || g.isProcessing}
                  className={`w-20 h-11 rounded-xl font-display font-black text-[10px] uppercase tracking-wider transition-all relative overflow-hidden btn-shimmer ${
                      (g.playValid && !g.isProcessing) ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {g.isProcessing ? '...' : 'XÁC NHẬN'}
                </motion.button>
              </div>
            </div>

            <div id="arena-hand-area" className="relative h-[clamp(110px,18vh,220px)] sm:h-[clamp(150px,22vh,300px)] flex justify-center items-end mb-1 px-2 overflow-visible">
               {g.activeHand.map((card, i) => {
                  const total = g.activeHand.length;
                  const mid = (total - 1) / 2;
                  
                  // Tính toán overlap linh hoạt bằng Margin
                  const cardWidth = Math.min(75, window.innerWidth / 5.5);
                  const availableWidth = window.innerWidth - 48; 
                  const maxStep = cardWidth * 0.66; // Bước nhảy tối đa (hiển thị 2/3 lá bài)
                  const dynamicStep = total <= 1 ? 0 : Math.min(maxStep, (availableWidth - cardWidth) / (total - 1));
                  const marginLeft = i === 0 ? 0 : dynamicStep - cardWidth;
                  
                  const rotation = (i - mid) * 4;
                  const yArc = Math.abs(i - mid) * 4;

                  return (
                    <div id={`hand-card-${i}`} key={card.id}>
                      <DraggableCard 
                        {...card} 
                        id={card.id}
                        layoutId={card.id}
                        className="relative origin-bottom math-card--in-game"
                        style={{ 
                           zIndex: i, 
                           marginLeft: `${marginLeft}px`,
                           transform: `rotate(${rotation}deg) translateY(${yArc}px)` 
                        }}
                        isDraggable={g.skillMode === 'none' && !g.isProcessing}
                        isSelected={g.mulliganSelection.includes(card.id) || g.pendingWildcard?.cardId === card.id}
                        onClick={() => g.handleCardInteraction(card.id)}
                      />
                    </div>
                  );
               })}
            </div>
            {/* Pull Bar Handle */}
            <div className="w-12 h-1.5 bg-primary/20 mx-auto rounded-full mt-2"></div>
          </div>
        </footer>
      </div>
        
      {/* Modals & Overlays */}
        <AnimatePresence>
          {g.isTutorial && (
            <TutorialOverlay 
              key="tutorial-overlay"
              onClose={() => g.setTutorialStep(0)} 
            />
          )}
          <HelpModal key="help-modal" isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} turn={g.currentTurn} />
          {g.phase === 'round_result' && g.showResultModal && <RoundResult key="round-result" result={g.lastResult!} onNext={g.nextTurn} />}
           {g.phase === 'game_over' && (
              <GameOver
                key="game-over"
                history={g.history}
                playerScore={g.player1Score}
                aiScore={g.player2Score}
                onRematch={() => g.playAgain()}
                onHome={() => { g.surrenderGame(); g.navigate('/'); }}
                onMap={g.goToMap}
                onNextStage={g.nextStage}
                isMobile={true}
               />
            )}
 
           {/* Card Inspector (Premium Mobile Overlay) */}
           {g.inspectedCard && (
              <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="fixed inset-0 z-200 bg-slate-950/60 flex items-center justify-center p-6"
                 onClick={() => g.setInspectedCard(null)}
              >
                 <motion.div 
                    initial={{ scale: 0.9, y: 50 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 50 }}
                    className="hud-glass w-full max-w-sm rounded-[40px] overflow-hidden flex flex-col shadow-2xl border-2 border-white/30"
                    onClick={e => e.stopPropagation()}
                 >
                    <div className="flex justify-between items-center p-6 border-b border-primary/10 bg-white/50 shrink-0">
                       <div className="w-8" />
                       <h2 className="text-sm font-black text-primary uppercase tracking-[0.2em] italic m-0">CHI TIẾT THẺ</h2>
                       <button onClick={() => g.setInspectedCard(null)} className="p-2 bg-primary/5 rounded-full text-primary/40">
                          <X size={20} />
                       </button>
                    </div>
                    
                    <div className="px-8 pb-24 pt-8 flex flex-col items-center text-center overflow-y-auto">
                       <h3 className="text-2xl font-black text-primary italic uppercase tracking-tighter m-0 leading-tight">
                          {g.inspectedCard.name || g.inspectedCard.value}
                       </h3>
                       
                       <div className="flex gap-1 mt-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                             <Star key={i} size={14} fill={i < (g.inspectedCard?.stars || 0) ? '#fbbf24' : 'none'} className={i < (g.inspectedCard?.stars || 0) ? 'text-amber-400' : 'text-gray-200'} />
                          ))}
                       </div>
 
                       <div className="flex justify-center py-10 scale-[1.3]">
                          <motion.div 
                             animate={{ y: [0, -10, 0] }}
                             transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                             className="drop-shadow-2xl"
                          >
                             <Card {...g.inspectedCard} id={`inspector-${g.inspectedCard.id}`} />
                          </motion.div>
                       </div>
 
                       <div className="w-full space-y-4">
                          <div className="bg-primary p-6 rounded-[32px] text-white shadow-xl shadow-primary/20">
                             <div className="flex items-center justify-center gap-2 mb-3 opacity-60">
                                <Zap size={12} fill="currentColor" />
                                <p className="text-[9px] font-black uppercase tracking-[0.2em]">KỸ NĂNG ĐẶC BIỆT</p>
                             </div>
                             <p className="text-sm font-black uppercase italic tracking-tight mb-2">{g.inspectedCard.abilityName || 'CƠ BẢN'}</p>
                             <p className="text-xs italic leading-relaxed m-0 text-white/90 font-medium">
                                "{resolveAbilityDesc(g.inspectedCard.value, g.inspectedCard.rarity) || 'Lá bài này không có nội tại đặc biệt.'}"
                             </p>
                             {g.inspectedCard.activationCond && (
                                <div className="mt-4 pt-4 border-t border-white/10">
                                   <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">ĐIỀU KIỆN KÍCH HOẠT</p>
                                   <p className="text-[10px] font-bold text-white/80">{g.inspectedCard.activationCond}</p>
                                </div>
                             )}
                          </div>
                       </div>
 
                       <button 
                          onClick={() => {
                             if (g.activeSlots.some(s => s?.id === g.inspectedCard?.id)) {
                                const idx = g.activeSlots.findIndex(s => s?.id === g.inspectedCard?.id);
                                if (idx !== -1) g.removeCard(idx);
                             } else {
                                g.handleCardDoubleClick(g.inspectedCard!.id);
                             }
                             g.setInspectedCard(null);
                          }}
                          className="w-[90%] mx-auto mt-10 py-6 bg-primary text-white rounded-3xl font-black text-sm uppercase tracking-[0.25em] shadow-2xl shadow-primary/30 active:scale-95 transition-all border-b-8 border-black/20"
                       >
                          {g.activeSlots.some(s => s?.id === g.inspectedCard?.id) ? 'GỠ KHỎI Ô ĐẤU' : 'SỬ DỤNG THẺ'}
                       </button>
                     </div>
                  </motion.div>
               </motion.div>
            )}
          {showTactics && (
             <motion.div 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed inset-0 z-50 bg-[#fcf9f2] flex flex-col"
             >
                <div className="flex justify-between items-center p-6 border-b border-primary/10 bg-white shrink-0 shadow-sm">
                   <div>
                      <h2 className="text-xl font-black text-primary uppercase tracking-tighter italic m-0">NHẬT KÝ CHIẾN THUẬT</h2>
                      <p className="text-[10px] font-black text-primary/30 uppercase tracking-widest mt-1">Dữ liệu phân tích thời gian thực</p>
                   </div>
                   <button onClick={() => setShowTactics(false)} className="p-3 bg-primary text-white rounded-2xl shadow-lg active:scale-90 transition-all">
                      <X size={20} />
                   </button>
                </div>
                <div className="flex-1 overflow-y-auto px-6 pb-20 pt-6">
                   <div className="max-w-md mx-auto">
                      <DetailedHistory history={g.history} />
                   </div>
                </div>
             </motion.div>
           )}
          {/* Local Surrender modal removed in favor of global ConfirmModal */}
        </AnimatePresence>

        <PlayerSwitchOverlay 
            isVisible={g.isScreenHidden} 
            playerName={g.activePlayer === 1 ? playerName : player2Name} 
            onReady={() => g.setScreenHidden(false)} 
        />
        
        <AnimatePresence>
          {g.activePoints.map(p => (
            <FloatingPoints key={p.id} points={p.pts} x={p.x} y={p.y} onComplete={() => g.setActivePoints(prev => prev.filter(x => x.id !== p.id))} />
          ))}
        </AnimatePresence>

        {g.showParticles && <ComboParticles onComplete={() => g.setShowParticles(false)} />}
        
        {/* Battle Event Theater Overlay (Now Global Fixed on Mobile) */}
        <BattleEventTheater 
            event={g.lastBattleEvents[g.currentEventIndex]} 
            isVisible={g.isAnimatingEvents} 
            eventIndex={g.currentEventIndex} 
            lastResult={g.lastResult}
            isFixed={true}
        />
        

        <DragOverlay zIndex={10000} dropAnimation={isEco ? null : { duration: 220, easing: 'cubic-bezier(0.2, 0, 0, 1.6)' }}>
          {g.activeId && g.activeCardData ? (
            <div style={{ 
              width: '64px', 
              height: '94px', 
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {isEco ? (
                <Card {...g.activeCardData} id={`overlay-${g.activeId}`} isDraggable={false} />
              ) : (
                <motion.div 
                  initial={{ scale: 1, rotate: 0, y: 0 }}
                  animate={{ 
                    scale: isUltra ? 1.35 : 1.15, 
                    rotate: isUltra ? 3 : 1,
                    y: isUltra ? -8 : -4
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  style={{ 
                    filter: isUltra 
                      ? 'drop-shadow(0 32px 48px rgba(0,0,0,0.55))' 
                      : 'drop-shadow(0 12px 24px rgba(0,0,0,0.3))' 
                  }}
                >
                  <Card {...g.activeCardData} id={`overlay-${g.activeId}`} isDraggable={false} />
                </motion.div>
              )}
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
};

export default MobileGamePage;
