import type { PayloadAction } from '@reduxjs/toolkit';

import { createSlice, nanoid } from '@reduxjs/toolkit';

import type { AppError, AppErrorType, ErrorSource, ErrorsState } from './errors.types';

const initialState: ErrorsState = {
  errors: [],
};

const errorsSlice = createSlice({
  initialState,

  name: 'errors',

  reducers: {
    clearErrors(state) {
      state.errors = [];
    },

    dismissError(state, action: PayloadAction<string>) {
      state.errors = state.errors.filter((e) => e.id !== action.payload);
    },

    pushError: {
      prepare(payload: { message: string; silent?: boolean; source: ErrorSource; type: AppErrorType }) {
        return {
          payload: {
            id: nanoid(),
            message: payload.message,
            silent: payload.silent ?? false,
            source: payload.source,
            timestamp: Date.now(),
            type: payload.type,
          } satisfies AppError,
        };
      },
      reducer(state, action: PayloadAction<AppError>) {
        state.errors.push(action.payload);
      },
    },
  },
});

export const { clearErrors, dismissError, pushError } = errorsSlice.actions;

export const errorsReducer = errorsSlice.reducer;
