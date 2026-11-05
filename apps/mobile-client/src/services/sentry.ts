import { traceId } from '@prod-forge-todolist-frontend/core';
import * as Sentry from '@sentry/react-native';

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
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: __DEV__ ? 'development' : 'production',
    // The React Native options omit dataCollection; the deprecation comes from the core type it extends
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    sendDefaultPii: false,
    tracesSampleRate: __DEV__ ? 1.0 : 0.2,
  });

  Sentry.setTag('trace_id', traceId);
}
