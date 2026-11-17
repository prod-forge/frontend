**Status:** ⏸ hold · **Version:** 1.2.0 · **Date:** 2026-11-17 · **Modules:** core

# 01 — Response schemas

## Files

- `packages/core/src/api/schemas/todo.schemas.ts` — `todoSchema`, `todosMetaSchema`, `todosResponseSchema`,
  `todoEnvelopeSchema` (`{ data: todoSchema }`).
- `packages/core/src/api/schemas/auth.schemas.ts` — `accessTokenSchema`, `accessTokenEnvelopeSchema`.
- `packages/core/src/features/todos/todos.types.ts` — `Todo` becomes `z.output<typeof todoSchema>`.
- `packages/core/src/interfaces/todos.ts` — `TodosResponse` from the schema; the duplicate `Todo` is removed and its
  importers switch to `todos.types.ts`.
- `packages/core/src/api/auth.api.ts` — `AccessToken` from the schema.
- `packages/core/src/index.ts` — export the response schemas (test-data and e2e fixtures use them in step 03).

## Schema rules

- Plain `z.object` (unknown keys stripped), never `.strict()`: an added backend field must not break installed clients.
- `description: z.string().nullable().transform((value) => value ?? '')`.
- Numbers in `meta` are `z.number().int().nonnegative()`; `expiresIn` is `z.number().int().positive()`.
- `id: z.string().min(1)` (not `uuid()`: optimistic ids are not UUIDs and must keep the same type).

## Tests

`packages/core/src/api/schemas/*.test.ts`, negative cases first:

- rejects a todo without `id`, with `completed` as a string, a response without `meta`, a token without `accessToken`;
- maps `description: null` to `''`; strips an unknown field; accepts the current backend response examples.

Type check: `npx nx typecheck core` (no change in exported type shapes except `Todo` now coming from one place).
