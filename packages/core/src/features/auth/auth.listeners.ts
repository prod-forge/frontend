import { createListenerMiddleware, isAnyOf, isRejected } from '@reduxjs/toolkit';

import type { SerializedApiError } from '../../errors/serialize-api-error';
import type { AuthState } from './auth.types';

import { getCoreConfig } from '../../config/core-config';
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from './auth.constants';
import { logout } from './auth.slices';
import { login, register } from './auth.thunks';

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
    logger.debug(register.fulfilled.match(action) ? 'User registered' : 'User logged in', 'auth');
  },
  matcher: isAnyOf(login.fulfilled, register.fulfilled),
});

authListenerMiddleware.startListening({
  actionCreator: logout,
  effect: async () => {
    const { logger, storage } = getCoreConfig();

    await Promise.all([storage.removeItem(TOKEN_STORAGE_KEY), storage.removeItem(USER_STORAGE_KEY)]);
    logger.debug('User logged out', 'auth');
  },
});

// A 401 on an authenticated request means the token expired or is no longer valid: the session is dropped,
// and the screens guarded by selectIsAuthenticated send the user back to sign in.
authListenerMiddleware.startListening({
  effect: (_action, listenerApi) => {
    getCoreConfig().logger.debug('Session expired', 'auth');
    listenerApi.dispatch(logout());
  },
  predicate: (action, currentState) =>
    isRejected(action) &&
    (action.error as SerializedApiError).status === 401 &&
    (currentState as { auth: AuthState }).auth.token !== null,
});
