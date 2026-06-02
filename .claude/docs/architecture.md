# Architecture

## Overview

NX monorepo with npm workspaces. Three main layers:

- **`apps/web-client`** — React 19 SPA. Routing, pages, Redux-connected containers.
- **`packages/core`** — All business logic: Redux store, API client, async thunks, services.
- **`packages/ui-web`** — Stateless UI components, widgets, Storybook, visual/a11y tests.

Supporting packages:

- **`packages/design-tokens`** — CSS custom properties + Tailwind v4 theme.
- **`packages/styles-web`** — Web-specific theme overrides.
- **`packages/test-data`** — Shared mock data for tests.

---

## Package Dependency Graph

```
apps/web-client
  ├── packages/core        (store, API, thunks)
  ├── packages/ui-web      (components, widgets)
  ├── packages/design-tokens (CSS variables)
  └── packages/styles-web

packages/ui-web
  └── packages/design-tokens

packages/core
  └── (no internal deps — pure business logic)
```

Rule: `ui-web` has no Redux dependency. `core` has no React dependency. `web-client` is the only place that wires them together.

---

## Folder Structure

```
apps/
└── web-client/
    └── src/
        ├── app.tsx                  # Root: Provider, Router, ErrorBoundary, LoggerContainer
        ├── main.tsx                 # Entry point — Sentry init before render
        ├── styles.css               # Tailwind entry + @source directives
        ├── containers/
        │   ├── layout/              # LayoutContainer — auth state, logout
        │   └── errors/              # ErrorNotifierContainer — error toasts
        ├── hooks/
        │   └── redux/redux.ts       # useAppDispatch, useAppSelector
        └── pages/
            ├── home/                # Todo list, filters, search
            ├── login/
            ├── register/
            └── todo-detail/         # Single todo view (by :id)

packages/
├── core/
│   └── src/
│       ├── api/
│       │   ├── client.ts            # Fetch wrapper, auth headers, error handling
│       │   ├── todos.api.ts         # Todo CRUD
│       │   └── logs.api.ts          # Client-side error logs
│       ├── features/
│       │   ├── auth/                # Slice, selectors, schemas, constants
│       │   ├── todos/               # Slice, selectors, schemas, utils, constants
│       │   └── errors/              # Slice, selectors, middleware
│       ├── errors/
│       │   ├── backend-error.ts     # BackendError class + error code map
│       │   └── network-error.ts
│       ├── interfaces/
│       │   ├── todos.ts             # Todo, TodosResponse, TodosMeta
│       │   └── select-option.ts     # SelectOption<T>
│       ├── services/
│       │   ├── logger/              # logrock adapter, trace ID
│       │   └── sentry/              # Sentry init, captureException
│       └── store.ts                 # configureStore: auth + todos + errors + errorMiddleware
│
├── ui-web/
│   └── src/
│       ├── components/              # 24+ base components (Button, Input, Modal, ...)
│       ├── widgets/
│       │   ├── auth/                # LoginForm, RegisterForm
│       │   ├── todos/               # AddTodoForm
│       │   └── errors/              # ErrorNotifier
│       └── hooks/
│           └── theme/use-theme.ts   # Dark/light toggle via localStorage + data-theme
│
├── design-tokens/
│   └── src/
│       ├── tokens.css               # CSS custom properties (:root + dark)
│       ├── theme.css                # @theme inline for Tailwind
│       └── global.css               # Storybook entry
│
└── test-data/
    └── src/index.ts                 # Mock Todo[] for tests
```

---

## Application Bootstrap

```
main.tsx
  └── initSentry()
      └── render(<App />)

app.tsx
  └── <Provider store={store}>
        <ErrorNotifierContainer>        ← error toasts
          <LoggerContainer>             ← logrock + trace ID
            <ErrorBoundary>             ← Sentry capture on crash
              <BrowserRouter>
                <Routes>
                  <Route element={<LayoutContainer />}>
                    /           → <Home />
                    /login      → <Login />
                    /register   → <Register />
                    /todo/:id   → <TodoDetail />
```

---

## Redux Store

Three slices, one middleware:

```
store
├── auth        AuthState       — token, user (persisted in localStorage)
├── todos       TodosState      — items, filters, pagination, optimistic state
├── errors      ErrorsState     — error queue for toast notifications
└── errorMiddleware             — catches rejected thunks → dispatches pushError
```

All async operations use `createAsyncThunk`. Optimistic updates are applied on `pending` and rolled back on `rejected` for: `addTodo`, `deleteTodo`, `toggleTodo`, `updateTodo`.

---

## Component Architecture

Components in `ui-web` are stateless — they receive everything through props. No Redux, no API calls.

Widgets in `ui-web` are domain-aware but do not connect to Redux directly — they receive callbacks and data as props, dispatching is done in the container/page level.

Containers in `web-client` are the only place that connects Redux state to UI. They select state, dispatch actions, and pass data down as props.

Pages are containers scoped to a route. They orchestrate state and compose layout using `ui-web` components.

---

## Environment Variables

| Variable               | Used in            | Purpose                              |
| ---------------------- | ------------------ | ------------------------------------ |
| `VITE_API_BASE_URL`    | `api/client.ts`    | Base URL for all API requests        |
| `VITE_ASSETS_BASE_URL` | app config         | Base URL for S3-hosted static assets |
| `VITE_SENTRY_DSN`      | `sentry/sentry.ts` | Sentry project DSN                   |
| `SENTRY_ORG`           | `vite.config.ts`   | Sentry org for source map upload     |
| `SENTRY_PROJECT`       | `vite.config.ts`   | Sentry project for source map upload |
| `SENTRY_AUTH_TOKEN`    | `vite.config.ts`   | Auth token for Sentry CLI            |

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

- **Sentry** — initialized in `main.tsx` before React render. Browser tracing + session replay (10% sample, 100% on errors). `captureException()` called from error middleware and `ErrorBoundary`.
- **Logrock** — structured logging with trace ID. Each request carries an `x-trace-id` header for cross-service correlation.
- **Trace ID** — generated once per session (UUID), attached to all API requests and Sentry events.
