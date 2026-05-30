# Repository Strategy

<p align="center">
  <img alt="Repository Strategy" src="https://github.com/prod-forge/frontend/blob/main/docs/assets/repo-strategy.png" width="701px" height="503px">
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
│   └── web-client/         # Main React application
├── packages/
│   ├── core/               # Business logic, store, API layer
│   ├── design-tokens/      # CSS custom properties
│   └── ui-web/             # UI components, Storybook
├── tsconfig.base.json
├── nx.json
└── package.json
```

Dependency graph:

```
web-client
  ├── core
  ├── ui-web
  │     └── core
  └── design-tokens
```

`core` has no dependency on `ui-web` — data only flows one way.
