import { createSelector } from '@reduxjs/toolkit';

import type { RootState } from '../../store';

const selectErrorsState = (state: RootState): RootState['errors'] => state.errors;

const selectErrors = createSelector(selectErrorsState, (state) => state.errors);

export const selectVisibleErrors = createSelector(selectErrors, (errors) => errors.filter((e) => !e.silent));
