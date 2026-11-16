import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, type Auth } from 'firebase/auth';
import {
  connectFirestoreEmulator,
  getFirestore,
  type Firestore,
} from 'firebase/firestore';

import { config, environment } from '@/config';
import { AppError } from '@/utils/errors';

let cachedDb: Firestore | null = null;
let cachedAuth: Auth | null = null;

/** Reserved project id accepted by the Firebase emulators. */
const DEMO_PROJECT_ID = 'demo-amazigh-learning';

function shouldUseEmulators(): boolean {
  return (
    environment === 'development' && config.emulators.firestoreHost !== ''
  );
}

function emulatorEndpoint(
  host: string,
  fallbackPort: number,
): { hostname: string; port: number } {
  const [hostname, port] = host.split(':');
  return { hostname, port: Number(port) || fallbackPort };
}

/**
 * Firebase JS SDK app for Firestore/Auth access.
 *
 * Only projectId/apiKey are needed here; native app ids and the sender id are
 * used by the native SDK configuration (issues #45/#46) once the Firebase
 * projects exist (issue #44). In development, when the emulator hosts are
 * configured, the reserved `demo-` project id is used so the app can run
 * before the real projects exist.
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
    apiKey: apiKey || undefined,
  });
}

export function getFirestoreDb(): Firestore {
  if (!cachedDb) {
    const db = getFirestore(getFirebaseApp());
    if (shouldUseEmulators()) {
      const { hostname, port } = emulatorEndpoint(
        config.emulators.firestoreHost,
        8080,
      );
      connectFirestoreEmulator(db, hostname, port);
    }
    cachedDb = db;
  }
  return cachedDb;
}

export function getFirebaseAuth(): Auth {
  if (!cachedAuth) {
    const auth = getAuth(getFirebaseApp());
    if (shouldUseEmulators() && config.emulators.authHost !== '') {
      const { hostname, port } = emulatorEndpoint(
        config.emulators.authHost,
        9099,
      );
      connectAuthEmulator(auth, `http://${hostname}:${port}`, {
        disableWarnings: true,
      });
    }
    cachedAuth = auth;
  }
  return cachedAuth;
}
