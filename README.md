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
| Deploy         | AWS S3 · CloudFront · ECR · ECS                  |
| Backend        | NestJS · Prisma · PostgreSQL · Redis · Docker    |
| Infrastructure | AWS · RDS · ElasticCache                         |
| Observability  | Prometheus · Grafana · Loki · Promtail           |
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
  - [Task Management](docs/development-workflow.md#task-management)
  - [Git Flow](docs/development-workflow.md#git-flow)
    - [Branch Naming Convention](docs/development-workflow.md#branch-naming-convention)
    - [Commit Conventions](docs/development-workflow.md#commit-conventions)
  - [Feature Workflow](docs/development-workflow.md#feature-workflow)
  - [Bug Fixing Workflow](docs/development-workflow.md#bug-fixing-workflow)
  - [Code Review](docs/development-workflow.md#code-review)
  - [Squash Merge Strategy](docs/development-workflow.md#squash-merge-strategy)
  - [Squash Merge Workflow](docs/development-workflow.md#squash-merge-workflow)
  - [Why This Matters](docs/development-workflow.md#why-this-matters)

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
  - [Layer 1. Code Formatting And Consistency](docs/code-quality.md#layer-1-code-formatting-and-consistency)
  - [Layer 2. Static Analysis With ESLint](docs/code-quality.md#layer-2-static-analysis-with-eslint)
  - [Layer 3. Pre-commit Protection](docs/code-quality.md#layer-3-pre-commit-protection)
  - [Layer 4. Commitlint Configuration](docs/code-quality.md#layer-4-commitlint-configuration)
  - [Layer 5. Continuous Integration Checks](docs/code-quality.md#layer-5-continuous-integration-checks)
  - [Layer 6. Dependency Locking](docs/code-quality.md#layer-6-dependency-locking)

<!-- -->

- [6. Styles Management](docs/styles-management.md)
  - [Design Tokens](docs/styles-management.md#design-tokens)
  - [Storybook](docs/styles-management.md#storybook)
  - [Tailwind CSS](docs/styles-management.md#tailwind-css)
  - [Accessibility](docs/styles-management.md#accessibility)

<!-- -->

- [7. Assets Management](docs/assets-management.md)
  - [When this Matters](docs/assets-management.md#when-this-matters)
  - [How it Works](docs/assets-management.md#how-it-works)
  - [Local Development](docs/assets-management.md#local-development)
  - [What Belongs in Assets](docs/assets-management.md#what-belongs-in-assets)

<!-- -->

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

[CONTRIBUTING](CONTRIBUTING.md)

# The MIT License

[LICENSE](LICENSE.md)
