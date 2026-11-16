module.exports = {
  preset: 'jest-expo',
  setupFiles: ['<rootDir>/jest.setup.js'],
  // Emulator tests run separately via `npm run test:emulator` (they need the
  // Firestore emulator); keep them out of the default unit test run.
  testPathIgnorePatterns: ['/node_modules/', '__tests__/emulator/'],
  // jest-expo's pattern plus the Firebase JS SDK, which ships ESM.
  transformIgnorePatterns: [
    '/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|standard-navigation|firebase|@firebase))',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
