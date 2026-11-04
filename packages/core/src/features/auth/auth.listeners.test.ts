import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getCoreConfig } from '../../config/core-config';
import { fetchTodoById, fetchTodos, todosReducer } from '../todos/todos.slices';
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from './auth.constants';
import { authListenerMiddleware } from './auth.listeners';
import { authReducer, logout } from './auth.slices';
import { login, register } from './auth.thunks';

const reducer = { auth: authReducer, todos: todosReducer };

type TestStore = ReturnType<typeof configureStore<{ [K in keyof typeof reducer]: ReturnType<(typeof reducer)[K]> }>>;

const makeStore = (): TestStore =>
  configureStore({
    middleware: (getDefault) => getDefault().prepend(authListenerMiddleware.middleware),
    reducer,
  });

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

const unauthorizedBody = {
  code: 'USER_IS_NOT_AUTHORIZED',
  details: {},
  message: 'User is not authorized',
  status: 401,
  traceId: 'test-trace-id',
};

const listFilters = { limit: 10, offset: 0, order: 'asc', query: '', sortBy: 'title' } as const;

beforeEach(() => {
  mockFetch(200, { data: { accessToken: 'signed.jwt.token', expiresIn: 3600 } });
});

describe('auth listeners', () => {
  describe('negative cases', () => {
    it('does not touch storage for unrelated actions', async () => {
      const store = makeStore();

      store.dispatch({ type: 'some/otherAction' });
      await Promise.resolve();

      const { storage } = getCoreConfig();
      expect(storage.setItem).not.toHaveBeenCalled();
      expect(storage.removeItem).not.toHaveBeenCalled();
    });

    it('does not persist anything when the login is rejected', async () => {
      mockFetch(401, unauthorizedBody);
      const store = makeStore();

      await store.dispatch(login({ email: 'unknown@example.com' }));

      const { storage } = getCoreConfig();
      expect(storage.setItem).not.toHaveBeenCalled();
      expect(storage.removeItem).not.toHaveBeenCalled();
    });

    it('logs a storage failure through the core logger instead of throwing', async () => {
      const { logger, storage } = getCoreConfig();
      vi.mocked(storage.setItem).mockRejectedValueOnce(new Error('quota exceeded'));
      const store = makeStore();

      await store.dispatch(login({ email: 'a@b.com' }));

      await vi.waitFor(() => {
        expect(logger.error).toHaveBeenCalledWith(expect.any(Error), 'auth/listeners');
      });
    });

    it('keeps the session when an authenticated request fails with a non-401 status', async () => {
      const store = makeStore();
      await store.dispatch(login({ email: 'a@b.com' }));
      mockFetch(500, { ...unauthorizedBody, code: 'INTERNAL_ERROR', status: 500 });

      await store.dispatch(fetchTodos(listFilters));

      expect(store.getState().auth.token).toBe('signed.jwt.token');
    });
  });

  describe('positive cases', () => {
    it('persists the issued token and the user after login', async () => {
      const store = makeStore();

      await store.dispatch(login({ email: 'a@b.com' }));

      const { storage } = getCoreConfig();
      await vi.waitFor(() => {
        expect(storage.setItem).toHaveBeenCalledWith(TOKEN_STORAGE_KEY, 'signed.jwt.token');
        expect(storage.setItem).toHaveBeenCalledWith(USER_STORAGE_KEY, JSON.stringify({ email: 'a@b.com' }));
      });
    });

    it('persists the issued token and the user with name after register', async () => {
      const store = makeStore();

      await store.dispatch(register({ email: 'a@b.com', name: 'Anna' }));

      const { storage } = getCoreConfig();
      await vi.waitFor(() => {
        expect(storage.setItem).toHaveBeenCalledWith(TOKEN_STORAGE_KEY, 'signed.jwt.token');
        expect(storage.setItem).toHaveBeenCalledWith(
          USER_STORAGE_KEY,
          JSON.stringify({ email: 'a@b.com', name: 'Anna' }),
        );
      });
    });

    it('removes the token and the user after logout', async () => {
      const store = makeStore();

      store.dispatch(logout());

      const { storage } = getCoreConfig();
      await vi.waitFor(() => {
        expect(storage.removeItem).toHaveBeenCalledWith(TOKEN_STORAGE_KEY);
        expect(storage.removeItem).toHaveBeenCalledWith(USER_STORAGE_KEY);
      });
    });

    it('clears the session when an authenticated request is answered with 401', async () => {
      const store = makeStore();
      await store.dispatch(login({ email: 'a@b.com' }));
      mockFetch(401, unauthorizedBody);

      await store.dispatch(fetchTodos(listFilters));

      const { storage } = getCoreConfig();
      expect(store.getState().auth).toMatchObject({ token: null, user: null });
      await vi.waitFor(() => {
        expect(storage.removeItem).toHaveBeenCalledWith(TOKEN_STORAGE_KEY);
      });
    });

    it('clears the session when a single todo request is answered with 401', async () => {
      const store = makeStore();
      await store.dispatch(login({ email: 'a@b.com' }));
      mockFetch(401, unauthorizedBody);

      await store.dispatch(fetchTodoById('todo-id'));

      expect(store.getState().auth).toMatchObject({ token: null, user: null });
    });
  });
});
