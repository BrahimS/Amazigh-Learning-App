/**
 * Environment configuration.
 *
 * Expo inlines `EXPO_PUBLIC_*` variables into the JS bundle at build time,
 * loaded from the `.env*` files selected per build (see README → "Environments").
 * Only NON-SECRET values may live here — Firebase config files and keys stay
 * out of git (docs/FIREBASE_SECURITY.md).
 */

export type AppEnvironment = 'development' | 'staging' | 'production';

const env = process.env;

export const environment: AppEnvironment =
  env.EXPO_PUBLIC_APP_ENV === 'staging' || env.EXPO_PUBLIC_APP_ENV === 'production'
    ? env.EXPO_PUBLIC_APP_ENV
    : 'development';

export const config = {
  environment,
  firebase: {
    projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
    apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
    appIdAndroid: env.EXPO_PUBLIC_FIREBASE_APP_ID_ANDROID ?? '',
    appIdIos: env.EXPO_PUBLIC_FIREBASE_APP_ID_IOS ?? '',
    messagingSenderId: env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  },
} as const;
