# Repository

<!-- cspell:ignore commitlintrc infile -->

## English only

- **Rule:** code, comments, docs and the guide are written in English.
- **Where:** `cspell.json` (`"language": "en,en-GB"`). It is not run by a hook; check docs manually with `npx --yes cspell --no-progress 'docs/**/*.md'`.

## Commit messages

- **Rule:** Conventional Commits; allowed types are `ci`, `chore`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`. No `Co-Authored-By` or other AI attribution in commits or pull requests.
- **Reason:** the release changelog is generated from the commit history (`docs/commands.md`, "Commit Convention"); attribution policy is in `AGENTS.md` ("Git Commit Policy").
- **Where:** `.commitlintrc.cjs` (run by `.husky/commit-msg`); `.husky/commit-msg` rejects `Co-Authored-By`, `Generated-By` or `Assisted-By` trailers that mention Claude or Anthropic.

## CHANGELOG.md is generated

- **Rule:** never edit `CHANGELOG.md` by hand.
- **Reason:** `release-it` writes it from the commit history on every release.
- **Where:** `.release-it.json` (`@release-it/conventional-changelog`, `infile: CHANGELOG.md`); `.claude/settings.json` denies Edit and Write on it.

## Protected files and commands

- **Rule:** do not edit `package-lock.json`, `.env*` files, `CHANGELOG.md`, `dist/` or `coverage/`; do not run `git push --force` or `git reset --hard`.
- **Reason:** generated files, secrets, and irreversible history changes (the deny reasons in the hooks).
- **Where:** `.claude/settings.json` — `PreToolUse` hooks on `Edit|Write` and `Bash`.

## Git hooks are the quality gate

- **Rule:** with CI disabled, the hooks and `npm run full-check` are the only gate (`guide/development-workflow.md`, `restrictions/ci-cd.md`); a commit or push that fails them is fixed, not forced through.
- **Where:** `.husky/pre-commit` (lint-staged: Prettier, ESLint, `tsc --noEmit`, `.lintstagedrc.cjs`), `.husky/commit-msg` (commitlint), `.husky/pre-push` (`npm run knip && npm run test:cov`).

## docs/ is not formatted by Prettier

- **Rule:** keep `docs/` out of Prettier.
- **Reason:** these files are written and edited by agents; Prettier has broken their tables, nested lists and checkboxes (`guide/ai-development.md`, "Context belongs to the repository").
- **Where:** `.prettierignore` (`docs/`).
