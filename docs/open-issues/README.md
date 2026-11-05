# Open Issues

Deferred known problems, so they are not rediscovered (or silently "fixed") in every session. Each entry links the GitHub issue that tracks it. When a problem is fixed, remove its line in the same change.

## GitHub issues

- [#3](https://github.com/prod-forge/frontend/issues/3) — Type `Todo.description` as `string | null` to match the backend. See the note under `Todo` in [data-schema.md](../architecture/data-schema.md): the backend column is nullable, the client type says `string`, and the UI treats a falsy description as empty.
- [#4](https://github.com/prod-forge/frontend/issues/4) — Set `displayName` on the remaining `ui-web` components.
- [#5](https://github.com/prod-forge/frontend/issues/5) — Rename `errors.slice.ts` to `errors.slices.ts` to match the other feature files.
- [#6](https://github.com/prod-forge/frontend/issues/6) — Enforce the 254 character email limit in the auth schema.
- [#7](https://github.com/prod-forge/frontend/issues/7) — Order describe blocks negative-first in three test files.
- [#8](https://github.com/prod-forge/frontend/issues/8) — Verify the format of deploy variables in the CD workflow, not only their presence.
- [#9](https://github.com/prod-forge/frontend/issues/9) — Show the `Retry-After` wait to the user when the API answers 429.
- [#10](https://github.com/prod-forge/frontend/issues/10) — Add a `size-limit` performance budget for the web client.
- [#11](https://github.com/prod-forge/frontend/issues/11) — Generate Linux visual snapshots for the Playwright suite.
- [#12](https://github.com/prod-forge/frontend/issues/12) — Deploy Storybook as a static site.

## Format

One line per problem: the issue link, its title and, when the docs already describe it, a link to that note. A problem without an issue gets a short file in this folder: what is wrong, where, why it is deferred, and what a fix needs.
