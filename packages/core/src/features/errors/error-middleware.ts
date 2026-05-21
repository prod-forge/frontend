import type { Middleware } from '@reduxjs/toolkit';

import { isRejected, isRejectedWithValue } from '@reduxjs/toolkit';
import { logger } from 'logrock';

import { captureException } from '../../services/sentry/sentry';
import { pushError } from './errors.slice';

export const errorMiddleware: Middleware = (api) => (next) => (action) => {
  const result = next(action);

  if (isRejected(action)) {
    const message = action.error.message ?? 'Something went wrong';
    const isBackend = action.error.name === 'BackendError';
    const isSilent =
      isRejectedWithValue(action) && (action.payload as undefined | { silent?: boolean })?.silent === true;

    logger.error(action.error instanceof Error ? action.error : message, action.type);
    captureException(new Error(message), {
      action: action.type,
      errorCode: action.error.code,
      errorName: action.error.name,
      stack: action.error.stack,
    });
    api.dispatch(
      pushError({ message, silent: isSilent, source: 'rtk', type: isBackend ? 'backend-error' : 'frontend-error' }),
    );
  }

  return result;
};
