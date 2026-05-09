import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import type { UserProfile } from '../types/auth.types';
import { capacitorStorage } from './capacitorStorage';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  
  // Actions
  enterName: (name: string, avatar: string) => void;
  logout: () => void;
  updateProfile: (name: string, avatar: string) => void;
  completeTutorial: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      enterName: (name, avatar) => {
        const newUser: UserProfile = {
          name,
          avatar,
          joinedAt: new Date().toISOString(),
          hasCompletedTutorial: false,
        };
        set({ user: newUser, isAuthenticated: true });
      },

      logout: () => {
        // Reset player progress when logging out to ensure a "new account" experience
        import('./playerStore').then(m => m.usePlayerStore.getState().resetAccount());
        set({ user: null, isAuthenticated: false });
      },

      updateProfile: (name, avatar) => set((state) => ({
        user: state.user ? { ...state.user, name, avatar } : null
      })),

      completeTutorial: () => set((state) => ({
        user: state.user ? { ...state.user, hasCompletedTutorial: true } : null
      })),
    }),
    {
      name: 'math-battle-auth-offline',
      storage: createJSONStorage(() => capacitorStorage),
    }
  )
);

