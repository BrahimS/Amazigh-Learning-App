import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

import { config } from '@/config';
import { AppError } from '@/utils/errors';

let cachedDb: Firestore | null = null;

/**
 * Firebase JS SDK app for Firestore access.
 *
 * Only projectId/apiKey are needed here; native app ids and the sender id are
 * used by the native SDK configuration (issues #45/#46) once the Firebase
 * projects exist (issue #44).
 */
export function getFirebaseApp(): FirebaseApp {
  const existing = getApps().find(a => a.name === '[DEFAULT]');
  if (existing) {
    return existing;
  }
  const { projectId, apiKey } = config.firebase;
  if (!projectId) {
    throw new AppError(
      'unavailable',
      'Firebase is not configured for this environment yet (see issue #44).',
    );
  }
  return initializeApp({
    projectId,
    apiKey: apiKey || undefined,
  });
}

export function getFirestoreDb(): Firestore {
  if (!cachedDb) {
    cachedDb = getFirestore(getFirebaseApp());
  }
  return cachedDb;
}
