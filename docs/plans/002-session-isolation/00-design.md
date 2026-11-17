**Status:** 📝 draft · **Version:** 1.1.1 · **Date:** 2026-11-17 · **Modules:** core, web-client, mobile-client, docs

# Design: session isolation on the client

## Intent

A review suggestion for the backend:

> before high-load work, replace the auth stub and add a two-user test: user b must not read, update, or delete user a's
> todo by swapping its ID. include list responses too, so ownership filtering is exercised as well as the single-item
> routes.

The server side is the backend plans `002-ownership-tests` and `003-oidc-authentication`. The client holds the same
data in its store and storage, so the same question applies here: can user B see what user A loaded?

## Current state

- `todosSlice` resets to `initialState` on `logout` (`packages/core/src/features/todos/todos.slices.ts:160`), tested in
  `todos.slices.test.ts` ("logout clears the previous session's todos").
- `fetchTodos.fulfilled` (and the other thunks' `fulfilled` cases) write the payload without checking which session
  started the request. A list request A started before logging out that resolves after logout, or after B logged in,
  writes A's todos into B's store. Suspected, not yet shown by a test.
- The detail page loads by id; the backend answers 404 to another user, so a stale id from A is safe on the server
  side. The open question is only the client cache.
- Web e2e (`apps/web-client/e2e/`) mocks the API with one user; there is no account-switch test.

## Goals

1. A response to a request started in an ended session never reaches the store.
2. A web e2e test: A logs in and sees their list; logs out; B logs in in the same tab and sees only B's list and
   summary; opening A's todo URL shows the not-found state.
3. The same rule holds on mobile through core; the mobile test covers the store, not the UI.

## Non-goals

- Server-side ownership: the backend plans cover it.
- Encrypting or partitioning storage per user: only the token and the user are stored, and logout removes both.

## Design

- `auth` state gets `sessionId: string | null`, a new id on `login`, `register` and `sessionRestored`, `null` on
  `logout`.
- Todo thunks read `sessionId` in `getPendingMeta` (RTK `createAsyncThunk` option) and keep it in `action.meta`.
  A slice reducer cannot read another slice, so `todosSlice` keeps its own `sessionId`, set by the same auth actions,
  and ignores a `fulfilled` or `rejected` action whose `meta.sessionId` differs from it.
- Optimistic rollbacks (`_pendingDeletes`, `_pendingUpdates`) are cleared by the `logout` reset already; a late
  `rejected` must not restore an item into the new session, which the same guard covers.
- Step 01 writes the failing test first; if it passes on `main`, the suspected gap is not real, the guard is not added,
  and the plan keeps only the tests.

## Open questions

None.

## Decisions

- 2026-11-17 — Ownership tests ship before the auth replacement; both before high-load work.

## Agent's calls (to check)

1. The fix uses a session id in thunk meta rather than aborting in-flight requests on logout: abort covers fetches but
   not a response already being parsed, and the meta check is one rule for every thunk.
2. Version 1.1.1 if the guard is needed (a fix); no release if only tests land.
3. The web e2e mocks two users by token in `fixtures.ts`; it does not need the real backend.
