import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  connectAuthEmulator,
  initializeAuth,
  // @ts-expect-error -- exported by the React Native build of firebase/auth;
  // the web typings shipped to TypeScript omit it.
  getReactNativePersistence,
  type Auth,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  connectFirestoreEmulator,
  getFirestore,
  type Firestore,
} from 'firebase/firestore';

import { config } from '@/config';
import { AppError } from '@/utils/errors';
import {
  authEmulatorEndpoint,
  firestoreEmulatorEndpoint,
  shouldUseEmulators,
} from './emulators';

let cachedDb: Firestore | null = null;
let cachedAuth: Auth | null = null;

/** Reserved project id accepted by the Firebase emulators. */
const DEMO_PROJECT_ID = 'demo-amazigh-learning';

/**
 * The emulators accept any non-empty API key but reject requests without one,
 * so development gets a placeholder until the real key exists (issue #44).
 */
const DEMO_API_KEY = 'demo-api-key';

/**
 * Firebase JS SDK app for Firestore/Auth access.
 *
 * Only projectId/apiKey are needed here; native app ids and the sender id are
 * used by the native SDK configuration (issues #45/#46) once the Firebase
 * projects exist (issue #44). In development the app uses the local emulators
 * by default (see ./emulators.ts), which accept the reserved `demo-` project
 * id, so the app runs before the real projects exist.
 */
export function getFirebaseApp(): FirebaseApp {
  const existing = getApps().find(a => a.name === '[DEFAULT]');
  if (existing) {
    return existing;
  }
  const { projectId, apiKey } = config.firebase;
  const effectiveProjectId =
    projectId || (shouldUseEmulators() ? DEMO_PROJECT_ID : '');
  if (!effectiveProjectId) {
    throw new AppError(
      'unavailable',
      'Firebase is not configured for this environment yet (see issue #44).',
    );
  }
  return initializeApp({
    projectId: effectiveProjectId,
    apiKey: apiKey || (shouldUseEmulators() ? DEMO_API_KEY : undefined),
  });
}

export function getFirestoreDb(): Firestore {
  if (cachedDb) {
    return cachedDb;
  }
  const db = getFirestore(getFirebaseApp());
  if (shouldUseEmulators()) {
    const { hostname, port } = firestoreEmulatorEndpoint();
    connectFirestoreEmulator(db, hostname, port);
  }
  cachedDb = db;
  return cachedDb;
}

export function getFirebaseAuth(): Auth {
  if (!cachedAuth) {
    // initializeAuth (not getAuth) is required on React Native: the auth
    // instance must exist before connectAuthEmulator runs, and the RN build
    // needs an explicit persistence or it warns and keeps memory-only state.
    const auth = initializeAuth(getFirebaseApp(), {
      persistence: getReactNativePersistence(AsyncStorage),
    });
    if (shouldUseEmulators()) {
      const { hostname, port } = authEmulatorEndpoint();
      connectAuthEmulator(auth, `http://${hostname}:${port}`, {
        disableWarnings: true,
      });
    }
    cachedAuth = auth;
  }
  return cachedAuth;
}
