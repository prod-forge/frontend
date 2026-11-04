import { configureCore, store } from '@prod-forge-todolist-frontend/core';

import { consoleLogger } from './console-logger';
import { secureStoreAdapter } from './secure-store-adapter';
import { captureException } from './sentry';

export function setupCore(): void {
  // Expo inlines EXPO_PUBLIC_* at bundle time, so a missing value must fail here, not as "undefinedtodos" later.
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error(
      'EXPO_PUBLIC_API_BASE_URL is not set. Create apps/mobile-client/.env from .env.example and restart Expo.',
    );
  }

  configureCore({
    apiBaseUrl,
    getToken: () => store.getState().auth.token,
    logger: consoleLogger,
    reportError: captureException,
    storage: secureStoreAdapter,
  });
}
