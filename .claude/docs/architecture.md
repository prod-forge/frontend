# Architecture

## Overview

NX monorepo with npm workspaces. Main layers:

- **`apps/web-client`** — React 19 SPA. Routing, pages, Redux-connected containers.
- **`apps/mobile-client`** — Expo SDK 58 app for iOS and Android (no `expo web`). expo-router screens on the same `core` store and the same design tokens.
- **`packages/core`** — All business logic: Redux store, API client, async thunks, services.
- **`packages/ui-web`** — Stateless UI components, widgets, Storybook, visual/a11y tests.

Supporting packages:

- **`packages/design-tokens`** — JSON design tokens compiled by Style Dictionary into CSS custom properties and a JS module.
- **`packages/styles-web`** — Web-specific Tailwind v4 theme (`theme.css`).
- **`packages/test-data`** — Single source of test data: `todos` (16 records), `users`, and `applyTodosQuery` (server emulator: filter, sort, pagination). Used by web-client and mobile-client unit tests and Playwright fixtures. Imports `Todo`/`TodosResponse` from core with `import type` only.

---

## Package Dependency Graph

```
apps/web-client
  ├── packages/core        (store, API, thunks)
  ├── packages/ui-web      (components, widgets)
  ├── packages/design-tokens (CSS variables)
  └── packages/styles-web

apps/mobile-client
  ├── packages/core        (store, API, thunks)
  └── packages/design-tokens (JS module: colors, spacing, radius, typography)

packages/ui-web
  └── packages/design-tokens

packages/core
  └── (no internal deps — pure business logic)
```

Rule: `ui-web` has no Redux dependency. `core` has no React dependency. The apps are the only places that wire them together: on mobile, `src/components/**` never import the store; only `src/app/**` route files do.

---

## Folder Structure

```
apps/
└── web-client/
    └── src/
        ├── app.tsx                  # Root: Provider, Router, ErrorBoundary, LoggerContainer
        ├── main.tsx                 # Entry point — setupCore, Sentry init, hydrateAuth, render
        ├── styles.css               # Tailwind entry + @source directives
        ├── containers/
        │   ├── auth/                # AuthHydrationGate — renders routes once auth is restored
        │   ├── layout/              # LayoutContainer — auth state, logout
        │   └── errors/              # ErrorNotifierContainer — error toasts
        ├── hooks/
        │   └── redux/redux.ts       # useAppDispatch, useAppSelector
        ├── services/
        │   ├── core-setup.ts        # setupCore(): web adapters for configureCore
        │   ├── console-logger.ts    # logrock stdout for the browser console
        │   └── sentry.ts            # initSentry, captureException
        └── pages/
            ├── home/                # Todo list, filters, search
            ├── login/
            ├── register/
            └── todo-detail/         # Single todo view (by :id)
└── mobile-client/
    ├── index.ts                     # Entry: imports src/bootstrap, then expo-router/entry
    ├── app.json                     # Expo config: name "Prod Forge", scheme prodforge, iOS/Android only
    ├── metro.config.js              # Monorepo: watchFolders = workspace root, app node_modules first
    ├── jest.config.ts               # jest-expo; workspace packages mapped to sources
    └── src/
        ├── bootstrap.ts             # crypto polyfill, setupCore, initSentry, hydrateAuth
        ├── app/                     # expo-router routes (default exports, file-name routing)
        │   ├── _layout.tsx          # Provider, hydration gate, Stack, latest-error banner
        │   ├── index.tsx            # Redirect: /todos when signed in, else /login
        │   ├── login.tsx
        │   ├── register.tsx
        │   └── todos/
        │       ├── index.tsx        # List, add, toggle, "Load more"
        │       └── [id].tsx         # Edit title/description, delete with confirmation
        ├── app-tests/               # Screen tests (kept out of app/, where every file is a route)
        ├── components/              # Store-free UI: screen, text-field, primary-button, todo-row, ...
        ├── hooks/                   # useAppDispatch, useAppSelector, useThemeTokens, useThemedStyles
        ├── services/
        │   ├── core-setup.ts        # setupCore(): mobile adapters for configureCore
        │   ├── secure-store-adapter.ts # KeyValueStorage over expo-secure-store
        │   ├── console-logger.ts    # CoreLogger over the device console
        │   ├── crypto-polyfill.ts   # crypto.getRandomValues/randomUUID from expo-crypto (Hermes has none)
        │   └── sentry.ts            # initSentry, captureException (@sentry/react-native)
        ├── test-utils/              # expo-router mock, fake backend over test-data, render helper
        ├── theme/                   # tokens.ts (light/dark palettes), createThemedStyles
        └── utils/                   # Zod issues -> field errors, todo field validation

packages/
├── core/
│   └── src/
│       ├── config/
│       │   └── core-config.ts       # configureCore, getCoreConfig, CoreNotConfiguredError
│       ├── api/
│       │   ├── client.ts            # Fetch wrapper, auth headers, error handling
│       │   ├── todos.api.ts         # Todo CRUD
│       │   └── logs.api.ts          # Client-side error logs
│       ├── features/
│       │   ├── auth/                # Slice, hydrateAuth thunk, persistence listeners, selectors
│       │   ├── todos/               # Slice, selectors, schemas, utils, constants
│       │   └── errors/              # Slice, selectors, middleware
│       ├── errors/
│       │   ├── backend-error.ts     # BackendError class + error code map
│       │   ├── network-error.ts
│       │   └── serialize-api-error.ts # Keeps HTTP status on rejected thunk errors
│       ├── interfaces/
│       │   ├── todos.ts             # Todo, TodosResponse, TodosMeta
│       │   └── select-option.ts     # SelectOption<T>
│       ├── services/
│       │   ├── logger/              # CoreLogger type, trace ID
│       │   └── storage/             # KeyValueStorage type
│       └── store.ts                 # configureStore: auth + todos + errors, auth listeners + errorMiddleware
│
├── ui-web/
│   └── src/
│       ├── components/              # 22 base components (Button, Input, Modal, ...)
│       ├── widgets/
│       │   ├── auth/                # LoginForm, RegisterForm
│       │   ├── todos/               # AddTodoForm
│       │   └── errors/              # ErrorNotifier
│       └── hooks/
│           └── theme/use-theme.ts   # Dark/light toggle via localStorage + data-theme
│
├── design-tokens/
│   ├── src/tokens/**                # JSON tokens (base, color, shadow)
│   ├── style-dictionary.config.mjs  # Style Dictionary build config
│   ├── tokens.css                   # Generated: CSS custom properties (:root + dark)
│   └── js/                          # Generated: index.mjs + index.d.ts (used by mobile-client)
│
├── styles-web/
│   └── src/theme.css                # @theme inline for Tailwind
│
└── test-data/
    └── src/
        ├── index.ts                 # todos, users, re-export of applyTodosQuery
        └── apply-todos-query.ts     # Backend-like filter + sort + pagination
```

---

## Platform-Neutral Core

`core` is shared by the web client and the Expo mobile client, so it must not touch anything that exists only in a browser or only in Vite. It does not read `import.meta.env`, does not import `@sentry/react` or `logrock`, and does not call `localStorage`. Everything platform-specific comes in through one object:

```ts
configureCore({
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL, // must end with "/"
  getToken: () => store.getState().auth.token, // read on every request
  logger: logrockLogger, // CoreLogger: debug / warn / error
  reportError: captureException, // Sentry on web
  storage: localStorageAdapter, // KeyValueStorage: async getItem / setItem / removeItem
});
```

Each app calls `configureCore` once in its entry point, before the first dispatch or request. Web does it in `apps/web-client/src/services/core-setup.ts` (`setupCore()`); mobile does it in `apps/mobile-client/src/services/core-setup.ts` with SecureStore, a console logger and Sentry React Native. Core reads the config lazily through `getCoreConfig()`, so forgetting the call fails on the first request with `CoreNotConfiguredError` and a message that names the fix, not with a `TypeError` deep inside `fetch`.

The storage interface is asynchronous because SecureStore and AsyncStorage are. That is why auth is no longer read in the reducer's initial state: the entry point dispatches `hydrateAuth()`, which moves `auth.hydration` from `idle` to `hydrating` to `done`, and both apps render routes only after `done` (`AuthHydrationGate` on web, `RootNavigator` in `apps/mobile-client/src/app/_layout.tsx` on mobile, which shows a `Preloader` meanwhile). Without the gate a reload on `/todo/:id` would redirect a signed-in user before the token is read, and on mobile the login screen would flash on every cold start while SecureStore is read.

---

## Application Bootstrap

```
main.tsx
  └── setupCore()                     ← configureCore with web adapters
      └── initSentry()
          └── store.dispatch(hydrateAuth())
              └── render(<App />)

app.tsx
  └── <Provider store={store}>
        <ErrorNotifierContainer>        ← error toasts
          <LoggerContainer>             ← logrock + trace ID
            <ErrorBoundary>             ← Sentry capture on crash
              <AuthHydrationGate>       ← waits for auth.hydration === 'done'
              <BrowserRouter>
                <Routes>
                  <Route element={<LayoutContainer />}>
                    /           → <Home />
                    /login      → <Login />
                    /register   → <Register />
                    /todo/:id   → <TodoDetail />
```

---

### Mobile bootstrap

```
index.ts
  └── import './src/bootstrap'
        ├── crypto-polyfill           ← before core: core creates its trace id with uuid at import
        ├── setupCore()               ← throws if EXPO_PUBLIC_API_BASE_URL is missing
        ├── initSentry()              ← only when EXPO_PUBLIC_SENTRY_DSN is set
        └── store.dispatch(hydrateAuth())
  └── import 'expo-router/entry'      ← mounts src/app/_layout.tsx
```

ES imports run in order, so splitting the side effects into `bootstrap.ts` guarantees core is configured before expo-router evaluates any route.

### React and Metro in the monorepo

Web and mobile pin the same `react` version (19.3.0, the one Expo SDK 58 requires), so npm hoists a single copy to the root `node_modules`. Two copies would break hooks: `react-redux` is hoisted and would load a different React than the screens. Metro resolves the app's own `node_modules` first, then the root (`nodeModulesPaths`), and keeps hierarchical lookup on, as `expo-doctor` requires since SDK 58. Upgrading the Expo SDK therefore means bumping `react`/`react-dom` in `web-client` and `ui-web` in the same change.

---

## Redux Store

Three slices, two middlewares:

```
store
├── auth        AuthState       — token, user, hydration
├── todos       TodosState      — items, filters, pagination, optimistic state
├── errors      ErrorsState     — error queue for toast notifications
├── authListenerMiddleware      — persists auth to KeyValueStorage on login/register/logout
└── errorMiddleware             — catches rejected thunks → logs, reports 5xx/unknown, dispatches pushError
```

Reducers stay pure: auth persistence lives in `features/auth/auth.listeners.ts` (RTK `createListenerMiddleware`), not inside `login`/`logout`. The `store` singleton stays in `core`; `getToken` on web reads it, which keeps the token in one place.

All async operations use `createAsyncThunk`. Optimistic updates are applied on `pending` and rolled back on `rejected` for: `addTodo`, `deleteTodo`, `toggleTodo`, `updateTodo`.

---

## Component Architecture

Components in `ui-web` are stateless — they receive everything through props. No Redux, no API calls.

Widgets in `ui-web` are domain-aware but do not connect to Redux directly — they receive callbacks and data as props, dispatching is done in the container/page level.

Containers in `web-client` are the only place that connects Redux state to UI. They select state, dispatch actions, and pass data down as props.

Pages are containers scoped to a route. They orchestrate state and compose layout using `ui-web` components.

---

## Environment Variables

| Variable                   | Used in                             | Purpose                                                         |
| -------------------------- | ----------------------------------- | --------------------------------------------------------------- |
| `VITE_API_BASE_URL`        | `services/core-setup.ts`            | Base URL for all API requests, passed to `configureCore`        |
| `EXPO_PUBLIC_API_BASE_URL` | mobile `src/services/core-setup.ts` | Mobile API base URL (must end with `/`), inlined at bundle time |
| `EXPO_PUBLIC_SENTRY_DSN`   | mobile `src/services/sentry.ts`     | Sentry React Native DSN; Sentry stays off when empty            |
| `VITE_ASSETS_BASE_URL`     | app config                          | Base URL for S3-hosted static assets                            |
| `VITE_SENTRY_DSN`          | `services/sentry.ts`                | Sentry project DSN                                              |
| `SENTRY_ORG`               | `vite.config.ts`                    | Sentry org for source map upload                                |
| `SENTRY_PROJECT`           | `vite.config.ts`                    | Sentry project for source map upload                            |
| `SENTRY_AUTH_TOKEN`        | `vite.config.ts`                    | Auth token for Sentry CLI                                       |

---

## Build Output

```
dist/
├── index.html          # Injected with <!-- version: x.y.z --> comment
├── favicon.svg
├── icons.svg
└── static/             # Hashed JS, CSS, assets
```

Sentry source maps are uploaded automatically when `SENTRY_AUTH_TOKEN` is set. Bundle analysis via `stats.html` when `ANALYZE=true`.

---

## Observability

- **Sentry** — lives in the apps, not in core. Mobile uses `@sentry/react-native` (`src/services/sentry.ts`), initialized in `src/bootstrap.ts`. Web: `services/sentry.ts`, initialized in `main.tsx` before React render. Browser tracing + session replay (10% sample, 100% on errors). `captureException()` is called from `ErrorBoundary` and, through `configureCore({ reportError })`, from the error middleware. The middleware skips 4xx responses: they are expected outcomes (not found, validation), not defects.
- **Logrock** — structured logging with trace ID. Core logs through the `CoreLogger` interface; web adapts it to logrock in `services/core-setup.ts`. Each request carries an `x-trace-id` header for cross-service correlation.
- **Trace ID** — generated once per session (UUID), attached to all API requests and Sentry events.
