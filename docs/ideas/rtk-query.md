# RTK Query for server data

## Problem

Todos are loaded and changed through hand-written thunks and slice reducers in `packages/core`. Caching, request
deduplication, refetch after a mutation and loading/error flags are written by hand per feature, on both clients.
Prompted by an r/expo review comment (2026-11-18); the owner supports the move.

## Direction

- `createApi` in `core` with a custom `baseQuery` on top of `apiRequest`, so platform services still come from
  `configureCore` and `core` keeps no browser or React Native API (`docs/restrictions/platform.md`).
- Todos move to endpoints with tags (`Todo`, `LIST`) and invalidation; optimistic updates where the UI has them now.
  Auth stays a slice with thunks: it is client state, not cached server data.
- Order with the held plans: `001-api-contract` (response schemas in `apiRequest`) and `003-oidc-login` (refresh and
  retry in `apiRequest`) both change the layer `baseQuery` wraps, so the move goes after them, or the plans are updated
  to target `baseQuery`.
- Tests: the mobile `fake-backend.ts` and web e2e mocks stay at the `fetch` level, so screen tests should survive; core
  unit tests move from thunks to endpoints.
- Open questions: version (the `core` public API changes for both clients, likely a major); whether to drop the
  `todos` slice entirely or keep UI-only state (filters) in it.
