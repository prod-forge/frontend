**Status:** ⏸ hold · **Version:** 1.2.0 · **Date:** 2026-11-17 · **Modules:** test-data, web-client, mobile-client, docs

# 03 — Fixtures through the schemas, docs

## Files

- `packages/test-data/src/test-data.test.ts` (new or existing) — every record in `todos` parses with `todoSchema`;
  `applyTodosQuery` output parses with `todosResponseSchema` for a few filter combinations.
- `apps/web-client/e2e/fixtures.ts`, `apps/web-client/e2e/home.spec.ts` — mocked bodies typed against the schema
  input types (`z.input<typeof todoEnvelopeSchema>` etc.), so a stale fixture fails the type check. The e2e runs then
  also parse every mocked response at runtime.
- `apps/mobile-client/src/test-utils/fake-backend.ts` — same typing for its responses.
- `docs/architecture/api.md` — `apiRequest` signature, response parsing, `ResponseShapeError` in "Error handling".
- `docs/architecture/data-schema.md` — `Todo` and `TodosResponse` come from the schemas; replace the nullable
  `description` caveat with the transform.
- `docs/restrictions/platform.md` or a new `docs/restrictions/api.md` — rule: every response goes through a schema;
  schemas never `.strict()`, with the reason (installed mobile builds and additive backend changes).
- `guide/` — the chapter on core / the API client: why responses are parsed and why schemas are not strict.
- `CHANGELOG.md` through the normal release flow, not by hand.

## Tests

- `npx nx test test-data`
- `npx nx typecheck web-client`, `npx nx typecheck mobile-client`
- the mobile tests that use `fake-backend.ts`
- web e2e is part of `npm run full-check`, run by the owner before merge
