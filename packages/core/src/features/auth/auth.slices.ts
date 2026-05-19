import type { PayloadAction } from '@reduxjs/toolkit';

import { createSlice } from '@reduxjs/toolkit';
import { logger } from 'logrock';

import type { AuthState, AuthUser } from './auth.types';

import { FAKE_TOKEN, TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from './auth.constants';

const readUser = (): AuthUser | null => {
  if (typeof localStorage === 'undefined') {
    return null;
  }

  const raw = localStorage.getItem(USER_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as AuthUser;

    if (typeof parsed.email === 'string') {
      return parsed;
    }

    return null;
  } catch {
    return null;
  }
};

const readToken = (): null | string => {
  if (typeof localStorage === 'undefined') {
    return null;
  }

  return localStorage.getItem(TOKEN_STORAGE_KEY);
};

const initialState: AuthState = {
  token: readToken(),
  user: readUser(),
};

const authSlice = createSlice({
  initialState,

  name: 'auth',

  reducers: {
    login(state, action: PayloadAction<{ email: string }>) {
      logger.info('User logged in', 'auth');
      state.token = FAKE_TOKEN;
      state.user = { email: action.payload.email };

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(TOKEN_STORAGE_KEY, FAKE_TOKEN);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(state.user));
      }
    },

    logout(state) {
      logger.info('User logged out', 'auth');
      state.token = null;
      state.user = null;

      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    },

    register(state, action: PayloadAction<{ email: string; name?: string }>) {
      logger.info('User registered', 'auth');
      state.token = FAKE_TOKEN;
      state.user = {
        email: action.payload.email,
        ...(action.payload.name ? { name: action.payload.name } : {}),
      };

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(TOKEN_STORAGE_KEY, FAKE_TOKEN);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(state.user));
      }
    },
  },
});

export const { login, logout, register } = authSlice.actions;

export const authReducer = authSlice.reducer;
