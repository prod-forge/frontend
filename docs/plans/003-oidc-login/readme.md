**Status:** 📝 draft · **Version:** 2.0.0 · **Date:** 2026-11-17 · **Modules:** core, web-client, mobile-client, test-data, docs, guide

# 003 — OIDC login

## Goal

Both clients sign in through the OpenID Connect provider with Authorization Code + PKCE, keep and refresh the tokens,
and log out at the provider. The email form that called `POST /auth/login`, and the register form that did the same,
are replaced. Client counterpart of the backend `003-oidc-authentication`. Design: [00-design.md](./00-design.md).

Prerequisites: [002-session-isolation](../002-session-isolation/readme.md) is done; backend 003 plans 01–02 are
merged (Keycloak runs locally).

## Plans

1. [01-core-session](./01-core-session/readme.md) — platform-neutral session in core: tokens, expiry, refresh, the
   `AuthClient` adapter.
2. [02-web-login](./02-web-login/readme.md) — web adapter, callback route, CSP, e2e.
3. [03-mobile-login](./03-mobile-login/readme.md) — mobile adapter on `expo-auth-session`, SecureStore, tests.

## Conclusions

_Written when the plan is done._
