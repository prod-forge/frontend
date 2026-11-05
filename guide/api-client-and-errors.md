# API Client and Errors

<p align="center">
  <img alt="API Client and Errors" src="assets/api-client-and-errors.jpg" width="701px" height="561px">
</p>

This chapter is about the client side of the contract. How the backend produces errors, filters exceptions and logs them is in [Error Handling](https://github.com/prod-forge/backend/blob/main/guide/error-handling.md) in the backend guide.

## The Client Contract

The client relies on two response shapes.

A successful response wraps the payload in `data`; a list adds `meta`:

```json
{ "data": { "id": "…", "title": "…", "description": "…", "completed": false } }
```

An error response is flat and has the same fields for every failure, whatever its cause:

```json
{
  "code": "TODO_NOT_FOUND",
  "message": "…",
  "status": 404,
  "details": {}
}
```

`details` is optional. The trace id is not in the body: the backend sends it in the `X-Trace-Id` response header, which its CORS configuration exposes to browser code.

`code` is the stable machine-readable value. `message` is for developers and is **not** shown to users (see Mapping Codes to Messages). The trace id (the `X-Trace-Id` header) is the id the backend logged the request under, which is what makes an error report actionable (see [Client Observability](client-observability.md)).

Two responses are special: `204 No Content` (delete, client logs), which has no body, and anything that is not JSON, for example a 502 page from a load balancer. The client has a path for each.

## apiRequest

Every HTTP call goes through one function, `apiRequest<T>(path, options)` in `packages/core/src/api/client.ts`. The endpoint modules (`todos.api.ts`, `logs.api.ts`) are thin: they build the path and body, and unwrap `data`.

What `apiRequest` does:

```ts
const response = await fetch(`${apiBaseUrl}${path}`, {
  ...options,
  headers: {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'Content-Type': 'application/json',
    'x-trace-id': traceId,
    ...Object.fromEntries(new Headers(options?.headers)),
  },
}).catch(() => {
  throw new NetworkError();
});
```

- **Base URL and token come from `getCoreConfig()`** on every call. The token is read through `getToken()` each time, so a login or logout takes effect on the next request with no re-initialization.
- **`x-trace-id`** is a UUID created once per page load (`services/logger/trace-id.ts`). All requests of one session carry the same value.
- **Error trace id.** On a failure, `apiRequest` takes the trace id from the response body if present, otherwise from the `X-Trace-Id` response header, and stores it on the `BackendError`.
- **Caller headers win.** They are merged last, so a specific request can override a default.
- **Logging.** Each request is logged at debug level; failures are logged at warn level with `code`, `status` and `traceId`, never with the body of the request.
- **`204`** returns `undefined`.

There is no retry and no timeout inside `apiRequest`. Retries for writes are dangerous without idempotency keys, and for reads the user has an explicit Retry button (below). A timeout via `AbortController` is a reasonable next step; it is not implemented.

## Error Taxonomy on the Client

`apiRequest` can throw three different errors. They exist because the three situations need different handling.

| Error          | File                           | When                                                          | Carries                                                       |
| -------------- | ------------------------------ | ------------------------------------------------------------- | ------------------------------------------------------------- |
| `NetworkError` | `errors/network-error.ts`      | `fetch` itself rejected: offline, DNS, CORS, connection reset | message only; no `status`                                     |
| `BackendError` | `errors/backend-error.ts`      | non-2xx with a body in the backend format                     | `code`, `status`, `traceId` (from the header), a user message |
| `ApiError`     | `api/client.ts` (not exported) | non-2xx with a body that is not the backend format            | `status`                                                      |

Why not one class:

- A `NetworkError` has no status. The user can fix it (reconnect), the backend knows nothing about it, and it must be reported to Sentry because the server logs will never show it.
- A `BackendError` is a known, documented failure. Its `code` drives the message and the logic, and its `traceId` links it to server logs.
- An `ApiError` is the "something unexpected sits between us and the backend" case: a gateway page, a proxy, a deploy in progress. Only the status is trustworthy. It is the one that tells us the contract was broken.

The detection of the backend format is `isBackendErrorResponse` in `backend-error.ts`: the body must be an object with a string `code` and a numeric `status`; `traceId` is optional there because it normally comes from the header. Anything else falls through to `ApiError`, including a body that is not valid JSON (`response.json().catch(() => null)`).

`BackendError` and `ApiError` both expose `status`. That is what `serializeApiError` keeps when a thunk rejects, and what the error middleware uses to decide whether to report (4xx no, 5xx and status-less yes). The rule is explained in [State Management](state-management.md).

## Mapping Codes to Messages

The message the user sees is chosen on the client, from the code, in `backend-error.ts`:

```ts
const ERROR_MESSAGES: Record<BackendErrorCode, string> = {
  DATABASE_ERROR: 'A storage error occurred. Please try again later.',
  DTO_VALIDATION_ERROR: 'Your request contains invalid data. Please check your input.',
  TODO_NOT_FOUND: 'The requested item could not be found.',
  USER_IS_NOT_AUTHORIZED: 'Please log in to continue.',
  // …
};

const FALLBACK_MESSAGE = 'Something went wrong. Please try again later.';
```

Three decisions are behind this table:

- **Messages are not taken from the response.** The backend `message` is written for engineers and may describe internals. The client owns the wording, which also makes it possible to translate later.
- **Unknown codes are not a crash.** `BackendErrorCode` is a closed union for the 14 codes the client knows (the same list as `ApiErrorDto.code` in the backend OpenAPI document), but the lookup goes through `Partial<Record<string, string>>` with a fallback. When the backend adds a code before the client learns it, the user sees the generic message and the code is still in the log.
- **Infrastructure codes get "try again later".** `DATABASE_ERROR`, `REDIS_ERROR` and `INFRA_FAILURE` do not explain what failed. The user cannot act on it; the trace id can.

The cost of this design is a table that must follow the backend. There is no generated shared type; a new backend code needs one line here.

## Toasts, Retry, Error Boundary

Different failures are shown in different places. The rule is that the user is told once, where it is useful.

| Failure                                 | Where it appears                        | Mechanism                                                             |
| --------------------------------------- | --------------------------------------- | --------------------------------------------------------------------- |
| A failed mutation (add, toggle, delete) | Toast, state is rolled back             | thunk rejected -> `errorMiddleware` -> `pushError` -> `ErrorNotifier` |
| The first load of the list failed       | Inline `ErrorBlock` with a Retry button | `status === 'error' && todos.length === 0` in `home.tsx`              |
| A todo that does not exist (404)        | "Not found" screen, no toast            | `fetchTodoById` rejects with `silent: true`                           |
| A rendering exception                   | Full-page fallback with "Reload page"   | `ErrorBoundary` in `ui-web`                                           |
| A failure on an optimistic item         | Nothing                                 | `silent: true`, the item never reached the server                     |

The toast path starts in the middleware. `ErrorNotifierContainer` in `apps/web-client/src/containers/errors/` reads `selectVisibleErrors` and passes it to the `ErrorNotifier` component; dismissing dispatches `dismissError(id)`.

The Retry button of the empty list clears the error queue and dispatches `fetchTodos` again. It appears only when there is nothing to show: if the list is loaded and a later refresh fails, the old data stays on screen and a toast is shown instead.

The error boundary (`packages/ui-web/src/components/error-boundary/error-boundary.tsx`) catches exceptions thrown while rendering, which thunks and the middleware never see. It does not know about Redux or Sentry; the app passes an `onError` callback in `app.tsx` that logs the error and calls `captureException` with the component stack. The fallback only offers a page reload, because after a render exception the component tree cannot be trusted.

Mobile shows load failures with `ErrorBanner` (`apps/mobile-client/src/components/error-banner.tsx`), which has a retry action, driven by the same `status` field of the todos slice.

## Validation on Both Sides

Input is validated twice, for different purposes.

- **On the client**, zod schemas in `packages/core` (`todos.schemas.ts`, `auth.schemas.ts`) give the user immediate feedback while typing: title required and at most 200 characters, description at most 2000, search at most 100, password 3 to 20 characters, name at most 50 (registration), email format. The limits are exported constants (`TITLE_MAX_LENGTH`, `DESCRIPTION_MAX_LENGTH`, `SEARCH_MAX_LENGTH`, `PASSWORD_MAX_LENGTH`, `NAME_MAX_LENGTH`) that both the schemas and the form components import, so the client rules do not drift apart between web and mobile. The schemas are in `core`, so web and mobile use the same rules.
- **On the server**, class-validator DTOs decide what is accepted. See [Security](https://github.com/prod-forge/backend/blob/main/guide/security.md) in the backend guide. Client validation is a convenience; it is never a security boundary, since anyone can send a request without the client.

There is **no single source of truth** today. The limits are written twice, once in zod and once in the backend DTOs, and they are kept in sync by hand. If they diverge, the user sees the server's `DTO_VALIDATION_ERROR` message from the table above, which is correct but less specific than a field error.

Options to close the gap, from cheapest to most thorough:

1. A contract test that reads the backend OpenAPI document and compares `maxLength` and `minLength` with the exported client constants.
2. Generating TypeScript types (and zod schemas) from the backend OpenAPI document, and importing them into `core`.
3. Sharing a validation package between the repositories. This couples releases of the two repositories, which they currently avoid.

Today the first option is the best price for the risk, and it is not implemented.
