**Status:** 📝 draft · **Version:** 1.1.1 · **Date:** 2026-11-17 · **Modules:** web-client

# 02 — Account switch e2e

## Files

- `apps/web-client/e2e/fixtures.ts` — the login mock issues a token per email; the todos mock answers per token
  from two data sets (`test-data` split by user), and `GET /todos/:id` of another user's todo answers 404
  `TODO_NOT_FOUND` like the backend.
- `apps/web-client/e2e/session-isolation.spec.ts`.

## Tests

Negative first:

- A logs in, sees A's titles; logs out; B logs in: none of A's titles, summary counts B's todos only;
- B opens A's todo URL directly → not-found state, no A data rendered;
- A's list request is delayed by the mock until after logout and B's login → B's page never shows A's titles.

Positive: B's own list and detail page work after the switch.

Run: `npx nx e2e web-client -- session-isolation` (CI is off, local run is the gate).
