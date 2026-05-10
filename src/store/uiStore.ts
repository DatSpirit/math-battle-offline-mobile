import { create } from 'zustand';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface ConfirmOptions {
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface UIState {
  notifications: Notification[];
  confirm: ConfirmOptions | null;
  showNotification: (message: string, type?: NotificationType) => void;
  removeNotification: (id: string) => void;
  showConfirm: (message: string, onConfirm: () => void, onCancel?: () => void) => void;
  closeConfirm: () => void;
  isLoading: boolean;
  loadingProgress: number;
  appInitialized: boolean;
  setIsLoading: (loading: boolean) => void;
  setLoadingProgress: (progress: number) => void;
  setAppInitialized: (initialized: boolean) => void;
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  notifications: [],
  confirm: null,
  showNotification: (message, type = 'info') => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({
      notifications: [...state.notifications, { id, message, type }],
    }));

    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    }, 4000);
  },
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  showConfirm: (message, onConfirm, onCancel) => {
    set({ confirm: { message, onConfirm, onCancel } });
  },
  closeConfirm: () => set({ confirm: null }),
  isLoading: false,
  loadingProgress: 0,
  appInitialized: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  setLoadingProgress: (progress) => set({ loadingProgress: progress }),
  setAppInitialized: (initialized) => set({ appInitialized: initialized }),
  isProfileOpen: false,
  setIsProfileOpen: (open) => set({ isProfileOpen: open }),
}));
