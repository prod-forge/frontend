**Status:** 📝 draft · **Version:** 2.0.0 · **Date:** 2026-11-17 · **Modules:** web-client

# 01 — Web AuthClient

## Files

- `apps/web-client/src/services/auth-client.ts` — `AuthClient` over `UserManager` (code flow, PKCE S256,
  `response_mode=query`); `register` adds `kc_action=register` / the provider's sign-up hint from config.
- `apps/web-client/src/services/core-setup.ts` — pass `authClient`.
- Route `/auth/callback` (lazy page): `signinRedirectCallback`, then dispatch the session and navigate home; an
  error shows the existing error UI.
- `VITE_OIDC_AUTHORITY`, `VITE_OIDC_CLIENT_ID` in `.env.example`, `vite.build-env.mts` guard, CSP
  `connect-src` (`index-csp.test.ts`).

## Tests

`auth-client.test.ts` with `UserManager` mocked; `vite.build-env.test.ts` for the new vars; CSP test.

Run: `npx nx test web-client`.
