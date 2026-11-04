import type { PayloadAction } from '@reduxjs/toolkit';

import { createSlice, isAnyOf } from '@reduxjs/toolkit';

import type { AuthSession, AuthState } from './auth.types';

import { hydrateAuth, login, register, sessionRestored } from './auth.thunks';

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
      })
      .addMatcher(isAnyOf(login.fulfilled, register.fulfilled), (state, action: PayloadAction<AuthSession>) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
      });
  },

  initialState,

  name: 'auth',

  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
    },
  },
});

export const { logout } = authSlice.actions;

export const authReducer = authSlice.reducer;
