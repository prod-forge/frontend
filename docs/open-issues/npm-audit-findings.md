# `npm audit` reports transitive findings

- **What:** `npm audit --omit=dev` reports 25 findings on 2026-11-05: 1 high, 23 moderate, 1 low. None is in code this repository writes, and none has a fix that keeps the current toolchain.
- **Where:**
  - high: `compression` 1.8.1 (denial of service via a memory leak on premature close), through `@expo/cli` (`expo` 58, the Expo dev server) and `serve` (the `dev:assets` static server).
  - moderate: `glob` / `minimatch` through `jest` 30.5, `babel-jest` and `babel-plugin-istanbul` (mobile tests), and through `@sentry/bundler-plugins` (`@sentry/react-native` 8.28.0); `@expo/cli` and `@expo/fingerprint` through `expo`.
  - low: `deepmerge` 4.3.1 through `style-dictionary` (design token build) and `jest-config`.
- **Why deferred:** every path is a development server, a test runner or a build tool, not code shipped to the browser or the app. The fixes npm proposes are downgrades that break the toolchain: `expo@53` (SDK 58 is required), `jest@29`, `babel-jest@30.4`, `@sentry/react-native@8.20` (below what SDK 58 expects). `--force` fixes and root `overrides` are not allowed (`docs/restrictions/dependencies.md`).
- **What a fix needs:** wait for Expo, Jest, Sentry and Style Dictionary releases that take fixed versions of `compression`, `minimatch` and `deepmerge`, then rerun `npm audit --omit=dev` and remove this file when it is clean. `serve` can be replaced by another static server for `dev:assets` if its `compression` stays unfixed.
