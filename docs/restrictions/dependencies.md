# Dependencies

## One React version, pinned to the Expo SDK

- **Rule:** `apps/web-client`, `packages/ui-web` and `apps/mobile-client` pin the same `react` (19.3.0), the one the Expo SDK requires, and the root `devDependencies` pin the same `react` and `react-dom`. An Expo SDK upgrade bumps all four together; a newer React patch is not taken before the Expo SDK asks for it.
- **Reason:** two copies of React break hooks with "Invalid hook call" when one copy's hooks run inside the other's renderer. Aligned versions let npm hoist one copy (`guide/mobile-client.md`).
- **Where:** `react` in `apps/web-client/package.json`, `packages/ui-web/package.json`, `apps/mobile-client/package.json` and the root `package.json`. The root pin exists because root test tooling (`@testing-library/react`) takes React as a peer: without it npm hoisted the newest React (19.3.1) to the root and nested 19.3.0 in every workspace. Check with `npm ls react`: one version only.

## No root `overrides`, no `disableHierarchicalLookup`

- **Rule:** do not force a single React copy through root `overrides` in `package.json` or through Metro's `disableHierarchicalLookup`.
- **Reason:** root overrides hide the real versions in the dependency graph; SDK 58 `expo-doctor` rejects `disableHierarchicalLookup` (and `newArchEnabled`) (`guide/mobile-client.md`).
- **Where:** root `package.json` has no `overrides`; `apps/mobile-client/metro.config.js` documents the choice. `npx nx doctor mobile-client` runs `expo-doctor`.

## Never `--legacy-peer-deps`

- **Rule:** never pass `--legacy-peer-deps` and never change npm peer dependency resolution.
- **Reason:** npm peer dependency resolution must not be changed (the deny reason of the hook).
- **Where:** `.claude/settings.json` — a `PreToolUse` hook denies any Bash command that contains `--legacy-peer-deps`.

## Exact versions, generated lock file

- **Rule:** dependencies are saved with exact versions; `package-lock.json` is changed only by npm.
- **Where:** `.npmrc` (`save-exact=true`); `.claude/settings.json` denies Edit and Write on `package-lock.json`.

## Node version

- **Rule:** Node.js 24.21.0 (`docs/commands.md`, "Prerequisites").
- **Where:** `NODE_VERSION: 24.21.0` in `.github/workflows/ci.yml` and `.github/workflows/cd.yml`.

## TypeScript stays on 6 until typescript-eslint supports 7

- **Rule:** keep `typescript` on the 6.0 line; do not take TypeScript 7.
- **Reason:** `typescript-eslint` 8.72 (and `@typescript-eslint/parser`) declare `typescript >=4.8.4 <6.1.0`; with TypeScript 7 the type-aware lint rules stop working.
- **Where:** `typescript` in the root `package.json`. Revisit when a `typescript-eslint` release accepts TypeScript 7.

## `@types/node` follows the Node.js the project runs on

- **Rule:** `@types/node` is not bumped past the Node.js major the project and CI run (24).
- **Reason:** newer types describe APIs that the runtime does not have, so code type-checks and then fails at runtime.
- **Where:** `@types/node` in the root `package.json`; `NODE_VERSION` in `.github/workflows/ci.yml`.
