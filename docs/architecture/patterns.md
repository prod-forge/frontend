# Patterns

How to add a component, a feature, a mobile screen or a page, and the conventions every change follows. Commands are in [commands.md](../commands.md).

## Adding a New Component

1. Create a folder under `packages/ui-web/src/components/{name}/` (a widget goes under `src/widgets/`)
2. Add `{name}.tsx` — named export, `ReactNode` return type
3. Add `{name}.test.tsx` — negative cases first, then positive
4. Add `{name}.stories.tsx` — at minimum one default story
5. Add `{name}.a11y-spec.ts` — one `checkStoryA11y` test per story (`npm run test:a11y`)
6. Add `{name}.visual-spec.ts` — one `matchStorySnapshot` test per story and theme, then create the snapshots with `npm run test:visual:update` (`npm run test:visual`)
7. Export from `packages/ui-web/src/index.ts`

Every component and widget folder has these five files (`guide/design-system.md`, "Component Anatomy"). A new story adds a line to both spec files.

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

Core must stay platform-neutral: no `import.meta.env`, no `localStorage`, no browser or Vite-only packages. Reach platform services through `getCoreConfig()` (`storage`, `logger`, `reportError`, `apiBaseUrl`, `getToken`) and keep reducers pure; put side effects in thunks or listener middleware. Core tests get fresh in-memory adapters from `packages/core/vitest.setup.ts` before every test, so assert on `getCoreConfig().storage` / `.logger` mocks instead of globals.

---

## Adding a New Mobile Screen

1. Add a route file under `apps/mobile-client/src/app/` (file name = route; default export, the ESLint override allows it there)
2. Register its title in the `<Stack>` of `src/app/_layout.tsx`
3. Add a test in `src/app-tests/`, not next to the route
4. Keep store access in the route file; components in `src/components/` take props only and get theme colors from `useThemedStyles` with a `createThemedStyles(...)` factory

---

## Adding a New Page

1. Create `apps/web-client/src/pages/{name}/{name}.tsx`
2. Add a `.test.tsx` alongside it
3. Register the route in `apps/web-client/src/app.tsx` as a lazy page inside the `Suspense` route: `const Name = lazy(() => import('./pages/{name}/{name}').then((module) => ({ default: module.Name })));`. Do not import the page statically, or it lands in the main bundle

Pages are containers: they select state with `useAppSelector`, dispatch with `useAppDispatch`, and pass data down to `ui-web` components as props.

---

## Project-Specific Notes

- **No default exports** — ESLint enforces named exports everywhere, except expo-router route files in `apps/mobile-client/src/app/**`, stories, `.storybook/**`, Playwright, Vite, Vitest, Jest and ESLint configs, and `*.d.ts` files (see [tooling hacks](../hacks/tooling.md)).
- **No `any`** — use `unknown` + type narrowing.
- **No API calls outside `core/src/api/`** — all fetch logic lives there.
- **Typed Redux hooks only** — use `useAppDispatch` / `useAppSelector` from `apps/web-client/src/hooks/redux/redux.ts` (mobile: `src/hooks/use-app-dispatch.ts`, `use-app-selector.ts`), never raw `useDispatch` / `useSelector`.
- **Optimistic updates** — `addTodo`, `deleteTodo`, `toggleTodo`, `updateTodo` all apply changes before the server responds. Rollback happens automatically in `rejected` handler.
- **Error handling** — never catch and swallow Redux thunk errors. Let them propagate to `errorMiddleware`, which dispatches `pushError` and reports 5xx and status-less errors through `getCoreConfig().reportError` (Sentry on web). Pass `serializeError: serializeApiError` to new thunks that call the API so the HTTP status reaches the middleware.
- **One React version** — `web-client`, `ui-web`, `mobile-client` and the root `package.json` pin the same `react` (the one the Expo SDK requires), and `web-client`, `ui-web` and the root pin the same `react-dom`. An Expo SDK upgrade bumps all four together; do not add root `overrides`. The rule is in [dependencies.md](../restrictions/dependencies.md).
- **Core configuration** — every app calls `configureCore` in its entry point before dispatching or rendering (web: `setupCore()` in `main.tsx`; mobile: `src/bootstrap.ts`), then dispatches `hydrateAuth()`. Missing configuration throws `CoreNotConfiguredError` on the first request.
