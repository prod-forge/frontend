import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';

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

afterEach(() => {
  vi.clearAllMocks();
});
