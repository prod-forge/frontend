# Code Quality

The shared approach is described in the backend guide: [Code Quality](https://github.com/prod-forge/backend/blob/main/docs/code-quality.md). The same six layers apply here: EditorConfig and Prettier, ESLint, pre-commit protection, commitlint, CI checks and dependency locking. The commitlint config is the same conventional preset, and exact versions with `npm ci` are used. This chapter lists only the differences for a frontend monorepo.

## Layer 1. Formatting

Prettier uses the same options as the backend (`printWidth` 120, single quotes, trailing commas). The difference is the file types: `lint-staged` also formats `*.md` and `*.json`, because documentation is part of the product here.

CSS is formatted and checked by **Stylelint** (`stylelint-config-standard`, with the Tailwind `@theme` at-rule allowed in `.stylelintrc.json`). It runs from `packages/styles-web` (`npm run lint:css`, `format:css`), where the shared stylesheets live. See [Styles Management](styles-management.md).

## Layer 2. Static Analysis

The ESLint config is one flat `eslint.config.ts` at the root, and it differs from the backend in what it protects:

- **React rules.** `@eslint-react/eslint-plugin` (no components created inside components, correct keys) and `eslint-plugin-react-hooks` (`rules-of-hooks`, `exhaustive-deps`). The duplicate `@eslint-react/rules-of-hooks` is turned off, because the hooks plugin reports the same problems.
- **Kebab-case names.** `eslint-plugin-check-file` requires every file and folder under `src/**` to be kebab-case (`todo-detail.tsx`, not `TodoDetail.tsx`). The component inside is still PascalCase. Middle extensions are ignored, so `todos.slices.test.ts` is valid.
- **No default exports.** `@import-lite/no-default-export` is an error. Two things need default exports by their nature, and are the known exceptions: `expo-router` screens in `apps/mobile-client/src/app`, and config files. Lazy routes work around it with `.then((module) => ({ default: module.Home }))`, see [Performance](performance.md#code-splitting-by-route).
- **Cognitive complexity** is limited to 20 by `eslint-plugin-sonarjs`; a function above it is split.
- **Testing plugins.** `eslint-plugin-testing-library`, `eslint-plugin-jest-dom` and `eslint-plugin-no-only-tests` keep the component tests idiomatic, and `eslint-plugin-storybook` checks the story files.
- **`no-console` is an error.** Code logs through the logger passed to `core`, so a stray `console.log` fails the lint. The few places that need the console carry an explicit disable with a reason.

## Layer 3. Pre-commit and Pre-push

`pre-commit` runs `lint-staged`: Prettier, ESLint with `--fix`, and `tsc --noEmit` only for the packages that contain staged files. In a monorepo the last part matters, because type-checking everything on each commit would take too long; `.lintstagedrc.cjs` maps staged paths to `apps/<name>` or `packages/<name>` and runs `tsc` with that package's `tsconfig.json` and `tsconfig.node.json`.

`pre-push` runs `npm run knip && npm test`, and `npm test` is `nx run-many -t test`, so the web, core, UI and mobile unit tests all run before code leaves the machine.

**Knip is configured per workspace** (`knip.json`). A monorepo makes unused-code detection harder, because an export is "used" when another package imports it. The configuration tells Knip where each workspace starts:

- `apps/mobile-client` treats `src/app/**/*.tsx` as entries, because `expo-router` loads routes by file name and nothing imports them. It also ignores the `expo-doctor` binary and points at the Babel config.
- `packages/ui-web` lists the stories' companion specs (`*.a11y-spec.ts`, `*.visual-spec.ts`) and test folders as entries.
- `packages/design-tokens` and `packages/styles-web` have empty entries, because they contain generated or CSS-only files.

An export that no workspace imports fails Knip, which is how `core/index.ts` stays limited to what the clients really use.

## Layer 4. Commitlint

Same conventional-commit rules as in the backend, with the same allowed types (`ci`, `chore`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`). They matter more here because the release tool reads the history: `release-it` builds `CHANGELOG.md` and picks the next version from the commit types, see [Release and Deployment](release-and-deployment.md).

## Layer 5. Continuous Integration

The checks described here exist as `.github/workflows/ci.yml`, but the `verify` job is disabled with `if: false`, an owner decision. The local hooks and `npm run full-check` replace it for now. What the job contains, why it is heavy and what enabling it would take is in [Testing Strategy](testing-strategy.md#running-locally-vs-ci).

## Layer 6. Dependency Locking

Exact versions are enforced for every package in the workspace: the root, `apps/*` and `packages/*` all use pinned versions, and the one `package-lock.json` at the root is the source of truth. Workspace packages refer to each other with `*`, which npm resolves to the local folder.

The one frontend-specific rule: **React must resolve to a single copy.** The web and mobile apps declare the same `react` version, so npm hoists one package and Metro does not bundle two (see [Mobile Client](mobile-client.md#metro-in-a-monorepo)). When you upgrade React, upgrade it in both applications in the same change.

An additional check is `react-doctor` (`npm run doctor`), which scans the React code for common problems; its settings are in `react-doctor.config.json`.
