# Mobile client hacks

## Entry import order

- **What:** `index.ts` imports `./src/bootstrap` before `expo-router/entry`; `bootstrap.ts` imports `./services/crypto-polyfill` first, then calls `setupCore()`, `initSentry()` and dispatches `hydrateAuth()`.
- **Where:** `apps/mobile-client/index.ts` (`"main": "index.ts"` in `apps/mobile-client/package.json`), `apps/mobile-client/src/bootstrap.ts`.
- **Why:** core creates its trace id with `uuid` at import time, so the polyfill must run before core is evaluated; core must be configured before expo-router mounts any screen (comments in both files, `guide/mobile-client.md`).
- **If cleaned up:** an import sorter or a reorder makes `uuid` fail on Hermes, or a screen reads the store before `setupCore` and gets `CoreNotConfiguredError`.

## Crypto polyfill extends, not replaces

- **What:** fills `crypto.getRandomValues` and `crypto.randomUUID` from `expo-crypto`; when a `crypto` object exists without these methods it is extended in place.
- **Where:** `apps/mobile-client/src/services/crypto-polyfill.ts` (test: `crypto-polyfill.test.ts`).
- **Why:** Hermes has no Web Crypto API, and `uuid` (used by core) needs one of these methods.
- **If cleaned up:** removing it breaks trace id creation; replacing `globalThis.crypto` wholesale drops whatever the runtime already provides.

## Metro monorepo config

- **What:** `watchFolders` is the workspace root, `nodeModulesPaths` lists the app's `node_modules` before the root one, `unstable_enablePackageExports = true`, hierarchical lookup stays on.
- **Where:** `apps/mobile-client/metro.config.js`.
- **Why:** workspace packages live outside the app folder; `design-tokens` exposes its JS only through the `exports` map; SDK 58 `expo-doctor` requires hierarchical lookup, and one React copy comes from aligned versions instead (`guide/mobile-client.md`, `restrictions/dependencies.md`).
- **If cleaned up:** Metro cannot resolve `@prod-forge-todolist-frontend/design-tokens/js` or does not reload changes in `packages/*`; `disableHierarchicalLookup` fails `expo-doctor`.

## Route files use default exports and non-kebab names

- **What:** files in `apps/mobile-client/src/app/` have a default export and names like `_layout.tsx` and `[id].tsx`.
- **Where:** `eslint.config.ts` (`expoRouterOverrides` turns off `@import-lite/no-default-export` and `@check-file/filename-naming-convention` for `apps/mobile-client/src/app/**`); `knip.json` lists `src/app/**/*.tsx` as entries.
- **Why:** expo-router discovers screens by file name and needs a default export per route file; named exports are not picked up as screens.
- **If cleaned up:** converting to named exports or renaming the files removes the screens.

## Screen tests outside src/app

- **What:** screen tests live in `apps/mobile-client/src/app-tests/`, not next to the route.
- **Where:** `apps/mobile-client/src/app-tests/`.
- **Why:** every file in `src/app/` is a route (`docs/commands.md`, "Testing"; `docs/architecture/patterns.md`, "Adding a New Mobile Screen").
- **If cleaned up:** a test file moved into `src/app/` becomes a route.

## console in the mobile logger adapter

- **What:** a file-level `/* eslint-disable no-console */`.
- **Where:** `apps/mobile-client/src/services/console-logger.ts`.
- **Why:** this adapter is the single place where core's log calls reach the device console (Metro, Logcat, Xcode) (comment in the file).
- **If cleaned up:** removing the disable fails lint.
