/**
 * Babel configuration for Expo SDK 58.
 *
 * `babel-preset-expo` replaces `@react-native/babel-preset`; the
 * `module-resolver` plugin keeps the `@/…` → `src/…` alias working.
 */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
          },
        },
      ],
    ],
  };
};
