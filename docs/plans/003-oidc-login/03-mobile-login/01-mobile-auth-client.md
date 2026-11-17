**Status:** 📝 draft · **Version:** 2.0.0 · **Date:** 2026-11-17 · **Modules:** mobile-client, guide

# 01 — Mobile AuthClient

## Files

- `apps/mobile-client/package.json` — `expo-auth-session`, `expo-web-browser`, `expo-crypto` at the versions
  `npx expo install` picks for the current SDK.
- `apps/mobile-client/src/services/auth-client.ts` — discovery, `AuthRequest` with PKCE, `exchangeCodeAsync`,
  `refreshAsync`, `revokeAsync` + end-session in the browser; redirect `prodforge://auth/callback`.
- `EXPO_PUBLIC_OIDC_AUTHORITY`, `EXPO_PUBLIC_OIDC_CLIENT_ID`.
- `src/app/login.tsx` — one "Sign in" button; `src/app/register.tsx` and its links removed.
- `guide/mobile-client.md` — login flow and the Keycloak note for a device on the LAN (issuer URL must be reachable).

## Tests

Jest with `expo-auth-session` mocked: cancel, error, success, refresh. Manual run on the iOS simulator against local
Keycloak.

Run: `npx nx test mobile-client`.
