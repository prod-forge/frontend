**Status:** ⏸ hold · **Version:** 1.2.0 · **Date:** 2026-11-17 · **Modules:** core, mobile-client

# 01 — `core/testing` entry

## Files

- `packages/core/src/testing/memory-storage.ts` — `createMemoryStorage(initial?)`: `KeyValueStorage` over a `Map`,
  plus `snapshot()`.
- `packages/core/src/testing/memory-logger.ts` — `createMemoryLogger()`: `CoreLogger` that records
  `{ level, message, context }` into `entries`.
- `packages/core/src/testing/test-core-config.ts` — `createTestCoreConfig(overrides?)`: base URL
  `http://test.local/api/v1/`, `getToken: () => null`, memory storage and logger, `reportError` that records into
  `reports`. Returns the config and the recorders.
- `packages/core/src/testing/index.ts` — public exports.
- `packages/core/package.json` — `exports["./testing"]: "./src/testing/index.ts"`.
- `tsconfig.base.json` — path `@prod-forge-todolist-frontend/core/testing`.
- `apps/mobile-client/jest.config.ts` — `moduleNameMapper` for the subpath.
- `knip.json` — only if knip reports the entry as unused before step 02.

## Interfaces for later steps

```ts
type MemoryStorage = KeyValueStorage & { readonly snapshot: () => Readonly<Record<string, string>> };
type MemoryLogger = CoreLogger & { readonly entries: readonly LogEntry[] };
type TestCoreConfig = { readonly config: CoreConfig; readonly logger: MemoryLogger; readonly reports: readonly Report[]; readonly storage: MemoryStorage };
function createTestCoreConfig(overrides?: Partial<CoreConfig>): TestCoreConfig;
```

No `vitest` or `jest` import inside `testing/`, so both runners can use it.

## Tests

`packages/core/src/testing/*.test.ts`, negative cases first:

- storage returns `null` for a missing key; `removeItem` of a missing key does not throw;
- storage round-trips a value and starts from `initial`;
- logger records each level in order;
- `createTestCoreConfig` passes `configureCore` validation and applies overrides.

Run: `npx nx test core`.
