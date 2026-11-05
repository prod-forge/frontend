# Testing Strategy

How tests are written, mocked and organized on the server is described in [Testing](https://github.com/prod-forge/backend/blob/main/guide/testing.md) in the backend guide. The principles are the same: most tests are small, they run fast, and each has a negative and a positive side. This chapter covers what is different for a client.

## The Pyramid for a Frontend

A frontend has more kinds of defects than a backend: logic can be wrong, a component can render wrong, a screen can look wrong, a control can be unusable with a keyboard, and the whole flow can break. Each kind has a cheapest test that catches it.

```text
            /\
           /e2e\            a user flow in a real browser          Playwright
          /------\
         / a11y   \         accessibility rules per story          Playwright + axe
        /----------\
       /  visual    \       a screenshot per story                  Playwright
      /--------------\
     /   component    \     a story with its states                 Storybook
    /------------------\
   /  unit + RTL / RNTL \   reducers, thunks, hooks, screens        Vitest, Jest
  /______________________\
```

| Layer     | Where                                                                    | Command                              |
| --------- | ------------------------------------------------------------------------ | ------------------------------------ |
| Unit      | `packages/core`, `packages/ui-web`, `apps/web-client` (`*.test.ts[x]`)   | `npm run test`                       |
| Component | `packages/ui-web` (`*.stories.tsx`, run by `vitest --project storybook`) | `npm run test:storybook` in `ui-web` |
| Visual    | `packages/ui-web` (`*.visual-spec.ts`)                                   | `npm run test:visual`                |
| A11y      | `packages/ui-web` (`*.a11y-spec.ts`)                                     | `npm run test:a11y`                  |
| E2E       | `apps/web-client/e2e`                                                    | `npm run test:e2e`                   |
| Mobile    | `apps/mobile-client/src` (`*.test.tsx`)                                  | `npm run test:mobile`                |

The visual and a11y layers reuse the stories from the design system, so a new component with a story gets both checks by adding a short spec file. This is the five-file contract described in [Design System](design-system.md).

Unit tests are the largest layer and carry most of the logic checks: thunks and reducers in `packages/core`, components in `ui-web`, pages in `web-client`. E2E is the smallest layer, on purpose.

## Why E2E Mocks the API

The Playwright tests in `apps/web-client/e2e` do not talk to a backend. The `mockApi` fixture in `e2e/fixtures.ts` is declared with `auto: true`, so every test gets it, and it intercepts `/api/v1/todos` (and `/api/v1/auth/login`, which answers a fixed token and a 401 for one unknown email) with `page.route`:

```ts
await page.route(/\/api\/v1\/todos/, async (route) => {
  // GET list, GET one, POST, PATCH, DELETE implemented over an in-memory array
});
```

The data comes from `packages/test-data`: a fixed set of todos (`todos`) and `applyTodosQuery`, which applies `limit`, `offset`, `order`, `search` (title only) and `sortBy` the same way the real API does (default order newest first, like the backend's `createdAt` descending). The same package is used by the web unit tests and the mobile tests, so there is one fixture set for both clients.

Reasons for mocking:

- **Determinism.** The test owns the data. It never fails because another test, a migration or a developer changed a database row.
- **Speed and cost.** No database, no containers, no seed step. The only server is the Vite dev server.
- **Isolation of failures.** A red e2e test means the client is broken, not that a dependency is down.
- **Failure scenarios are cheap.** Making the backend return a 500 for one request is one `route.fulfill`.

The price is that the mock can lie: if the backend changes a response, the client tests stay green. The boundary is as follows.

| Question                                         | Who checks it                                                                                                          |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Does the client behave correctly for response X? | Client tests (e2e, unit), with X from `test-data`                                                                      |
| Does the backend really return X?                | Backend e2e tests, see the [backend testing chapter](https://github.com/prod-forge/backend/blob/main/guide/testing.md) |
| Do X on both sides match?                        | Nothing automated today                                                                                                |

The last row is the honest gap. Adding a contract check (the backend OpenAPI document against the client fixtures and types) would close it; it is not implemented. A full-stack smoke test against a deployed environment is the other option and is out of scope here.

Authentication in e2e is set up without the UI: `addInitScript` writes the token and user to `localStorage` before the page loads, and the app restores them through `hydrateAuth`. A separate `auth.spec.ts` covers the login and registration screens themselves.

## Unit Tests With a Real Store

Redux is **not** mocked in tests. A test that needs state creates a real store with `configureStore` and the real reducers, dispatches real actions and reads real selectors. The thing that is mocked is the boundary below the store, the network:

- `packages/core` tests replace the `todosApi` module with `vi.mock('../../api/todos.api', ...)` and assert on the state after pending and after rejected, which is exactly where optimistic updates and rollbacks live.
- Page tests in `web-client` (`home.test.tsx`) build a store with `authReducer` and `todosReducer`, spy on `todosApi` with answers from `applyTodosQuery(todos, ...)`, render inside `Provider` and `MemoryRouter`, and use `@testing-library/user-event`.
- Mobile screen tests mock `fetch` itself with a small fake backend (`test-utils/fake-backend.ts`) and run the real thunks and the real `apiRequest`.

Why not mock the store: a mocked store asserts that the component dispatched a particular action, which is an implementation detail. A real store asserts what the user would see: the item is gone, the error is shown, the old value is back after a failure. When a reducer is refactored, the real-store tests still describe the behavior and still pass; the mocked ones break for nothing.

Core has no ambient state between tests. `packages/core/vitest.setup.ts` calls `configureCore` in `beforeEach` with fresh in-memory storage and spy loggers, so no config, storage or mock leaks from one test to the next. The ordering convention of the project applies everywhere: `describe('negative cases')` first, `describe('positive cases')` second, separated by an empty line.

## Coverage Thresholds

Every project has the same threshold: 80% for branches, functions, lines and statements. `npm run test:cov` runs all of them, and the `pre-push` hook runs it, so a push that drops a project below the line fails.

| Scope                  | Tool          | Where                                      |
| ---------------------- | ------------- | ------------------------------------------ |
| `apps/web-client` unit | Vitest, v8    | `vite.config.ts`                           |
| `apps/web-client` e2e  | nyc, istanbul | root `.nycrc.json` (run by `test:e2e:cov`) |
| `apps/mobile-client`   | Jest          | `jest.config.ts` (`coverageThreshold`)     |
| `packages/core`        | Vitest, v8    | `vitest.config.ts`                         |
| `packages/ui-web`      | Vitest, v8    | `vite.config.ts` (unit project)            |
| `packages/test-data`   | Vitest, v8    | `vitest.config.ts`                         |

Coverage is measured over all of `src/`, not only the files the tests happen to import, so an untested file counts as 0% instead of disappearing from the report. It excludes tests, stories, Playwright specs, type declarations, barrel `index.ts` files, `main.tsx` and the mobile test helpers. `ui-web` is also covered by the story, visual and a11y layers, which a line count does not show.

A threshold is a floor, not a target. It stops a decline; it does not say whether the right things are tested.

The e2e coverage run (`npm run test:e2e:cov`) instruments the app with `vite-plugin-istanbul` when `VITE_COVERAGE=true` and collects `window.__coverage__` through the auto `coverage` fixture. It is a separate command because instrumentation changes the bundle.

## Running Locally vs CI

Locally, the whole check is one command:

```shell
npm run full-check   # lint, knip, unit, e2e, visual, a11y
```

For a daily loop, run only what you changed: `npx nx test core`, `npm run test:watch` inside a package, one Playwright file with `npx playwright test e2e/home.spec.ts`.

**CI is disabled.** `.github/workflows/ci.yml` has `if: false` on its `verify` job. This is an owner decision, not an oversight: the full job is heavy (see below). The workflow itself is complete and describes the intended pipeline:

```text
npm ci -> playwright install -> lint -> knip -> unit -> e2e -> visual -> a11y -> build
```

What enabling it would take, and why it costs more than it looks:

- Remove `if: false`. Everything else is in place, including `VITE_API_BASE_URL` for the build step: the build guard fails without it, so the workflow sets a placeholder value (`http://localhost:3000/api/v1/`) for the `Build` step only.
- **Playwright browser** is installed on every run with `npx playwright install chromium --with-deps`. Only Chromium is installed, which is all the configs use; `--with-deps` adds the system libraries and is the slowest setup step. Caching `~/.cache/ms-playwright` helps with the download, not with the system packages.
- **Storybook is started twice** (visual and a11y each start `npm run storybook`), and the Vite dev server is started for e2e. They run sequentially in one job.
- **Visual snapshots depend on the OS.** `snapshotPathTemplate` points at a `darwin` folder, so the stored images were produced on macOS. Rendering on Ubuntu differs in font rasterization; the tolerance is `maxDiffPixelRatio: 0.01`, which may or may not absorb it. The `update-visual-snapshots.yml` workflow regenerates them on Ubuntu, and the folder name would then be misleading. Decide on one OS for snapshots before turning the job on.
- **Mobile tests run with the unit step.** `npm run test` is `nx run-many -t test`, and `mobile-client` has a `test` target, so Jest is part of it. That adds the `jest-expo` transform cost to the step.

Until CI is enabled, `npm run full-check` before a push is the quality gate, together with the husky hooks described in [Code Quality](code-quality.md).

## Mobile Tests

Mobile tests run on Jest with the `jest-expo` preset and `@testing-library/react-native`. Screen tests live in `apps/mobile-client/src/app-tests/` (`login`, `register`, `todos`, `todo-detail`, `root-layout`).

What makes them different from web tests:

- **No navigation container.** `test-utils/expo-router-mock.tsx` replaces `expo-router`: `useRouter` returns spies, and `<Redirect>` renders its target as text, so a test can assert where a screen sent the user.
- **Native modules are replaced** in `jest.setup.ts`: `expo-secure-store` with an in-memory map, `@sentry/react-native` with spies, safe-area insets with the library mock, the console logger with spies.
- **The real store and the real core run.** Only `fetch` is faked, by `mockFakeBackend`, which answers from `test-data` and can return a backend-format error with `backendErrorResponse(500, 'INTERNAL_ERROR')`. The same data and the same error shape are used as on web.
- **Workspace packages map to sources** (`moduleNameMapper` in `jest.config.ts`), so tests never depend on a prior build. Packages that ship ESM only are listed in `transformIgnorePatterns`, which is the first thing to check when Jest fails with "Unexpected token 'export'".

Mobile has no e2e layer and no visual tests. A device-level flow test (Maestro or Detox) is not in place and is not planned in this phase.
