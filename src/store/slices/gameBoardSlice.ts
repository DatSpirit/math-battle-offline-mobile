import type { GameState } from './gameStoreTypes';
import { TURN_INFO } from '../../types/game';

import type { StoreApi } from 'zustand';

export const createGameBoardSlice = (
  set: StoreApi<GameState>['setState'],
  get: () => GameState
) => ({
  placeCard: (cardId: string, slotIndex: number) => {
    const state = get();
    if (state.skillMode !== 'none' || state.isProcessing) return;
    const slotsCount = TURN_INFO[state.currentTurn - 1].slotsCount;
    if (slotIndex >= slotsCount) return;

    const handKey = state.activePlayer === 1 ? 'player1Hand' : 'player2Hand';
    const slotsKey = state.activePlayer === 1 ? 'player1Slots' : 'player2Slots';

    const hand = state[handKey];
    const cardIdx = hand.findIndex(c => c.id === cardId);
    if (cardIdx === -1) return;

    const card = hand[cardIdx];
    const newHand = hand.filter(c => c.id !== cardId);
    const newSlots = [...state[slotsKey]];
    const displaced = newSlots[slotIndex];
    if (displaced) newHand.push(displaced);
    newSlots[slotIndex] = card;
    
    set({ [handKey]: newHand, [slotsKey]: newSlots } as Partial<GameState>);
  },

  moveCardBetweenSlots: (fromIndex: number, toIndex: number) => {
    const state = get();
    if (state.skillMode !== 'none' || state.isProcessing) return;
    const slotsCount = TURN_INFO[state.currentTurn - 1].slotsCount;
    if (toIndex >= slotsCount) return;

    const slotsKey = state.activePlayer === 1 ? 'player1Slots' : 'player2Slots';
    const newSlots = [...state[slotsKey]];
    const card = newSlots[fromIndex];
    if (!card) return;

    const displaced = newSlots[toIndex];
    newSlots[toIndex] = card;
    newSlots[fromIndex] = displaced;
    set({ [slotsKey]: newSlots } as Partial<GameState>);
  },

  removeCard: (slotIndex: number) => {
    const state = get();
    if (state.skillMode !== 'none' || state.isProcessing) return;
    
    const handKey = state.activePlayer === 1 ? 'player1Hand' : 'player2Hand';
    const slotsKey = state.activePlayer === 1 ? 'player1Slots' : 'player2Slots';

    const card = state[slotsKey][slotIndex];
    if (!card) return;
    const newSlots = [...state[slotsKey]];
    newSlots[slotIndex] = null;
    set({ [slotsKey]: newSlots, [handKey]: [...state[handKey], card] } as Partial<GameState>);
  },

  setProcessing: (val: boolean) => set({ isProcessing: val }),

  sendEmote: (player: 1 | 2, id: string) => {
    set({ activeEmote: { player, id } });
    setTimeout(() => {
      const current = get().activeEmote;
      if (current?.player === player && current?.id === id) {
        set({ activeEmote: null });
      }
    }, 2500);
  }
});
