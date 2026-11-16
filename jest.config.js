module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['<rootDir>/jest.setup.js'],
  // Emulator tests run separately via `npm run test:emulator` (they need the
  // Firestore emulator); keep them out of the default unit test run.
  testPathIgnorePatterns: ['/node_modules/', '__tests__/emulator/'],
  // React Navigation, safe-area and the Firebase JS SDK ship ESM that Jest must transform
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?@?react-native|@react-native(-community)?|@react-navigation|react-native-screens|react-native-safe-area-context|firebase|@firebase)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
