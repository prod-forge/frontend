**Status:** ⏸ hold · **Version:** 2.0.0 · **Date:** 2026-11-17 · **Modules:** core, test-data

# 01 — AuthClient and session

## Files

- `packages/core/src/config/core-config.ts` — `authClient` in `CoreConfig`, validated by `configureCore`.
- `packages/core/src/features/auth/auth.types.ts` — `TokenSet`, `AuthSession = { tokens, user }`.
- `auth.thunks.ts` — `login` calls `signIn`, `register` is removed; a cancelled sign-in resolves to no session without an error.
- `auth.listeners.ts`, `auth.constants.ts` — one key per value (access token, refresh token, expiry, user JSON), each
  well under the SecureStore ~2 KB limit; the ID token is not persisted. `hydrateAuth` reads them and checks expiry.
- `packages/core/src/utils/decode-jwt-claims.ts` — base64url payload decode, no verification.
- Remove `api/auth.api.ts`, `UNKNOWN_EMAIL_MESSAGE`, `serializeLoginError`, `docs/hacks/core.md` register entry.

## Tests

Negative first: `signIn` rejects → login rejected and reported; cancelled → no session, no error; malformed ID token
→ user falls back to no name, email from claims missing → login rejected; stored session expired without refresh token
→ hydration returns null; one key missing → hydration returns null and clears the rest. Positive: session from
`signIn`, persisted and restored.

Run: `npx nx test core`.
