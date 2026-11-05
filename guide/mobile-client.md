# Mobile Client

<p align="center">
  <img alt="Mobile Client" src="assets/mobile-client.jpg" width="701px" height="561px">
</p>

`apps/mobile-client` is the second client of the same backend. It exists to prove the reason for the monorepo (see [Repository Strategy](repository-strategy.md)): the store, the API layer and the design tokens are written once and used by two applications. This chapter explains what is shared, what is not, and the Metro and Expo details that are easy to get wrong in a monorepo.

## Why Expo

A React Native project can be started with the bare CLI or with Expo. Expo was chosen because the goal here is a reference that runs after `npm install` and `npm run dev:mobile` (`expo start`), without Xcode or Android Studio project files to maintain:

- **Managed native layer.** `app.json` is the whole native configuration. Native modules used here (`expo-secure-store`, `expo-crypto`) come with the SDK and are versioned together with it.
- **File-based routing** with `expo-router`: a file in `src/app` is a screen, the way pages are a folder in other frameworks.
- **One toolchain for checks.** `npx expo-doctor` (the `doctor` script) validates dependency versions against the SDK. It rejected two configuration options that were tried (see Metro below), which is the kind of mistake it is there to catch.

The versions are exact, as everywhere: `expo` 58.0.23 (SDK 58), `react-native` 0.88.1, `react` 19.3.0.

**Platforms are iOS and Android only** (`"platforms": ["ios", "android"]` in `app.json`). Expo can also build for the web, but the web client is a separate Vite application with its own UI; a third rendering target would double the testing effort with no gain. This is an owner decision.

## What Is Shared and What Is Not

Shared, through the workspace packages:

| Package                       | What mobile takes from it                                                         |
| ----------------------------- | --------------------------------------------------------------------------------- |
| `core`                        | the Redux store, thunks, selectors, zod schemas, `apiRequest`, the error taxonomy |
| `design-tokens` (`/js` entry) | colors, spacing, radius, font sizes as plain numbers                              |
| `test-data` (dev only)        | todo fixtures for tests                                                           |

Not shared: the UI. `ui-web` is built from DOM elements and Tailwind classes. React Native has `View`, `Text` and `StyleSheet`, so every component (`apps/mobile-client/src/components`) is written for the platform. Sharing components between web and native is possible with extra layers, and it was not worth the cost for a todo list.

The line between the two is `core`: it has no DOM and no browser API, and everything platform-specific is passed in once at startup. See [State Management](state-management.md#sharing-the-store-with-mobile) for the store side.

## Project Layout

```text
apps/mobile-client/
├── index.ts                 # entry: imports bootstrap, then expo-router
├── app.json  metro.config.js  babel.config.js  jest.config.ts
└── src/
    ├── bootstrap.ts         # startup order
    ├── app/                 # routes: _layout, index, login, register, todos/
    ├── app-tests/           # screen tests (not routes)
    ├── components/          # React Native UI
    ├── hooks/               # typed dispatch/selector, theme hooks, auth redirect
    ├── services/            # platform adapters
    ├── test-utils/          # store render helper, fake backend, router mock
    ├── theme/               # token mapping and themed styles
    └── utils/               # form field helpers
```

**Tests do not live in `src/app`.** `expo-router` turns every file in `src/app` into a route, including a `*.test.tsx`. Screen tests are therefore in `src/app-tests/`, and each imports the screen from `../app/...`.

`index.ts` has one job, to fix the order:

```ts
import './src/bootstrap';
import 'expo-router/entry';
```

and `src/bootstrap.ts` runs, in this order:

```ts
import './services/crypto-polyfill';
// ...
setupCore();
initSentry();
void store.dispatch(hydrateAuth());
```

The order is not cosmetic. The polyfill goes first because `core` creates its trace id with `uuid` at import time, and Hermes has no Web Crypto API (the polyfill, `services/crypto-polyfill.ts`, fills `crypto.getRandomValues` from `expo-crypto`). `setupCore` must run before anything reads the store (`CoreNotConfiguredError` otherwise). Sentry starts next so later failures are reported, and `hydrateAuth` reads the token from the secure store.

The root layout (`app/_layout.tsx`) renders a preloader until `auth.hydration` is `done`. Without the gate, a signed-in user would see the login screen for a moment while the keychain is read asynchronously.

## Metro in a Monorepo

Metro does not know about npm workspaces by itself. `apps/mobile-client/metro.config.js` adds three things to the default Expo config:

```js
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
config.resolver.unstable_enablePackageExports = true;
```

- **`watchFolders`** lets Metro see and reload files in `packages/*`, which are outside the app folder.
- **`nodeModulesPaths`** searches the app's own `node_modules` first, then the hoisted root one.
- **`unstable_enablePackageExports`** is needed because `design-tokens` exposes its JavaScript only through the `exports` map (`@prod-forge-todolist-frontend/design-tokens/js`). Without it Metro reports a module that cannot be resolved.

The classic pitfall is **two copies of React**. If the web client and the mobile client resolve different `react` packages, the hooks of one copy fail inside the renderer of the other with "Invalid hook call". Two options and a decision:

- Force one copy with `disableHierarchicalLookup` in Metro, or root `overrides` in `package.json`. Both were dropped: SDK 58 `expo-doctor` rejects `disableHierarchicalLookup`, and root overrides hide the real versions in the dependency graph.
- Keep the versions aligned. The web client was moved to React 19.3.0, the same as mobile, so npm hoists one copy. There are no overrides.

If `npm ls react` ever shows two versions, that is the first thing to look at. `newArchEnabled` was dropped for the same reason: SDK 58 `expo-doctor` rejects it.

## Platform Adapters

`core` asks for four things through `configureCore`, and `apps/mobile-client/src/services/core-setup.ts` provides them:

| Core asks for | Mobile gives                                 | File                      |
| ------------- | -------------------------------------------- | ------------------------- |
| `storage`     | `expo-secure-store` (Keychain / Keystore)    | `secure-store-adapter.ts` |
| `logger`      | a thin console logger                        | `console-logger.ts`       |
| `reportError` | `captureException` of `@sentry/react-native` | `sentry.ts`               |
| `getToken`    | reads `auth.token` from the store            | `core-setup.ts`           |

`KeyValueStorage` is a three-method interface (`getItem`, `setItem`, `removeItem`). On web it is a wrapper around `localStorage`, on mobile it is a wrapper around `getItemAsync`, `setItemAsync` and `deleteItemAsync`. Core does not know the difference, and the auth listener persists the token the same way on both. Why SecureStore is the right place on a phone is in [Security](security.md#token-storage).

Mobile Sentry is smaller than the web one: `sendDefaultPii` is `false`, tracing is sampled, and the process trace id is attached as a tag. There is no Session Replay and no Web Vitals. `initSentry` returns immediately without `EXPO_PUBLIC_SENTRY_DSN`. The mobile app does not send logs to the backend `client-logs` endpoint; see [Client Observability](client-observability.md).

The list screen uses what the web page does not need: infinite scroll. `fetchMoreTodos` in `core` appends the next page using `nextOffset`, and `FlatList` calls it from `onEndReached`.

## Theming From Tokens

The tokens are generated once by Style Dictionary (see [Design System](design-system.md#token-pipeline)). Web reads `tokens.css`, mobile reads `design-tokens/js`, which exports plain numbers because `StyleSheet` expects unitless values.

`src/theme/tokens.ts` builds `lightTheme` and `darkTheme` from those exports. `useThemeTokens` picks one from the system color scheme:

```ts
export const useThemeTokens = (): ThemeTokens => (useColorScheme() === 'dark' ? darkTheme : lightTheme);
```

Styles are created with `createThemedStyles` and read through `useThemedStyles`, so a component declares its styles as a function of the tokens and is re-styled when the system theme changes. A designer who changes a color in the token source changes it in both applications. The user cannot choose a theme inside the mobile app; it follows the system (`"userInterfaceStyle": "automatic"`).

## Testing

Mobile uses Jest with `jest-expo` and `@testing-library/react-native`, because Vitest does not run the React Native transform. `npm run test:mobile` runs it, and `nx run-many -t test` includes it.

Details of `jest.config.ts` that explain themselves once you know the problem:

- **`moduleNameMapper`** points `core`, `design-tokens/js` and `test-data` at their sources, so tests do not need a build.
- **`transformIgnorePatterns`** extends the jest-expo list with ESM-only packages that `core` resolves to (`@reduxjs/toolkit`, `immer`, `redux`, `reselect`, `react-redux`, `uuid`). Without it Jest fails with `SyntaxError: Cannot use import statement`.
- **`jest.setup.ts`** replaces native modules: SecureStore by an in-memory map, Sentry by spies, safe-area insets by the library's mock, the console logger by spies.

Tests use the real store (`render-with-store.tsx`), and `fake-backend.ts` stubs `fetch`, the same principle as on web (see [Testing Strategy](testing-strategy.md)). `root-layout.test.tsx` covers the hydration gate described above. The negative cases come first, as in the rest of the project.

## Not Covered

Honestly, the chapter ends where a native product begins. These are not implemented and not documented as done:

- **Store release.** No App Store or Google Play submission, signing or store metadata. `release-it` bumps `apps/mobile-client/package.json`, but not `app.json`, whose `version` is what the stores see.
- **EAS.** There is no `eas.json`, no EAS Build and no EAS Submit, so there is no CI build of a binary. The app runs in Expo Go or a development build.
- **OTA updates.** `app.json` has `"updates": { "enabled": false }`. Over-the-air JavaScript updates (EAS Update) are a separate topic with their own rollout and rollback story.
- **Push notifications, deep link configuration, app icons per store.** Only the scheme `prodforge` and the default icons exist.
- **Device end-to-end tests.** There is no Maestro or Detox suite. Screens are tested in Jest, which does not catch native issues.
