import type { GameState } from './gameStoreTypes';
import type { GameCard, GameMode, AIDifficulty, TurnResult } from '../../types/game';
import type { MatchRecord } from '../../types/history.types';
import { TURN_INFO } from '../../types/game';
import { buildDeck, smartDraw, makeCard, HAND_SIZE } from '../../core/game/deckLogic';
import { getAIPlay, validatePlay, evaluatePlay } from '../../core/game/matchEngine';
import { ScoringPipeline } from '../../engine/ScoringPipeline';
import { LogicScoringPipeline } from '../../engine/LogicScoringPipeline';
import { usePlayerStore } from '../playerStore';
import { useHistoryStore } from '../historyStore';
import { useAuthStore } from '../authStore';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { EMPTY_SLOTS } from '../gameStore';

import type { StoreApi } from 'zustand';


export const createGameMatchSlice = (
  set: StoreApi<GameState>['setState'],
  get: () => GameState
) => ({
  isTutorial: false,
  tutorialStep: 0,
  tutorialId: null,
  isTutorialPaused: false,

  startGame: (mode: GameMode, difficulty: AIDifficulty = 'medium', isTutorial: boolean = false) => {
    const collection = usePlayerStore.getState().collection;
    
    let aiDiff: AIDifficulty = difficulty;
    let theme: string | undefined = undefined;
    let stageId: number | undefined = undefined;

    if (mode === 'campaign') {
      stageId = get().currentStageId || 1;
      const stage = get().stages.find(s => s.id === stageId);
      if (stage) {
        aiDiff = stage.type === 'boss' ? 'boss' : difficulty;
        theme = stage.theme;
      }
    }

    const p1Deck = buildDeck('p', collection, difficulty, mode, theme, stageId);
    const p2Deck = (mode === 'pass_play' && !isTutorial) 
      ? buildDeck('p', collection, difficulty, mode, theme, stageId) 
      : buildDeck('ai', undefined, aiDiff, mode, theme, stageId);
    
    set({
      phase: 'player1_placing',
      gameMode: mode,
      difficulty,
      isTutorial,
      tutorialId: isTutorial ? 'battle' : null,
      tutorialStep: 0,
      activePlayer: 1,
      currentTurn: 1,
      player1Hand: p1Deck.slice(0, HAND_SIZE),
      player1Reserve: p1Deck.slice(HAND_SIZE),
      player2Hand: p2Deck.slice(0, HAND_SIZE),
      player2Reserve: p2Deck.slice(HAND_SIZE),
      player1Score: 0,
      player2Score: 0,
      player1Slots: [...EMPTY_SLOTS],
      player2Slots: [...EMPTY_SLOTS],
      history: [],
      lastResult: null,
      lastBattleEvents: [],
      player1PoolPoints: 0,
      player2PoolPoints: 0,
      player1ActiveBonuses: 0,
      player2ActiveBonuses: 0,
      timeLeft: isTutorial ? 999 : 60,
      hasUsedWildcard: false,
      hasUsedMulligan: false,
      skillMode: 'none',
      pendingWildcard: null,
      mulliganSelection: [],
      isScreenHidden: false,
      lastMatchRewards: null,
      usedCards: [],
    });
  },

  submitTurn: (isTimeout?: boolean) => {
    const state = get();
    if (state.phase !== 'player1_placing' && state.phase !== 'player2_placing') return;
    
    const turn = state.currentTurn;
    const slotsCount = TURN_INFO[turn - 1].slotsCount;
    
    const handKey = state.activePlayer === 1 ? 'player1Hand' : 'player2Hand';
    const slotsKey = state.activePlayer === 1 ? 'player1Slots' : 'player2Slots';
    
    let activeSlots = [...state[slotsKey]];
    const hand = [...state[handKey]];

    // --- NEW PRECISE WITHDRAWAL LOGIC ---
    if (isTimeout) {
      let numReq = 0;
      let opReq = 0;
      
      if (turn === 1) { numReq = 1; opReq = 0; }
      else if (turn === 2) { numReq = 2; opReq = 0; }
      else if (turn === 3) { numReq = 2; opReq = 1; }
      else if (turn === 4) { numReq = 3; opReq = 1; }
      else if (turn === 5) { numReq = 3; opReq = 2; }
      else if (turn === 6) { numReq = 4; opReq = 2; }

      const withdrawnCards: GameCard[] = [];

      const consume = (type: 'number' | 'operator') => {
        const slotIdx = activeSlots.findIndex(s => s?.type === type);
        if (slotIdx !== -1) {
          const card = activeSlots[slotIdx]!;
          activeSlots[slotIdx] = null;
          return card;
        }
        const handIdx = hand.findIndex(c => c.type === type);
        if (handIdx !== -1) {
          return hand.splice(handIdx, 1)[0];
        }
        return null;
      };

      for (let i = 0; i < numReq; i++) {
        const c = consume('number');
        if (c) withdrawnCards.push(c);
      }
      for (let i = 0; i < opReq; i++) {
        const c = consume('operator');
        if (c) withdrawnCards.push(c);
      }

      // Return any unconsumed cards from the arena back to the hand
      activeSlots.forEach(c => {
        if (c !== null) {
          hand.push(c);
        }
      });

      activeSlots = [...EMPTY_SLOTS];
      withdrawnCards.forEach((c, i) => { activeSlots[i] = c; });

      // Update local hand for immediate use in the rest of the function
      set({ [handKey]: hand, [slotsKey]: activeSlots } as Partial<GameState>);
    }

    const { valid } = validatePlay(activeSlots, turn);
    if (!valid && !isTimeout) return;

    // Use placeholder card for engine if somehow slots are empty after timeout (rare)
    const finalSlots = activeSlots.slice(0, slotsCount).map(s => s || makeCard('0', 'number', 'normal', 'timeout'));
    const playedCards = finalSlots.filter(Boolean) as GameCard[];

    if (Capacitor.isNativePlatform()) {
      Haptics.impact({ style: ImpactStyle.Medium });
    }

    if (state.gameMode === 'pass_play' && !state.isTutorial) {
      if (state.activePlayer === 1) {
        const newUsedCards = [...state.usedCards];
        playedCards.forEach(c => {
          const key = `${c.type}_${c.value}_${c.rarity}`;
          if (c.id?.startsWith('p_') && !newUsedCards.includes(key)) newUsedCards.push(key);
        });

        set({
          activePlayer: 2,
          phase: 'player2_placing',
          isScreenHidden: true,
          timeLeft: 60,
          usedCards: newUsedCards,
        });
      } else {
        // Player 2 submitting
        const p1Cards = state.player1Slots.filter(Boolean) as GameCard[];
        const p2Cards = playedCards;
        
        // --- NEW ENGINE INTEGRATION (Pass & Play) ---
        const pipeline = new ScoringPipeline();
        const engineResult = pipeline.calculate({
          player1: { 
            cards: p1Cards, 
            poolPoints: state.player1PoolPoints, 
            activeBonuses: state.player1ActiveBonuses 
          },
          player2: { 
            cards: p2Cards, 
            poolPoints: state.player2PoolPoints, 
            activeBonuses: state.player2ActiveBonuses 
          },
          turn: turn
        });

        const nextP1Pool = engineResult.events.find(e => e.type === 'POOL_TRANSFER' && e.targetPlayer === 'player1')?.valueTo as number || 0;
        const nextP2Pool = engineResult.events.find(e => e.type === 'POOL_TRANSFER' && e.targetPlayer === 'player2')?.valueTo as number || 0;

        const result: TurnResult = {
          turn,
          playerCards: p1Cards,
          playerExpression: evaluatePlay(p1Cards, turn).expression,
          playerValue: engineResult.player1Details.baseValue,
          playerLogicScore: engineResult.player1Details.logicScore,
          playerTacticalScore: engineResult.player1Details.bonusScore,
          aiCards: p2Cards,
          aiExpression: evaluatePlay(p2Cards, turn).expression,
          aiValue: engineResult.player2Details.baseValue,
          aiLogicScore: engineResult.player2Details.logicScore,
          aiTacticalScore: engineResult.player2Details.bonusScore,
          winner: engineResult.winner === 'player1' ? 'player' : engineResult.winner === 'player2' ? 'ai' : 'tie',
          playerPointsEarned: engineResult.player1Score,
          aiPointsEarned: engineResult.player2Score,
          events: engineResult.events,
          attacker: engineResult.winner === 'player1' ? 'player' : engineResult.winner === 'player2' ? 'ai' : null
        };
        
        const drawCount = turn < 5 ? turn : turn + 1;

        const [newP1Hand, newP1Res] = (turn < 6) 
            ? smartDraw(state.player1Hand.filter(c => !p1Cards.some(p => p.id === c.id)), state.player1Reserve, drawCount, turn) 
            : [state.player1Hand.filter(c => !p1Cards.some(p => p.id === c.id)), state.player1Reserve];
        
        const [newP2Hand, newP2Res] = (turn < 6)
            ? smartDraw(hand.filter(c => !p2Cards.some(p => p.id === c.id)), state.player2Reserve, drawCount, turn)
            : [hand.filter(c => !p2Cards.some(p => p.id === c.id)), state.player2Reserve];

        const newUsedCards = [...state.usedCards];
        p2Cards.forEach(c => {
          const key = `${c.type}_${c.value}_${c.rarity}`;
          // In pass_play, both players share the collection, so we track both
          if (c.id?.startsWith('p_') && !newUsedCards.includes(key)) newUsedCards.push(key);
        });

        const newP1Score = state.player1Score + engineResult.player1Score;
        const newP2Score = state.player2Score + engineResult.player2Score;

        set({
          phase: 'round_result',
          player1Hand: newP1Hand,
          player1Reserve: newP1Res,
          player2Hand: newP2Hand,
          player2Reserve: newP2Res,
          player1Score: newP1Score,
          player2Score: newP2Score,
          player1Slots: [...EMPTY_SLOTS],
          player2Slots: [...EMPTY_SLOTS],
          player1PoolPoints: nextP1Pool,
          player2PoolPoints: nextP2Pool,
          player1ActiveBonuses: engineResult.player1NextBonus * 0.5, // Giảm dần theo thời gian
          player2ActiveBonuses: engineResult.player2NextBonus * 0.5,
          lastBattleEvents: engineResult.events.slice(-10), // [PERF] Limit to last 10 events to prevent memory bloating
          history: [...state.history, result],
          lastResult: result,
          activePlayer: 1,
          usedCards: newUsedCards,
        });

        if (turn === 6) {
          const finalWinner = newP1Score > newP2Score ? 'player' : newP1Score < newP2Score ? 'ai' : 'tie';
          const rewards = usePlayerStore.getState().processMatchResult(finalWinner, newUsedCards);
          set({ lastMatchRewards: rewards });
          useHistoryStore.getState().addMatch(createMatchRecord(state, newP1Score, newP2Score, finalWinner, [...state.history, result]));
        }
      }
    } else {
      // vs AI mode / Campaign mode
      let targetScore = 0;
      let aiDiff: AIDifficulty | 'boss' = state.difficulty;

      if (state.gameMode === 'campaign') {
        const stage = state.stages.find(s => s.id === state.currentStageId);
        if (stage) {
          targetScore = stage.targetScore;
          aiDiff = stage.type === 'boss' ? 'boss' : state.difficulty;
        }
      }

      const aiPlay = state.isTutorial 
        ? state.player2Hand.filter(c => c.type === 'number').sort((a,b) => Number(a.value) - Number(b.value)).slice(0, slotsCount)
        : getAIPlay(state.player2Hand, turn, aiDiff, targetScore);

      // --- NEW ENGINE INTEGRATION (VS AI / Campaign) ---
      const pipeline = state.gameMode === 'logic' ? new LogicScoringPipeline() : new ScoringPipeline();
      const engineResult = pipeline.calculate({
        player1: { 
          cards: playedCards, 
          poolPoints: state.player1PoolPoints, 
          activeBonuses: state.player1ActiveBonuses 
        },
        player2: { 
          cards: aiPlay, 
          poolPoints: state.player2PoolPoints, 
          activeBonuses: state.player2ActiveBonuses 
        },
        turn: turn
      });

      const result: TurnResult = {
        turn,
        playerCards: playedCards,
        playerExpression: evaluatePlay(playedCards, turn).expression,
        playerValue: engineResult.player1Details.baseValue,
        playerLogicScore: engineResult.player1Details.logicScore,
        playerTacticalScore: engineResult.player1Details.bonusScore,
        aiCards: aiPlay,
        aiExpression: evaluatePlay(aiPlay, turn).expression,
        aiValue: engineResult.player2Details.baseValue,
        aiLogicScore: engineResult.player2Details.logicScore,
        aiTacticalScore: engineResult.player2Details.bonusScore,
        winner: engineResult.winner === 'player1' ? 'player' : engineResult.winner === 'player2' ? 'ai' : 'tie',
        playerPointsEarned: engineResult.player1Score,
        aiPointsEarned: engineResult.player2Score,
        events: engineResult.events,
        attacker: engineResult.winner === 'player1' ? 'player' : engineResult.winner === 'player2' ? 'ai' : null
      };

      set({
        phase: 'round_result',
        player1Slots: finalSlots,
        player2Slots: aiPlay,
        player1ActiveBonuses: engineResult.player1NextBonus * 0.5,
        player2ActiveBonuses: engineResult.player2NextBonus * 0.5,
        lastBattleEvents: engineResult.events.slice(-10), // [PERF] Limit to last 10 events
        lastResult: result,
        tutorialStep: state.isTutorial ? state.tutorialStep + 1 : 0
      });
    }
  },

  nextTurn: () => {
    const state = get();
    if (state.phase !== 'round_result' || !state.lastResult) return;

    const result = state.lastResult;
    const turn = state.currentTurn;
    const p1Cards = state.player1Slots.filter(Boolean) as GameCard[];
    const p2Cards = state.player2Slots.filter(Boolean) as GameCard[];

    const newPlayer1Score = state.player1Score + result.playerPointsEarned;
    const newPlayer2Score = state.player2Score + result.aiPointsEarned;

    const drawCount = turn < 5 ? turn : turn + 1;
    const [newP1Hand, newP1Res] = (turn < 6) 
        ? smartDraw(state.player1Hand.filter(c => !p1Cards.some(p => p.id === c.id)), state.player1Reserve, drawCount, turn) 
        : [state.player1Hand.filter(c => !p1Cards.some(p => p.id === c.id)), state.player1Reserve];
    
    const [newP2Hand, newP2Res] = (turn < 6)
        ? smartDraw(state.player2Hand.filter(c => !p2Cards.some(a => a.id === c.id)), state.player2Reserve, drawCount, turn)
        : [state.player2Hand.filter(c => !p2Cards.some(a => a.id === c.id)), state.player2Reserve];

    const newUsedCards = [...state.usedCards];
    [...p1Cards, ...p2Cards].forEach(c => {
       const key = `${c.type}_${c.value}_${c.rarity}`;
       if (c.id?.startsWith('p_') && !newUsedCards.includes(key)) newUsedCards.push(key);
    });

    const nextP1Pool = result.events.find(e => e.type === 'POOL_TRANSFER' && e.targetPlayer === 'player1' && e.sourceCardId)?.valueTo as number || 0;
    const nextP2Pool = result.events.find(e => e.type === 'POOL_TRANSFER' && e.targetPlayer === 'player2' && e.sourceCardId)?.valueTo as number || 0;

    if (turn >= 6) {
      const finalWinner = newPlayer1Score > newPlayer2Score ? 'player' : newPlayer1Score < newPlayer2Score ? 'ai' : 'tie';
      
      if (state.gameMode === 'campaign' && state.currentStageId) {
        const diff = newPlayer1Score - newPlayer2Score;
        const stars = finalWinner === 'player' ? (diff >= 1000 ? 3 : diff >= 500 ? 2 : 1) : 0;
        const stage = state.stages.find(s => s.id === state.currentStageId);
        
        // Lấy progress từ playerStore để đảm bảo tính nhất quán
        const playerStore = usePlayerStore.getState();
        const currentProgress = playerStore.progress[state.currentStageId] || { stars: 0 };
        
        if (stage) {
          const res = playerStore.processCampaignResult(
            state.currentStageId, 
            stars, 
            currentProgress.stars, 
            stage.rewards.gold, 
            stage.rewards.gems, 
            stage.rewards.packType, 
            newUsedCards
          );
          
          // Cập nhật tiến độ vào playerStore (nơi có Persist)
          playerStore.updateProgress(state.currentStageId, Math.max(stars, currentProgress.stars), newPlayer1Score);
          
          set({ lastMatchRewards: { coins: res.coins, gems: res.gems, xp: 100, elo: 0, streak: 0, stars, pack: res.pack, cards: res.cards } });
        }
      } else {
        set({ lastMatchRewards: usePlayerStore.getState().processMatchResult(finalWinner, newUsedCards) });
      }

      if (state.isTutorial) {
        useAuthStore.getState().completeTutorial();
        usePlayerStore.getState().addCoins(500);
      }

      set({
        phase: 'game_over',
        player1Score: newPlayer1Score,
        player2Score: newPlayer2Score,
        history: [...state.history, result],
        usedCards: newUsedCards,
        isProcessing: false
      });
    } else {
      set({
        phase: 'player1_placing',
        currentTurn: turn + 1,
        activePlayer: 1,
        player1Hand: newP1Hand,
        player1Reserve: newP1Res,
        player2Hand: newP2Hand,
        player2Reserve: newP2Res,
        player1Score: newPlayer1Score,
        player2Score: newPlayer2Score,
        player1Slots: [...EMPTY_SLOTS],
        player2Slots: [...EMPTY_SLOTS],
        player1PoolPoints: nextP1Pool,
        player2PoolPoints: nextP2Pool,
        history: [...state.history, result],
        usedCards: newUsedCards,
        timeLeft: state.isTutorial ? 999 : 60,
        isScreenHidden: state.gameMode === 'pass_play',
        hasUsedWildcard: false,
        hasUsedMulligan: false,
        skillMode: 'none',
        pendingWildcard: null,
        mulliganSelection: [],
        isProcessing: false
      });
    }
  },

  playAgain: () => {
    const state = get();
    set({ isProcessing: false });
    get().startGame(state.gameMode, state.difficulty, state.isTutorial);
  },

  tickTimer: () => {
    const state = get();
    if (state.isTutorial && state.isTutorialPaused) return;
    if (state.isTutorial && state.currentTurn === 1) return; // Legacy tutorial logic, can keep or remove
    if (state.phase !== 'player1_placing' && state.phase !== 'player2_placing') return;
    const newTime = state.timeLeft - 1;
    if (newTime < 0) {
      set({ timeLeft: 0 });
    } else {
      set({ timeLeft: newTime });
    }
  },

  surrenderGame: () => {
    set({ phase: 'start_screen' });
  },

  setTutorialStep: (step: number) => set({ tutorialStep: step }),
  setIsTutorial: (val: boolean) => set((state) => ({ 
    isTutorial: val,
    isProcessing: val ? state.isProcessing : false,
    skillMode: val ? state.skillMode : 'none',
    timeLeft: (state.isTutorial && !val && state.timeLeft > 60) ? 60 : state.timeLeft
  })),
  setTutorialId: (id: 'home' | 'battle' | null) => set({ tutorialId: id }),
  setTutorialPaused: (paused: boolean) => set({ isTutorialPaused: paused }),
  setProcessing: (val: boolean) => set({ isProcessing: val }),
  sendEmote: (player: 1 | 2, emoteId: string) => set({ activeEmote: { player, id: emoteId } }),
});

function createMatchRecord(state: GameState, p1Score: number, p2Score: number, winner: 'player' | 'ai' | 'tie', history: TurnResult[]): MatchRecord {
    return {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        mode: state.gameMode,
        difficulty: state.difficulty,
        player1: {
            name: useAuthStore.getState().user?.name || 'Bạn',
            avatar: useAuthStore.getState().user?.avatar || '👤',
            score: p1Score,
        },
        player2: {
            name: (state.gameMode === 'pass_play' && !state.isTutorial) ? 'Người chơi 2' : 'Máy (AI)',
            avatar: (state.gameMode === 'pass_play' && !state.isTutorial) ? '👤' : '🤖',
            score: p2Score,
            isAI: !(state.gameMode === 'pass_play' && !state.isTutorial),
        },
        winner: winner === 'player' ? 'player1' : winner === 'ai' ? 'player2' : 'tie',
        turns: history,
        durationSeconds: 0,
    };
}
