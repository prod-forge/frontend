# Client Observability

<p align="center">
  <img alt="Client Observability" src="assets/client-observability.jpg" width="701px" height="561px">
</p>

The backend side of observability (structured logs, Promtail, Loki, Grafana, Prometheus) is described in [Logging and Observability](https://github.com/prod-forge/backend/blob/main/guide/logging-observability.md). This chapter covers what the browser adds, and how the two halves meet.

## Why Observability Starts in the Browser

Backend monitoring sees only the requests that arrived. A large part of what a user experiences never reaches the server:

- a request that failed before leaving the device (offline, DNS, CORS, a blocked script);
- a render exception that leaves a blank page while every API call returned 200;
- a page that loads in six seconds on a slow phone, with a perfectly healthy backend.

For these cases the server logs are silent, so the client has to report them itself. The client has three tools for this, each with a different job:

| Tool       | Answers                                       | Where it lives                           |
| ---------- | --------------------------------------------- | ---------------------------------------- |
| Trace ID   | Which backend logs belong to this user action | `packages/core`, sent as a header        |
| Sentry     | What broke in the browser, and what led to it | `apps/web-client/src/services/sentry.ts` |
| Web Vitals | How fast the page felt                        | same file, sent to Sentry as metrics     |

All of them are initialized in `apps/web-client/src/main.tsx` after `setupCore()`. Without `VITE_SENTRY_DSN`, `initSentry` returns immediately and every Sentry call becomes a no-op (`captureException` checks `Sentry.getClient()` first). Local development and tests need no Sentry account.

## Trace ID End-to-End

`packages/core/src/services/logger/trace-id.ts` creates one UUID when the module is loaded:

```ts
export const traceId = uuid();
```

`apiRequest` sends it on every request as `x-trace-id`. The backend middleware (`trace-id.middleware.ts`) uses the id of the active OpenTelemetry span when tracing is on, otherwise the incoming `x-trace-id` value, or creates its own when the header is missing. It stores the id in the request context and echoes it back in the `X-Trace-Id` response header (exposed to browser code by the backend CORS configuration). Every error response carries this header. Every backend log line written during that request carries the id.

The same id is attached on the client side:

- `Sentry.setTag('trace_id', traceId)` in `initSentry`, so a Sentry issue can be searched by trace id;
- the `traceId` prop of logrock's `LoggerContainer` in `app.tsx`, so the log payload sent to the backend contains it (see Client Logs Endpoint);
- the `X-Trace-Id` header of an error response (the body has no trace id), which `BackendError` keeps and `apiRequest` writes to the warn log.

The granularity is a **page load**, not a single request: reload the page and a new id is issued. This is a deliberate trade-off. One id per session lets support ask for a single value and see everything the user did; per-request ids would be more precise but would need to be shown to the user for every error.

How to find a user's requests:

1. Get the trace id. From a Sentry issue, read the `trace_id` tag. From a user report, ask for it from the browser's network tab (the `x-trace-id` request header) or read the `traceId` of a failed request from the browser console warn log.
2. Open Grafana, Explore, the Loki data source, and select the backend's log stream.
3. Add a line filter with the value: `|= "9c226319-abcc-4d6c-a1b6-f5d1cf18b6ae"`.

The result is the full request flow on the server, in order. The step that is not automated is showing the id to the user in the UI; today it is only in the console and in Sentry.

## Sentry

Sentry is initialized in `initSentry`:

```ts
Sentry.init({
  dataCollection: {
    cookies: false,
    databaseQueryData: false,
    genAI: { inputs: false, outputs: false },
    httpBodies: [],
    httpHeaders: false,
    urlQueryParams: false,
    userInfo: false,
  },
  dsn,
  environment: import.meta.env.MODE,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({ blockAllMedia: false, maskAllText: false }),
  ],
  release: import.meta.env.VITE_APP_VERSION,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  tracesSampleRate: import.meta.env.MODE === 'production' ? 0.2 : 1.0,
});
```

- **No default PII.** `dataCollection` turns off every category Sentry would otherwise collect on its own: user details, cookies, headers, bodies and query parameters. It replaces `sendDefaultPii`, which Sentry 10.78 deprecated and Sentry 11 removed.
- **Replay: 10% of sessions, 100% of sessions with an error.** Recording everything is expensive and mostly useless; recording every failure is cheap and is exactly what is needed. `maskAllText: false` is acceptable here because the application shows no sensitive text beyond the user's own todos; an application that does must turn masking on.
- **Traces: 20% in production, 100% elsewhere.** Sampling keeps the quota under control while production stays representative.
- **Release is the package version.** `vite.config.ts` defines `import.meta.env.VITE_APP_VERSION` from `apps/web-client/package.json`. The same value is used as the release name when source maps are uploaded, so an issue in `v1.2.2` resolves to the original source lines of `v1.2.2`.
- **Source maps are hidden and private.** `build.sourcemap: 'hidden'` produces `.map` files without the `sourceMappingURL` comment. When `SENTRY_AUTH_TOKEN` is set at build time, `sentryVitePlugin` uploads them to Sentry and deletes them after upload (`filesToDeleteAfterUpload`); `cd.yml` also excludes `*.map` from the S3 sync as a second guard (configuration is in [Configuration](configuration.md)). Without the token the build still succeeds and stack traces in Sentry stay minified.

What gets reported:

- the **error middleware** reports rejected thunks that are not 4xx and not silent or not-found rejections (see [State Management](state-management.md)), through the `reportError` function injected into core. Core does not import Sentry;
- the **error boundary** reports render exceptions with the component stack as context;
- unhandled errors and rejections are captured by the Sentry SDK itself.

Mobile has its own `initSentry` in `apps/mobile-client/src/services/sentry.ts` with `@sentry/react-native`, `sendDefaultPii: false` (the React Native SDK has no `dataCollection` option yet), the same `trace_id` tag and the same traces sampling (no replay), and reads `EXPO_PUBLIC_SENTRY_DSN`.

## Web Vitals

Core Web Vitals are measured in the real browser of the real user, which is something no lab test can give. `reportWebVitals` in `sentry.ts` subscribes to three of them with the `web-vitals` library:

```ts
onCLS(reportWebVital);
onINP(reportWebVital);
onLCP(reportWebVital);
```

| Metric | Measures                          | Unit        |
| ------ | --------------------------------- | ----------- |
| LCP    | when the main content is visible  | millisecond |
| INP    | how fast the page reacts to input | millisecond |
| CLS    | how much the layout jumps         | none        |

Each value is sent with `Sentry.metrics.distribution('web_vitals.<name>', value, { attributes: { rating }, unit })`. `rating` is `good`, `needs-improvement` or `poor`, as classified by the library, so a dashboard can show the share of poor sessions without knowing the thresholds.

Vitals are sent only when Sentry is enabled. There is no separate analytics endpoint. FCP and TTFB are not collected: LCP covers loading, and TTFB is visible on the server and the CDN side.

## Client Logs Endpoint

The web client also has its own log buffer. `LoggerContainer` from `logrock` in `app.tsx` keeps the last `loggerLimit` (25) log entries in memory. When an error happens, it calls `onError` with that stack, and the app posts it to the backend:

```ts
onError={(stack) => {
  void logsApi.send(stack).catch(console.error);
}}
```

`logsApi.send` (`packages/core/src/api/logs.api.ts`) is `POST client-logs/web`. The backend validates the payload (`WebLogDto`: `actions`, `env`, `metadata`, `timestamp`, `traceId`) and answers `204`.

What the backend does with it today: `ClientLogsService.processWebLog` writes the payload to the backend log at warn level; it is not stored anywhere else yet. The client's own id is logged as `clientTraceId`, and query string and hash are stripped from `fullUrl` and `url` in the metadata. Until the storage is added, the trace of "what the user did before the error" is available in Sentry replay and breadcrumbs, not in the backend.

`POST client-logs/web` is public, so logs from signed-out pages (login, registration) are accepted without a token. It is throttled to 20 requests per 60 seconds; a throttled send fails with `429 TOO_MANY_REQUESTS` and ends up in `console.error` like any other failed send. `metadata` is required, `actions` holds at most 100 entries, an action `stack` at most 10000 characters, and the payload must not contain PII.

If the request that sends the log fails, the error goes to `console.error` and is dropped. Sending a log must never trigger another log, otherwise a backend outage turns into a request loop.

## What We Do Not Collect

The rule: collect what is needed to find and fix a defect, and nothing that identifies a person without need.

Not collected:

- passwords and tokens (the logger writes the request path, method, status and codes, never headers or bodies);
- the content of requests and responses;
- IP address and other default PII: `dataCollection` turns it off on web, `sendDefaultPii: false` on mobile;
- cookies and local storage contents.

Collected on purpose:

- error stacks, component stacks, the `trace_id` tag, release and environment;
- performance metrics without user identity;
- session replay of 10% of sessions and of every session with an error. Text is not masked (see above), so what the user types or sees in those sessions is visible in the replay.

What the current code **does** send as user context: `bindSentryUser` mirrors the signed-in user into Sentry as a hashed id:

```ts
Sentry.setUser({ id: sha256(email.toLowerCase()) });
```

It is set after `hydrateAuth` or login, and cleared with `null` after logout. Sentry receives a SHA-256 hash of the email as `user.id`, not the email: enough to count affected users and correlate their events, without PII.

For production use with real users, add a consent mechanism for replay and a retention period in the Sentry project settings.
