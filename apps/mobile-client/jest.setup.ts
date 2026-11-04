// Native modules have no implementation under Jest: SecureStore is replaced by an in-memory map,
// Sentry by spies, and safe-area insets by the library's own mock.
jest.mock('expo-secure-store', () => {
  const entries = new Map<string, string>();

  return {
    deleteItemAsync: jest.fn((key: string) => {
      entries.delete(key);

      return Promise.resolve();
    }),
    getItemAsync: jest.fn((key: string) => Promise.resolve(entries.get(key) ?? null)),
    setItemAsync: jest.fn((key: string, value: string) => {
      entries.set(key, value);

      return Promise.resolve();
    }),
  };
});

jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
  getClient: jest.fn(() => undefined),
  init: jest.fn(),
  setTag: jest.fn(),
  withScope: jest.fn(),
}));

jest.mock(
  'react-native-safe-area-context',
  () => jest.requireActual<{ default: Record<string, unknown> }>('react-native-safe-area-context/jest/mock').default,
);

// Tests assert on behavior, not log lines: the device console adapter is replaced by spies so output stays clean.
jest.mock('./src/services/console-logger', () => ({
  consoleLogger: { debug: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));
