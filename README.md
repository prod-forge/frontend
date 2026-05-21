<p align="center">
  <img alt="Logo" src="https://github.com/prod-forge/backend/blob/main/assets/prod-forge-logo.png" width="264px" height="243px">
</p>

# prod-forge-todolist-frontend

An NX-managed monorepo for the TodoAI frontend application.

## Structure

```
prod-forge-todolist-frontend/
├── apps/
│   └── web-client/             # Main React application (Vite)
├── packages/
│   ├── core/                   # Business logic, Redux store, API layer, services
│   ├── design-tokens/          # CSS custom properties (theme tokens)
│   └── ui-web/                 # UI components, widgets, Storybook
├── tsconfig.base.json          # Shared TypeScript config with path aliases
├── nx.json                     # NX workspace configuration
└── package.json                # Workspace root (npm workspaces)
```

## Packages

### `@prod-forge-todolist-frontend/web-client` — `apps/web-client`

The main entry point of the application. Wires up routing, Redux Provider, Sentry, and the logger. Contains app-specific components (`Layout`, `ErrorNotifier`) and all page components.

**Key tools:** Vite, React, React Router, Vitest, Playwright

---

### `@prod-forge-todolist-frontend/core` — `packages/core`

All business logic that is framework-independent in principle but Redux/TypeScript-based in practice.

Contains:
- Redux store (`configureStore`, `RootState`, `AppDispatch`)
- RTK slices and selectors: `auth`, `todos`, `errors`
- API clients: `todosApi`, `logsApi`
- Zod schemas: `loginSchema`, `registerSchema`, `titleSchema`, `descriptionSchema`
- Services: Sentry integration, logger utilities
- Shared types: `Todo`, `SelectOption`, `AppError`, …
- Test seed data (`todos`)

**Key tools:** Redux Toolkit, Zod, Sentry, Vitest (jsdom)

---

### `@prod-forge-todolist-frontend/ui-web` — `packages/ui-web`

All presentational components and widgets. Has no direct Redux dependency — it receives data and callbacks through props.

Contains:
- Primitive components: `Button`, `Input`, `Select`, `Modal`, `Pagination`, `Header`, …
- Domain widgets: `LoginForm`, `RegisterForm`, `AddTodoForm`
- `useTheme` hook
- Storybook stories, a11y specs (Playwright + axe-core), visual regression specs

**Key tools:** React, Tailwind CSS, Storybook, Playwright, Vitest (jsdom + browser/playwright)

---

### `@prod-forge-todolist-frontend/design-tokens` — `packages/design-tokens`

Framework-agnostic CSS custom properties for the design system.

Exports:
- `@prod-forge-todolist-frontend/design-tokens/tokens.css` — raw CSS variables (light/dark themes)
- `@prod-forge-todolist-frontend/design-tokens/global.css` — Tailwind base + token mapping

---

## Getting started

```bash
# Install all workspace dependencies
npm install

# Start the dev server
npm run dev

# Run all tests
npm run test

# Run Storybook
npm run storybook

# Build all packages
npm run build
```

## Available scripts (root)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start web-client dev server |
| `npm run build` | Build all packages with NX |
| `npm run test` | Run all unit tests with NX |
| `npm run lint` | Lint all packages with NX |
| `npm run storybook` | Start Storybook for ui-web |
| `npm run storybook:build` | Build static Storybook |
| `npm run test:a11y` | Run Playwright a11y tests for ui-web |
| `npm run test:visual` | Run Playwright visual regression tests for ui-web |
| `npm run test:e2e` | Run Playwright e2e tests for web-client |
| `npm run format` | Format all files with Prettier |

## Package scope

All packages use the `@prod-forge-todolist-frontend/` scope:

- `@prod-forge-todolist-frontend/core`
- `@prod-forge-todolist-frontend/ui-web`
- `@prod-forge-todolist-frontend/design-tokens`
- `@prod-forge-todolist-frontend/web-client` (private, not published)

## Dependency graph

```
web-client
  ├── @prod-forge-todolist-frontend/core
  ├── @prod-forge-todolist-frontend/ui-web
  │     └── @prod-forge-todolist-frontend/core
  └── @prod-forge-todolist-frontend/design-tokens
```

`core` has no dependency on `ui-web` — the dependency only flows one way.

## NX

This monorepo uses [NX](https://nx.dev) for task orchestration (build caching, dependency-aware task ordering). Each package has a `project.json` that declares its targets.

```bash
# Run a specific target in one project
npx nx test core
npx nx storybook ui-web
npx nx build web-client

# Run a target across all projects
npx nx run-many -t test
```

## TypeScript path aliases

`tsconfig.base.json` at the root defines path aliases so TypeScript resolves workspace packages:

```json
{
  "@prod-forge-todolist-frontend/core": ["packages/core/src/index.ts"],
  "@prod-forge-todolist-frontend/ui-web": ["packages/ui-web/src/index.ts"]
}
```

Vite configs in each package add matching `resolve.alias` entries so Vite resolves the same paths during dev and test.

---

# Contributing

We welcome any kind of contribution, please read the guidelines:

[CONTRIBUTING](https://github.com/prod-forge/backend/blob/main/CONTRIBUTING.md)

# The MIT License

[LICENSE](https://github.com/prod-forge/backend/blob/main/LICENSE.md)
