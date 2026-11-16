import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { DialectId, LearningGoal, UiLanguage } from '@/types';

interface PreferencesState {
  dialect: DialectId;
  uiLanguage: UiLanguage;
  learningGoal: LearningGoal | null;
  dailyGoalMinutes: number;
  hasCompletedOnboarding: boolean;
  setDialect: (dialect: DialectId) => void;
  setUiLanguage: (uiLanguage: UiLanguage) => void;
  setLearningGoal: (learningGoal: LearningGoal) => void;
  setDailyGoalMinutes: (minutes: number) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    set => ({
      dialect: 'tachelhit',
      uiLanguage: 'fr',
      learningGoal: null,
      dailyGoalMinutes: 10,
      hasCompletedOnboarding: false,
      setDialect: dialect => set({ dialect }),
      setUiLanguage: uiLanguage => set({ uiLanguage }),
      setLearningGoal: learningGoal => set({ learningGoal }),
      setDailyGoalMinutes: dailyGoalMinutes => set({ dailyGoalMinutes }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      resetOnboarding: () => set({ hasCompletedOnboarding: false }),
    }),
    {
      name: 'preferences',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
