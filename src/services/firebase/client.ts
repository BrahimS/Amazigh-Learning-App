import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { Platform } from 'react-native';

import { config } from '@/config';
import { AppError } from '@/utils/errors';

let cachedDb: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }
  const { projectId, appIdAndroid, appIdIos, messagingSenderId } = config.firebase;
  if (!projectId) {
    throw new AppError(
      'unavailable',
      'Firebase is not configured for this environment yet (see issue #44).',
    );
  }
  return initializeApp({
    projectId,
    apiKey: config.firebase.apiKey || undefined,
    appId: Platform.select({ ios: appIdIos, default: appIdAndroid }) || undefined,
    messagingSenderId: messagingSenderId || undefined,
  });
}

export function getFirestoreDb(): Firestore {
  if (!cachedDb) {
    cachedDb = getFirestore(getFirebaseApp());
  }
  return cachedDb;
}
