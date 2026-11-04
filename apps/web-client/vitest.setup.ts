import '@testing-library/jest-dom/vitest';
import { configureCore } from '@prod-forge-todolist-frontend/core';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

vi.mock('@sentry/react', () => ({
  browserTracingIntegration: vi.fn(() => ({})),
  captureException: vi.fn(),
  getClient: vi.fn(),
  init: vi.fn(),
  replayIntegration: vi.fn(() => ({})),
  setTag: vi.fn(),
  withScope: vi.fn(),
}));

vi.mock('logrock', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    log: vi.fn(),
    warn: vi.fn(),
  },
  LoggerContainer: ({ children }: { children: unknown }): unknown => children,
}));

if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      addEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches: false,
      media: query,
      onchange: null,
      removeEventListener: vi.fn(),
    }) as unknown as MediaQueryList;
}

// Core is platform-neutral and must be configured before any store or API use; tests get fresh in-memory adapters.
beforeEach(() => {
  const entries = new Map<string, string>();

  configureCore({
    apiBaseUrl: 'https://api.test/',
    getToken: () => null,
    logger: { debug: vi.fn(), error: vi.fn(), warn: vi.fn() },
    reportError: vi.fn(),
    storage: {
      getItem: (key) => Promise.resolve(entries.get(key) ?? null),
      removeItem: (key) => {
        entries.delete(key);

        return Promise.resolve();
      },
      setItem: (key, value) => {
        entries.set(key, value);

        return Promise.resolve();
      },
    },
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
