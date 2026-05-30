<p align="center">
  <img alt="Logo" src="https://github.com/prod-forge/backend/blob/main/assets/prod-forge-logo.png" width="264px" height="243px">
</p>

# prod-forge-todolist-frontend

An NX-managed monorepo for the TodoAI frontend application.

# Table of contents

- [1. Repository Strategy](docs/repository-strategy.md)
  - [Why Frontend Projects Use a Monorepo](docs/repository-strategy.md#why-frontend-projects-use-a-monorepo)
  - [What Gets Shared Across Clients](docs/repository-strategy.md#what-gets-shared-across-clients)
  - [What Belongs in a Frontend Monorepo](docs/repository-strategy.md#what-belongs-in-a-frontend-monorepo)
  - [Structure](docs/repository-strategy.md#structure)

<!-- -->

- [2. Architecture Decisions](docs/architecture-decisions.md)
  - [Feature Sliced Design](docs/architecture-decisions.md#feature-sliced-design)
  - [Feature-based Approach](docs/architecture-decisions.md#feature-based-approach)

<!-- -->

- [3. Styles Management](docs/styles-management.md)
  - [Design Tokens](docs/styles-management.md#design-tokens)
  - [Storybook](docs/styles-management.md#storybook)
  - [Tailwind CSS](docs/styles-management.md#tailwind-css)
  - [Accessibility](docs/styles-management.md#accessibility)

## Getting started

```bash
# Install all workspace dependencies
npm install

# Start the dev server
npm run dev

# Run all tests
npm run test

# Run Storybook
npm run storybook

# Build all packages
npm run build
```

## Available scripts (root)

| Script                    | Description                                       |
| ------------------------- | ------------------------------------------------- |
| `npm run dev`             | Start web-client dev server                       |
| `npm run build`           | Build all packages with NX                        |
| `npm run test`            | Run all unit tests with NX                        |
| `npm run lint`            | Lint all packages with NX                         |
| `npm run storybook`       | Start Storybook for ui-web                        |
| `npm run storybook:build` | Build static Storybook                            |
| `npm run test:a11y`       | Run Playwright a11y tests for ui-web              |
| `npm run test:visual`     | Run Playwright visual regression tests for ui-web |
| `npm run test:e2e`        | Run Playwright e2e tests for web-client           |
| `npm run format`          | Format all files with Prettier                    |

## Package scope

All packages use the `@prod-forge-todolist-frontend/` scope:

- `@prod-forge-todolist-frontend/core`
- `@prod-forge-todolist-frontend/ui-web`
- `@prod-forge-todolist-frontend/design-tokens`
- `@prod-forge-todolist-frontend/web-client` (private, not published)

## NX

This monorepo uses [NX](https://nx.dev) for task orchestration (build caching, dependency-aware task ordering). Each package has a `project.json` that declares its targets.

```bash
# Run a specific target in one project
npx nx test core
npx nx storybook ui-web
npx nx build web-client

# Run a target across all projects
npx nx run-many -t test
```

## TypeScript path aliases

`tsconfig.base.json` at the root defines path aliases so TypeScript resolves workspace packages:

```json
{
  "@prod-forge-todolist-frontend/core": ["packages/core/src/index.ts"],
  "@prod-forge-todolist-frontend/ui-web": ["packages/ui-web/src/index.ts"]
}
```

Vite configs in each package add matching `resolve.alias` entries so Vite resolves the same paths during dev and test.

---

# Contributing

We welcome any kind of contribution, please read the guidelines:

[CONTRIBUTING](https://github.com/prod-forge/backend/blob/main/CONTRIBUTING.md)

# The MIT License

[LICENSE](https://github.com/prod-forge/backend/blob/main/LICENSE.md)
