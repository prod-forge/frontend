**Status:** ⏸ hold · **Version:** 1.2.0 · **Date:** 2026-11-17 · **Modules:** core

# 02 — Parse at the API boundary

## Files

- `packages/core/src/errors/response-shape-error.ts` — `ResponseShapeError extends Error` with `path` (request path)
  and `issues` (`z.prettifyError` output); `name = 'ResponseShapeError'`; message is the user-facing text from the
  design.
- `packages/core/src/api/client.ts` — `apiRequest<S extends z.ZodType>(path, schema: S, options?): Promise<z.output<S>>`.
  After the status checks: `204` parses `undefined`; otherwise `schema.safeParse(await response.json())`, throwing
  `ResponseShapeError` on failure. Invalid JSON in a 2xx body also becomes `ResponseShapeError`.
- `packages/core/src/api/todos.api.ts`, `auth.api.ts`, `logs.api.ts` — pass schemas; `delete` and `send` pass
  `z.unknown()`.
- `packages/core/src/features/errors/error-middleware.ts` — add `issues` and the request path to the `reportError`
  context when the serialized error is a `ResponseShapeError`; nothing else changes (status-less errors are already
  reported).
- `packages/core/src/errors/serialize-api-error.ts` — keep `path` and `issues` through serialization.
- `packages/core/src/index.ts` — export `ResponseShapeError`.

## Tests

- `client.test.ts`, negative first: a 200 with a body that fails the schema throws `ResponseShapeError` with the path
  and issues; a 200 with invalid JSON throws `ResponseShapeError`; existing network, backend and HTTP error cases still
  pass. Positive: returns the parsed (transformed) value; `204` resolves `undefined`.
- `todos.api.test.ts`: `getOne` maps `description: null` to `''`.
- `error-middleware` test: a rejected thunk with `ResponseShapeError` calls `reportError` with `path` and `issues`, and
  never with the response body.

Run: `npx nx test core`, `npx nx typecheck core`.
