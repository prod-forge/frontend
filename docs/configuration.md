# Configuration

How the backend manages environments and secrets is described in [Configuration Management](https://github.com/prod-forge/backend/blob/main/docs/configuration-management.md). The client has a different problem: it has no server process that reads variables at startup. This chapter explains what that changes.

## Build-Time Configuration

A browser bundle cannot read environment variables. Vite replaces every `import.meta.env.VITE_*` reference with its literal value **while building**, and from then on the value is part of the JavaScript:

```ts
// apps/web-client/src/services/core-setup.ts
apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
```

```js
// in dist/static/index-<hash>.js
apiBaseUrl: 'https://api.example.com/api/v1/';
```

The consequences are the main thing to understand about client configuration:

- **One bundle per environment.** A build made for staging cannot be promoted to production by changing a setting. It must be built again with the production values. The release flow is built around this: the `prod` GitHub environment holds the values and CD builds from the tag.
- **No runtime switching.** The same `dist/` cannot point at two backends. If that is ever needed, the common solution is to serve a small `config.json` next to `index.html` and fetch it before the app starts. It is more flexible and has a cost (an extra request, a loading state before the first render, a cached-file problem). This project does not do it.
- **Everything is public.** Anyone can open the bundle and read the values (see What Never Goes Into the Client).
- **Changing a value means a new release,** with a new version and a new set of hashed files.

Only variables with the `VITE_` prefix are exposed to the client by Vite. This is a safety feature: a variable such as `SENTRY_AUTH_TOKEN` is not exposed even if it is present in the environment during the build.

The variables the web client uses are typed in `apps/web-client/src/env.d.ts`:

| Variable               | Required | Used for                                                                      |
| ---------------------- | -------- | ----------------------------------------------------------------------------- |
| `VITE_API_BASE_URL`    | build    | Base URL of the backend; must end with `/`; also allowed in the CSP           |
| `VITE_ASSETS_BASE_URL` | no       | Origin of the assets CDN; empty means "use local paths"                       |
| `VITE_SENTRY_DSN`      | no       | Enables Sentry when set (see [Client Observability](client-observability.md)) |
| `VITE_APP_VERSION`     | derived  | Defined by `vite.config.ts` from `package.json`; not set by hand              |

In development `VITE_API_BASE_URL` can be the relative `/api/v1/` (also the fallback when it is unset in the dev server): `server.proxy` in `apps/web-client/vite.config.ts` forwards `/api` to `http://localhost:3000`, so the browser stays on the Vite origin and the backend CORS allowlist is not involved. To log in locally, run `docker compose up` in the backend repo, then `npm run dev`, and use `user1@example.com`. The proxy exists only in the dev server; a production build still requires an absolute `VITE_API_BASE_URL`. `'self'` in the CSP covers the proxied calls; `normalizeCspOrigins` drops the relative URL.

`VITE_API_BASE_URL` and `VITE_ASSETS_BASE_URL` are also substituted into `index.html` as `%VITE_API_BASE_URL%` in the Content Security Policy `connect-src`, so the browser is allowed to call exactly the configured origins. Vite leaves a `%VITE_*%` token unchanged when the variable is unset, which would put an invalid source into the policy. The `stripUnsetHtmlEnv` transform in `apps/web-client/vite.build-env.ts` removes such tokens.

## .env.example

Local values live in `.env` files, which are ignored by git (`.gitignore` lists `.env` and `.env.production`). The repository carries `.env.example` files as the template of what to set. Copy and edit.

Root `.env.example` (web):

```shell
VITE_API_BASE_URL=/api/v1/
VITE_ASSETS_BASE_URL=http://localhost:4000
VITE_SENTRY_DSN=
```

`apps/mobile-client/.env.example`:

```shell
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1/
EXPO_PUBLIC_SENTRY_DSN=
```

The defaults match the local setup of the backend repository (the API on port 3000) and `npm run dev:assets`, which serves the `assets` folder on port 4000. An empty `VITE_SENTRY_DSN` keeps Sentry off.

Nx loads the root `.env` into the environment of its tasks. That detail matters for the next section.

## assertBuildEnv

A build without an API URL is the worst kind of failure: it succeeds, ships, and then every request goes to `undefinedtodos`. `assertBuildEnv` in `apps/web-client/vite.build-env.ts` makes it fail at build time instead:

```ts
export function assertBuildEnv(env: Record<string, string | undefined>, isBuild: boolean): void {
  if (!isBuild) {
    return;
  }

  const apiBaseUrl = env.VITE_API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error('VITE_API_BASE_URL is required for production build');
  }

  if (!apiBaseUrl.endsWith('/')) {
    throw new Error('VITE_API_BASE_URL must end with a trailing slash');
  }
}
```

It is wired as the `buildEnvGuard` plugin with `apply: 'build'`, so it runs on `vite build` only. The dev server, Vitest and tools that merely load `vite.config.ts` (such as knip) are not affected. The tests are in `vite.build-env.test.ts`.

The guard reads `process.env`, not Vite's own `.env` loading. Locally this works because Nx puts the root `.env` into the environment. A consequence to know: a `VITE_API_BASE_URL` set **only** in `apps/web-client/.env` is read by Vite for the bundle but not seen by the guard, so the build can fail with "required" even though the file has the value. Put the value in the root `.env` or export it in the shell.

The same rule is checked at runtime by `configureCore`, which throws on an empty URL or one without a trailing slash. The build guard catches the problem earlier; `configureCore` catches it in tests and on mobile.

## GitHub Variables and Secrets

The CD workflow (`.github/workflows/cd.yml`) reads its configuration from the `prod` environment; `rollback.yml` and `show-web-client-versions.yml` use the deploy variables. The build step fails without `VITE_API_BASE_URL`, so a bundle never ships with an empty API URL, and a first step fails the job when a deploy variable is empty. The deploy variables and the API URL are Terraform outputs of the environment root (`terraform -chdir=infrastructure/environments/prod output`, see [Deploy workflow variables](https://github.com/prod-forge/terraform/blob/main/docs/workflow.md#deploy-workflow-variables)).

| Name                         | Kind     | Consumer | Terraform output             | Example                                                                        |
| ---------------------------- | -------- | -------- | ---------------------------- | ------------------------------------------------------------------------------ |
| `VITE_API_BASE_URL`          | variable | build    | `api_url` + `/api/v1/`       | `https://api.example.com/api/v1/` (trailing slash required)                    |
| `CLOUDFRONT_URL`             | variable | build    | `cloudfront_url`             | `https://d111111abcdef8.cloudfront.net`                                        |
| `VITE_SENTRY_DSN`            | variable | build    |                              | `https://key@o0.ingest.sentry.io/0`                                            |
| `SENTRY_ORG`                 | variable | build    |                              | `my-org`                                                                       |
| `SENTRY_PROJECT`             | variable | build    |                              | `prod-forge-web`                                                               |
| `SENTRY_AUTH_TOKEN`          | secret   | build    |                              | `sntrys_...`                                                                   |
| `AWS_DEPLOY_ROLE_ARN`        | variable | deploy   | `github_frontend_role_arn`   | `arn:aws:iam::123456789012:role/prod-forge-todolist-prod-github-frontend-role` |
| `S3_WEB_CLIENT_BUCKET`       | variable | deploy   | `web_client_bucket_name`     | `prod-forge-todolist-prod-web-client`                                          |
| `S3_ASSETS_BUCKET`           | variable | deploy   | `assets_bucket_name`         | `prod-forge-todolist-prod-assets`                                              |
| `CLOUDFRONT_DISTRIBUTION_ID` | variable | deploy   | `cloudfront_distribution_id` | `E1ABCDEFGHIJKL`                                                               |
| `KEEP`                       | variable | deploy   |                              | `10` (releases kept in S3, default 10)                                         |

`VITE_ASSETS_BASE_URL` is not stored itself. The build step composes it from `CLOUDFRONT_URL`:

```yaml
VITE_ASSETS_BASE_URL: ${{ vars.CLOUDFRONT_URL }}/assets
```

Variables versus secrets: a variable is a value that ends up in the bundle anyway (API URL, DSN) or is not sensitive (a bucket name). A secret is something that must never appear in a log or in the bundle: `SENTRY_AUTH_TOKEN`. The role ARN, the bucket names and the distribution id are identifiers, not credentials: the role trusts only jobs of this repository in the `prod` environment, so they are variables. The Sentry token is used only by `sentryVitePlugin` during the build, to upload source maps. When it is absent (local builds, forks), the plugin is not added and the build still succeeds.

## Mobile

Expo plays the role of Vite. Variables with the `EXPO_PUBLIC_` prefix are inlined into the JavaScript bundle at build time, with the same consequences as above: they are public and fixed per build.

| Variable                   | Required | Used for                                |
| -------------------------- | -------- | --------------------------------------- |
| `EXPO_PUBLIC_API_BASE_URL` | yes      | Backend base URL, trailing slash        |
| `EXPO_PUBLIC_SENTRY_DSN`   | no       | Enables `@sentry/react-native` when set |

Both are typed in `apps/mobile-client/src/env.d.ts`. There is no build guard plugin, so `setupCore` in `apps/mobile-client/src/services/core-setup.ts` checks the value itself and throws a message that names the file to create:

```text
EXPO_PUBLIC_API_BASE_URL is not set. Create apps/mobile-client/.env from .env.example and restart Expo.
```

"Restart Expo" matters: the value is read when the bundle is built, so changing `.env` while Metro is running has no effect until it is restarted.

A device cannot reach `localhost` of the development machine. When running on a phone or an emulator, set the URL to the machine's address on the network (on the Android emulator it is `10.0.2.2`).

## What Never Goes Into the Client

Anything in a `VITE_*` or `EXPO_PUBLIC_*` variable is readable by every user. Open the bundle, search for the string, and it is there. Therefore:

- **No secrets.** No API keys with write access, no signing keys, no database URLs, no cloud credentials. If a third-party service needs a secret, it is called from the backend.
- **No `VITE_`-prefixed tokens "just for the build".** Build-only values such as `SENTRY_AUTH_TOKEN` have no prefix, so they never reach the bundle.
- **No internal-only URLs.** An admin endpoint address in the bundle is an invitation.
- **No feature flags for security.** A flag in the bundle can be flipped by the user; whatever it hides must also be refused by the server.

What is acceptable in the client, because it is public by design: the API base URL, the Sentry **DSN** (it only allows sending events, and can be limited by allowed domains in the Sentry project), the CDN origin, the app version.

For the backend side of secrets (storage, rotation, environment files) see [Secret Management](https://github.com/prod-forge/backend/blob/main/docs/configuration-management.md#secret-management).
