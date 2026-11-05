# Platform

## Core is platform-neutral

- **Rule:** `packages/core` has no `import.meta.env`, no `localStorage`, no DOM or browser API and no browser- or Vite-only packages. Platform services come through `getCoreConfig()` (`storage`, `logger`, `reportError`, `apiBaseUrl`, `getToken`), passed in once at startup with `configureCore`.
- **Reason:** the same store and API clients run in the web client and in the React Native client (`guide/mobile-client.md`, "Platform Adapters"; `guide/state-management.md`, "Sharing the Store With Mobile").
- **Where:** `docs/architecture/patterns.md` ("Adding a New Feature (Redux)"); the adapters live in `apps/web-client/src/services/` and `apps/mobile-client/src/services/`.

## Mobile is iOS and Android only

- **Rule:** no Expo web target. The web client is `apps/web-client`.
- **Reason:** the web client is a separate Vite application with its own UI; a third rendering target would double the testing effort with no gain. An owner decision (`guide/mobile-client.md`).
- **Where:** `apps/mobile-client/app.json` — `"platforms": ["ios", "android"]`.

## UI is not shared between web and mobile

- **Rule:** `ui-web` components are DOM and Tailwind; mobile components in `apps/mobile-client/src/components/` are written for React Native. Only `core` and the design tokens are shared.
- **Reason:** sharing components needs extra layers that were not worth the cost for a todo list (`guide/mobile-client.md`).
- **Where:** mobile reads tokens from `@prod-forge-todolist-frontend/design-tokens/js`, web from `tokens.css`.
