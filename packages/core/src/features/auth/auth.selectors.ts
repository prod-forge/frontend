import { createSelector } from '@reduxjs/toolkit';

import type { RootState } from '../../store';

const selectAuthState = (state: RootState): RootState['auth'] => state.auth;

export const selectAuthToken = createSelector(selectAuthState, (state) => state.token);

export const selectAuthUser = createSelector(selectAuthState, (state) => state.user);

export const selectIsAuthenticated = createSelector(selectAuthState, (state) => state.token !== null);
