import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { UserProfile } from '@/types';

interface SessionState {
  user: UserProfile | null;
  /** False until persisted state has been rehydrated (avoids auth flicker). */
  isHydrated: boolean;
  setUser: (user: UserProfile | null) => void;
  logout: () => void;
  setHydrated: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    set => ({
      user: null,
      isHydrated: false,
      setUser: user => set({ user }),
      logout: () => set({ user: null }),
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'session',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({ user: state.user }),
      onRehydrateStorage: () => state => {
        state?.setHydrated();
      },
    },
  ),
);
