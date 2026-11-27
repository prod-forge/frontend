# Open Issues

Deferred known problems, so they are not rediscovered (or silently "fixed") in every session. Each entry links the GitHub issue that tracks it. When a problem is fixed, remove its line in the same change.

## GitHub issues

- [#3](https://github.com/prod-forge/frontend/issues/3) — Type `Todo.description` as `string | null` to match the backend. See the note under `Todo` in [data-schema.md](../architecture/data-schema.md): the backend column is nullable, the client type says `string`, and the UI treats a falsy description as empty.
- [#4](https://github.com/prod-forge/frontend/issues/4) — Set `displayName` on the remaining `ui-web` components.
- [#8](https://github.com/prod-forge/frontend/issues/8) — Verify the format of deploy variables in the CD workflow, not only their presence.
- [#9](https://github.com/prod-forge/frontend/issues/9) — Show the `Retry-After` wait to the user when the API answers 429.
- [#10](https://github.com/prod-forge/frontend/issues/10) — Add a `size-limit` performance budget for the web client.
- [#11](https://github.com/prod-forge/frontend/issues/11) — Generate Linux visual snapshots for the Playwright suite.
- [#12](https://github.com/prod-forge/frontend/issues/12) — Deploy Storybook as a static site.
- [#25](https://github.com/prod-forge/frontend/issues/25) — Fix the contrast of text on primary and danger buttons in the dark theme.
- [#26](https://github.com/prod-forge/frontend/issues/26) — Ignore stale `fetchTodos` responses so an earlier search cannot overwrite a newer one.
- [#43](https://github.com/prod-forge/frontend/issues/43) — Ignore out-of-order `toggleTodo` responses so a quick double toggle cannot leave the wrong state.
- [#44](https://github.com/prod-forge/frontend/issues/44) — Refetch the current page after adding a todo on web Home.
- [#45](https://github.com/prod-forge/frontend/issues/45) — Debounce the web search before fetching todos.
- [#46](https://github.com/prod-forge/frontend/issues/46) — Hide decorative icons from screen readers with `aria-hidden`.
- [#48](https://github.com/prod-forge/frontend/issues/48) — Reuse the `Button` styles for the Sign in and Create account links on web Home.
- [#49](https://github.com/prod-forge/frontend/issues/49) — Fix the flaky mobile `todos.test.tsx` error banner test under parallel `test:cov`.

## Without an issue

- [branch-protection.md](branch-protection.md) — `main` has no branch protection: no required checks or review, force pushes allowed; waits for CI to be enabled.
- [npm-audit-findings.md](npm-audit-findings.md) — `npm audit --omit=dev` reports 1 high, 23 moderate and 1 low finding, all transitive through dev servers, test runners and build tools; the proposed fixes are breaking downgrades.
- [e2e-coverage-below-threshold.md](e2e-coverage-below-threshold.md) — `test:e2e:cov` reports about 71% against the 80% threshold; predates the 2026-11-05 dependency upgrade.

## Format

One line per problem: the issue link, its title and, when the docs already describe it, a link to that note. A problem without an issue gets a short file in this folder: what is wrong, where, why it is deferred, and what a fix needs.
