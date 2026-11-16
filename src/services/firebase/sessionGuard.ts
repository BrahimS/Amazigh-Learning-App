import { onAuthStateChanged } from 'firebase/auth';

import { useSessionStore } from '@/store/sessionStore';

import { getFirebaseAuth } from './client';

/**
 * The persisted app session is only valid while Firebase Auth has a user.
 * When the auth backend loses the user — e.g. the local Auth emulator was
 * restarted and its users wiped — the session must be dropped so the app
 * returns to Welcome instead of showing Firestore permission errors.
 */
export function shouldInvalidateSession(
  firebaseUserPresent: boolean,
  appSessionPresent: boolean,
): boolean {
  return !firebaseUserPresent && appSessionPresent;
}

/**
 * Watches Firebase Auth and clears the app session when it no longer has a
 * matching Firebase user. Returns an unsubscribe function, or null when
 * Firebase is not configured for this environment (issue #44).
 */
export function initAuthSessionGuard(): (() => void) | null {
  let unsubscribe: (() => void) | null = null;
  try {
    const auth = getFirebaseAuth();
    unsubscribe = onAuthStateChanged(auth, firebaseUser => {
      const { user, logout } = useSessionStore.getState();
      if (shouldInvalidateSession(firebaseUser !== null, user !== null)) {
        logout();
      }
    });
  } catch {
    return null;
  }
  return unsubscribe;
}
