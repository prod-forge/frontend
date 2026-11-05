# `main` has no branch protection

- **What:** the `main` branch of `prod-forge/frontend` on GitHub has no branch protection rule or ruleset: no required status checks, no required review, and direct pushes and force pushes are allowed.
- **Where:** the repository settings on GitHub (Settings, Branches or Rules); nothing in this repository configures it.
- **Why deferred:** CI is disabled on purpose (`docs/restrictions/ci-cd.md`), so there is no status check to require yet. Until then the local checks are the only gate: the husky hooks and `npm run full-check` before a push. No document claims that merges are blocked by checks.
- **What a fix needs:** when `ci.yml` is enabled, add a rule for `main` that requires the `verify` and `build` checks and a pull request, and blocks force pushes and deletion. The owner sets it in the GitHub settings.
