**Status:** ⏸ hold · **Version:** 1.2.0 · **Date:** 2026-11-17 · **Modules:** core, web-client, mobile-client, docs

# 02 — Use the test adapters

## Files

- `packages/core/src/config/core-config.test.ts`
- `packages/core/src/api/client.test.ts`
- `packages/core/src/features/auth/auth.thunks.test.ts`
- other core tests that call `configureCore` (find with `grep -rl configureCore packages/core/src`)
- `apps/web-client/src/services/core-setup.test.ts` and `apps/mobile-client/src/test-utils/` where they stub storage or
  the logger for the store (the adapter tests themselves, such as `secure-store-adapter.test.ts`, keep their mocks:
  they test the real adapter)
- `docs/architecture/patterns.md` — how to configure core in a test
- `guide/` chapter on testing core, if it describes the stubs

## Rules

- Replace stubs only; do not change what a test asserts.
- Keep `vi.fn()` / `jest.fn()` where a test needs an adapter to throw or reject.
- Assert on `storage.snapshot()`, `logger.entries` and `reports` where it replaces call-argument inspection.

## Tests

The changed test files pass unchanged in count: `npx nx test core`, then the web-client and mobile-client test files
that were edited.
