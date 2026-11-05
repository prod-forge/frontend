# Performance

<p align="center">
  <img alt="Performance" src="assets/performance.jpg" width="701px" height="561px">
</p>

How the backend keeps responses small and fast (pagination, indexes, compression) is described in [Performance](https://github.com/prod-forge/backend/blob/main/guide/performance.md) in the backend guide. On the client the cost is different: the user pays for every byte that is downloaded, parsed and executed before the first paint. This chapter explains how the bundle is measured, split and cached.

## Bundle Analysis

A bundle grows quietly. One import of a large library is enough to double the download, and nothing fails. The first step is to be able to see what is inside:

```shell
npm run build:analyze --workspace @prod-forge-todolist-frontend/web-client
```

The script is `tsc -b && ANALYZE=true vite build`. When `ANALYZE` is `true`, `vite.config.mts` adds `rollup-plugin-visualizer`, which writes `apps/web-client/dist/stats.html` and opens it:

```ts
visualizer({
  filename: 'dist/stats.html',
  gzipSize: true,
  open: true,
});
```

The report is a treemap with gzip sizes. Look for three things: one dependency that takes a large share, the same library included twice in different versions, and code that should be in a route chunk but landed in the entry chunk.

The plugin is imported dynamically (`await import('rollup-plugin-visualizer')`) and only in analyze mode, so a normal build and a normal `vite dev` never load it.

## Code Splitting by Route

`apps/web-client/src/app.tsx` loads every page with `React.lazy`:

```tsx
const Home = lazy(() => import('./pages/home/home').then((module) => ({ default: module.Home })));
const Login = lazy(() => import('./pages/login/login').then((module) => ({ default: module.Login })));
```

Home, Login, Register, TodoDetail and NotFound each become their own chunk. A visitor who opens `/login` does not download the todo list page. The routes are wrapped in one `Suspense` with the `Preloader` component as the fallback, placed on a layout route, so the header and the page frame stay on screen while a chunk loads.

The `.then((module) => ({ default: module.Home }))` part exists because the project forbids default exports (the `@import-lite/no-default-export` rule), while `React.lazy` expects a module with a default export.

Splitting by route is the cheapest split to maintain: the boundaries already exist, and a user always needs exactly one page. Splitting inside a page (a chart, a rich text editor) is worth doing only when `stats.html` shows a heavy dependency that is not needed at first paint.

What is not split: the Redux store, `packages/core` and the design system styles are in the entry chunk, because every page uses them.

## Caching Strategy

The build writes content-hashed files into `dist/static/` (`assetsDir: 'static'` in `vite.config.mts`). A file name changes when its content changes, so a hashed file can be cached forever. `index.html` is the opposite: it is the only file that points to the current hashes, so it must never be cached.

`cd.yml` sets exactly this:

| File                      | `Cache-Control`                       | Why                                             |
| ------------------------- | ------------------------------------- | ----------------------------------------------- |
| `static/*` (hashed)       | `max-age=31536000,immutable`          | the name is the version, it never changes       |
| `index.html`              | `no-cache, no-store, must-revalidate` | a new release must be visible on the next visit |
| media from `assets/` (S3) | `max-age=31536000,immutable`          | see the next section                            |

The result is that a returning visitor downloads one small HTML file and reuses everything else from the disk cache. A release changes the hashes of only the chunks that changed. CloudFront serves the same headers; the details of the distribution, the 403 to `index.html` rule and the invalidation are in [Frontend Deployment](https://github.com/prod-forge/terraform/blob/main/guide/frontend.md#cache-strategy) in the Terraform guide.

One caveat. The root sync in `cd.yml` applies the immutable header to every file in `dist/` first, and then overrides only `index.html`. Files from `apps/web-client/public/` that have no hash in the name (`favicon.svg`) are therefore also cached for a year. That is fine while they never change. If one has to change, give it a versioned name.

Source maps are built as `hidden`: the bundle has no `sourceMappingURL` comment, so browsers do not download the `.map` files and they add nothing to the page weight. They are uploaded to Sentry when `SENTRY_AUTH_TOKEN` is set and deleted after upload; `cd.yml` also excludes `*.map` from the S3 sync, so they are never public. See [Client Observability](client-observability.md) and [Security](security.md#dependency-hygiene).

## Assets CDN

Media is not bundled. It lives in the `assets/` folder (today two status icons), is synced to a separate S3 bucket and is served through the same CloudFront distribution under `/assets`. The application reads the base URL at build time from `VITE_ASSETS_BASE_URL`. Why this is done, and what it gives to designers, is in [Assets Management](assets-management.md).

For performance this has two effects. The bundle does not grow when an image is added, and a changed image is deployed without rebuilding the application. In production the assets share the origin of the application, so there is no extra connection. In development they come from `localhost:4000`, which is why `VITE_ASSETS_BASE_URL` is also listed in `connect-src` of the Content Security Policy in `index.html` (see [Security](security.md)).

## Performance Budget

**Not implemented.** Today nothing fails when the bundle gets bigger: `build:analyze` is a manual tool. A budget turns the size into a gate, in the same way the coverage threshold does for tests.

A proposal that fits this repository:

- Add `size-limit` with `@size-limit/file` to `apps/web-client`, pointing at `dist/static/*.js`.
- Start with the numbers measured on the current build plus a margin of about 10%, and set them per chunk: the entry chunk strictest, route chunks looser.
- Run it as `npm run size` after `npm run build:web-client` in the `build` job of `ci.yml`, so a pull request that adds a heavy dependency fails with a message that names the file and the limit.
- Review the budget when the limit is hit. Raising it is a legitimate answer, but it becomes a visible, reviewed decision instead of a silent one.

It is not done here because the application is small and `ci.yml` is disabled (see [Testing Strategy](testing-strategy.md)). A budget in a pipeline that does not run would only look like a guarantee.

Runtime performance is already measured for real users: Core Web Vitals (LCP, INP, CLS) are reported to Sentry, as described in [Client Observability](client-observability.md#web-vitals). A budget catches regressions before release, vitals show what users actually felt.

## Rendering Performance

The rule used in this code base: do not optimize rendering before it is measured.

- There is no `React.memo` or `useCallback` in the code. `useMemo` is used in three places, and none of them is a render optimization of a list: `editable-title.tsx` and `editable-description.tsx` in `packages/ui-web` memoize the zod form schema built from a prop, and `use-themed-styles.ts` in the mobile client memoizes the style object per theme. The lists are paginated by the backend (`limit` and `offset` in the todos filters), so a screen renders tens of rows, not thousands.
- What does protect rendering is the store design. Components read state through memoized selectors from `packages/core/src/features/todos/todos.selectors.ts`, created with `createSelector`. `selectCompletedTodos` filters the list only when `items` changes. A selector that returns an unchanged reference does not re-render the component, with no work in the component itself. See [State Management](state-management.md).
- Optimistic updates (`toggleTodo`) change one item and keep the others by reference, so only the changed row has new props.

When a profile (React DevTools Profiler) shows a slow list, the order of actions is: check that the selector returns a stable reference, then wrap the row component in `memo`, then consider a virtualized list. The mobile client already uses `FlatList`, which virtualizes by design.

## Summary

| Question                         | Where the answer is                                  |
| -------------------------------- | ---------------------------------------------------- |
| What is in the bundle?           | `npm run build:analyze`, `dist/stats.html`           |
| What is downloaded on `/login`?  | entry chunk plus the Login chunk (`React.lazy`)      |
| Why a release is visible at once | `index.html` is `no-cache`, hashed files are new     |
| What stops the bundle growing?   | nothing yet, a `size-limit` budget is proposed above |
