import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';

import type { DialectId, LearningGoal, UiLanguage, UserProfile } from '@/types';

import { getFirestoreDb } from './client';
import { fail, ok, type ServiceResult } from './result';

/** Profile fields a learner may edit. `role` and `xp` are server-managed. */
export interface LearningPreferences {
  dialect: DialectId;
  uiLanguage: UiLanguage;
  learningGoal: LearningGoal | null;
  dailyGoalMinutes: number;
}

/** Fields required to create a user document at registration (issue #54). */
export interface NewUserProfile {
  displayName: string;
  email: string;
  dialect: DialectId;
  uiLanguage: UiLanguage;
  learningGoal?: LearningGoal;
  dailyGoalMinutes: number;
}

export async function getUserProfile(
  uid: string,
  db: Firestore = getFirestoreDb(),
): Promise<ServiceResult<UserProfile | null>> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return ok(snap.exists() ? (snap.data() as UserProfile) : null);
  } catch (error) {
    return fail(error);
  }
}

export async function updateLearningPreferences(
  uid: string,
  preferences: LearningPreferences,
  db: Firestore = getFirestoreDb(),
): Promise<ServiceResult<void>> {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...preferences,
      updatedAt: serverTimestamp(),
    });
    return ok(undefined);
  } catch (error) {
    return fail(error);
  }
}

export async function createUserProfile(
  uid: string,
  profile: NewUserProfile,
  db: Firestore = getFirestoreDb(),
): Promise<ServiceResult<void>> {
  try {
    const now = serverTimestamp();
    // `role` is intentionally omitted: security rules reject client-set roles,
    // and the role mirror is managed by admins via custom claims.
    await setDoc(doc(db, 'users', uid), {
      displayName: profile.displayName,
      email: profile.email,
      dialect: profile.dialect,
      uiLanguage: profile.uiLanguage,
      learningGoal: profile.learningGoal ?? null,
      dailyGoalMinutes: profile.dailyGoalMinutes,
      xp: 0,
      currentStreak: 0,
      longestStreak: 0,
      createdAt: now,
      updatedAt: now,
    });
    return ok(undefined);
  } catch (error) {
    return fail(error);
  }
}
