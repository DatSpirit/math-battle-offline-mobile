import type { GameState } from './gameStoreTypes';
import { smartDraw } from '../../core/game/deckLogic';

import type { StoreApi } from 'zustand';

export const createGameSkillSlice = (
  set: StoreApi<GameState>['setState'],
  get: () => GameState
) => ({
  activateWildcard: () => {
    const state = get();
    if (state.hasUsedWildcard || state.skillMode !== 'none') return;
    const roll = Math.floor(Math.random() * 9) + 1;
    const rarities: ('normal'|'rare'|'super')[] = ['normal','normal','normal','rare','rare','rare','rare','super','super','super'];
    set({ skillMode: 'wildcard_select', pendingWildcard: { cardId: '', newValue: String(roll), newRarity: rarities[roll] } });
  },

  confirmWildcard: () => {
    const state = get();
    if (!state.pendingWildcard || state.pendingWildcard.cardId === '') return;
    const { cardId, ...changes } = state.pendingWildcard;
    
    const handKey = state.activePlayer === 1 ? 'player1Hand' : 'player2Hand';
    const hand = state[handKey];
    
    const newHand = hand.map(c => c.id === cardId ? { ...c, value: changes.newValue, type: 'number' as const, rarity: changes.newRarity } : c);
    
    set({ [handKey]: newHand, skillMode: 'none', pendingWildcard: null, hasUsedWildcard: true } as Partial<GameState>);
  },

  activateMulligan: () => {
    const state = get();
    const slotsKey = state.activePlayer === 1 ? 'player1Slots' : 'player2Slots';
    if (state.hasUsedMulligan || state.skillMode !== 'none' || state[slotsKey].some(Boolean)) return;
    set({ skillMode: 'mulligan_select', mulliganSelection: [] });
  },

  toggleMulliganCard: (cardId: string) => {
    const state = get();
    const handKey = state.activePlayer === 1 ? 'player1Hand' : 'player2Hand';
    const card = state[handKey].find(c => c.id === cardId);
    if (!card || card.type !== 'number') return;
    
    let sel = [...state.mulliganSelection];
    if (sel.includes(cardId)) {
      sel = sel.filter(id => id !== cardId);
    } else if (sel.length < 2) {
      sel.push(cardId);
    }
    set({ mulliganSelection: sel });
  },

  confirmMulligan: () => {
    const state = get();
    if (state.skillMode !== 'mulligan_select' || state.mulliganSelection.length === 0) return;

    const handKey = state.activePlayer === 1 ? 'player1Hand' : 'player2Hand';
    const reserveKey = state.activePlayer === 1 ? 'player1Reserve' : 'player2Reserve';
    
    const hand = state[handKey];
    const reserve = state[reserveKey];

    const newHandItems = hand.filter(c => !state.mulliganSelection.includes(c.id));
    const removed = hand.filter(c => state.mulliganSelection.includes(c.id));
    const newReserve = [...reserve, ...removed];
    const [finalHand, finalReserve] = smartDraw(newHandItems, newReserve, state.mulliganSelection.length, state.currentTurn);
    
    set({ 
      [handKey]: finalHand, 
      [reserveKey]: finalReserve,
      skillMode: 'none', 
      mulliganSelection: [], 
      hasUsedMulligan: true 
    } as Partial<GameState>);
  },

  cancelSkill: () => set({ skillMode: 'none', pendingWildcard: null, mulliganSelection: [] }),
  
  toggleSkillCard: (cardId: string) => {
    const state = get();
    const handKey = state.activePlayer === 1 ? 'player1Hand' : 'player2Hand';
    const card = state[handKey].find(c => c.id === cardId);
    if (!card) return;

    if (state.skillMode === 'wildcard_select') {
      if (card.type !== 'number') return;
      set({ pendingWildcard: { ...state.pendingWildcard!, cardId } });
    } else if (state.skillMode === 'mulligan_select') {
      state.toggleMulliganCard(cardId);
    }
  },
  
  setScreenHidden: (hidden: boolean) => set({ isScreenHidden: hidden })
});
