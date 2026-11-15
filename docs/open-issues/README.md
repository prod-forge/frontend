# Open Issues

Deferred known problems, so they are not rediscovered (or silently "fixed") in every session. Each entry links the GitHub issue that tracks it. When a problem is fixed, remove its line in the same change.

## GitHub issues

- [#3](https://github.com/prod-forge/frontend/issues/3) — Type `Todo.description` as `string | null` to match the backend. See the note under `Todo` in [data-schema.md](../architecture/data-schema.md): the backend column is nullable, the client type says `string`, and the UI treats a falsy description as empty.
- [#4](https://github.com/prod-forge/frontend/issues/4) — Set `displayName` on the remaining `ui-web` components.
- [#5](https://github.com/prod-forge/frontend/issues/5) — Rename `errors.slice.ts` to `errors.slices.ts` to match the other feature files.
- [#6](https://github.com/prod-forge/frontend/issues/6) — Enforce the 254 character email limit in the auth schema.
- [#8](https://github.com/prod-forge/frontend/issues/8) — Verify the format of deploy variables in the CD workflow, not only their presence.
- [#9](https://github.com/prod-forge/frontend/issues/9) — Show the `Retry-After` wait to the user when the API answers 429.
- [#10](https://github.com/prod-forge/frontend/issues/10) — Add a `size-limit` performance budget for the web client.
- [#11](https://github.com/prod-forge/frontend/issues/11) — Generate Linux visual snapshots for the Playwright suite.
- [#12](https://github.com/prod-forge/frontend/issues/12) — Deploy Storybook as a static site.
- [#13](https://github.com/prod-forge/frontend/issues/13) — Show a "no tasks yet" empty state on Home when no search query is set.
- [#14](https://github.com/prod-forge/frontend/issues/14) — Include the todo title in the TodoItem delete button's accessible name.
- [#15](https://github.com/prod-forge/frontend/issues/15) — Link the EditableTitle and EditableDescription errors to their fields with `aria-describedby`.
- [#17](https://github.com/prod-forge/frontend/issues/17) — Remove the dead `instanceof Error` branch in the error middleware.
- [#18](https://github.com/prod-forge/frontend/issues/18) — Remove the duplicated `Todo` type from core.
- [#19](https://github.com/prod-forge/frontend/issues/19) — Leave the web todo detail page only after the delete succeeds.
- [#20](https://github.com/prod-forge/frontend/issues/20) — Take transition durations from the design tokens instead of hardcoding them.

## Without an issue

- [branch-protection.md](branch-protection.md) — `main` has no branch protection: no required checks or review, force pushes allowed; waits for CI to be enabled.
- [npm-audit-findings.md](npm-audit-findings.md) — `npm audit --omit=dev` reports 1 high, 23 moderate and 1 low finding, all transitive through dev servers, test runners and build tools; the proposed fixes are breaking downgrades.
- [e2e-coverage-below-threshold.md](e2e-coverage-below-threshold.md) — `test:e2e:cov` reports about 71% against the 80% threshold; predates the 2026-11-05 dependency upgrade.

## Format

One line per problem: the issue link, its title and, when the docs already describe it, a link to that note. A problem without an issue gets a short file in this folder: what is wrong, where, why it is deferred, and what a fix needs.
