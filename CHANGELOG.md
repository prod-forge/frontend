# Changelog

# [1.1.0](https://github.com/prod-forge/frontend/compare/v1.0.0...v1.1.0) (2026-11-09)

### Bug Fixes

- **a11y:** put the visible text into the names of Prev and the status toggle ([0c3e88a](https://github.com/prod-forge/frontend/commit/0c3e88a959d4342aa32388b43a7caea0f2154978))
- **ci:** sync assets under the assets/ prefix that CloudFront reads ([6173931](https://github.com/prod-forge/frontend/commit/617393128cfd6b585808ae41c7175dfbb2636ce9))
- make the Claude deny hooks actually deny ([8925e32](https://github.com/prod-forge/frontend/commit/8925e32a57817eda81d4610396654a5cde69f160))
- **mobile-client:** install the @sentry/react-native version Expo SDK 58 expects ([69bf7b1](https://github.com/prod-forge/frontend/commit/69bf7b140146d72c1d395eefb0694221838432b9))
- **mobile-client:** keep sendDefaultPii explicit under the Sentry 8.28 types ([c8806c4](https://github.com/prod-forge/frontend/commit/c8806c4144c55050ce3afda62f34d13a7e15fba4))
- paste over-limit descriptions in ui-web tests instead of typing them ([89fce8b](https://github.com/prod-forge/frontend/commit/89fce8b4de446856d903e1dd83552a3f9dc41519))
- **ui-web:** drop aria-pressed from the status toggle whose name changes ([d3dc9a0](https://github.com/prod-forge/frontend/commit/d3dc9a071467701fccf7ea65251f54d97109ca29))
- **ui-web:** remove the forgot password form from the login form ([d5e89a8](https://github.com/prod-forge/frontend/commit/d5e89a89a91f1ad633a6f8fc64e5ba472d0671fc))
- **ui-web:** trap focus in the modal and return it to the opener ([26be9e8](https://github.com/prod-forge/frontend/commit/26be9e8563a2f67b83a67dd14394932a3a66180a))
- **web-client:** mask all text in Sentry Replay ([9b97cdf](https://github.com/prod-forge/frontend/commit/9b97cdff64ec3c46419d452684fb4574ce5d371a))

### Features

- **web-client:** show a not found page for unknown paths ([404256c](https://github.com/prod-forge/frontend/commit/404256c9adf4dd7cfb71705902c0f896d8a09dbc))

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
