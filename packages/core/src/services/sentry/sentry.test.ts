import type { Scope } from '@sentry/react';

import * as Sentry from '@sentry/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../logger/trace-id', () => ({ traceId: 'test-trace-id' }));

import { captureException, initSentry } from './sentry';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('initSentry', () => {
  describe('negative cases', () => {
    it('does not call Sentry.init when DSN is not set', () => {
      vi.stubEnv('VITE_SENTRY_DSN', '');

      initSentry();

      expect(Sentry.init).not.toHaveBeenCalled();
    });

    it('does not set trace_id tag when DSN is not set', () => {
      vi.stubEnv('VITE_SENTRY_DSN', '');

      initSentry();

      expect(Sentry.setTag).not.toHaveBeenCalled();
    });
  });

  describe('positive cases', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_SENTRY_DSN', 'https://test@sentry.io/123');
    });

    it('calls Sentry.init with DSN and environment', () => {
      initSentry();

      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          dsn: 'https://test@sentry.io/123',
          environment: expect.any(String) as string,
        }),
      );
    });

    it('configures browser tracing and replay integrations', () => {
      initSentry();

      expect(Sentry.browserTracingIntegration).toHaveBeenCalled();
      expect(Sentry.replayIntegration).toHaveBeenCalled();
    });

    it('sets trace_id tag with value from traceId', () => {
      initSentry();

      expect(Sentry.setTag).toHaveBeenCalledWith('trace_id', 'test-trace-id');
    });
  });
});

// Extracts the scope callback passed to Sentry.withScope mock and invokes it with a mock scope
function invokeScopeCallback(mockScope: Scope): void {
  const cb = vi.mocked(Sentry.withScope).mock.lastCall?.[0] as unknown as (scope: Scope) => void;
  cb?.(mockScope);
}

describe('captureException', () => {
  describe('negative cases', () => {
    it('does nothing when Sentry client is not initialized', () => {
      vi.mocked(Sentry.getClient).mockReturnValue(undefined);

      captureException(new Error('test'));

      expect(Sentry.withScope).not.toHaveBeenCalled();
    });
  });

  describe('positive cases', () => {
    beforeEach(() => {
      vi.mocked(Sentry.getClient).mockReturnValue({} as NonNullable<ReturnType<typeof Sentry.getClient>>);
    });

    it('calls Sentry.withScope when client is initialized', () => {
      captureException(new Error('test'));

      expect(Sentry.withScope).toHaveBeenCalled();
    });

    it('sets context on scope when context is provided', () => {
      const setContext = vi.fn();
      const mockScope = { setContext } as unknown as Scope;

      captureException(new Error('test'), { action: 'todos/fetchAll/rejected' });
      invokeScopeCallback(mockScope);

      expect(setContext).toHaveBeenCalledWith('context', { action: 'todos/fetchAll/rejected' });
    });

    it('does not call setContext when context is not provided', () => {
      const setContext = vi.fn();
      const mockScope = { setContext } as unknown as Scope;

      captureException(new Error('test'));
      invokeScopeCallback(mockScope);

      expect(setContext).not.toHaveBeenCalled();
    });

    it('calls Sentry.captureException inside scope callback', () => {
      const error = new Error('test error');
      const mockScope = { setContext: vi.fn() } as unknown as Scope;

      captureException(error);
      invokeScopeCallback(mockScope);

      expect(Sentry.captureException).toHaveBeenCalledWith(error);
    });
  });
});
