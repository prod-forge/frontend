# Changelog

## 1.0.0 (2026-11-04)

First published version of the Prod Forge frontend: a React web client, an Expo mobile client and the shared packages
they are built from. Earlier tags (`v1.1.0` to `v1.2.2`, May 2026) were local scaffolding iterations that were never
pushed; their content is folded into this release. Requires backend `1.0.0`: the client logs in against the backend,
sends the issued JWT and relies on its pagination, validation limits and error codes.

### Web client

- Todo list with offset pagination and "load more", create, edit and delete, including delete from the list view.
- Login against the backend with the issued JWT, todos are cleared on logout.
- Route-level code splitting, web vitals reported to Sentry, Content Security Policy shared with CloudFront.
- Sentry error reporting with a hashed user id instead of the email; source maps are uploaded to Sentry and kept out of
  the public bucket.
- Production builds fail without an absolute `VITE_API_BASE_URL`; the dev server proxies the API to the local backend.

### Mobile client

- Expo SDK 58 app (iOS and Android) on the shared core and design tokens, with stable "load more" offsets.

### Shared packages

- `core`: platform-neutral `configureCore`, async auth hydration, `fetchMoreTodos` that appends the next page and tracks
  the server offset, error mapping aligned with the backend contract (including bodies without a trace id), no
  reporting of silent and not-found rejections.
- `design-tokens`: color, shadow and base tokens built with Style Dictionary for web and mobile.
- `styles-web`: Tailwind CSS v4 setup shared by the web client and the UI library.
- `ui-web`: component library with Storybook, visual and accessibility tests.
- `test-data`: one source of seed data for unit, e2e and visual tests, with backend-compatible search and sorting.

### Quality gates

- ESLint config mirroring `@rockpack/codestyle`, Prettier, knip, cspell, Husky with lint-staged and commitlint.
- The `commit-msg` hook rejects AI attribution trailers.
- Vitest unit tests, Playwright e2e tests, visual regression and accessibility tests.

### CI/CD

- CI workflow with lint, knip, unit, e2e, visual and accessibility tests and a build, kept disabled on purpose (see
  the roadmap).
- CD on `v*` tags: assets and web client to S3, CloudFront invalidation, rollback with a validated version input.
- AWS role, CloudFront distribution and bucket names come from terraform outputs; Sentry build variables are passed to
  the build; Node.js 24.21.0.

### Documentation

- 17-chapter frontend guide, from repository strategy to the mobile client.
- Agent docs in `.claude/docs`, `.env.example` templates for both clients, roadmap, contributing guide, MIT license.
