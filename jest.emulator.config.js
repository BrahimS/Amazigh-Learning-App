// Standalone Node config for the Firebase emulator suites: no React Native
// preset (its resolver prefers Firebase's browser ESM builds, which Jest
// cannot load as CJS).
module.exports = {
  rootDir: __dirname,
  testEnvironment: 'node',
  transform: {
    '^.+\\.(js|jsx|ts|tsx|mjs|cjs)$': 'babel-jest',
  },
  setupFiles: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/__tests__/emulator/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
