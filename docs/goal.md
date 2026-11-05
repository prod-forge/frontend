# Goal

## What the project is

The frontend of Prod Forge: the web and mobile clients of a todo application in one NX monorepo, with a shared design system (`README.md`). The organization overview is at https://github.com/prod-forge; the API is the separate backend repository (https://github.com/prod-forge/backend).

- `apps/web-client` — React and Vite web client.
- `apps/mobile-client` — Expo and React Native client for iOS and Android.
- `packages/core` — Redux store, API clients and domain logic shared by both clients.
- `packages/ui-web`, `packages/design-tokens`, `packages/styles-web` — web components and the shared design tokens.
- `guide/` — the human guide: why each decision was made.

It is a reference, not a product: the owner decided that nothing is deployed from this repository (`guide/release-and-deployment.md`, "Why Not Deploy on Every Merge").

## What it must achieve

It answers one question: how do I build, ship, and keep web and mobile clients healthy? (`README.md`)

- Production-ready code that follows the existing architecture and conventions (`AGENTS.md`).
- Low-quality code must not be able to enter the repository: lint, type check, commit message, unused-code and unit test checks run in git hooks, and `npm run full-check` adds e2e, visual and accessibility tests (`guide/ai-development.md`, `guide/development-workflow.md`).
- Every `ui-web` component has tests and Storybook stories; tests list negative cases first (`AGENTS.md`, `architecture/patterns.md`).
- Both clients share `core`, which stays platform-neutral (`guide/mobile-client.md`, `restrictions/platform.md`).
- The project runs after `npm install` and `npm run dev` / `npm run dev:mobile`, without native project files to maintain (`guide/mobile-client.md`).
- Every decision is explained in `guide/`, and the docs are updated in the same change as the code (`AGENTS.md`).

Open work is listed in the public roadmap, [roadmap.md](../roadmap.md).
