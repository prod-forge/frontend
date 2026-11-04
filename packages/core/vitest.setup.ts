import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, vi } from 'vitest';

import { configureCore } from './src/config/core-config';

// Fresh in-memory adapters per test so no config, storage or mock state leaks between tests.
beforeEach(() => {
  const entries = new Map<string, string>();

  configureCore({
    apiBaseUrl: 'https://api.test/',
    getToken: vi.fn(() => null),
    logger: { debug: vi.fn(), error: vi.fn(), warn: vi.fn() },
    reportError: vi.fn(),
    storage: {
      getItem: vi.fn((key: string) => Promise.resolve(entries.get(key) ?? null)),
      removeItem: vi.fn((key: string) => {
        entries.delete(key);

        return Promise.resolve();
      }),
      setItem: vi.fn((key: string, value: string) => {
        entries.set(key, value);

        return Promise.resolve();
      }),
    },
  });
});

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

afterEach(() => {
  vi.clearAllMocks();
});
