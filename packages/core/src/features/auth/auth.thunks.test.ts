import { configureStore } from '@reduxjs/toolkit';
import { describe, expect, it, vi } from 'vitest';

import { getCoreConfig } from '../../config/core-config';
import { errorsReducer } from '../errors/errors.slice';
import { todosReducer } from '../todos/todos.slices';
import { FAKE_TOKEN, TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from './auth.constants';
import { selectIsAuthenticated } from './auth.selectors';
import { authReducer } from './auth.slices';
import { hydrateAuth } from './auth.thunks';

const reducer = { auth: authReducer, errors: errorsReducer, todos: todosReducer };

type TestStore = ReturnType<typeof configureStore<{ [K in keyof typeof reducer]: ReturnType<(typeof reducer)[K]> }>>;

const makeStore = (): TestStore => configureStore({ reducer });

const seedStorage = async (entries: Record<string, string>): Promise<void> => {
  const { storage } = getCoreConfig();

  for (const [key, value] of Object.entries(entries)) {
    await storage.setItem(key, value);
  }
};

const isAuthenticated = (store: TestStore): boolean => selectIsAuthenticated(store.getState());

describe('hydrateAuth', () => {
  describe('negative cases', () => {
    it('leaves the user unauthenticated and finishes hydration when storage is empty', async () => {
      const store = makeStore();

      const result = await store.dispatch(hydrateAuth());

      expect(result.payload).toBeNull();
      expect(isAuthenticated(store)).toBe(false);
      expect(store.getState().auth.hydration).toBe('done');
    });

    it('stays unauthenticated when the stored user is not valid JSON', async () => {
      await seedStorage({ [TOKEN_STORAGE_KEY]: FAKE_TOKEN, [USER_STORAGE_KEY]: '{not json' });
      const store = makeStore();

      await store.dispatch(hydrateAuth());

      expect(isAuthenticated(store)).toBe(false);
      expect(store.getState().auth.hydration).toBe('done');
    });

    it('stays unauthenticated when the stored user has no email', async () => {
      await seedStorage({ [TOKEN_STORAGE_KEY]: FAKE_TOKEN, [USER_STORAGE_KEY]: JSON.stringify({ name: 'Anna' }) });
      const store = makeStore();

      await store.dispatch(hydrateAuth());

      expect(isAuthenticated(store)).toBe(false);
    });

    it('stays unauthenticated when only the user is stored without a token', async () => {
      await seedStorage({ [USER_STORAGE_KEY]: JSON.stringify({ email: 'a@b.com' }) });
      const store = makeStore();

      await store.dispatch(hydrateAuth());

      expect(isAuthenticated(store)).toBe(false);
    });

    it('finishes hydration unauthenticated and logs a warning when storage fails', async () => {
      const { logger, storage } = getCoreConfig();
      vi.mocked(storage.getItem).mockRejectedValueOnce(new Error('storage unavailable'));
      const store = makeStore();

      await store.dispatch(hydrateAuth());

      expect(isAuthenticated(store)).toBe(false);
      expect(store.getState().auth.hydration).toBe('done');
      expect(logger.warn).toHaveBeenCalledWith('Failed to restore the auth session', 'auth/hydrate');
    });
  });

  describe('positive cases', () => {
    it('starts in the idle hydration state', () => {
      expect(makeStore().getState().auth.hydration).toBe('idle');
    });

    it('marks hydration as in progress while storage is being read', () => {
      const store = makeStore();

      void store.dispatch(hydrateAuth());

      expect(store.getState().auth.hydration).toBe('hydrating');
    });

    it('restores the token and the user from populated storage', async () => {
      await seedStorage({
        [TOKEN_STORAGE_KEY]: 'stored-token',
        [USER_STORAGE_KEY]: JSON.stringify({ email: 'a@b.com', name: 'Anna' }),
      });
      const store = makeStore();

      const result = await store.dispatch(hydrateAuth());

      expect(result.payload).toEqual({ email: 'a@b.com', name: 'Anna' });
      expect(store.getState().auth).toEqual({
        hydration: 'done',
        token: 'stored-token',
        user: { email: 'a@b.com', name: 'Anna' },
      });
    });
  });
});
