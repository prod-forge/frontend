**Status:** 📝 draft · **Version:** 2.0.0 · **Date:** 2026-11-17 · **Modules:** web-client, ui-web, docs, guide

# 02 — Pages, e2e, docs

## Files

- Login and register pages: provider buttons; password fields and `loginSchema`/`registerSchema` removed (or kept
  only if open question 2 keeps a form).
- `apps/web-client/e2e/fixtures.ts` — mocked discovery, authorize redirect back to `/auth/callback`, token endpoint;
  `auth.spec.ts` and `session-isolation.spec.ts` run through it.
- Visual snapshots of the changed pages (`npm run test:visual`, macOS).
- `guide/security.md` "Authentication", `guide/state-management.md` (session, refresh), `docs/architecture/api.md`,
  `docs/architecture/data-schema.md`, `README.md` env list.

## Tests

`npx nx e2e web-client`, `npm run test:visual`, manual login against local Keycloak (noted in the conclusions).
