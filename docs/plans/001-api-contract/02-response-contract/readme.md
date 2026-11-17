**Status:** ⏸ hold · **Version:** 1.2.0 · **Date:** 2026-11-17 · **Modules:** core, test-data, web-client, mobile-client, docs

# 02 — Response contract

Every JSON response is parsed with a Zod schema in `packages/core/src/api/`; domain types are inferred from the
schemas; a wrong shape throws `ResponseShapeError`.

## Steps

1. [01-response-schemas](./01-response-schemas.md) — schemas, types from `z.infer`, one `Todo` type.
2. [02-parse-at-boundary](./02-parse-at-boundary.md) — `apiRequest(path, schema, options?)` and `ResponseShapeError`.
3. [03-fixtures-and-docs](./03-fixtures-and-docs.md) — test data and e2e fixtures through the schemas; docs and guide.

## Conclusions

_Written when the plan is done._
