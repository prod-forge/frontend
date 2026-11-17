**Status:** 📝 draft · **Version:** 2.0.0 · **Date:** 2026-11-17 · **Modules:** core, web-client, mobile-client, test-data, docs, guide

# Design: OIDC login

## Intent

Same review suggestion as [002-session-isolation](../002-session-isolation/00-design.md): replace the auth stub. The
backend plan `003-oidc-authentication` makes the API accept only tokens from an OIDC provider (Keycloak locally,
Cognito on AWS) and removes `POST /auth/login`. Both clients must log in through the provider.

## Current state

- `authApi.login(email)` posts the email; `login` and `register` thunks both call it
  (`packages/core/src/features/auth/auth.thunks.ts`); `register` keeps the name locally
  (`docs/hacks/core.md`, "register logs an existing user in").
- The login and register forms ask for a password that is validated (`auth.schemas.ts`) but never sent.
- The token and user are stored through `KeyValueStorage` (`localStorage` on web, SecureStore on mobile) by
  `auth.listeners.ts`; a 401 with a token dispatches `logout()`. There is no refresh: the session ends when the
  1-hour token expires.
- Web CSP `connect-src` lists the API, assets and Sentry only (`apps/web-client/index.html`).
- `guide/security.md` says passwords, refresh tokens, sign-up and an identity provider are out of scope.

## Goals

1. Login and sign-up happen on the provider's pages (hosted login), reached with Authorization Code + PKCE (S256)
   and `state`; the client never sees a password.
2. Core owns the session: access token, refresh token, expiry, the user from the ID token claims; it refreshes before
   expiry and once on a 401, then logs out. Core stays platform-neutral (`docs/restrictions/platform.md`): redirects
   and browsers live in app adapters.
3. Logout clears the session and calls the provider's end-session endpoint.
4. Web e2e and unit tests run without a real provider; one manual check per platform against local Keycloak.

## Non-goals

- Silent login in an iframe and third-party cookies.
- Social login, MFA: provider configuration, no client code.
- A backend-for-frontend that keeps tokens in an HttpOnly cookie on web (decision 2026-11-17).

## Design

### Core (plan 01)

- `CoreConfig` gets `authClient: AuthClient`, the platform adapter:

  ```ts
  type AuthClient = {
    readonly signIn: () => Promise<TokenSet | null>; // null when the user cancels
    readonly refresh: (refreshToken: string) => Promise<TokenSet>;
    readonly signOut: (idToken: string | null) => Promise<void>;
  };
  type TokenSet = {
    readonly accessToken: string;
    readonly refreshToken: string | null;
    readonly idToken: string | null;
    readonly expiresAt: number;
  };
  ```

- The `login` thunk calls `authClient.signIn()`; the `register` thunk and its hack are removed (sign-up is a link on
  the provider's page). `AuthUser` comes from ID token claims (`email`, `name`), decoded, not verified:
  the client trusts what its own provider exchange returned, the API verifies the access token.
- `apiRequest` gets the access token through `getToken`, as today; a new `ensureFreshToken()` refreshes when less
  than 60 s remain, with one shared in-flight refresh. A 401 triggers one refresh and one retry, then `logout()`.
- Storage keys: `auth-session` (the token set) replaces `auth-token`; `hydrateAuth` drops an expired session without a
  refresh token.
- `authApi.login` and `UNKNOWN_EMAIL_MESSAGE` are removed; the 401-on-login mapping goes with them.

### Web (plan 02)

- `apps/web-client/src/services/auth-client.ts` implements `AuthClient` with `oidc-client-ts` (`UserManager`,
  redirect flow). `signIn` redirects; route `/auth/callback` completes the exchange and dispatches the session.
- Config: `VITE_OIDC_AUTHORITY`, `VITE_OIDC_CLIENT_ID`; the build env guard and the CSP `connect-src` include the
  authority.
- The login page becomes one "Sign in" button to the provider; the register page and route, the password fields and
  the form schemas are removed.
- e2e: `fixtures.ts` mocks the authority's discovery, authorize redirect and token endpoint, so Playwright runs the
  full code flow without Keycloak.

### Mobile (plan 03)

- `apps/mobile-client/src/services/auth-client.ts` on `expo-auth-session` + `expo-web-browser` (Expo SDK packages, no
  native files to maintain), redirect `prodforge://auth/callback`; config from `EXPO_PUBLIC_OIDC_*`.
- Session in SecureStore as today. Jest tests mock `expo-auth-session`.

## Compatibility

Released together with backend 2.0.0, backend first. An installed 1.x mobile build cannot log in after the backend
upgrade; there is no store release, so nothing to migrate.

## Open questions

None.

## Decisions

- 2026-11-17 — Generic OIDC with Authorization Code + PKCE on both clients; Keycloak locally, Cognito on AWS.
- 2026-11-17 — Session isolation tests (002) first, then this plan.
- 2026-11-17 — Web keeps the session in `localStorage`, with short access tokens and refresh-token rotation at the
  provider; no backend-for-frontend.
- 2026-11-17 — One "Sign in" screen; sign-up is offered by the provider's page. The register screens, route and thunk
  are removed.
- 2026-11-17 — The backend stores only `sub`; the user's email and name come from the ID token on the client.

## Agent's calls (to check)

1. `AuthClient` adapter injected through `CoreConfig`, like storage and logger; core has no OIDC library.
2. `oidc-client-ts` on web instead of a hand-written PKCE flow; `expo-auth-session` on mobile.
3. Refresh before expiry (60 s margin) plus one refresh-and-retry on 401; a single shared in-flight refresh.
4. ID token claims are decoded without verification on the client.
5. Version 2.0.0: the login flow and stored session format change, and the client requires backend 2.0.0.
6. Web e2e mocks the provider endpoints; a real Keycloak run is a manual check in the conclusions.
