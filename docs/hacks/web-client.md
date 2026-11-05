# Web client hacks

## Lazy route pages with a named-export adapter

- **What:** every page is loaded with `lazy(() => import('./pages/{name}/{name}').then((module) => ({ default: module.Name })))` inside a `Suspense` route.
- **Where:** `apps/web-client/src/app.tsx`.
- **Why:** one chunk per route, so the first paint downloads only the page the user opened (comment in `app.tsx`). `React.lazy` needs a default export, but the project bans default exports, so `.then` maps the named export to `default`.
- **If cleaned up:** a static `import` puts the page into the main bundle; exporting the page as `default` breaks the `@import-lite/no-default-export` rule (`docs/architecture/patterns.md`, "Adding a New Page").

## console in logger adapters

- **What:** `// eslint-disable-next-line no-console` on every `console.*` call.
- **Where:** `apps/web-client/src/services/console-logger.ts` (the `stdout` of logrock), `apps/web-client/src/app.tsx` (`logsApi.send(stack).catch(console.error)` in `LoggerContainer.onError`).
- **Why:** these adapters are where log calls reach the browser console; the rest of the code logs through `logger`.
- **If cleaned up:** removing the disables fails lint. Logging through `logger` here would feed the logger's own output and its error handler back into the logger.
