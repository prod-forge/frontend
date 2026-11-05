# Tooling hacks

## Default exports allowed in config and story files

- **What:** `@import-lite/no-default-export` is off for stories, Playwright, Vite, Vitest, Jest and ESLint configs, `.storybook/**` and `*.d.ts`.
- **Where:** `eslint.config.ts` (`disableDefaultExportBlockingForStorybook`, `dtsOverrides`).
- **Why:** these tools load a default export from their files; everything else uses named exports.
- **If cleaned up:** the tools stop finding their config or stories.

## Two React lint presets in separate blocks

- **What:** `@eslint-react` and `react-hooks` presets are separate config objects, and `@eslint-react/rules-of-hooks` is off.
- **Where:** `eslint.config.ts` (`reactConfigs`).
- **Why:** spreading both presets into one object kept only the plugins and rules of the last one; `react-hooks/rules-of-hooks` reports the same problems (comments in the file).
- **If cleaned up:** merging the blocks silently drops one preset; turning both hook rules on reports every problem twice.

## Node access in a few UI tests

- **What:** `testing-library/no-node-access` (and `no-container`) disabled on specific lines.
- **Where:** `packages/ui-web/src/components/circular-progress/circular-progress.test.tsx`, `packages/ui-web/src/components/preloader/preloader.test.tsx`, `packages/ui-web/src/widgets/errors/error-notifier/error-notifier.test.tsx`, `packages/ui-web/src/components/todo-list/todo-list.test.tsx`.
- **Why:** the asserted elements have no accessible role: the geometry of a decorative SVG, a decorative spinner, an `aria-live` region (comments in the files; `todo-list.test.tsx` has no comment).
- **If cleaned up:** there is no role query to replace them with.

## Hook names in the expo-router mock

- **What:** `@eslint-react/no-unnecessary-use-prefix` disabled on two mock functions.
- **Where:** `apps/mobile-client/src/test-utils/expo-router-mock.tsx`.
- **Why:** the mock mirrors the expo-router hook names (comment in the file).
- **If cleaned up:** renamed mocks no longer replace the real hooks.

## `tailwindcss` declared in the workspaces, not the root

- **What:** `tailwindcss` is a devDependency of `apps/web-client` and `packages/ui-web`, while `@tailwindcss/vite` stays in the root.
- **Where:** `apps/web-client/package.json`, `packages/ui-web/package.json`.
- **Why:** knip registers its CSS compiler per workspace, only when that workspace depends on `tailwindcss`. With the dependency in the root, knip 6.44 no longer followed `@import 'tailwindcss'` and `@import '@prod-forge-todolist-frontend/styles-web/theme.css'` in `src/styles.css` and `.storybook/styles.css`, and reported both packages as unused. npm still installs one hoisted copy.
- **If cleaned up:** moving it back to the root brings back three false "unused dependency" reports from knip.

