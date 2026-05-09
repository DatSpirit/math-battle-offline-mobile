import { useState, useCallback } from 'react';

interface PassPlayState {
  player1Name: string;
  player2Name: string;
  currentTurn: 1 | 2;
  isScreenHidden: boolean;
}

export const usePassPlayLogic = () => {
  const [state, setState] = useState<PassPlayState>({
    player1Name: 'Người chơi 1',
    player2Name: 'Người chơi 2',
    currentTurn: 1,
    isScreenHidden: false,
  });

  const setupPlayers = useCallback((p1: string, p2: string) => {
    setState(prev => ({
      ...prev,
      player1Name: p1 || 'Người chơi 1',
      player2Name: p2 || 'Người chơi 2',
    }));
  }, []);

  const switchTurn = useCallback(() => {
    setState(prev => ({
      ...prev,
      isScreenHidden: true,
      currentTurn: prev.currentTurn === 1 ? 2 : 1,
    }));
  }, []);

  const revealScreen = useCallback(() => {
    setState(prev => ({
      ...prev,
      isScreenHidden: false,
    }));
  }, []);

  return {
    ...state,
    setupPlayers,
    switchTurn,
    revealScreen,
  };
};
