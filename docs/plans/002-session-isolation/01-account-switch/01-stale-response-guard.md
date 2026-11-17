**Status:** ✅ approved · **Version:** 1.1.1 · **Date:** 2026-11-17 · **Modules:** core

# 01 — Stale response guard

## Files

- `packages/core/src/features/todos/todos.slices.test.ts` — first, the failing tests.
- `packages/core/src/features/auth/auth.slices.ts`, `auth.types.ts`, `auth.selectors.ts` — `sessionId`.
- `packages/core/src/features/todos/todos.slices.ts` — `getPendingMeta` on the todo thunks, the guard in each
  `fulfilled`/`rejected` case.

## Tests

Negative cases first:

- `fetchTodos` started, `logout`, then the response resolves → `items` stay empty, `total` 0;
- same with `login` of another user in between → B's store holds no A item;
- `fetchMoreTodos`, `fetchTodoById`, `createTodo`, `updateTodo`, `deleteTodo` resolving or rejecting after
  logout → no change to the new session's state;

Positive: a response in the same session is applied as before (existing tests stay green).

Run: `npx nx test core`, then `npx nx test mobile-client` (it uses the same store).
