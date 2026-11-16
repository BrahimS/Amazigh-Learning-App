declare const __DEV__: boolean | undefined;

/** True only in development builds (Expo/RN global). */
export const IS_DEV_BUILD = typeof __DEV__ !== 'undefined' && __DEV__ === true;
