import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';

import type { AuthState } from './auth.types';

import { getCoreConfig } from '../../config/core-config';
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from './auth.constants';
import { login, logout, register } from './auth.slices';

// Persistence lives here, not in reducers: reducers stay pure and storage is async on every platform.
export const authListenerMiddleware = createListenerMiddleware({
  onError: (error) => {
    getCoreConfig().logger.error(error, 'auth/listeners');
  },
});

authListenerMiddleware.startListening({
  effect: async (action, listenerApi) => {
    const { logger, storage } = getCoreConfig();
    const { token, user } = (listenerApi.getState() as { auth: AuthState }).auth;

    if (!token || !user) {
      return;
    }

    await Promise.all([
      storage.setItem(TOKEN_STORAGE_KEY, token),
      storage.setItem(USER_STORAGE_KEY, JSON.stringify(user)),
    ]);
    logger.debug(register.match(action) ? 'User registered' : 'User logged in', 'auth');
  },
  matcher: isAnyOf(login, register),
});

authListenerMiddleware.startListening({
  actionCreator: logout,
  effect: async () => {
    const { logger, storage } = getCoreConfig();

    await Promise.all([storage.removeItem(TOKEN_STORAGE_KEY), storage.removeItem(USER_STORAGE_KEY)]);
    logger.debug('User logged out', 'auth');
  },
});
