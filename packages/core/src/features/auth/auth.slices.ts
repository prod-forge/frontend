import type { PayloadAction } from '@reduxjs/toolkit';

import { createSlice } from '@reduxjs/toolkit';

import type { AuthState } from './auth.types';

import { FAKE_TOKEN } from './auth.constants';
import { hydrateAuth, sessionRestored } from './auth.thunks';

const initialState: AuthState = {
  hydration: 'idle',
  token: null,
  user: null,
};

const authSlice = createSlice({
  extraReducers: (builder) => {
    builder
      .addCase(sessionRestored, (state, action) => {
        // A login or register that finished while storage was being read is newer than the stored session.
        if (state.token) {
          return;
        }

        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(hydrateAuth.pending, (state) => {
        state.hydration = 'hydrating';
      })
      .addCase(hydrateAuth.fulfilled, (state) => {
        state.hydration = 'done';
      })
      .addCase(hydrateAuth.rejected, (state) => {
        state.hydration = 'done';
      });
  },

  initialState,

  name: 'auth',

  reducers: {
    login(state, action: PayloadAction<{ email: string }>) {
      state.token = FAKE_TOKEN;
      state.user = { email: action.payload.email };
    },

    logout(state) {
      state.token = null;
      state.user = null;
    },

    register(state, action: PayloadAction<{ email: string; name?: string }>) {
      state.token = FAKE_TOKEN;
      state.user = {
        email: action.payload.email,
        ...(action.payload.name ? { name: action.payload.name } : {}),
      };
    },
  },
});

export const { login, logout, register } = authSlice.actions;

export const authReducer = authSlice.reducer;
