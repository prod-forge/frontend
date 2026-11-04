import type { AuthState } from '@prod-forge-todolist-frontend/core';
import type { Metric } from 'web-vitals';

import { traceId } from '@prod-forge-todolist-frontend/core';
import * as Sentry from '@sentry/react';
import { onCLS, onINP, onLCP } from 'web-vitals';

type AuthStore = {
  getState: () => { auth: AuthState };
  subscribe: (listener: () => void) => () => void;
};

// Mirrors the signed-in user into Sentry as a SHA-256 id (no PII): covers hydrateAuth, login, register and logout without touching core.
export function bindSentryUser(store: AuthStore): void {
  if (!Sentry.getClient()) return;

  let currentEmail: null | string = null;

  store.subscribe(() => {
    const email = store.getState().auth.user?.email ?? null;

    if (email === currentEmail) return;

    currentEmail = email;

    if (!email) {
      Sentry.setUser(null);

      return;
    }

    void hashEmail(email).then((id) => {
      // A logout or another user may have arrived while the digest was pending
      if (currentEmail === email) Sentry.setUser({ id });
    });
  });
}

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
  reportWebVitals();
}

async function hashEmail(email: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(email.toLowerCase()));

  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function reportWebVital(metric: Metric): void {
  Sentry.metrics.distribution(`web_vitals.${metric.name.toLowerCase()}`, metric.value, {
    attributes: { rating: metric.rating },
    unit: metric.name === 'CLS' ? 'none' : 'millisecond',
  });
}

function reportWebVitals(): void {
  onCLS(reportWebVital);
  onINP(reportWebVital);
  onLCP(reportWebVital);
}
