# Developers Guide

## Prerequisites

- Node.js 20+
- npm 10+

---

## Setup

```bash
# Install all workspace dependencies
npm install

# Copy env file and fill in values
cp .env.example .env
```

Required env variables:

```
VITE_API_BASE_URL=http://localhost:3000/api/v1/
VITE_ASSETS_BASE_URL=http://localhost:4000
VITE_SENTRY_DSN=          # leave empty for local dev
```

---

## Running the App

```bash
# Start web-client dev server (http://localhost:5173)
npm run dev

# Serve local static assets (http://localhost:4000)
npm run dev:assets
```

`dev:assets` is needed when working on features that load media from S3. It serves the `assets/` folder locally so the app can fetch them without hitting real S3.

---

## NX Commands

```bash
# Run a specific target in one project
npx nx test core
npx nx build web-client
npx nx storybook ui-web

# Run a target across all projects
npx nx run-many -t test
npx nx run-many -t build
npx nx run-many -t lint
```

---

## Testing

```bash
# Unit tests (all packages)
npm run test

# Unit tests — single package (preferred for isolated changes)
npx nx test core
npx nx test ui-web

# E2E tests (Playwright)
npm run test:e2e

# E2E with coverage
npm run test:e2e:cov

# Visual regression tests (Storybook-based)
npm run test:visual

# Update visual snapshots
npm run test:visual:update

# Accessibility tests
npm run test:a11y
```

**Run only affected tests** when making isolated changes — do not run the full suite for a single file change.

---

## Storybook

```bash
npm run storybook         # dev server
npm run storybook:build   # static build
```

Every component in `ui-web` has stories. New components must include a `.stories.tsx` file before being merged.

---

## Linting & Formatting

```bash
# Lint all packages
npm run lint

# Format all files (Prettier)
npm run format

# Check unused exports / dead code
npm run knip

# Type check
npx nx run web-client:lint:ts
```

Pre-commit hooks (Husky + lint-staged) run formatting and lint automatically on staged files.

---

## Building

```bash
# Build all packages
npm run build

# Build web-client only
npm run build:web-client

# Build with bundle analysis
cd apps/web-client && ANALYZE=true npm run build
```

---

## Adding a New Component

1. Create a folder under `packages/ui-web/src/components/{name}/`
2. Add `{name}.tsx` — named export, `ReactNode` return type, `displayName` set
3. Add `{name}.test.tsx` — negative cases first, then positive
4. Add `{name}.stories.tsx` — at minimum one default story
5. Export from `packages/ui-web/src/index.ts`

Components must be stateless — no Redux, no API calls.

---

## Adding a New Feature (Redux)

1. Create `packages/core/src/features/{name}/` with:
   - `{name}.types.ts` — state shape and domain types
   - `{name}.slices.ts` — slice + async thunks
   - `{name}.selectors.ts` — memoized selectors with `createSelector`
   - `{name}.schemas.ts` — Zod validation (if user input)
   - `{name}.constants.ts` — dropdown options, storage keys, etc.
2. Add API methods to `packages/core/src/api/{name}.api.ts`
3. Register reducer in `packages/core/src/store.ts`
4. Export public API from `packages/core/src/index.ts`

---

## Adding a New Page

1. Create `apps/web-client/src/pages/{name}/{name}.tsx`
2. Add a `.test.tsx` alongside it
3. Register the route in `apps/web-client/src/app.tsx`

Pages are containers: they select state with `useAppSelector`, dispatch with `useAppDispatch`, and pass data down to `ui-web` components as props.

---

## Commit Convention

Commits follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add pagination to todo list
fix: correct optimistic rollback on delete
docs: update architecture guide
chore: bump vitest to 4.2
```

`commitlint` enforces this on every commit. The `release` script uses commit history to auto-generate changelogs.

---

## Release

```bash
npm run release
```

Runs `before-release.ts` (pre-checks), then `release-it` with:

- Conventional changelog generation
- Version bump in `package.json`
- Git tag
- GitHub release

---

## Project-Specific Notes

- **No default exports** — ESLint enforces named exports everywhere.
- **No `any`** — use `unknown` + type narrowing.
- **No API calls outside `core/src/api/`** — all fetch logic lives there.
- **Typed Redux hooks only** — use `useAppDispatch` / `useAppSelector` from `apps/web-client/src/hooks/redux/redux.ts`, never raw `useDispatch` / `useSelector`.
- **Optimistic updates** — `addTodo`, `deleteTodo`, `toggleTodo`, `updateTodo` all apply changes before the server responds. Rollback happens automatically in `rejected` handler.
- **Error handling** — never catch and swallow Redux thunk errors. Let them propagate to `errorMiddleware`, which dispatches `pushError` and reports to Sentry.
