import { configureStore } from '@reduxjs/toolkit';
import { describe, expect, it, vi } from 'vitest';

import { getCoreConfig } from '../../config/core-config';
import { FAKE_TOKEN, TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from './auth.constants';
import { authListenerMiddleware } from './auth.listeners';
import { authReducer, login, logout, register } from './auth.slices';

const makeStore = (): ReturnType<typeof configureStore<{ auth: ReturnType<typeof authReducer> }>> =>
  configureStore({
    middleware: (getDefault) => getDefault().prepend(authListenerMiddleware.middleware),
    reducer: { auth: authReducer },
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

    it('logs a storage failure through the core logger instead of throwing', async () => {
      const { logger, storage } = getCoreConfig();
      vi.mocked(storage.setItem).mockRejectedValueOnce(new Error('quota exceeded'));
      const store = makeStore();

      store.dispatch(login({ email: 'a@b.com' }));

      await vi.waitFor(() => {
        expect(logger.error).toHaveBeenCalledWith(expect.any(Error), 'auth/listeners');
      });
    });
  });

  describe('positive cases', () => {
    it('persists the token and the user after login', async () => {
      const store = makeStore();

      store.dispatch(login({ email: 'a@b.com' }));

      const { storage } = getCoreConfig();
      await vi.waitFor(() => {
        expect(storage.setItem).toHaveBeenCalledWith(TOKEN_STORAGE_KEY, FAKE_TOKEN);
        expect(storage.setItem).toHaveBeenCalledWith(USER_STORAGE_KEY, JSON.stringify({ email: 'a@b.com' }));
      });
    });

    it('persists the token and the user with name after register', async () => {
      const store = makeStore();

      store.dispatch(register({ email: 'a@b.com', name: 'Anna' }));

      const { storage } = getCoreConfig();
      await vi.waitFor(() => {
        expect(storage.setItem).toHaveBeenCalledWith(TOKEN_STORAGE_KEY, FAKE_TOKEN);
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
  });
});
