/**
 * Environment configuration.
 *
 * Values are injected at build time by `react-native-config` from the `.env*`
 * files selected per build (see README → "Environments"). Only NON-SECRET
 * values may live here — Firebase config files and keys stay out of git
 * (docs/FIREBASE_SECURITY.md).
 */

export type AppEnvironment = 'development' | 'staging' | 'production';

interface EnvValues {
  APP_ENV?: string;
  FIREBASE_PROJECT_ID?: string;
  FIREBASE_APP_ID_ANDROID?: string;
  FIREBASE_APP_ID_IOS?: string;
  FIREBASE_MESSAGING_SENDER_ID?: string;
}

// require() inside try/catch: the native module throws when the app has not
// been rebuilt, and Jest has no native side — both fall back to defaults.
function readEnv(): EnvValues {
  try {
    const mod = require('react-native-config');
    return (mod.default ?? mod ?? {}) as EnvValues;
  } catch {
    return {};
  }
}

const env = readEnv();

export const environment: AppEnvironment =
  env.APP_ENV === 'staging' || env.APP_ENV === 'production'
    ? env.APP_ENV
    : 'development';

export const config = {
  environment,
  firebase: {
    projectId: env.FIREBASE_PROJECT_ID ?? '',
    appIdAndroid: env.FIREBASE_APP_ID_ANDROID ?? '',
    appIdIos: env.FIREBASE_APP_ID_IOS ?? '',
    messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID ?? '',
  },
} as const;
