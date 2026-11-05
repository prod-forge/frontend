# Repository Strategy

<p align="center">
  <img alt="Repository Strategy" src="assets/repo-strategy.jpg" width="701px" height="503px">
</p>

One of the first architectural decisions when starting a project is choosing the repository structure.

In practice, there are two common approaches:

- **Monorepo** - all applications and packages live in a single repository
- **Single repository per project** - each application is maintained independently

Both approaches have advantages and trade-offs.

## Why Frontend Projects Use a Monorepo

For most large frontend projects, a monorepo is the recommended approach. The reason is that a product rarely has just one client.

A typical product might need a public landing page, an e-commerce storefront, an admin panel, a back-office system, a web application, and a mobile app - all at the same time, or added over time as the product grows.

When these are maintained as separate repositories, teams quickly end up duplicating the same UI components, the same form validation logic, the same design tokens. Any shared update has to be applied in multiple places, and things slowly get out of sync.

## What Gets Shared Across Clients

Even when clients look very different on the surface - a mobile app versus a web storefront - they still share a lot under the hood.

The most obvious example is the design system: buttons, inputs, color schemes, and typography rules stay consistent across all clients regardless of platform. For mobile the implementation may differ, but the brand rules and design tokens remain the same.

Beyond visuals, the same business logic often applies everywhere: validation schemas for forms, API client configuration, shared types, error handling patterns. Keeping all of this in one repository means a single change reaches all consumers at once instead of having to be replicated across projects.

## What Belongs in a Frontend Monorepo

One important point: a monorepo does not mean putting everything in one place.

The recommendation here is to keep a monorepo focused on a single concern. A frontend monorepo should contain frontend applications and shared frontend packages only. It should not include backend services, infrastructure configuration, or anything unrelated to the frontend.

Mixing different kinds of systems in one repository brings organizational complexity that outweighs any convenience. Keeping the scope narrow is what makes a monorepo manageable.

## Structure

```
prod-forge-todolist-frontend/
├── apps/
│   ├── web-client/         # React web application (Vite)
│   └── mobile-client/      # Expo application for iOS and Android
├── packages/
│   ├── core/               # Business logic, store, API layer (no DOM)
│   ├── design-tokens/      # Token sources, CSS variables and JS exports
│   ├── styles-web/         # Shared web styles (Tailwind layer)
│   ├── test-data/          # Todo fixtures shared by the tests of both apps
│   └── ui-web/             # Web UI components, Storybook
├── assets/                 # Media synced to S3 independently of the build
├── tsconfig.base.json
├── nx.json
└── package.json
```

Dependency graph:

```
web-client
  ├── core
  ├── ui-web
  │     ├── core
  │     ├── styles-web
  │     └── design-tokens
  ├── styles-web
  ├── design-tokens
  └── test-data   (dev only)
        └── core

mobile-client
  ├── core
  ├── design-tokens   (JS entry)
  └── test-data       (dev only)
```

`core` has no dependency on `ui-web`, and no client depends on another client: data only flows one way. The mobile app does not import `ui-web`, which is built for the DOM. See [Mobile Client](mobile-client.md) for what is shared.

## Package Scope

All packages use the `@prod-forge-todolist-frontend/` scope: `core`, `ui-web`, `design-tokens`, `styles-web`, `test-data`, and the private `web-client` and `mobile-client` applications.

The scope was chosen for the first version of the repository, and it reads as the name of the project, not as a brand. A shorter `@prod-forge` scope would be tidier, but renaming touches every import in every package, the path aliases in `tsconfig.base.json`, the Vite, Vitest and Jest mappings and the lockfile, and it adds no value to the reader: the packages are never published to a registry. So the name stays as it is.

## Path Aliases

`tsconfig.base.json` at the root defines path aliases so TypeScript resolves workspace packages from their sources:

```json
{
  "@prod-forge-todolist-frontend/core": ["./packages/core/src/index.ts"],
  "@prod-forge-todolist-frontend/test-data": ["./packages/test-data/src/index.ts"],
  "@prod-forge-todolist-frontend/ui-web": ["./packages/ui-web/src/index.ts"]
}
```

The Vite configs of `web-client` and `ui-web` add matching `resolve.alias` entries, and the mobile client maps the same packages in `moduleNameMapper` of its Jest config, so dev and tests resolve the same sources without a prior build.
