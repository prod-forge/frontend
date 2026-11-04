import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuthState } from './auth.types';

import { errorMiddleware } from '../errors/error-middleware';
import { errorsReducer } from '../errors/errors.slice';
import { UNKNOWN_EMAIL_MESSAGE } from './auth.constants';
import { authReducer, logout } from './auth.slices';
import { login, register } from './auth.thunks';

const reducer = { auth: authReducer, errors: errorsReducer };

type TestStore = ReturnType<typeof configureStore<{ [K in keyof typeof reducer]: ReturnType<(typeof reducer)[K]> }>>;

const makeStore = (): TestStore =>
  configureStore({ middleware: (getDefault) => getDefault().concat(errorMiddleware), reducer });

const mockFetch = (status: number, body: unknown): void => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue(body),
      ok: status >= 200 && status < 300,
      status,
    }),
  );
};

const backendError = (status: number, code: string): Record<string, unknown> => ({
  code,
  details: {},
  message: code,
  status,
  traceId: 'test-trace-id',
});

const init = (): AuthState => authReducer(undefined, { type: '@@init' });

beforeEach(() => {
  mockFetch(200, { data: { accessToken: 'signed.jwt.token', expiresIn: 3600 } });
});

describe('auth slice — initial state', () => {
  it('starts with no token, no user and hydration not started', () => {
    expect(init()).toEqual({ hydration: 'idle', token: null, user: null });
  });
});

describe('auth slice — login', () => {
  describe('negative cases', () => {
    it('stays signed out and pushes the unknown-email message when the backend answers 401', async () => {
      mockFetch(401, backendError(401, 'USER_IS_NOT_AUTHORIZED'));
      const store = makeStore();

      await store.dispatch(login({ email: 'unknown@example.com' }));

      expect(store.getState().auth.token).toBeNull();
      expect(store.getState().auth.user).toBeNull();
      expect(store.getState().errors.errors.map((e) => e.message)).toEqual([UNKNOWN_EMAIL_MESSAGE]);
    });

    it('pushes the mapped backend message when the login is throttled', async () => {
      mockFetch(429, backendError(429, 'TOO_MANY_REQUESTS'));
      const store = makeStore();

      await store.dispatch(login({ email: 'user1@example.com' }));

      expect(store.getState().auth.token).toBeNull();
      expect(store.getState().errors.errors.map((e) => e.message)).toEqual([
        'Too many requests. Please wait a moment and try again.',
      ]);
    });
  });

  describe('positive cases', () => {
    it('stores the issued access token and the user email', async () => {
      const store = makeStore();

      await store.dispatch(login({ email: 'user1@example.com' }));

      expect(store.getState().auth.token).toBe('signed.jwt.token');
      expect(store.getState().auth.user).toEqual({ email: 'user1@example.com' });
      expect(store.getState().errors.errors).toEqual([]);
    });
  });
});

describe('auth slice — register', () => {
  describe('negative cases', () => {
    it('stays signed out when the backend does not know the email', async () => {
      mockFetch(401, backendError(401, 'USER_IS_NOT_AUTHORIZED'));
      const store = makeStore();

      await store.dispatch(register({ email: 'new@example.com', name: 'Anna' }));

      expect(store.getState().auth.token).toBeNull();
      expect(store.getState().errors.errors.map((e) => e.message)).toEqual([UNKNOWN_EMAIL_MESSAGE]);
    });

    it('omits the name when an empty string is provided', async () => {
      const store = makeStore();

      await store.dispatch(register({ email: 'a@b.com', name: '' }));

      expect(store.getState().auth.user).toEqual({ email: 'a@b.com' });
    });
  });

  describe('positive cases', () => {
    it('logs in through the backend and keeps the entered name', async () => {
      const store = makeStore();

      await store.dispatch(register({ email: 'a@b.com', name: 'Anna' }));

      expect(fetch).toHaveBeenCalledWith('https://api.test/auth/login', expect.objectContaining({ method: 'POST' }));
      expect(store.getState().auth.token).toBe('signed.jwt.token');
      expect(store.getState().auth.user).toEqual({ email: 'a@b.com', name: 'Anna' });
    });
  });
});

describe('auth slice — logout', () => {
  it('clears token and user', async () => {
    const store = makeStore();
    await store.dispatch(login({ email: 'a@b.com' }));

    store.dispatch(logout());

    expect(store.getState().auth).toEqual({ hydration: 'idle', token: null, user: null });
  });
});
