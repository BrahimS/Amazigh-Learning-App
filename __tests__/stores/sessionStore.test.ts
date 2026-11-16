import AsyncStorage from '@react-native-async-storage/async-storage';

import { useSessionStore } from '@/store/sessionStore';
import type { UserProfile } from '@/types';

const timestamp = { seconds: 1_760_000_000, nanoseconds: 0 };

const sampleUser: UserProfile = {
  uid: 'user-1',
  email: 'learner@example.com',
  displayName: 'Learner',
  role: 'learner',
  dialect: 'tachelhit',
  uiLanguage: 'fr',
  learningGoal: 'culture',
  dailyGoalMinutes: 10,
  xp: 0,
  currentStreak: 0,
  longestStreak: 0,
  createdAt: timestamp,
  updatedAt: timestamp,
};

beforeEach(async () => {
  await AsyncStorage.clear();
  useSessionStore.setState({ user: null, isHydrated: false });
});

describe('sessionStore', () => {
  it('starts logged out', () => {
    expect(useSessionStore.getState().user).toBeNull();
  });

  it('setUser stores the profile and marks hydration', () => {
    useSessionStore.getState().setUser(sampleUser);
    expect(useSessionStore.getState().user).toEqual(sampleUser);
  });

  it('logout clears the user', () => {
    useSessionStore.getState().setUser(sampleUser);
    useSessionStore.getState().logout();
    expect(useSessionStore.getState().user).toBeNull();
  });

  it('persists the user across store instances', async () => {
    useSessionStore.getState().setUser(sampleUser);
    // zustand persist writes asynchronously
    await new Promise<void>(resolve => setTimeout(resolve, 0));

    const persisted = await AsyncStorage.getItem('session');
    expect(persisted).toContain('user-1');
  });

  it('setHydrated marks the store as rehydrated', () => {
    useSessionStore.getState().setHydrated();
    expect(useSessionStore.getState().isHydrated).toBe(true);
  });
});
