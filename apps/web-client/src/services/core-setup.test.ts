import { getCoreConfig, logout, sessionRestored, store } from '@prod-forge-todolist-frontend/core';
import * as Sentry from '@sentry/react';
import { logger } from 'logrock';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { localStorageAdapter, logrockLogger, setupCore } from './core-setup';

afterEach(() => {
  vi.unstubAllEnvs();
  localStorage.clear();
  store.dispatch(logout());
});

describe('setupCore', () => {
  describe('negative cases', () => {
    it('throws when VITE_API_BASE_URL has no trailing slash', () => {
      vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com');

      expect(() => setupCore()).toThrow('apiBaseUrl must end with "/"');
    });

    it('returns no token while the store user is logged out', () => {
      vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com/');
      setupCore();

      expect(getCoreConfig().getToken()).toBeNull();
    });
  });

  describe('positive cases', () => {
    it('configures core with the API base URL from the env', () => {
      vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com/');

      setupCore();

      expect(getCoreConfig().apiBaseUrl).toBe('https://api.example.com/');
    });

    it('reads the token from the store on every call', () => {
      vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com/');
      setupCore();

      store.dispatch(sessionRestored({ token: 'test-token', user: { email: 'a@b.com' } }));

      expect(getCoreConfig().getToken()).toBe(store.getState().auth.token);
    });

    it('reports errors through Sentry when the client is initialized', () => {
      vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com/');
      vi.mocked(Sentry.getClient).mockReturnValue({} as NonNullable<ReturnType<typeof Sentry.getClient>>);
      setupCore();

      getCoreConfig().reportError(new Error('boom'));

      expect(Sentry.withScope).toHaveBeenCalledOnce();
    });
  });
});

describe('localStorageAdapter', () => {
  describe('negative cases', () => {
    it('resolves null for a missing key', async () => {
      await expect(localStorageAdapter.getItem('missing')).resolves.toBeNull();
    });
  });

  describe('positive cases', () => {
    it('stores, reads and removes a value', async () => {
      await localStorageAdapter.setItem('key', 'value');
      await expect(localStorageAdapter.getItem('key')).resolves.toBe('value');

      await localStorageAdapter.removeItem('key');
      expect(localStorage.getItem('key')).toBeNull();
    });
  });
});

describe('logrockLogger', () => {
  describe('negative cases', () => {
    it('stringifies a non-Error, non-string error value', () => {
      logrockLogger.error({ reason: 1 }, 'ctx');

      expect(logger.error).toHaveBeenCalledWith('[object Object]', 'ctx');
    });
  });

  describe('positive cases', () => {
    it('forwards debug, warn and error to logrock', () => {
      const error = new Error('boom');

      logrockLogger.debug('message', 'ctx');
      logrockLogger.warn({ key: 'value' }, 'ctx');
      logrockLogger.error(error, 'ctx');

      expect(logger.debug).toHaveBeenCalledWith('message', 'ctx');
      expect(logger.warn).toHaveBeenCalledWith({ key: 'value' }, 'ctx');
      expect(logger.error).toHaveBeenCalledWith(error, 'ctx');
    });
  });
});
