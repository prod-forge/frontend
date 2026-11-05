# E2E coverage is below its 80% threshold

- **What:** `npm run test:e2e:cov` passes all 44 tests but reports about 71% lines, 64% branches and 74% functions for `apps/web-client/src`, so `nyc check-coverage` fails against the 80% thresholds in `.nycrc.json`.
- **Where:** the lowest files are `src/services/sentry.ts` (about 15% lines: the e2e build has no DSN, so Sentry never initialises) and `src/pages/home/home.tsx` (about 58%).
- **Why deferred:** found on 2026-11-05 while upgrading dependencies; `main` before the upgrade gives the same numbers, so it predates the upgrade. CI is disabled, so nothing ran this check.
- **What a fix needs:** either e2e scenarios for the uncovered paths of `home.tsx` and an exclusion of `sentry.ts` from e2e coverage (it is covered by unit tests), or a lower e2e threshold with the reason written next to it.
