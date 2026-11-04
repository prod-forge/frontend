import type { CoreLogger, KeyValueStorage } from '@prod-forge-todolist-frontend/core';

import { configureCore, store } from '@prod-forge-todolist-frontend/core';
import { logger } from 'logrock';

import { captureException } from './sentry';

export const localStorageAdapter: KeyValueStorage = {
  getItem: (key) => Promise.resolve(localStorage.getItem(key)),
  removeItem: (key) => {
    localStorage.removeItem(key);

    return Promise.resolve();
  },
  setItem: (key, value) => {
    localStorage.setItem(key, value);

    return Promise.resolve();
  },
};

export const logrockLogger: CoreLogger = {
  debug: (message, context) => {
    logger.debug(message, context);
  },
  error: (error, context) => {
    logger.error(error instanceof Error || typeof error === 'string' ? error : String(error), context);
  },
  warn: (message, context) => {
    logger.warn(message, context);
  },
};

// Served by the Vite dev proxy; production builds require VITE_API_BASE_URL (see vite.build-env.ts).
const DEV_API_BASE_URL = '/api/v1/';

export function setupCore(): void {
  configureCore({
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || DEV_API_BASE_URL,
    getToken: () => store.getState().auth.token,
    logger: logrockLogger,
    reportError: captureException,
    storage: localStorageAdapter,
  });
}
