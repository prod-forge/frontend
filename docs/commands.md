# Commands

Commands for working with the project. How to add code is in [architecture/patterns.md](architecture/patterns.md).

## Prerequisites

- Node.js 24.21.0
- npm (the version bundled with Node 24.21.0, the version CI uses)

---

## Setup

```bash
# Install all workspace dependencies
npm install

# Copy env file and fill in values
cp .env.example .env
```

Variables in `.env.example` (all optional in dev; `VITE_API_BASE_URL` falls back to `/api/v1/` when unset, but a production build requires an absolute `http(s)://` URL ending with `/`):

```
VITE_API_BASE_URL=/api/v1/   # relative: the Vite dev server proxies /api to http://localhost:3000
VITE_ASSETS_BASE_URL=http://localhost:4000
VITE_SENTRY_DSN=          # leave empty for local dev
```

---

## Running the App

To log in against the local backend: start it as described in the backend README ("Getting started": database and cache containers, migrations, `npm run db:seed`, `npm run start:dev`; API on `http://localhost:3000`), then `npm run dev` here, and log in with `user1@example.com`. The Vite dev server proxies `/api` to `http://localhost:3000`, so the backend CORS allowlist is not involved.

```bash
# Start web-client dev server (http://localhost:5173)
npm run dev

# Serve local static assets (http://localhost:4000)
npm run dev:assets
```

`dev:assets` is needed when working on features that load media from S3. It serves the `assets/` folder locally so the app can fetch them without hitting real S3.

### Mobile client (Expo, iOS and Android)

The mobile app reads its own env file, `apps/mobile-client/.env` (Expo loads it from the app folder, not from the repo root):

```
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1/
EXPO_PUBLIC_SENTRY_DSN=          # leave empty for local dev
```

`EXPO_PUBLIC_*` values are inlined into the bundle, so restart Expo after changing them. `setupCore()` throws at startup when `EXPO_PUBLIC_API_BASE_URL` is missing. On a physical device or the Android emulator `localhost` is the device itself: use the machine's LAN IP (or `http://10.0.2.2:3000/api/v1/` on the Android emulator).

```bash
# Start Metro; open the app in Expo Go (scan the QR code) or press i / a for a simulator
npm run dev:mobile

# Mobile unit tests (jest-expo + React Native Testing Library)
npm run test:mobile

# Check the Expo project (SDK versions, config schema, Metro config)
npx nx doctor mobile-client
```

There is no `expo web` target: the web client is `apps/web-client`.

---

## NX Commands

```bash
# Run a specific target in one project
npx nx test core
npx nx test test-data
npx nx test mobile-client
npx nx start mobile-client
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

# Mobile unit tests (Jest, not Vitest)
npm run test:mobile

# Visual regression tests (Storybook-based)
npm run test:visual

# Update visual snapshots
npm run test:visual:update

# Accessibility tests
npm run test:a11y
```

**Run only affected tests** when making isolated changes — do not run the full suite for a single file change.

Test data lives only in `@prod-forge-todolist-frontend/test-data` (`todos`, `users`, `applyTodosQuery`). Core does not export fixtures; tests and e2e mocks import from test-data.

Mobile tests run on `jest-expo`. `jest.config.ts` maps `core`, `test-data` and `design-tokens/js` to their sources, so no prior build is needed. Screen tests live in `src/app-tests/` (every file in `src/app/` is a route), use the real core `store`, mock `fetch` with `src/test-utils/fake-backend.ts` (a per-test copy of the test-data seed that POST, PATCH and DELETE mutate) and mock `expo-router` with `src/test-utils/expo-router-mock.tsx`. `jest.setup.ts` replaces native modules (SecureStore, Sentry, safe-area insets) and the console logger, so test output stays clean.

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
cd apps/web-client && npm run lint:ts
cd apps/mobile-client && npm run lint:ts
```

Husky hooks: `pre-commit` runs lint-staged (Prettier, ESLint and `tsc --noEmit` on staged files), `commit-msg` runs commitlint, `pre-push` runs `npm run knip && npm run test:cov`: unit tests of every project with coverage, failing below 80%.

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

## Commit Convention

Commits follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add pagination to todo list
fix: correct optimistic rollback on delete
docs: update architecture guide
chore: bump vitest
```

`commitlint` enforces this on every commit. The `release` script uses commit history to auto-generate changelogs.

---

## Release

```bash
npm run release
```

Runs `before-release.ts` (an interactive checklist), then `release-it` (must run on a clean `main`) with:

- `npm run lint` before the bump and `npm run build` after it
- Conventional changelog generation (`CHANGELOG.md`, never edited by hand)
- Version bump in the root `package.json` and `apps/*/package.json`
- Release commit `chore(release): v<version>`, git tag `v<version>` and push
- GitHub release

---

## Rules

- For an isolated change, run only the tests of the affected project (`npx nx test core`, `npx nx test ui-web`, `npm run test:mobile`); do not run the full suite for a single file change.
- Never run `npm run release` without an explicit request.
