import type { Stack } from 'logrock';
import type { ReactNode } from 'react';

import { hydrateAuth, logsApi, store } from '@prod-forge-todolist-frontend/core';
import { render, screen } from '@testing-library/react';
import { logger } from 'logrock';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from './app';
import { captureException } from './services/sentry';

const loggerContainer = vi.hoisted(() => ({ onError: undefined as ((stack: Stack) => void) | undefined }));

vi.mock('logrock', () => ({
  logger: { debug: vi.fn(), error: vi.fn(), info: vi.fn(), log: vi.fn(), warn: vi.fn() },
  LoggerContainer: ({ children, onError }: { children: ReactNode; onError: (stack: Stack) => void }): ReactNode => {
    loggerContainer.onError = onError;

    return children;
  },
}));

vi.mock('./services/sentry', () => ({ captureException: vi.fn() }));

vi.mock('./pages/register/register', () => ({
  Register: (): ReactNode => {
    throw new Error('render failed');
  },
}));

const stack = { actions: [], metadata: {} } as unknown as Stack;

let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

const renderAt = (path: string): void => {
  window.history.pushState({}, '', path);
  render(<App />);
};

beforeEach(async () => {
  consoleErrorSpy = vi.spyOn(globalThis.console, 'error').mockImplementation(() => undefined);
  await store.dispatch(hydrateAuth());
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('<App /> error reporting', () => {
  describe('negative cases', () => {
    it('writes a failed log upload to console.error instead of throwing', async () => {
      const failure = new Error('network down');
      vi.spyOn(logsApi, 'send').mockRejectedValue(failure);
      renderAt('/');

      loggerContainer.onError?.(stack);

      await vi.waitFor(() => expect(consoleErrorSpy).toHaveBeenCalledWith(failure));
    });

    it('replaces a page that throws while rendering with the fallback', async () => {
      renderAt('/register');

      expect(await screen.findByRole('heading', { name: /something went wrong/i })).toBeInTheDocument();
    });
  });

  describe('positive cases', () => {
    it('sends the logger stack to the backend when the logger reports an error', () => {
      const send = vi.spyOn(logsApi, 'send').mockResolvedValue(undefined);
      renderAt('/');

      loggerContainer.onError?.(stack);

      expect(send).toHaveBeenCalledWith(stack);
    });

    it('logs a render error and reports it to Sentry with the component stack', async () => {
      renderAt('/register');

      await screen.findByRole('heading', { name: /something went wrong/i });

      const error = expect.objectContaining({ message: 'render failed' }) as Error;
      expect(logger.error).toHaveBeenCalledWith(error, 'error-boundary');
      expect(captureException).toHaveBeenCalledWith(error, { componentStack: expect.any(String) as string });
    });
  });
});
