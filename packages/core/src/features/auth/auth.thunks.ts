import { createAction, createAsyncThunk } from '@reduxjs/toolkit';

import type { SerializedApiError } from '../../errors/serialize-api-error';
import type { RootState } from '../../store';
import type { AuthSession, AuthUser } from './auth.types';

import { authApi } from '../../api/auth.api';
import { getCoreConfig } from '../../config/core-config';
import { serializeApiError } from '../../errors/serialize-api-error';
import { TOKEN_STORAGE_KEY, UNKNOWN_EMAIL_MESSAGE, USER_STORAGE_KEY } from './auth.constants';

export const sessionRestored = createAction<AuthSession>('auth/sessionRestored');

// The status is kept, so a rejected login stays a 4xx for the error middleware and is not reported as a defect.
const serializeLoginError = (error: unknown): SerializedApiError => {
  const serialized = serializeApiError(error);

  return serialized.status === 401 ? { ...serialized, message: UNKNOWN_EMAIL_MESSAGE } : serialized;
};

export const login = createAsyncThunk<AuthSession, { email: string }>(
  'auth/login',
  async ({ email }) => {
    getCoreConfig().logger.debug('Logging in', 'auth/login');
    const { accessToken } = await authApi.login(email);

    return { token: accessToken, user: { email } };
  },
  { serializeError: serializeLoginError },
);

// The backend has no sign-up endpoint: register logs in an existing user and keeps the entered name locally.
export const register = createAsyncThunk<AuthSession, { email: string; name?: string }>(
  'auth/register',
  async ({ email, name }) => {
    getCoreConfig().logger.debug('Registering', 'auth/register');
    const { accessToken } = await authApi.login(email);

    return { token: accessToken, user: { email, ...(name ? { name } : {}) } };
  },
  { serializeError: serializeLoginError },
);

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
    } catch (error) {
      logger.error(error, 'auth/hydrate');

      return null;
    }
  },
);
