# Dependencies

## One React version, pinned to the Expo SDK

- **Rule:** `apps/web-client`, `packages/ui-web` and `apps/mobile-client` pin the same `react` (19.3.0), the one the Expo SDK requires. An Expo SDK upgrade bumps all three together.
- **Reason:** two copies of React break hooks with "Invalid hook call" when one copy's hooks run inside the other's renderer. Aligned versions let npm hoist one copy (`guide/mobile-client.md`).
- **Where:** `react` in `apps/web-client/package.json`, `packages/ui-web/package.json`, `apps/mobile-client/package.json`. Check with `npm ls react`.

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
