import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MatchRecord, PlayerStats } from '../types/history.types';

interface HistoryState {
  matches: MatchRecord[];
  stats: PlayerStats;
  addMatch: (match: MatchRecord) => void;
  clearHistory: () => void;
}

const initialStats: PlayerStats = {
  totalGames: 0,
  wins: 0,
  losses: 0,
  ties: 0,
  winRate: 0,
  highestScore: 0,
  favoriteMode: null,
  longestWinStreak: 0,
  currentWinStreak: 0,
};

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      matches: [],
      stats: initialStats,

      addMatch: (match) => {
        const { matches, stats } = get();
        const newMatches = [match, ...matches].slice(0, 50); // Keep last 50
        
        const isWin = match.winner === 'player1';
        const isLoss = match.winner === 'player2';
        const isTie = match.winner === 'tie';

        const newWins = stats.wins + (isWin ? 1 : 0);
        const newTotal = stats.totalGames + 1;
        const newCurrentStreak = isWin ? stats.currentWinStreak + 1 : 0;

        const newStats: PlayerStats = {
          ...stats,
          totalGames: newTotal,
          wins: newWins,
          losses: stats.losses + (isLoss ? 1 : 0),
          ties: stats.ties + (isTie ? 1 : 0),
          winRate: (newWins / newTotal) * 100,
          highestScore: Math.max(stats.highestScore, match.player1.score),
          currentWinStreak: newCurrentStreak,
          longestWinStreak: Math.max(stats.longestWinStreak, newCurrentStreak),
        };

        set({ matches: newMatches, stats: newStats });
      },

      clearHistory: () => set({ matches: [], stats: initialStats }),
    }),
    {
      name: 'math-battle-history',
    }
  )
);
