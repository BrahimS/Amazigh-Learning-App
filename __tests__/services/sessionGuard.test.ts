import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';

import { getFirebaseAuth } from '@/services/firebase/client';
import {
  initAuthSessionGuard,
  shouldInvalidateSession,
} from '@/services/firebase/sessionGuard';
import { useSessionStore } from '@/store/sessionStore';
import type { UserProfile } from '@/types';

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(() => jest.fn()),
}));

jest.mock('@/services/firebase/client', () => ({
  getFirebaseAuth: jest.fn(() => ({})),
}));

const mockOnAuthStateChanged = onAuthStateChanged as jest.Mock;
const mockGetFirebaseAuth = getFirebaseAuth as jest.Mock;

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
  createdAt: { seconds: 1_760_000_000, nanoseconds: 0 },
  updatedAt: { seconds: 1_760_000_000, nanoseconds: 0 },
};

/** The auth-state callback passed to the last onAuthStateChanged call. */
function lastAuthCallback(): (user: unknown) => void {
  const calls = mockOnAuthStateChanged.mock.calls;
  return calls[calls.length - 1][1] as (user: unknown) => void;
}

beforeEach(async () => {
  await AsyncStorage.clear();
  useSessionStore.setState({ user: null, isHydrated: false });
  jest.clearAllMocks();
});

describe('shouldInvalidateSession', () => {
  it('clears the session only when auth lost its user but the app still has one', () => {
    expect(shouldInvalidateSession(false, true)).toBe(true);
    expect(shouldInvalidateSession(true, true)).toBe(false);
    expect(shouldInvalidateSession(false, false)).toBe(false);
    expect(shouldInvalidateSession(true, false)).toBe(false);
  });
});

describe('initAuthSessionGuard', () => {
  it('returns null when Firebase is not configured', () => {
    mockGetFirebaseAuth.mockImplementationOnce(() => {
      throw new Error('unavailable');
    });
    expect(initAuthSessionGuard()).toBeNull();
    expect(mockOnAuthStateChanged).not.toHaveBeenCalled();
  });

  it('subscribes to auth state changes and returns the unsubscribe function', () => {
    const unsubscribe = jest.fn();
    mockOnAuthStateChanged.mockReturnValueOnce(unsubscribe);

    const stop = initAuthSessionGuard();

    expect(mockOnAuthStateChanged).toHaveBeenCalledTimes(1);
    expect(stop).toBe(unsubscribe);
  });

  it('drops the persisted session when the auth user disappears', () => {
    useSessionStore.getState().setUser(sampleUser);
    initAuthSessionGuard();

    lastAuthCallback()(null);

    expect(useSessionStore.getState().user).toBeNull();
  });

  it('keeps the session while the auth user is present', () => {
    useSessionStore.getState().setUser(sampleUser);
    initAuthSessionGuard();

    lastAuthCallback()({ uid: 'anon-1' });

    expect(useSessionStore.getState().user).toEqual(sampleUser);
  });

  it('does nothing when there is no app session', () => {
    initAuthSessionGuard();

    expect(() => lastAuthCallback()(null)).not.toThrow();
    expect(useSessionStore.getState().user).toBeNull();
  });
});