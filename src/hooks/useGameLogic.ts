import { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useSensor, useSensors, MouseSensor, TouchSensor } from '@dnd-kit/core';
import { usePerformance } from './usePerformance';
import { useGameStore } from '../store/gameStore';
import { usePlayerStore } from '../store/playerStore';
import { useMathParser } from './useMathParser';
import { useSound } from './useSound';
import { useJuice } from './useJuice';
import { validatePlay } from '../core/game/matchEngine';
import type { GameMode, AIDifficulty, GameCard, PlayerRole } from '../types/game';
import { TURN_INFO } from '../types/game';

import { useVisibility } from './useVisibility';

export const useGameLogic = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isEco } = usePerformance();
  const isVisible = useVisibility();

  const phase = useGameStore(s => s.phase);
  const currentTurn = useGameStore(s => s.currentTurn);
  const timeLeft = useGameStore(s => s.timeLeft);
  const player1Score = useGameStore(s => s.player1Score);
  const player2Score = useGameStore(s => s.player2Score);
  const player1Hand = useGameStore(s => s.player1Hand);
  const player2Hand = useGameStore(s => s.player2Hand);
  const player1Slots = useGameStore(s => s.player1Slots);
  const player2Slots = useGameStore(s => s.player2Slots);
  const history = useGameStore(s => s.history);
  const lastResult = useGameStore(s => s.lastResult);
  const skillMode = useGameStore(s => s.skillMode);
  const hasUsedMulligan = useGameStore(s => s.hasUsedMulligan);
  const hasUsedWildcard = useGameStore(s => s.hasUsedWildcard);
  const mulliganSelection = useGameStore(s => s.mulliganSelection);
  const pendingWildcard = useGameStore(s => s.pendingWildcard);
  const gameMode = useGameStore(s => s.gameMode);
  const activePlayer = useGameStore(s => s.activePlayer);
  const isScreenHidden = useGameStore(s => s.isScreenHidden);
  const isTutorial = useGameStore(s => s.isTutorial);
  const tutorialStep = useGameStore(s => s.tutorialStep);
  const difficulty = useGameStore(s => s.difficulty);
  const isProcessing = useGameStore(s => s.isProcessing);
  const activeEmote = useGameStore(s => s.activeEmote);
  const currentStageId = useGameStore(s => s.currentStageId);
  const lastBattleEvents = useGameStore(s => s.lastBattleEvents);

  const startGameStore = useGameStore(s => s.startGame);
  const tickTimer = useGameStore(s => s.tickTimer);
  const submitTurn = useGameStore(s => s.submitTurn);
  const nextTurn = useGameStore(s => s.nextTurn);
  const placeCard = useGameStore(s => s.placeCard);
  const moveCardBetweenSlots = useGameStore(s => s.moveCardBetweenSlots);
  const removeCard = useGameStore(s => s.removeCard);
  const activateMulligan = useGameStore(s => s.activateMulligan);
  const activateWildcard = useGameStore(s => s.activateWildcard);
  const confirmMulligan = useGameStore(s => s.confirmMulligan);
  const confirmWildcard = useGameStore(s => s.confirmWildcard);
  const cancelSkill = useGameStore(s => s.cancelSkill);
  const toggleSkillCard = useGameStore(s => s.toggleSkillCard);
  const surrenderGame = useGameStore(s => s.surrenderGame);
  const playAgain = useGameStore(s => s.playAgain);
  const setScreenHidden = useGameStore(s => s.setScreenHidden);
  const setTutorialStep = useGameStore(s => s.setTutorialStep);
  const setProcessing = useGameStore(s => s.setProcessing);
  const sendEmote = useGameStore(s => s.sendEmote);

  const updateQuestProgress = usePlayerStore(s => s.updateQuestProgress);
  const incrementConsecutiveSuccess = usePlayerStore(s => s.incrementConsecutiveSuccess);
  const resetConsecutiveSuccess = usePlayerStore(s => s.resetConsecutiveSuccess);
  const addCoins = usePlayerStore(s => s.addCoins);
  const { playSound, stopSound, stopBGM } = useSound();
  const { triggerShake, shakeIntensity } = useJuice();

  const [activePoints, setActivePoints] = useState<{ id: number; pts: number; x: number; y: number }[]>([]);
  const [showParticles, setShowParticles] = useState(false);
  const [inspectedCard, setInspectedCard] = useState<GameCard | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [currentEventIndex, setCurrentEventIndex] = useState(-1);
  const [displayP1Score, setDisplayP1Score] = useState(player1Score);
  const [displayP2Score, setDisplayP2Score] = useState(player2Score);
  const [isAnimatingEvents, setIsAnimatingEvents] = useState(false);
  const [battleCountdown, setBattleCountdown] = useState<number | null>(null);

  // Live Scoring Orbs during event animations
  const [orbP1Score, setOrbP1Score] = useState<number | null>(null);
  const [orbP2Score, setOrbP2Score] = useState<number | null>(null);
  const [orbP1Delta, setOrbP1Delta] = useState<{ id: number, val: number } | null>(null);
  const [orbP2Delta, setOrbP2Delta] = useState<{ id: number, val: number } | null>(null);

  /** ID của thẻ bài đang phát sáng (đang thi triển kỹ năng hoặc bị tác động) */
  const glowingCardId = useMemo(() => {
    if (!isAnimatingEvents || currentEventIndex === -1 || !lastBattleEvents[currentEventIndex]) return null;
    return lastBattleEvents[currentEventIndex].sourceCardId || lastBattleEvents[currentEventIndex].targetCardId || null;
  }, [isAnimatingEvents, currentEventIndex, lastBattleEvents]);

  const processedRoundRef = useRef<number>(-1);
  const processedGameOverRef = useRef<boolean>(false);
  const isSubmittingRef = useRef(false);
  const isAnimatingRef = useRef(false); // Ref để chặn lặp tức thì
  
  // Refs for cleanup
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const orbIdCounter = useRef(0);

  const addTimer = (t: ReturnType<typeof setTimeout>) => {
    timersRef.current.push(t);
  };

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  }, []);

  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  // Auto-start game based on location state if needed
  useEffect(() => {
    if (phase === 'start_screen' && location.state) {
      const { mode, difficulty: diff, isTutorial: tutorialFlag } = location.state as { mode: GameMode; difficulty?: AIDifficulty; isTutorial?: boolean };
      startGameStore(mode, diff || 'medium', tutorialFlag || false);
      
      // Welcome Emote from AI
      if (mode === 'vs_ai') {
        addTimer(setTimeout(() => sendEmote(2, 'hello'), 1000));
      }
    }
  }, [phase, location.state, startGameStore, sendEmote]);

  useEffect(() => {
    if (phase === 'player1_placing' || phase === 'player2_placing') {
      if (currentTurn === 1) {
        processedRoundRef.current = -1;
        processedGameOverRef.current = false;
      }
      // Clean reset cho mỗi lượt mới
      setTimeout(() => {
        isAnimatingRef.current = false;
        setCurrentEventIndex(-1);
        setIsAnimatingEvents(false);
        setOrbP1Score(null);
        setOrbP2Score(null);
        setOrbP1Delta(null);
        setOrbP2Delta(null);
        setProcessing(false);
        setShowResultModal(false);
      }, 0);
    }
  }, [phase, currentTurn, isTutorial, setProcessing, clearAllTimers]);

  // Xử lý logic kết quả vòng đấu (Âm thanh, Điểm số, Quest)
  useEffect(() => {
    if (phase === 'round_result' && lastBattleEvents.length > 0 && !isAnimatingEvents && !isAnimatingRef.current && processedRoundRef.current !== currentTurn) {
      processedRoundRef.current = currentTurn;
      isAnimatingRef.current = true;

      // Track Math Progress
      if (lastResult?.playerValue && lastResult.playerValue > 0) {
        updateQuestProgress('d2', 1);
        updateQuestProgress('w1', 1);
        incrementConsecutiveSuccess();

        // Track Card Usage Quests
        const playerCards = lastResult.playerCards || [];
        const opCards = playerCards.filter(c => c.type === 'operator');
        if (opCards.length > 0) {
          updateQuestProgress('w8', opCards.length); // Sử dụng 50 thẻ phép tính (Weekly)
          
          const multDivCount = opCards.filter(c => c.value === '*' || c.value === '/').length;
          if (multDivCount > 0) {
            updateQuestProgress('d8', multDivCount); // Sử dụng 5 thẻ Nhân/Chia (Daily)
          }
        }
      } else {
        resetConsecutiveSuccess();
      }
      
      // Bắt đầu đếm ngược 3, 2, 1
      setBattleCountdown(3);
      playSound('timer');
      
      addTimer(setTimeout(() => { setBattleCountdown(2); playSound('timer'); }, 1000));
      addTimer(setTimeout(() => { setBattleCountdown(1); playSound('timer'); }, 2000));
      // Tách riêng các sự kiện khởi tạo (không hiển thị Theater) và các sự kiện kỹ năng (hiển thị Theater)
      const initEvents = lastBattleEvents.filter(e => e.type === 'VALUE_MODIFIED' && e.description.startsWith('Giá trị gốc'));
      const skillEvents = lastBattleEvents.filter(e => !(e.type === 'VALUE_MODIFIED' && e.description.startsWith('Giá trị gốc'))).map(event => {
        // Xác định phía hiển thị NGAY TỪ ĐẦU để tránh bị giật chuyển bên
        let side: PlayerRole = event.targetPlayer || 'player1';
        if (event.sourceCardId) {
          const isP1Card = lastResult?.playerCards.some(c => c.id === event.sourceCardId);
          side = isP1Card ? 'player1' : 'player2';
        }
        return { ...event, displaySide: side };
      });

      addTimer(setTimeout(() => {
        setBattleCountdown(null);
        setIsAnimatingEvents(true);
        setProcessing(true);
        setShowResultModal(false);
        
        // Hiển thị điểm cũ và bắt đầu hiện Orb
        setDisplayP1Score(player1Score);
        setDisplayP2Score(player2Score);
        
        // ÁP DỤNG NGAY các giá trị khởi tạo (Điểm gốc) vào Orb mà không chạy Theater
        let p1Base = 0;
        let p2Base = 0;
        initEvents.forEach(e => {
          if (e.targetPlayer === 'player1') p1Base += (lastResult?.playerValue || 0);
          else p2Base += (lastResult?.aiValue || 0);
        });
        setOrbP1Score(p1Base);
        setOrbP2Score(p2Base);
        
        // Bắt đầu chuỗi sự kiện kỹ năng
        if (skillEvents.length === 0) {
          // Nếu không có kỹ năng nào, kết thúc sớm sau khi hiện điểm gốc
          addTimer(setTimeout(() => {
             setProcessing(false);
             setShowResultModal(true);
             isAnimatingRef.current = false;
             setIsAnimatingEvents(false);
             setDisplayP1Score(player1Score + (lastResult?.playerPointsEarned || 0));
             setDisplayP2Score(player2Score + (lastResult?.aiPointsEarned || 0));
          }, 1500));
        }
      }, 3000));

      // Tính toán delta cho các sự kiện kỹ năng
      const skillDeltas = skillEvents.map(event => {
        let p1Delta = 0, p2Delta = 0;
        const p1SkillEvents = skillEvents.filter(e => e.targetPlayer === 'player1' || (e.displaySide === 'player1'));
        const p2SkillEvents = skillEvents.filter(e => e.targetPlayer === 'player2' || (e.displaySide === 'player2'));

        if (event.targetPlayer === 'player1' || p1SkillEvents.includes(event)) {
          const remainingP1 = p1SkillEvents.length - p1SkillEvents.indexOf(event);
          if (remainingP1 > 0) {
            const p1TotalToDistribute = (lastResult?.playerPointsEarned || 0) - (lastResult?.playerValue || 0);
            p1Delta = Math.ceil(p1TotalToDistribute / remainingP1);
          }
        }
        if (event.targetPlayer === 'player2' || p2SkillEvents.includes(event)) {
          const remainingP2 = p2SkillEvents.length - p2SkillEvents.indexOf(event);
          if (remainingP2 > 0) {
            const p2TotalToDistribute = (lastResult?.aiPointsEarned || 0) - (lastResult?.aiValue || 0);
            p2Delta = Math.ceil(p2TotalToDistribute / remainingP2);
          }
        }
        return { p1Delta, p2Delta };
      });

      let cumulativeDelay = 3500;
      skillEvents.forEach((event, index) => {
        addTimer(setTimeout(() => {
          if (!event) return;
          setCurrentEventIndex(index);
          
          const { p1Delta, p2Delta } = skillDeltas[index];
          if (p1Delta !== 0) {
            orbIdCounter.current++;
            setOrbP1Delta({ id: orbIdCounter.current, val: p1Delta });
            setOrbP1Score(prev => (prev || 0) + p1Delta);
          }
          if (p2Delta !== 0) {
            orbIdCounter.current++;
            setOrbP2Delta({ id: orbIdCounter.current, val: p2Delta });
            setOrbP2Score(prev => (prev || 0) + p2Delta);
          }
          
          // Sound/Shake effects
          if (!isEco) {
            const isSkillType = ['SKILL_ACTIVATED', 'GLOBAL_EFFECT', 'BONUS_APPLIED', 'POOL_TRANSFER'].includes(event.type) || 
                               (event.type === 'VALUE_MODIFIED' && event.sourceCardId);

            if (isSkillType) {
              // Phân loại âm thanh dựa trên mục tiêu và mô tả
              const isAttack = event.targetPlayer && event.targetPlayer !== event.displaySide;
              const isDefense = event.description.toLowerCase().includes('đỡ') || 
                               event.description.toLowerCase().includes('giảm') ||
                               event.description.toLowerCase().includes('chặn') ||
                               event.description.toLowerCase().includes('vô hiệu');
              
              if (isAttack) playSound('attack');
              else if (isDefense) playSound('defense');
              else playSound('skill');
              
              triggerShake(150);
            } else if (event.type === 'MULTIPLIER_HIT') {
               playSound('combo');
               triggerShake(120);
            } else if (event.type === 'NEUTRALIZED') {
               playSound('defense'); // Vô hiệu hóa có thể coi là phòng thủ
               triggerShake(80);
            } else if (event.type === 'TEXT_POPUP' && event.skillName === 'TRỰC GIAO') {
               playSound('defense'); // Tiếng chặn đòn cho Thẻ 4
            }
          } else {
            // Chế độ tiết kiệm: chỉ phát âm thanh cơ bản
            if (event.type === 'SKILL_ACTIVATED') playSound('skill');
            else if (event.type === 'MULTIPLIER_HIT') playSound('combo');
          }

          // Kết thúc chuỗi sự kiện
          if (index === skillEvents.length - 1) {
            addTimer(setTimeout(() => {
              setDisplayP1Score(player1Score + (lastResult?.playerPointsEarned || 0));
              setDisplayP2Score(player2Score + (lastResult?.aiPointsEarned || 0));
              setIsAnimatingEvents(false);
              
              addTimer(setTimeout(() => {
                setOrbP1Score(null);
                setOrbP2Score(null);
                setProcessing(false);
                setShowResultModal(true);
                isAnimatingRef.current = false;
              }, 800));
            }, 1800));
          }
        }, cumulativeDelay));

        const durationMap: Record<string, number> = isEco ? {
          'SKILL_ACTIVATED': 1200, 'MULTIPLIER_HIT': 1500, 'GLOBAL_EFFECT': 1500, 'NEUTRALIZED': 1000, 'POOL_TRANSFER': 800, 'VALUE_MODIFIED': 800
        } : {
          'SKILL_ACTIVATED': 3000, 'MULTIPLIER_HIT': 3500, 'GLOBAL_EFFECT': 4000, 'NEUTRALIZED': 2500, 'POOL_TRANSFER': 2000, 'VALUE_MODIFIED': 1800
        };
        cumulativeDelay += (durationMap[event.type] || 2000) + (isEco ? 400 : 800);
      });

      if (lastBattleEvents.length > 0 && skillEvents.length === 0) {
        // Đã xử lý ở trên
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, lastBattleEvents, lastResult, player1Score, player2Score, playSound, triggerShake, setProcessing, currentTurn, isEco]);

  // Timer logic
  useEffect(() => {
    if ((phase === 'player1_placing' || phase === 'player2_placing') && !isScreenHidden && timeLeft > 0 && !isTutorial && isVisible) {
      if (timeLeft <= 5) playSound('timer');
      const timerId = setInterval(() => tickTimer(), 1000);
      return () => clearInterval(timerId);
    } else if ((phase === 'player1_placing' || phase === 'player2_placing') && !isScreenHidden && timeLeft === 0 && !isSubmittingRef.current && !isTutorial && isVisible) {
      isSubmittingRef.current = true;
      setProcessing(true);
      submitTurn(true);
      addTimer(setTimeout(() => { isSubmittingRef.current = false; }, 2000));
    }
  }, [phase, timeLeft, tickTimer, submitTurn, playSound, isScreenHidden, isTutorial, setProcessing, isVisible]);

  // Game Over logic
  useEffect(() => {
    if (phase === 'game_over' && !processedGameOverRef.current) {
       processedGameOverRef.current = true;
       setProcessing(false); // Game over, no more locking needed for main flow
       stopBGM();
       stopSound('timer');
       
       // Cập nhật tiến độ nhiệm vụ (ID d3: Thắng trận, w2: Thắng tuần)
       if (player1Score > player2Score) {
          updateQuestProgress('d3', 1); // Thắng 3 trận (Daily)
          updateQuestProgress('w2', 1); // Thắng 30 trận (Weekly)
          
          if (difficulty === 'hard' && gameMode === 'vs_ai') {
             updateQuestProgress('d10', 1); // Thắng AI Khó (Daily)
             updateQuestProgress('w11', 1); // Thắng AI Khó (Weekly)
          }
          playSound('win', 0.8);
       } else if (player1Score < player2Score) {
          playSound('loss', 0.8);
          if (gameMode === 'vs_ai') sendEmote(2, 'victory');
       }
    }
  }, [phase, player1Score, player2Score, updateQuestProgress, addCoins, playSound, stopBGM, stopSound, difficulty, gameMode, setProcessing, sendEmote]);

  useEffect(() => {
    if (phase === 'round_result') {
      const clearT = setTimeout(() => setInspectedCard(null), 0);
      addTimer(clearT);
      
      return () => {
        clearTimeout(clearT);
      };
    }
  }, [phase, setInspectedCard]);

  const currentTurnInfo = useMemo(() => TURN_INFO[Math.max(0, Math.min(currentTurn - 1, 5))], [currentTurn]);
  const slotsCount = currentTurnInfo.slotsCount;
  
  const activeSlots = useMemo(() => 
    activePlayer === 1 ? player1Slots.slice(0, slotsCount) : player2Slots.slice(0, slotsCount), 
    [activePlayer, player1Slots, player2Slots, slotsCount]
  );
  
  const activeHand = useMemo(() => 
    activePlayer === 1 ? player1Hand : player2Hand, 
    [activePlayer, player1Hand, player2Hand]
  );



  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 10 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { distance: 10 },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    if (isProcessing) return;
    setActiveId(String(event.active.id));
  }, [isProcessing]);

  const activeCardData = useMemo(() => {
    if (!activeId) return undefined;
    let card = activeHand.find(c => c.id === activeId);
    if (!card) {
      card = activeSlots.find((c): c is GameCard => c?.id === activeId);
    }
    return card;
  }, [activeId, activeHand, activeSlots]);

  const handleCardClick = useCallback((cardId: string) => {
    if (isProcessing) return;
    playSound('click');
    if (skillMode !== 'none') {
      toggleSkillCard(cardId);
    } else {
      const card = activeHand.find(c => c.id === cardId) || activeSlots.find((c): c is GameCard => c?.id === cardId);
      if (card) setInspectedCard(card);
    }
  }, [skillMode, toggleSkillCard, playSound, activeHand, activeSlots, isProcessing]);

  const placedCards = useMemo(() => activeSlots.filter(Boolean), [activeSlots]);
  const placedValues = useMemo(() => placedCards.map(c => c!.value), [placedCards]);
  
  const { result: liveResult, error: mathError } = useMathParser(placedValues, currentTurn);
  const { valid: playValid, message: ruleError } = useMemo(() => validatePlay(activeSlots, currentTurn), [activeSlots, currentTurn]);
  
  const handleCardDoubleClick = useCallback((cardId: string) => {
    if (isProcessing) return;
    
    // Kiểm tra xem thẻ đang ở trên tay hay trên bàn
    const inSlotIdx = activeSlots.findIndex(c => c && c.id === cardId);
    if (inSlotIdx !== -1) {
      // Nếu ở trên bàn -> Thu hồi về tay
      removeCard(inSlotIdx);
      playSound('click');
      return;
    }

    // Nếu ở trên tay -> Đưa lên bàn
    const firstEmptyIndex = activeSlots.findIndex(slot => slot === null);
    if (firstEmptyIndex !== -1) {
      placeCard(cardId, firstEmptyIndex);
      playSound('place');
    }
  }, [activeSlots, placeCard, removeCard, playSound, isProcessing]);

  const lastTapRef = useRef<{ id: string; time: number } | null>(null);

  const handleCardInteraction = useCallback((cardId: string) => {
    if (isProcessing) return;
    const now = Date.now();
    const lastTap = lastTapRef.current;

    if (lastTap && lastTap.id === cardId && (now - lastTap.time) < 300) {
      lastTapRef.current = null;
      handleCardDoubleClick(cardId);
    } else {
      lastTapRef.current = { id: cardId, time: now };
      addTimer(setTimeout(() => {
        if (lastTapRef.current?.id === cardId && lastTapRef.current?.time === now) {
          lastTapRef.current = null;
          handleCardClick(cardId);
        }
      }, 300));
    }
  }, [handleCardClick, handleCardDoubleClick, isProcessing]);

  const displayError = placedCards.length === slotsCount ? (playValid ? mathError : ruleError) : mathError;

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveId(null);
    if (isProcessing) return;
    const { active, over } = event;
    if (!over) return;
    const overId = String(over.id);
    if (overId.startsWith('slot-')) {
      const toIndex = parseInt(overId.split('-')[1]);
      const activeData = active.data.current;
      if (activeData?.sourceSlot !== undefined) {
        moveCardBetweenSlots(activeData.sourceSlot, toIndex);
      } else {
        placeCard(String(active.id), toIndex);
      }
      playSound('place');
    }
  }, [moveCardBetweenSlots, placeCard, playSound, isProcessing]);

  const handleNextStage = useCallback(() => {
    if (gameMode === 'campaign' && currentStageId) {
      const nextId = currentStageId + 1;
      
      // Kiểm tra xem màn chơi tiếp theo có tồn tại không
      const nextStage = useGameStore.getState().stages.find(s => s.id === nextId);
      if (!nextStage) {
        navigate('/campaign');
        return;
      }

      // Cập nhật ID màn chơi vào cả 2 store TRƯỚC khi bắt đầu game
      useGameStore.getState().setCurrentStage(nextId);
      usePlayerStore.getState().setCurrentStage?.(nextId);
      
      // Bắt đầu trận đấu mới
      startGameStore('campaign', 'medium', false);
    }
  }, [gameMode, currentStageId, startGameStore, navigate]);

  const handleGoToMap = useCallback(() => {
    surrenderGame();
    navigate('/campaign');
  }, [surrenderGame, navigate]);

  const handleSubmit = useCallback(() => {
    if (isProcessing) return;
    setProcessing(true);
    submitTurn();
  }, [isProcessing, setProcessing, submitTurn]);

  // LUỒNG DỮ LIỆU TRẢ VỀ CHO UI
  return {
    navigate, sensors, handleDragStart, handleDragEnd, handleCardInteraction, handleCardClick, handleCardDoubleClick,
    phase, currentTurn, timeLeft, player1Score, player2Score, activeHand, player1Slots, player2Slots, activeSlots, history, lastResult,
    skillMode, hasUsedMulligan, hasUsedWildcard, mulliganSelection, pendingWildcard, gameMode, activePlayer, isScreenHidden,
    isTutorial, tutorialStep, difficulty, inspectedCard, activeId, activeCardData, isProcessing, activeEmote, showResultModal,
    startGame: startGameStore, submitTurn: handleSubmit, nextTurn, removeCard, activateMulligan, activateWildcard, confirmMulligan, confirmWildcard, cancelSkill, surrenderGame, playAgain, setScreenHidden, setTutorialStep, setInspectedCard, sendEmote,
    activePoints, showParticles, setActivePoints, setShowParticles, shakeIntensity,
    displayError, liveResult, slotsCount, placedCards, playValid,
    nextStage: handleNextStage, goToMap: handleGoToMap,
    displayP1Score, displayP2Score, currentEventIndex, isAnimatingEvents, lastBattleEvents, glowingCardId,
    battleCountdown,
    orbP1Score, orbP2Score, orbP1Delta, orbP2Delta,
    currentStageId,
  };
};
