import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import type { UserProfile } from '../types/auth.types';
import { capacitorStorage } from './capacitorStorage';
import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  /** true khi đã đăng nhập qua Supabase (có server sync) */
  isOnlineMode: boolean;
  /** Supabase session token */
  accessToken: string | null;
  /** Trạng thái đang xử lý auth */
  isLoading: boolean;

  // === Actions — Offline (giữ nguyên) ===
  enterName: (name: string, avatar: string) => void;
  logout: () => void;
  updateProfile: (name: string, avatar: string) => void;
  completeTutorial: () => void;

  // === Actions — Online (Sprint 1) ===
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, password: string, username: string) => Promise<{ error?: string }>;
  /** Đồng bộ profile từ server */
  syncProfile: () => Promise<void>;
  /** Khởi tạo auth listener */
  initAuthListener: () => () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isOnlineMode: false,
      accessToken: null,
      isLoading: false,

      // ─── OFFLINE MODE (giữ nguyên logic cũ) ────────────
      enterName: (name, avatar) => {
        const newUser: UserProfile = {
          name,
          avatar,
          joinedAt: new Date().toISOString(),
          hasCompletedTutorial: false,
        };
        set({ user: newUser, isAuthenticated: true, isOnlineMode: false });
      },

      logout: () => {
        const { isOnlineMode } = get();
        if (isOnlineMode && supabase) {
          supabase.auth.signOut();
        }
        import('./playerStore').then(m => m.usePlayerStore.getState().resetAccount());
        set({ user: null, isAuthenticated: false, isOnlineMode: false, accessToken: null });
      },

      updateProfile: (name, avatar) => set((state) => ({
        user: state.user ? { ...state.user, name, avatar } : null
      })),

      completeTutorial: () => set((state) => ({
        user: state.user ? { ...state.user, hasCompletedTutorial: true } : null
      })),

      // ─── ONLINE MODE (Sprint 1 — Supabase Auth) ────────

      signInWithGoogle: async () => {
        if (!supabase) return;
        set({ isLoading: true });
        try {
          await supabase.auth.signInWithOAuth({ provider: 'google' });
        } catch (err) {
          console.error('[Auth] Google sign-in failed:', err);
        } finally {
          set({ isLoading: false });
        }
      },

      signInWithEmail: async (email, password) => {
        if (!supabase) return { error: 'Supabase not configured' };
        set({ isLoading: true });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) return { error: error.message };
          if (!data.session) return { error: 'Login failed — no session' };

          // Thiết lập state ngay lập tức (không chờ onAuthStateChange)
          const token = data.session.access_token;
          const supaUser = data.session.user;
          set({
            accessToken: token,
            isOnlineMode: true,
            isAuthenticated: true,
            user: {
              name: supaUser.user_metadata?.full_name || supaUser.email?.split('@')[0] || 'Player',
              avatar: '🐼',
              joinedAt: supaUser.created_at,
              hasCompletedTutorial: get().user?.hasCompletedTutorial || false,
              supabaseId: supaUser.id,
              email: supaUser.email,
            },
          });

          // Đồng bộ profile từ server
          try {
            const res = await fetch(`${API_URL}/api/auth/register`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                username: supaUser.user_metadata?.full_name || supaUser.email?.split('@')[0] || 'Player',
                avatarEmoji: '🐼',
              }),
            });
            if (res.ok) {
              const { user: serverUser } = await res.json();
              set((state) => ({
                user: state.user ? {
                  ...state.user,
                  id: serverUser.id,
                  elo: serverUser.elo,
                  name: serverUser.username || state.user.name,
                } : null,
              }));
            }
          } catch (err) {
            console.error('[Auth] Server sync on login failed:', err);
          }

          return {};
        } finally {
          set({ isLoading: false });
        }
      },

      signUpWithEmail: async (email, password, username) => {
        if (!supabase) return { error: 'Supabase not configured' };
        set({ isLoading: true });
        try {
          const { data, error } = await supabase.auth.signUp({ email, password });
          if (error) return { error: error.message };
          if (!data.session) return { error: 'Check your email for verification' };

          // Đăng ký thành công → tạo profile trên server
          const token = data.session.access_token;
          const supaUser = data.session.user;
          const res = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ username, avatarEmoji: '🐼' }),
          });

          if (!res.ok) {
            const body = await res.json();
            return { error: body.error || 'Registration failed' };
          }

          const { user: serverUser } = await res.json();

          // Thiết lập state ngay lập tức
          set({
            accessToken: token,
            isOnlineMode: true,
            isAuthenticated: true,
            user: {
              name: serverUser.username || username,
              avatar: '🐼',
              joinedAt: supaUser.created_at,
              hasCompletedTutorial: false,
              supabaseId: supaUser.id,
              email: supaUser.email,
              id: serverUser.id,
              elo: serverUser.elo,
            },
          });

          return {};
        } finally {
          set({ isLoading: false });
        }
      },

      syncProfile: async () => {
        const { accessToken } = get();
        if (!accessToken) return;

        try {
          const res = await fetch(`${API_URL}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
          });

          if (!res.ok) return;

          const { user: serverUser } = await res.json();

          set((state) => ({
            user: state.user ? {
              ...state.user,
              id: serverUser.id,
              supabaseId: serverUser.supabaseId,
              elo: serverUser.elo,
            } : null,
          }));
        } catch (err) {
          console.error('[Auth] Sync profile failed:', err);
        }
      },

      initAuthListener: () => {
        if (!supabase) return () => {};

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (session?.user) {
              const token = session.access_token;
              set({
                accessToken: token,
                isOnlineMode: true,
                isAuthenticated: true,
                isLoading: false,
                user: {
                  name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Player',
                  avatar: '🐼',
                  joinedAt: session.user.created_at,
                  hasCompletedTutorial: get().user?.hasCompletedTutorial || false,
                  supabaseId: session.user.id,
                  email: session.user.email,
                },
              });

              // Đăng ký / lấy profile từ server
              try {
                const res = await fetch(`${API_URL}/api/auth/register`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    username: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Player',
                    avatarEmoji: '🐼',
                  }),
                });
                if (res.ok) {
                  const { user: serverUser } = await res.json();
                  set((state) => ({
                    user: state.user ? {
                      ...state.user,
                      id: serverUser.id,
                      elo: serverUser.elo,
                    } : null,
                  }));
                }
              } catch (err) {
                console.error('[Auth] Server register failed:', err);
              }
            } else if (event === 'SIGNED_OUT') {
              set({ isOnlineMode: false, accessToken: null });
            }
          }
        );

        return () => subscription.unsubscribe();
      },
    }),
    {
      name: 'math-battle-auth-offline',
      storage: createJSONStorage(() => capacitorStorage),
      // Không persist accessToken (security)
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isOnlineMode: state.isOnlineMode,
      }),
    }
  )
);
