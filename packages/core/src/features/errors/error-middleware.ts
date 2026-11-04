import type { Middleware } from '@reduxjs/toolkit';

import { isRejected, isRejectedWithValue } from '@reduxjs/toolkit';

import type { SerializedApiError } from '../../errors/serialize-api-error';

import { getCoreConfig } from '../../config/core-config';
import { pushError } from './errors.slice';

// Client errors (4xx) are expected outcomes, not defects; only 5xx and status-less errors go to error reporting.
const shouldReport = (error: SerializedApiError): boolean => error.status === undefined || error.status >= 500;

export const errorMiddleware: Middleware = (api) => (next) => (action) => {
  const result = next(action);

  if (isRejected(action)) {
    const { logger, reportError } = getCoreConfig();
    const error: SerializedApiError = action.error;
    const message = error.message ?? 'Something went wrong';
    const isBackend = error.name === 'BackendError';
    const isSilent =
      isRejectedWithValue(action) && (action.payload as undefined | { silent?: boolean })?.silent === true;

    logger.error(error instanceof Error ? error : message, action.type);

    if (shouldReport(error)) {
      reportError(new Error(message), {
        action: action.type,
        errorCode: error.code,
        errorName: error.name,
        stack: error.stack,
      });
    }

    api.dispatch(
      pushError({ message, silent: isSilent, source: 'rtk', type: isBackend ? 'backend-error' : 'frontend-error' }),
    );
  }

  return result;
};
