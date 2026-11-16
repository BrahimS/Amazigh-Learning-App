const base = require('./jest.config.js');

module.exports = {
  ...base,
  testMatch: ['**/__tests__/emulator/**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/'],
};
