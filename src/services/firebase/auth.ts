import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

import { usePreferencesStore } from '@/store/preferencesStore';
import { useSessionStore } from '@/store/sessionStore';
import type { UserProfile } from '@/types';

import { getFirebaseAuth } from './client';
import { fail, ok, type ServiceResult } from './result';
import { createUserProfile, getUserProfile } from './users';

function localTimestamp() {
  const seconds = Math.floor(Date.now() / 1000);
  return { seconds, nanoseconds: 0 };
}

/** Builds a local profile from the Auth user and current local preferences. */
function profileFromAuthUser(user: User): UserProfile {
  const prefs = usePreferencesStore.getState();
  return {
    uid: user.uid,
    displayName: user.displayName ?? user.email ?? 'Learner',
    email: user.email ?? '',
    role: 'learner',
    dialect: prefs.dialect,
    uiLanguage: prefs.uiLanguage,
    learningGoal: prefs.learningGoal ?? undefined,
    dailyGoalMinutes: prefs.dailyGoalMinutes,
    xp: 0,
    currentStreak: 0,
    longestStreak: 0,
    createdAt: localTimestamp(),
    updatedAt: localTimestamp(),
  };
}

/**
 * Returns the Firestore profile for an Auth user, creating it on first sign-in
 * (e.g. after registration or when the profile write was interrupted).
 */
async function ensureUserProfile(
  user: User,
  db?: Firestore,
): Promise<ServiceResult<UserProfile>> {
  const existing = await getUserProfile(user.uid, db);
  if (!existing.ok) {
    return existing;
  }
  if (existing.data) {
    return ok(existing.data);
  }
  const profile = profileFromAuthUser(user);
  const created = await createUserProfile(
    user.uid,
    {
      displayName: profile.displayName,
      email: profile.email,
      dialect: profile.dialect,
      uiLanguage: profile.uiLanguage,
      learningGoal: profile.learningGoal,
      dailyGoalMinutes: profile.dailyGoalMinutes,
    },
    db,
  );
  if (!created.ok) {
    return fail(created.error);
  }
  return ok(profile);
}

export async function signInWithEmail(
  email: string,
  password: string,
  db?: Firestore,
): Promise<ServiceResult<UserProfile>> {
  try {
    const credential = await signInWithEmailAndPassword(
      getFirebaseAuth(),
      email,
      password,
    );
    const profile = await ensureUserProfile(credential.user, db);
    if (profile.ok) {
      useSessionStore.getState().setUser(profile.data);
    }
    return profile;
  } catch (error) {
    return fail(error);
  }
}

export interface RegisterInput {
  displayName: string;
  email: string;
  password: string;
}

export async function registerWithEmail(
  input: RegisterInput,
  db?: Firestore,
): Promise<ServiceResult<UserProfile>> {
  try {
    const credential = await createUserWithEmailAndPassword(
      getFirebaseAuth(),
      input.email,
      input.password,
    );
    // Best-effort: the Auth profile name is cosmetic; the Firestore profile is
    // the source of truth for the app.
    await updateProfile(credential.user, {
      displayName: input.displayName,
    }).catch(() => undefined);
    const profile = await ensureUserProfile(credential.user, db);
    if (profile.ok) {
      useSessionStore.getState().setUser(profile.data);
    }
    return profile;
  } catch (error) {
    return fail(error);
  }
}

export async function sendPasswordReset(
  email: string,
): Promise<ServiceResult<void>> {
  try {
    await sendPasswordResetEmail(getFirebaseAuth(), email);
    return ok(undefined);
  } catch (error) {
    return fail(error);
  }
}

export async function signOutUser(): Promise<ServiceResult<void>> {
  try {
    await firebaseSignOut(getFirebaseAuth());
    useSessionStore.getState().logout();
    return ok(undefined);
  } catch (error) {
    return fail(error);
  }
}
