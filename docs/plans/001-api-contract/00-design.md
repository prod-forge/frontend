**Status:** ⏸ hold · **Version:** 1.2.0 · **Date:** 2026-11-17 · **Modules:** core, test-data, web-client, mobile-client, docs

# Design: API contract and test adapters

## Intent

The owner received a review comment on the web/mobile split and asked to take two points from it:

> Put the interfaces (storage, logger, error reporter) in the core package along with tiny in-memory versions, so the
> core's tests run in plain Node without touching SecureStore or Sentry. I'd also treat the schemas as the single source
> of truth and parse at the API client boundary, since the bugs that hurt most in a shared core are one platform holding
> an old response shape after a release.

The third point of the comment (generate web and mobile tokens from one source) is already true:
`packages/design-tokens` builds `tokens.css` and the JS module used by `apps/mobile-client/src/theme/tokens.ts` from the
same JSON files.

## Current state

- `CoreConfig` (`packages/core/src/config/core-config.ts`) already takes `storage`, `logger` and `reportError` as
  injected adapters, and core tests already run in Node. There are no shared in-memory adapters: each test builds its own
  stubs (`core-config.test.ts`, `auth.thunks.test.ts`, `api/client.test.ts`, `apps/web-client/src/services/core-setup.test.ts`).
- Responses are not checked. `apiRequest<T>()` returns `response.json()` cast to `T`, so `apiRequest<{ data: Todo }>`
  is a promise, not a check. A changed backend response reaches the store as `undefined` fields and fails later, far from
  the cause.
- `Todo` is declared twice (`interfaces/todos.ts` and `features/todos/todos.types.ts`) and both say
  `description: string`, while the backend returns `null` for a todo created without a description
  (`docs/architecture/data-schema.md`).
- Zod is already a core dependency and is used for form schemas (`todos.schemas.ts`, `auth.schemas.ts`).

## Goals

1. Core exports in-memory adapters and a test config factory; every test that needs `configureCore` uses them.
2. Every JSON response is parsed with a Zod schema in `packages/core/src/api/`; domain types come from those schemas
   through `z.infer`, so a type cannot disagree with the check.
3. A response of the wrong shape fails at the API boundary with a dedicated error that is reported, with the path of
   the broken field, and the user sees a clear message.
4. Test data and e2e fixtures go through the same schemas, so a stale fixture fails a test.

## Non-goals

- Generating schemas from the backend `docs/openapi.json`. It is a separate repository, and the document is not precise
  enough yet (`TodoResponseDto.description` is typed `object`, `PaginatedResponseDto.data` items are typed `array`).
- Validating request bodies against the backend: forms already use Zod, and the backend answers 422.
- Backend changes. They are proposed below as a separate global plan in the backend repository.
- Forcing old mobile builds to update (see "Backend follow-up").

## Design

### Test adapters (plan 01)

A new subpath entry `@prod-forge-todolist-frontend/core/testing` (`packages/core/src/testing/index.ts`) exports:

- `createMemoryStorage(initial?: Record<string, string>): KeyValueStorage & { readonly snapshot: () => Record<string, string> }`
- `createMemoryLogger(): CoreLogger & { readonly entries: readonly LogEntry[] }`
- `createTestCoreConfig(overrides?: Partial<CoreConfig>): CoreConfig` — base URL `http://test.local/api/v1/`, no token,
  memory storage and logger, `reportError` that records calls.

It is a separate entry so app bundles never import test code, and it has no `vitest` import, so the mobile Jest tests
can use it too. Assertions use the recorded state (`snapshot()`, `entries`, `reports`) instead of `vi.fn()`
call inspection where that reads better; `vi.fn()` stays where a test needs to make an adapter fail.

### Response contract (plan 02)

- `packages/core/src/api/schemas/` holds response schemas: `todoSchema`, `todosResponseSchema`, `todoEnvelopeSchema`,
  `accessTokenEnvelopeSchema`.
- `Todo`, `TodosResponse`, `AccessToken` become `z.infer` / `z.output` of those schemas. The duplicate in
  `interfaces/todos.ts` is removed.
- `description: z.string().nullable().transform((value) => value ?? '')` makes the existing UI assumption ("a falsy
  description is empty") a contract.
- Schemas are not strict: unknown keys are stripped. A backend that adds a field must not break clients already
  installed on phones. Only removed, renamed or retyped fields fail.
- `apiRequest` loses its type parameter and takes a schema: `apiRequest(path, schema, options?)`. The returned type is
  the schema output, so a cast is no longer possible. Endpoints without a body (`DELETE /todos/:id`, `POST /client-logs/web`)
  pass `z.unknown()`.
- On a failed parse `apiRequest` throws `ResponseShapeError` (`packages/core/src/errors/response-shape-error.ts`) with
  the request path and `z.prettifyError` issues. It has no HTTP status, so `errorMiddleware` already reports it through
  `reportError`; the user message is the same on both platforms: "The server sent an unexpected response. Please try
  again later."
- Thunks do not change: they already handle rejections.

## Backend follow-up

Written as the backend global plan `001-api-contract-stability` (backend repository, `docs/plans/`), items 1–3.

URI versioning (`/api/v1`) and a committed, CI-checked `docs/openapi.json` already exist. Versioning without a rule
for what may change inside `v1` still lets an old mobile build break. Proposed, in priority order:

1. **Accurate OpenAPI for responses.** Fix the DTO decorators so `docs/openapi.json` describes what the API returns
   (`description: string | null`, `PaginatedResponseDto` with real item types). Prerequisite for 2.
2. **Breaking-change check in CI.** Diff `docs/openapi.json` against `main` (for example with `oasdiff breaking`) and fail
   the pull request on a breaking change inside `v1`.
3. **Versioning policy** in `docs/restrictions/`: inside a version only additive changes; a removal, rename or type
   change goes to `v2`; the old version keeps working with `Deprecation` and `Sunset` headers for a stated period.
4. **Minimum client version (idea, not now).** Clients send `X-Client-Version` and `X-Client-Platform`; below a
   configured minimum the backend answers `426` with code `CLIENT_UPGRADE_REQUIRED`, and mobile shows an "update the
   app" screen. Useful for a real store release; heavy for a reference project.

With 1–3 in the backend and plan 02 here, a breaking change is stopped in backend CI, and one that slips through is
reported by the client with the exact broken field instead of failing silently.

## Open questions

None.

## Decisions

- 2026-11-17 — Take points 2 (in-memory adapters) and 3 (schemas at the API boundary) of the review comment into one
  plan. Point 1 (tokens) is already done.
- 2026-11-17 — Backend follow-up items 1–3 become a global plan in the backend repository; item 4 (minimum client
  version) stays an idea.
- 2026-11-17 — `ResponseShapeError` shows one neutral message on both platforms.
- 2026-11-17 — The agent's calls below are confirmed. The plan is approved and put on hold: not implemented for now.

## Agent's calls (to check)

All confirmed by the owner on 2026-11-17.

1. Test helpers live in a subpath entry `core/testing`, not in the main index. Needs a `package.json` `exports` entry, a
   `tsconfig.base.json` path and a mobile Jest `moduleNameMapper` line.
2. Schemas are hand-written, not generated from OpenAPI (see Non-goals). Revisit after backend item 1.
3. Non-strict object schemas (unknown keys stripped), so additive backend changes never break installed clients.
4. `apiRequest(path, schema, options?)` replaces `apiRequest<T>(path, options?)`; every call site passes a schema, even
   `z.unknown()`, so no response is accepted without a stated shape.
5. `ResponseShapeError` is reported like any status-less error (it is a defect, either ours or the backend's), and its
   report context carries the request path and the Zod issues, never the response body (it may hold user data).
6. The two plans ship in one minor version, 1.2.0.
