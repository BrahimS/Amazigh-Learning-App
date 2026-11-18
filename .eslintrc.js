module.exports = {
  root: true,
  extends: '@react-native',
  overrides: [
    {
      files: ['jest.setup.js'],
      env: {
        jest: true,
      },
    },
    {
      // Node scripts: plain ESM, no JSX/TS.
      files: ['design/**/*.mjs', 'scripts/**/*.mjs'],
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2022,
      },
      env: {
        node: true,
        es2022: true,
      },
      rules: {
        'react/react-in-jsx-scope': 'off',
        'react/no-unescaped-entities': 'off',
      },
    },
  ],
};
