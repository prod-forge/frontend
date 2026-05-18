import * as Sentry from '@sentry/react';

import { traceId } from '../logger/trace-id';

export function captureException(error: unknown, context?: Record<string, unknown>): void {
  if (!Sentry.getClient()) return;

  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext('context', context);
    }
    Sentry.captureException(error);
  });
}

export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        blockAllMedia: false,
        maskAllText: false,
      }),
    ],
    release: import.meta.env.VITE_APP_VERSION,
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    sendDefaultPii: false,
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.2 : 1.0,
  });

  Sentry.setTag('trace_id', traceId);
}
