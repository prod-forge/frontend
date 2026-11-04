import type { Config } from 'jest';

// Workspace packages are mapped to their sources, so tests never depend on a prior build (test-data ships dist in main).
const config: Config = {
  moduleNameMapper: {
    '^@prod-forge-todolist-frontend/core$': '<rootDir>/../../packages/core/src/index.ts',
    '^@prod-forge-todolist-frontend/design-tokens/js$': '<rootDir>/../../packages/design-tokens/js/index.mjs',
    '^@prod-forge-todolist-frontend/test-data$': '<rootDir>/../../packages/test-data/src/index.ts',
  },
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
  transform: {
    '\\.mjs$': 'babel-jest',
  },
  // jest-expo's list plus the ESM-only packages core and react-redux resolve to under the react-native condition.
  transformIgnorePatterns: [
    '/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|standard-navigation|@reduxjs/toolkit|immer|redux|reselect|react-redux|uuid))',
    '/node_modules/react-native-reanimated/plugin/',
    '/node_modules/@react-native/babel-preset/',
  ],
};

export default config;
