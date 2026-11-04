import type { Store } from '@prod-forge-todolist-frontend/core';
import type { Scope } from '@sentry/react';
import type { Metric } from 'web-vitals';

import {
  authReducer,
  errorsReducer,
  getCoreConfig,
  hydrateAuth,
  login,
  logout,
  todosReducer,
  TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
} from '@prod-forge-todolist-frontend/core';
import { configureStore } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { onCLS, onINP, onLCP } from 'web-vitals';

vi.mock(import('@prod-forge-todolist-frontend/core'), async (importOriginal) => ({
  ...(await importOriginal()),
  traceId: 'test-trace-id',
}));

vi.mock('web-vitals', () => ({
  onCLS: vi.fn(),
  onINP: vi.fn(),
  onLCP: vi.fn(),
}));

import { bindSentryUser, captureException, initSentry } from './sentry';

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

// Extracts the callback registered with a mocked web-vitals subscriber and reports a metric through it
function reportVital(subscriber: (onReport: (metric: Metric) => void) => void, metric: Partial<Metric>): void {
  const cb = vi.mocked(subscriber).mock.lastCall?.[0] as (metric: Metric) => void;
  cb(metric as Metric);
}

describe('initSentry web vitals', () => {
  describe('negative cases', () => {
    it('does not subscribe to web vitals when DSN is not set', () => {
      vi.stubEnv('VITE_SENTRY_DSN', '');

      initSentry();

      expect(onCLS).not.toHaveBeenCalled();
      expect(onINP).not.toHaveBeenCalled();
      expect(onLCP).not.toHaveBeenCalled();
    });
  });

  describe('positive cases', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_SENTRY_DSN', 'https://test@sentry.io/123');
    });

    it('subscribes to CLS, INP and LCP', () => {
      initSentry();

      expect(onCLS).toHaveBeenCalledTimes(1);
      expect(onINP).toHaveBeenCalledTimes(1);
      expect(onLCP).toHaveBeenCalledTimes(1);
    });

    it('sends LCP as a millisecond distribution with its rating', () => {
      initSentry();
      reportVital(onLCP, { name: 'LCP', rating: 'good', value: 1200 });

      expect(Sentry.metrics.distribution).toHaveBeenCalledWith('web_vitals.lcp', 1200, {
        attributes: { rating: 'good' },
        unit: 'millisecond',
      });
    });

    it('sends INP as a millisecond distribution with its rating', () => {
      initSentry();
      reportVital(onINP, { name: 'INP', rating: 'needs-improvement', value: 300 });

      expect(Sentry.metrics.distribution).toHaveBeenCalledWith('web_vitals.inp', 300, {
        attributes: { rating: 'needs-improvement' },
        unit: 'millisecond',
      });
    });

    it('sends CLS as a unitless distribution with its rating', () => {
      initSentry();
      reportVital(onCLS, { name: 'CLS', rating: 'poor', value: 0.3 });

      expect(Sentry.metrics.distribution).toHaveBeenCalledWith('web_vitals.cls', 0.3, {
        attributes: { rating: 'poor' },
        unit: 'none',
      });
    });
  });
});

const createAuthStore = (): Store =>
  configureStore({ reducer: { auth: authReducer, errors: errorsReducer, todos: todosReducer } });

// The fulfilled action of the login thunk, without a request to the backend.
const loggedIn = (email: string): ReturnType<typeof login.fulfilled> =>
  login.fulfilled({ token: 'test-token', user: { email } }, 'test-request', { email });

const sha256Hex = async (value: string): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));

  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
};

describe('bindSentryUser', () => {
  describe('negative cases', () => {
    it('does not set the user when the Sentry client is not initialized', () => {
      vi.mocked(Sentry.getClient).mockReturnValue(undefined);
      const store = createAuthStore();

      bindSentryUser(store);
      store.dispatch(loggedIn('a@b.com'));

      expect(Sentry.setUser).not.toHaveBeenCalled();
    });

    it('never passes the email to Sentry', async () => {
      vi.mocked(Sentry.getClient).mockReturnValue({} as NonNullable<ReturnType<typeof Sentry.getClient>>);
      const store = createAuthStore();

      bindSentryUser(store);
      store.dispatch(loggedIn('a@b.com'));
      await vi.waitFor(() => expect(Sentry.setUser).toHaveBeenCalled());

      expect(JSON.stringify(vi.mocked(Sentry.setUser).mock.calls)).not.toContain('a@b.com');
    });

    it('leaves the user null when logout arrives before the digest resolves', async () => {
      vi.mocked(Sentry.getClient).mockReturnValue({} as NonNullable<ReturnType<typeof Sentry.getClient>>);
      const store = createAuthStore();

      bindSentryUser(store);
      store.dispatch(loggedIn('a@b.com'));
      store.dispatch(logout());
      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(Sentry.setUser).toHaveBeenCalledTimes(1);
      expect(Sentry.setUser).toHaveBeenLastCalledWith(null);
    });

    it('does not set the user again when an action leaves the user unchanged', async () => {
      vi.mocked(Sentry.getClient).mockReturnValue({} as NonNullable<ReturnType<typeof Sentry.getClient>>);
      const store = createAuthStore();

      bindSentryUser(store);
      await store.dispatch(hydrateAuth());

      expect(Sentry.setUser).not.toHaveBeenCalled();
    });
  });

  describe('positive cases', () => {
    beforeEach(() => {
      vi.mocked(Sentry.getClient).mockReturnValue({} as NonNullable<ReturnType<typeof Sentry.getClient>>);
    });

    it('sets the hashed user id after hydrateAuth restores a session', async () => {
      const { storage } = getCoreConfig();
      await storage.setItem(TOKEN_STORAGE_KEY, 'token');
      await storage.setItem(USER_STORAGE_KEY, JSON.stringify({ email: 'restored@b.com', name: 'Ann' }));
      const store = createAuthStore();

      bindSentryUser(store);
      await store.dispatch(hydrateAuth());

      await vi.waitFor(async () =>
        expect(Sentry.setUser).toHaveBeenCalledWith({ id: await sha256Hex('restored@b.com') }),
      );
    });

    it('sets the sha-256 of the lowercased email as the user id after login', async () => {
      const store = createAuthStore();

      bindSentryUser(store);
      store.dispatch(loggedIn('A@B.com'));

      await vi.waitFor(async () => expect(Sentry.setUser).toHaveBeenCalledWith({ id: await sha256Hex('a@b.com') }));
    });

    it('clears the user after logout', async () => {
      const store = createAuthStore();

      bindSentryUser(store);
      store.dispatch(loggedIn('a@b.com'));
      await vi.waitFor(() => expect(Sentry.setUser).toHaveBeenCalledTimes(1));
      store.dispatch(logout());

      expect(Sentry.setUser).toHaveBeenLastCalledWith(null);
    });
  });
});

// Extracts the scope callback passed to Sentry.withScope mock and invokes it with a mock scope
function invokeScopeCallback(mockScope: Scope): void {
  const cb = vi.mocked(Sentry.withScope).mock.lastCall?.[0] as unknown as (scope: Scope) => void;
  cb(mockScope);
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
