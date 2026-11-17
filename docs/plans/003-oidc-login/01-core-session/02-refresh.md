**Status:** ✅ approved · **Version:** 2.0.0 · **Date:** 2026-11-17 · **Modules:** core

# 02 — Refresh

## Files

- `packages/core/src/features/auth/ensure-fresh-token.ts` — refresh when < 60 s remain; one shared promise.
- `packages/core/src/api/client.ts` — calls it before each request; on 401 one refresh and one retry.
- `auth.listeners.ts` — `logout` calls `authClient.signOut(idToken)` after clearing storage.

## Tests

Negative first: refresh fails → `logout`, no retry loop; second 401 after refresh → `logout`; two parallel requests
near expiry → one refresh call. Positive: expired-soon token refreshed and the request sent with the new one.

Run: `npx nx test core`.
