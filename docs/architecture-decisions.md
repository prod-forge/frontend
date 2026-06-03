# Architecture Decisions

<p align="center">
  <img alt="Architecture Decisions" src="assets/architecture-decisions.png" width="701px" height="561px">
</p>

## Choosing the Right Architecture

Architectural decisions are rarely purely technical. In practice, they are shaped by client requirements, regulatory constraints, legacy systems, security policies, team expertise, and long-term maintainability.

In regulated industries such as Healthcare, Insurance, or Finance, even introducing a new library can require a formal review process lasting several months. These constraints often influence the technology stack far more than developer preferences. Ignoring them leads to delays, rework, or outright rejection.

Before making any architectural decision, it is critical to understand the product itself. This requires close collaboration with the client, product owners, and other engineering teams. The goal is to clearly answer one question: what problem are we actually solving? Architecture should support the product's goals, not the other way around.

When selecting technologies, a few principles consistently produce better outcomes than optimizing for novelty:

**Team familiarity.** Using niche or obscure frameworks increases onboarding cost, makes hiring harder, and shifts engineering time toward fighting tooling instead of solving business problems.

**Community ecosystem.** Widely adopted technologies have better documentation, more third-party libraries, and more shared production experience. This reduces long-term risk in ways that are easy to underestimate early in a project.

**Opinionated structure.** Frameworks with clear conventions help maintain consistency as a codebase grows. NestJS, for example, encourages a layered architecture and explicit module boundaries. More flexible frameworks like Express are not worse, but they require stronger internal conventions to achieve the same consistency.

**Stability over hype.** The JavaScript ecosystem has a history of frameworks that gained rapid popularity and then disappeared. For production systems, a well-established technology with mature tooling and long-term support is usually a safer bet than an early-stage alternative.

## Frontend architecture

Frontend architecture does not have the same established foundations as backend development. On the backend, patterns like layered architecture, dependency injection, and clear separation between transport, business logic, and persistence are well understood. The framework sits on top of those patterns.

On the frontend, the framework comes first. React does not enforce any particular architecture. It gives you components and hooks and leaves everything else up to you. There is no built-in dependency injection, no enforced separation between UI and logic, and nothing stopping a single component from doing data fetching, state management, and rendering all at once.

This makes architectural decisions on the frontend genuinely difficult. Without a deliberate approach, projects tend to grow into tightly coupled components that are hard to test, hard to reuse, and expensive to change. It is worth taking this seriously from the start.

### Feature Sliced Design

Feature Sliced Design is a methodology that organizes frontend code into strict layers: app, pages, widgets, features, entities, and shared. Each layer has defined responsibilities and explicit rules about which layers can import from which. The core idea is that each feature is a self-contained unit with its own UI, model, and API.

This project does not use Feature Sliced Design. The reasons are practical.

The model layer in FSD is attached directly to each feature's components. If you want to reuse a component in a different context, you carry its state management along with it, which creates unnecessary coupling. The methodology also requires a significant amount of boilerplate and introduces coordination overhead that compounds as the project grows. Teams often spend more effort navigating architecture rules than building product.

### Feature-based Approach

The approach used in this project is simpler. Code is organized by what it does, split across packages with clearly defined responsibilities.

`ui-web` is the design system layer. Components here are stateless and receive everything through props. They have no Redux dependency, make no API calls, and have no knowledge of the application domain. This makes them straightforward to test, straightforward to document in Storybook, and reusable across different clients without modification.

`core` holds all business logic. Concretely: the Redux store, RTK slices and selectors for `auth`, `todos`, and `errors`, API clients, Zod validation schemas, shared types, and services like Sentry and the logger. Data is fetched, transformed, and stored here. Application code consumes this layer but never duplicates it.

Keeping business logic in `core` has two concrete benefits. First, it can be covered with unit tests in isolation, without rendering components or simulating user interaction. Second, every client gets the same logic for free. A mobile client would import the same store, the same selectors, and the same API layer. The only thing that changes is how each client wires it up inside its own containers.

`design-tokens` provides the visual foundation as framework-agnostic CSS custom properties. Colors, spacing, and typography live here and are shared across all packages.

When a feature requires coordination between multiple concerns, for example displaying todos while also reacting to the current user state, that logic lives in a container inside `web-client`. Containers connect the store to presentational components: they select state, dispatch actions, and pass data down as props. This boundary matters because a future mobile client would handle the same coordination differently, while `ui-web` and `core` stay shared and unchanged.

Pages follow the same idea. A page component is a container scoped to a route: it wires up the necessary state and composes the layout, but delegates all visual decisions to `ui-web` components.
