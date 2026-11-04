<p align="center">
  <img alt="Logo" src="https://github.com/prod-forge/backend/blob/main/docs/assets/prod-forge-logo.png" width="264px" height="243px">
</p>

_AI made writing the code easy. Running it in production is still hard._

**Prod Forge** is an open-source reference that shows how to build and operate a production-ready system: AI-assisted
development, quality gates, CI/CD, infrastructure, observability, migrations, and rollback.

The implementation is based on a simple Todo API, but the architecture follows patterns used in real production systems
at scale.

Every major technical decision is documented and explained.

---

## Project structure

| Repository                                                | Description                                     |
| --------------------------------------------------------- | ----------------------------------------------- |
| [Frontend](https://github.com/prod-forge/frontend)        | React Web and React Mobile apps + Design System |
| [Backend](https://github.com/prod-forge/backend)          | NestJS API - the main guide                     |
| [Infrastructure](https://github.com/prod-forge/terraform) | Terraform on AWS                                |

## Stack

<p align="center">
  <img alt="Architecture" src="https://github.com/prod-forge/backend/blob/main/docs/assets/architecture_diagram.png">
</p>

| Layer          | Tools                                            |
| -------------- | ------------------------------------------------ |
| Web Client     | React · Vite · Redux Toolkit · Tailwind CSS · NX |
| Mobile Client  | Expo · React Native · Redux Toolkit              |
| Deploy         | AWS S3 · CloudFront · ECR · ECS                  |
| Backend        | NestJS · Prisma · PostgreSQL · Redis · Docker    |
| Infrastructure | AWS · RDS · ElastiCache                          |
| Observability  | Prometheus · Grafana · Loki · Promtail · Tempo   |
| Quality        | ESLint · Prettier · Husky · Commitlint · CI/CD   |

# Table of contents

- [1. Repository Strategy](docs/repository-strategy.md)
  - [Why Frontend Projects Use a Monorepo](docs/repository-strategy.md#why-frontend-projects-use-a-monorepo)
  - [What Gets Shared Across Clients](docs/repository-strategy.md#what-gets-shared-across-clients)
  - [What Belongs in a Frontend Monorepo](docs/repository-strategy.md#what-belongs-in-a-frontend-monorepo)
  - [Structure](docs/repository-strategy.md#structure)

<!-- -->

- [2. Architecture Decisions](docs/architecture-decisions.md)
  - [Choosing the Right Architecture](docs/architecture-decisions.md#choosing-the-right-architecture)
  - [Frontend Architecture](docs/architecture-decisions.md#frontend-architecture)
    - [Feature Sliced Design](docs/architecture-decisions.md#feature-sliced-design)
    - [Feature-based Approach](docs/architecture-decisions.md#feature-based-approach)

<!-- -->

- [3. Development Workflow](docs/development-workflow.md)
  - [NX-Aware Development](docs/development-workflow.md#nx-aware-development)
  - [Visual Snapshots in a Pull Request](docs/development-workflow.md#visual-snapshots-in-a-pull-request)
  - [Storybook in Review](docs/development-workflow.md#storybook-in-review)
  - [Checks Before You Push](docs/development-workflow.md#checks-before-you-push)
  - [Documentation Is Part of the Change](docs/development-workflow.md#documentation-is-part-of-the-change)

<!-- -->

- [4. AI-Assisted Development](docs/ai-development.md)
  - [Quality Gates First](docs/ai-development.md#quality-gates-first)
  - [Architecture Before Generation](docs/ai-development.md#architecture-before-generation)
  - [Workflow](docs/ai-development.md#workflow)
    - [Input Modes](docs/ai-development.md#input-modes)
    - [Plan, Then Implement](docs/ai-development.md#plan-then-implement)
    - [Save Your Prompts](docs/ai-development.md#save-your-prompts)
  - [Project Knowledge Files](docs/ai-development.md#project-knowledge-files)
    - [MEMORY.md](docs/ai-development.md#memorymd)
    - [REVIEW.md](docs/ai-development.md#reviewmd)
    - [docs/](docs/ai-development.md#docs)
    - [Skills](docs/ai-development.md#skills)
  - [Pre-Hooks](docs/ai-development.md#pre-hooks)
    - [Protected files (Edit|Write)](docs/ai-development.md#protected-files-editwrite)
    - [Blocked commands (Bash)](docs/ai-development.md#blocked-commands-bash)
  - [Task Decomposition](docs/ai-development.md#task-decomposition)
  - [Common AI Problems](docs/ai-development.md#common-ai-problems)
  - [Cost Optimization](docs/ai-development.md#cost-optimization)
  - [Quality Control](docs/ai-development.md#quality-control)
    - [Commit Frequently](docs/ai-development.md#commit-frequently)
    - [Validate Edge Cases](docs/ai-development.md#validate-edge-cases)
    - [Mandatory Code Review](docs/ai-development.md#mandatory-code-review)
    - [Never Trust AI Blindly](docs/ai-development.md#never-trust-ai-blindly)
  - [Recommended Workflow](docs/ai-development.md#recommended-workflow)

<!-- -->

- [5. Code Quality](docs/code-quality.md)
  - [Layer 1. Formatting](docs/code-quality.md#layer-1-formatting)
  - [Layer 2. Static Analysis](docs/code-quality.md#layer-2-static-analysis)
  - [Layer 3. Pre-commit and Pre-push](docs/code-quality.md#layer-3-pre-commit-and-pre-push)
  - [Layer 4. Commitlint](docs/code-quality.md#layer-4-commitlint)
  - [Layer 5. Continuous Integration](docs/code-quality.md#layer-5-continuous-integration)
  - [Layer 6. Dependency Locking](docs/code-quality.md#layer-6-dependency-locking)

<!-- -->

- [6. Styles Management](docs/styles-management.md)
  - [Design Tokens](docs/styles-management.md#design-tokens)
  - [Tailwind CSS](docs/styles-management.md#tailwind-css)
  - [Why Accessibility Is in the Pipeline](docs/styles-management.md#why-accessibility-is-in-the-pipeline)

<!-- -->

- [7. Assets Management](docs/assets-management.md)
  - [When this Matters](docs/assets-management.md#when-this-matters)
  - [How it Works](docs/assets-management.md#how-it-works)
  - [Local Development](docs/assets-management.md#local-development)
  - [What Belongs in Assets](docs/assets-management.md#what-belongs-in-assets)

<!-- -->

- [8. Design System](docs/design-system.md)
  - [What a Design System Is Here](docs/design-system.md#what-a-design-system-is-here)
  - [Token Pipeline](docs/design-system.md#token-pipeline)
  - [Theming](docs/design-system.md#theming)
  - [Component Anatomy](docs/design-system.md#component-anatomy)
  - [Storybook as the Contract](docs/design-system.md#storybook-as-the-contract)
  - [Visual Regression](docs/design-system.md#visual-regression)
  - [Accessibility Testing](docs/design-system.md#accessibility-testing)
  - [Designer Workflow](docs/design-system.md#designer-workflow)

<!-- -->

- [9. State Management](docs/state-management.md)
  - [Why Redux Toolkit Here](docs/state-management.md#why-redux-toolkit-here)
  - [Slices and Thunks](docs/state-management.md#slices-and-thunks)
  - [Optimistic Updates and Rollback](docs/state-management.md#optimistic-updates-and-rollback)
  - [Selectors and Memoization](docs/state-management.md#selectors-and-memoization)
  - [Error Middleware](docs/state-management.md#error-middleware)
  - [Normalization or Not](docs/state-management.md#normalization-or-not)
  - [Sharing the Store With Mobile](docs/state-management.md#sharing-the-store-with-mobile)

<!-- -->

- [10. API Client and Errors](docs/api-client-and-errors.md)
  - [The Client Contract](docs/api-client-and-errors.md#the-client-contract)
  - [apiRequest](docs/api-client-and-errors.md#apirequest)
  - [Error Taxonomy on the Client](docs/api-client-and-errors.md#error-taxonomy-on-the-client)
  - [Mapping Codes to Messages](docs/api-client-and-errors.md#mapping-codes-to-messages)
  - [Toasts, Retry, Error Boundary](docs/api-client-and-errors.md#toasts-retry-error-boundary)
  - [Validation on Both Sides](docs/api-client-and-errors.md#validation-on-both-sides)

<!-- -->

- [11. Client Observability](docs/client-observability.md)
  - [Why Observability Starts in the Browser](docs/client-observability.md#why-observability-starts-in-the-browser)
  - [Trace ID End-to-End](docs/client-observability.md#trace-id-end-to-end)
  - [Sentry](docs/client-observability.md#sentry)
  - [Web Vitals](docs/client-observability.md#web-vitals)
  - [Client Logs Endpoint](docs/client-observability.md#client-logs-endpoint)
  - [What We Do Not Collect](docs/client-observability.md#what-we-do-not-collect)

<!-- -->

- [12. Testing Strategy](docs/testing-strategy.md)
  - [The Pyramid for a Frontend](docs/testing-strategy.md#the-pyramid-for-a-frontend)
  - [Why E2E Mocks the API](docs/testing-strategy.md#why-e2e-mocks-the-api)
  - [Unit Tests With a Real Store](docs/testing-strategy.md#unit-tests-with-a-real-store)
  - [Coverage Thresholds](docs/testing-strategy.md#coverage-thresholds)
  - [Running Locally vs CI](docs/testing-strategy.md#running-locally-vs-ci)
  - [Mobile Tests](docs/testing-strategy.md#mobile-tests)

<!-- -->

- [13. Configuration](docs/configuration.md)
  - [Build-Time Configuration](docs/configuration.md#build-time-configuration)
  - [.env.example](docs/configuration.md#envexample)
  - [assertBuildEnv](docs/configuration.md#assertbuildenv)
  - [GitHub Variables and Secrets](docs/configuration.md#github-variables-and-secrets)
  - [Mobile](docs/configuration.md#mobile)
  - [What Never Goes Into the Client](docs/configuration.md#what-never-goes-into-the-client)

<!-- -->

- [14. Performance](docs/performance.md)
  - [Bundle Analysis](docs/performance.md#bundle-analysis)
  - [Code Splitting by Route](docs/performance.md#code-splitting-by-route)
  - [Caching Strategy](docs/performance.md#caching-strategy)
  - [Assets CDN](docs/performance.md#assets-cdn)
  - [Performance Budget](docs/performance.md#performance-budget)
  - [Rendering Performance](docs/performance.md#rendering-performance)
  - [Summary](docs/performance.md#summary)

<!-- -->

- [15. Security](docs/security.md)
  - [Threat Model for an SPA](docs/security.md#threat-model-for-an-spa)
  - [Content Security Policy](docs/security.md#content-security-policy)
  - [Token Storage](docs/security.md#token-storage)
  - [Authentication](docs/security.md#authentication)
  - [XSS Surface](docs/security.md#xss-surface)
  - [Dependency Hygiene](docs/security.md#dependency-hygiene)
  - [Headers Set by CloudFront](docs/security.md#headers-set-by-cloudfront)

<!-- -->

- [16. Release and Deployment](docs/release-and-deployment.md)
  - [Release Flow](docs/release-and-deployment.md#release-flow)
  - [What CD Does](docs/release-and-deployment.md#what-cd-does)
  - [Rollback](docs/release-and-deployment.md#rollback)
  - [Why Not Deploy on Every Merge](docs/release-and-deployment.md#why-not-deploy-on-every-merge)
  - [Storybook Deployment](docs/release-and-deployment.md#storybook-deployment)

<!-- -->

- [17. Mobile Client](docs/mobile-client.md)
  - [Why Expo](docs/mobile-client.md#why-expo)
  - [What Is Shared and What Is Not](docs/mobile-client.md#what-is-shared-and-what-is-not)
  - [Project Layout](docs/mobile-client.md#project-layout)
  - [Metro in a Monorepo](docs/mobile-client.md#metro-in-a-monorepo)
  - [Platform Adapters](docs/mobile-client.md#platform-adapters)
  - [Theming From Tokens](docs/mobile-client.md#theming-from-tokens)
  - [Testing](docs/mobile-client.md#testing)
  - [Not Covered](docs/mobile-client.md#not-covered)

<!-- -->

## Package scope

All packages use the `@prod-forge-todolist-frontend/` scope: `core`, `ui-web`, `design-tokens`, `styles-web`, `test-data`, and the private `web-client` and `mobile-client` applications.

### Why the scope is not `@prod-forge`

The scope was chosen for the first version of the repository, and it reads as the name of the project, not as a brand. A shorter `@prod-forge` scope would be tidier, but renaming touches every import in every package, the path aliases in `tsconfig.base.json`, the Vite, Vitest and Jest mappings and the lockfile, and it adds no value to the reader: the packages are never published to a registry. So the name stays as it is.

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
  "@prod-forge-todolist-frontend/core": ["./packages/core/src/index.ts"],
  "@prod-forge-todolist-frontend/test-data": ["./packages/test-data/src/index.ts"],
  "@prod-forge-todolist-frontend/ui-web": ["./packages/ui-web/src/index.ts"]
}
```

The Vite configs of `web-client` and `ui-web` add matching `resolve.alias` entries, and the mobile client maps the same packages in `moduleNameMapper` of its Jest config, so dev and tests resolve the same sources.

---

# Contributing

We welcome any kind of contribution, please read the guidelines:

[CONTRIBUTING](CONTRIBUTING.md)

# The MIT License

[LICENSE](LICENSE.md)
