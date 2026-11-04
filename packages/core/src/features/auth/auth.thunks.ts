import { createAction, createAsyncThunk } from '@reduxjs/toolkit';

import type { RootState } from '../../store';
import type { AuthUser } from './auth.types';

import { getCoreConfig } from '../../config/core-config';
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from './auth.constants';

export const sessionRestored = createAction<{ token: string; user: AuthUser }>('auth/sessionRestored');

const parseUser = (raw: null | string): AuthUser | null => {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as null | Partial<AuthUser>;

    return typeof parsed?.email === 'string' ? (parsed as AuthUser) : null;
  } catch {
    return null;
  }
};

// `void` is RTK's convention for a thunk dispatched without an argument: `dispatch(hydrateAuth())`.
// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export const hydrateAuth = createAsyncThunk<AuthUser | null, void, { state: RootState }>(
  'auth/hydrate',
  async (_, { dispatch }) => {
    const { logger, storage } = getCoreConfig();

    try {
      const [token, rawUser] = await Promise.all([
        storage.getItem(TOKEN_STORAGE_KEY),
        storage.getItem(USER_STORAGE_KEY),
      ]);
      const user = parseUser(rawUser);

      if (!token || !user) {
        return null;
      }

      dispatch(sessionRestored({ token, user }));

      return user;
    } catch {
      logger.warn('Failed to restore the auth session', 'auth/hydrate');

      return null;
    }
  },
);
