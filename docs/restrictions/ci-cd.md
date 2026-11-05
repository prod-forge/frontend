# CI and CD

## CI is disabled on purpose

- **Rule:** do not enable `ci.yml` and do not treat its absence as a bug. The local checks are the gate: the husky hooks and `npm run full-check` (lint, knip, unit, e2e, visual, a11y) before a push.
- **Reason:** an owner decision, not an oversight; the full job is heavy (`guide/testing-strategy.md`, "CI is disabled"). Enabling CI is an open item in `roadmap.md`.
- **Where:** `.github/workflows/ci.yml` — `if: false` on the `verify` job; the `build` job has `needs: verify`. `.github/actionlint.yaml` silences actionlint's "constant expression" error for this one condition in `ci.yml`.

## Nothing is deployed

- **Rule:** do not push `v*` tags or run `npm run release` without an explicit request.
- **Reason:** the repository is a reference, not a product; the owner decided that nothing is deployed from it. The pipeline is written and complete (`guide/release-and-deployment.md`, "Status" and "Why Not Deploy on Every Merge").
- **Where:** `.github/workflows/cd.yml` ("Release Frontend") runs on `push` of tags `v*` and stops at "Check deploy variables" when a deploy variable is empty. `npm run release` creates and pushes the tag (`.release-it.json`, `git.push: true`).
- **Consequence:** CD runs no lint or tests; with CI disabled nothing in GitHub stops a tag on an untested commit (`guide/release-and-deployment.md`).
