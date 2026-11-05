<p align="center">
  <img alt="Prod Forge" src="https://raw.githubusercontent.com/prod-forge/.github/main/assets/prod-forge-logo.png" width="264px" height="243px">
</p>

_AI made writing the code easy. Running it in production is still hard._

This repository holds the web and mobile clients in one NX monorepo, with a shared design system. It answers: how do I build, ship, and keep web and mobile clients healthy?

Part of Prod Forge — start with the organization overview: https://github.com/prod-forge

## Stack

<!-- prettier-ignore -->
| Layer          | Tools                                            |
| -------------- | ------------------------------------------------ |
| Web Client     | React · Vite · Redux Toolkit · Tailwind CSS · NX |
| Mobile Client  | Expo · React Native · Redux Toolkit              |
| Quality        | ESLint · Prettier · Husky · Commitlint · CI/CD   |

The full stack table is on the organization page: https://github.com/prod-forge

## Getting started

Requires Node 24 and the backend API running (see the [backend guide](https://github.com/prod-forge/backend#readme)).

```shell
npm ci
cp .env.example .env   # VITE_API_BASE_URL is required for a build (absolute URL ending with "/"); dev falls back to the /api/v1/ proxy
npm run dev            # web client
cp apps/mobile-client/.env.example apps/mobile-client/.env   # EXPO_PUBLIC_API_BASE_URL, mobile client only
npm run dev:mobile     # mobile client (Expo)
```

# Table of contents

- [1. Repository Strategy](guide/repository-strategy.md)
  - [Why Frontend Projects Use a Monorepo](guide/repository-strategy.md#why-frontend-projects-use-a-monorepo)
  - [What Gets Shared Across Clients](guide/repository-strategy.md#what-gets-shared-across-clients)
  - [What Belongs in a Frontend Monorepo](guide/repository-strategy.md#what-belongs-in-a-frontend-monorepo)
  - [Structure](guide/repository-strategy.md#structure)
  - [Package Scope](guide/repository-strategy.md#package-scope)
  - [Path Aliases](guide/repository-strategy.md#path-aliases)

<!-- -->

- [2. Architecture Decisions](guide/architecture-decisions.md)
  - [Choosing the Right Architecture](guide/architecture-decisions.md#choosing-the-right-architecture)
  - [Frontend Architecture](guide/architecture-decisions.md#frontend-architecture)
    - [Feature Sliced Design](guide/architecture-decisions.md#feature-sliced-design)
    - [Feature-based Approach](guide/architecture-decisions.md#feature-based-approach)

<!-- -->

- [3. Development Workflow](guide/development-workflow.md)
  - [NX-Aware Development](guide/development-workflow.md#nx-aware-development)
  - [Visual Snapshots in a Pull Request](guide/development-workflow.md#visual-snapshots-in-a-pull-request)
  - [Storybook in Review](guide/development-workflow.md#storybook-in-review)
  - [Checks Before You Push](guide/development-workflow.md#checks-before-you-push)
  - [Documentation Is Part of the Change](guide/development-workflow.md#documentation-is-part-of-the-change)

<!-- -->

- [4. AI-Assisted Development](guide/ai-development.md)
  - [Quality Gates First](guide/ai-development.md#quality-gates-first)
  - [Architecture Before Generation](guide/ai-development.md#architecture-before-generation)
  - [Workflow](guide/ai-development.md#workflow)
    - [Context Belongs to the Repository](guide/ai-development.md#context-belongs-to-the-repository)
    - [What Goes into AGENTS.md](guide/ai-development.md#what-goes-into-agentsmd)
    - [The docs/ Folder](guide/ai-development.md#the-docs-folder)
    - [Tune Your Harness](guide/ai-development.md#tune-your-harness)
    - [Superpowers](guide/ai-development.md#superpowers)
  - [Pre-Hooks](guide/ai-development.md#pre-hooks)
  - [Task Decomposition](guide/ai-development.md#task-decomposition)
    - [1. State the Task at a High Level](guide/ai-development.md#1-state-the-task-at-a-high-level)
    - [2. Let the Agent Write the Plan](guide/ai-development.md#2-let-the-agent-write-the-plan)
    - [3. Answer the Questions](guide/ai-development.md#3-answer-the-questions)
    - [4. Validate and Approve](guide/ai-development.md#4-validate-and-approve)
    - [5. Close with Conclusions](guide/ai-development.md#5-close-with-conclusions)
  - [Legacy Projects](guide/ai-development.md#legacy-projects)
  - [Common AI Problems](guide/ai-development.md#common-ai-problems)
  - [Cost Optimization](guide/ai-development.md#cost-optimization)
  - [Quality Control](guide/ai-development.md#quality-control)
    - [Commit Frequently](guide/ai-development.md#commit-frequently)
    - [Validate Edge Cases](guide/ai-development.md#validate-edge-cases)
    - [Mandatory Code Review](guide/ai-development.md#mandatory-code-review)
    - [Never Trust AI Blindly](guide/ai-development.md#never-trust-ai-blindly)
  - [Recommended Workflow](guide/ai-development.md#recommended-workflow)

<!-- -->

- [5. Code Quality](guide/code-quality.md)
  - [Layer 1. Formatting](guide/code-quality.md#layer-1-formatting)
  - [Layer 2. Static Analysis](guide/code-quality.md#layer-2-static-analysis)
  - [Layer 3. Pre-commit and Pre-push](guide/code-quality.md#layer-3-pre-commit-and-pre-push)
  - [Layer 4. Commitlint](guide/code-quality.md#layer-4-commitlint)
  - [Layer 5. Continuous Integration](guide/code-quality.md#layer-5-continuous-integration)
  - [Layer 6. Dependency Locking](guide/code-quality.md#layer-6-dependency-locking)

<!-- -->

- [6. Styles Management](guide/styles-management.md)
  - [Design Tokens](guide/styles-management.md#design-tokens)
  - [Tailwind CSS](guide/styles-management.md#tailwind-css)
  - [Why Accessibility Is in the Pipeline](guide/styles-management.md#why-accessibility-is-in-the-pipeline)

<!-- -->

- [7. Assets Management](guide/assets-management.md)
  - [When this Matters](guide/assets-management.md#when-this-matters)
  - [How it Works](guide/assets-management.md#how-it-works)
  - [Local Development](guide/assets-management.md#local-development)
  - [What Belongs in Assets](guide/assets-management.md#what-belongs-in-assets)

<!-- -->

- [8. Design System](guide/design-system.md)
  - [What a Design System Is Here](guide/design-system.md#what-a-design-system-is-here)
  - [Token Pipeline](guide/design-system.md#token-pipeline)
  - [Theming](guide/design-system.md#theming)
  - [Component Anatomy](guide/design-system.md#component-anatomy)
  - [Storybook as the Contract](guide/design-system.md#storybook-as-the-contract)
  - [Visual Regression](guide/design-system.md#visual-regression)
  - [Accessibility Testing](guide/design-system.md#accessibility-testing)
  - [Designer Workflow](guide/design-system.md#designer-workflow)

<!-- -->

- [9. State Management](guide/state-management.md)
  - [Why Redux Toolkit Here](guide/state-management.md#why-redux-toolkit-here)
  - [Slices and Thunks](guide/state-management.md#slices-and-thunks)
  - [Optimistic Updates and Rollback](guide/state-management.md#optimistic-updates-and-rollback)
  - [Selectors and Memoization](guide/state-management.md#selectors-and-memoization)
  - [Error Middleware](guide/state-management.md#error-middleware)
  - [Normalization or Not](guide/state-management.md#normalization-or-not)
  - [Sharing the Store With Mobile](guide/state-management.md#sharing-the-store-with-mobile)

<!-- -->

- [10. API Client and Errors](guide/api-client-and-errors.md)
  - [The Client Contract](guide/api-client-and-errors.md#the-client-contract)
  - [apiRequest](guide/api-client-and-errors.md#apirequest)
  - [Error Taxonomy on the Client](guide/api-client-and-errors.md#error-taxonomy-on-the-client)
  - [Mapping Codes to Messages](guide/api-client-and-errors.md#mapping-codes-to-messages)
  - [Toasts, Retry, Error Boundary](guide/api-client-and-errors.md#toasts-retry-error-boundary)
  - [Validation on Both Sides](guide/api-client-and-errors.md#validation-on-both-sides)

<!-- -->

- [11. Client Observability](guide/client-observability.md)
  - [Why Observability Starts in the Browser](guide/client-observability.md#why-observability-starts-in-the-browser)
  - [Trace ID End-to-End](guide/client-observability.md#trace-id-end-to-end)
  - [Sentry](guide/client-observability.md#sentry)
  - [Web Vitals](guide/client-observability.md#web-vitals)
  - [Client Logs Endpoint](guide/client-observability.md#client-logs-endpoint)
  - [What We Do Not Collect](guide/client-observability.md#what-we-do-not-collect)

<!-- -->

- [12. Testing Strategy](guide/testing-strategy.md)
  - [The Pyramid for a Frontend](guide/testing-strategy.md#the-pyramid-for-a-frontend)
  - [Why E2E Mocks the API](guide/testing-strategy.md#why-e2e-mocks-the-api)
  - [Unit Tests With a Real Store](guide/testing-strategy.md#unit-tests-with-a-real-store)
  - [Coverage Thresholds](guide/testing-strategy.md#coverage-thresholds)
  - [Running Locally vs CI](guide/testing-strategy.md#running-locally-vs-ci)
  - [Mobile Tests](guide/testing-strategy.md#mobile-tests)

<!-- -->

- [13. Configuration](guide/configuration.md)
  - [Build-Time Configuration](guide/configuration.md#build-time-configuration)
  - [.env.example](guide/configuration.md#envexample)
  - [assertBuildEnv](guide/configuration.md#assertbuildenv)
  - [GitHub Variables and Secrets](guide/configuration.md#github-variables-and-secrets)
  - [Mobile](guide/configuration.md#mobile)
  - [What Never Goes Into the Client](guide/configuration.md#what-never-goes-into-the-client)

<!-- -->

- [14. Performance](guide/performance.md)
  - [Bundle Analysis](guide/performance.md#bundle-analysis)
  - [Code Splitting by Route](guide/performance.md#code-splitting-by-route)
  - [Caching Strategy](guide/performance.md#caching-strategy)
  - [Assets CDN](guide/performance.md#assets-cdn)
  - [Performance Budget](guide/performance.md#performance-budget)
  - [Rendering Performance](guide/performance.md#rendering-performance)
  - [Summary](guide/performance.md#summary)

<!-- -->

- [15. Security](guide/security.md)
  - [Threat Model for an SPA](guide/security.md#threat-model-for-an-spa)
  - [Content Security Policy](guide/security.md#content-security-policy)
  - [Token Storage](guide/security.md#token-storage)
  - [Authentication](guide/security.md#authentication)
  - [XSS Surface](guide/security.md#xss-surface)
  - [Dependency Hygiene](guide/security.md#dependency-hygiene)
  - [Headers Set by CloudFront](guide/security.md#headers-set-by-cloudfront)

<!-- -->

- [16. Release and Deployment](guide/release-and-deployment.md)
  - [Release Flow](guide/release-and-deployment.md#release-flow)
  - [What CD Does](guide/release-and-deployment.md#what-cd-does)
  - [Rollback](guide/release-and-deployment.md#rollback)
  - [Why Not Deploy on Every Merge](guide/release-and-deployment.md#why-not-deploy-on-every-merge)
  - [Storybook Deployment](guide/release-and-deployment.md#storybook-deployment)

<!-- -->

- [17. Mobile Client](guide/mobile-client.md)
  - [Why Expo](guide/mobile-client.md#why-expo)
  - [What Is Shared and What Is Not](guide/mobile-client.md#what-is-shared-and-what-is-not)
  - [Project Layout](guide/mobile-client.md#project-layout)
  - [Metro in a Monorepo](guide/mobile-client.md#metro-in-a-monorepo)
  - [Platform Adapters](guide/mobile-client.md#platform-adapters)
  - [Theming From Tokens](guide/mobile-client.md#theming-from-tokens)
  - [Testing](guide/mobile-client.md#testing)
  - [Not Covered](guide/mobile-client.md#not-covered)

<!-- -->

# Conclusion

A frontend is easy to start and hard to keep healthy.

The first screen takes an afternoon. What takes years is everything around it: two clients that must agree on the same
rules, a bundle that grows a little with every feature, an error a user saw that nobody can reproduce, a release that
has to be rolled back on a Friday evening, and a design that drifts a pixel at a time until nobody trusts it.

This repository is an attempt to show that work, not just the screens.

The stack - React, Expo, Redux Toolkit, Tailwind, NX - is not the point. These are just tools. The principles behind
them apply to almost any client, whatever framework comes next.

What matters is the thinking:

- Why does sharing a store and an API layer between web and mobile pay off only with a strict dependency direction?
- Why should a design system live in the repository, with tokens, stories and visual tests, and not in a design file?
- Why does a client need its own observability when the backend already logs every request?
- Why is the browser an untrusted environment, and what does that change about tokens and configuration?

These are not advanced topics. They are basic requirements for any client that real users depend on.
The goal of Prod Forge is to make these practices visible, understandable, and reusable.

## What comes next

Open work is tracked in the [roadmap](roadmap.md) and summarized on the [organization page](https://github.com/prod-forge).

## A final thought

The best time to set up these practices is at the beginning of a project.

The second best time is now.

A client without error tracking leaves you guessing about what users actually saw. A design system without visual tests
drifts until nobody trusts it. A bundle without a budget only grows. A release without a rollback path turns a small
mistake into an outage.

None of these things are difficult to set up. They are just easy to skip.
This project exists as a reminder not to skip them.

# Intentionally out of scope

- Passwords, refresh tokens, sign-up and an identity provider: the clients sign in with the backend's login stub, see [Security](guide/security.md#authentication)
- Store release of the mobile app: no EAS Build, EAS Submit or over-the-air updates, see [Mobile Client](guide/mobile-client.md#not-covered)
- Running CI: the workflows exist but are disabled on purpose, see the [roadmap](roadmap.md)

# Contributing

We welcome any kind of contribution, please read the guidelines:

[CONTRIBUTING](CONTRIBUTING.md)

# The MIT License

[LICENSE](LICENSE)
