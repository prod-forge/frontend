# Security

The server side of security (request validation, response sanitization, headers, CORS, rate limiting) is described in [Security](https://github.com/prod-forge/backend/blob/main/docs/security.md) in the backend guide. A browser client changes the question: the code runs on a machine that the team does not control, so nothing in it can be secret, and the main enemy is script injected into the page. This chapter covers the client side, and is honest about what authentication does not do yet.

## Threat Model for an SPA

The assumptions are short:

- **The bundle is public.** Anyone can read every line of JavaScript, every `VITE_*` value and every API path. No secret belongs in it (see [Configuration](configuration.md#what-never-goes-into-the-client)). The server must treat every request as coming from an attacker.
- **The page is the trust boundary.** If an attacker runs a script in the page, they act as the user: they can read what the page can read, including the stored token, and call the API. Most client defenses exist to make that first step hard.
- **Third-party code runs with full rights.** Every dependency in the bundle can do whatever the page can do. This is a supply-chain risk, not a theory.

What this application protects against, and where:

| Threat                        | Defense                                           | Where                             |
| ----------------------------- | ------------------------------------------------- | --------------------------------- |
| Injected script (XSS)         | React escaping, no `dangerouslySetInnerHTML`, CSP | components, `index.html`          |
| Page embedded in another site | `frame-ancestors 'none'` as a response header     | CloudFront (see below)            |
| Token theft from storage      | CSP only; a real fix needs an HttpOnly cookie     | see Token Storage                 |
| Malicious dependency          | exact versions, lockfile, `npm ci`, `knip`        | `package.json`, `ci.yml`          |
| Secret in the bundle          | nothing secret is read by the client              | [Configuration](configuration.md) |

## Content Security Policy

The CloudFront response headers policy (terraform repo, `docs/frontend.md#security-headers`) is the enforced source of truth: it sends the policy below as a `Content-Security-Policy` header. The `<meta>` tag in `apps/web-client/index.html` carries the same policy as a fallback for local development, where there is no CDN. The two must stay identical after substitution; both repos assert the same string (`apps/web-client/index-csp.test.ts` here, `edge.tftest.hcl` in terraform). Change them together.

`apps/web-client/index.html` carries the policy in a `<meta>` tag:

```text
default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
img-src 'self' data: https:; connect-src 'self' %VITE_API_BASE_URL% %VITE_ASSETS_BASE_URL% https://*.sentry.io;
font-src 'self' data:; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'
```

Every directive is there for a reason:

- `script-src 'self'` is the one that matters most. Only scripts served from the same origin run, so an injected `<script>` or an inline `onclick` is blocked. This is why the theme initialization is a module, `src/theme-init.ts`, and not an inline script in the HTML: an inline script would need `'unsafe-inline'`, which would cancel the protection.
- `connect-src` lists where the app may send requests: itself, the API (`VITE_API_BASE_URL`), the assets CDN and Sentry. A script that tries to send data to another host is blocked. The two `%VITE_*%` tokens are replaced by Vite at build time; `stripUnsetHtmlEnv` removes a token whose variable is not set (`VITE_ASSETS_BASE_URL` is optional), so the policy never contains an invalid source. `normalizeCspOrigins` (same file) reduces the API URL to its origin (`https://api.example.com/api/v1/` becomes `https://api.example.com`), removes duplicates and drops a relative URL, so the meta tag matches the header, which cannot know the API path. In production the assets are served by the same CloudFront distribution, so the assets origin is redundant with `'self'` there; the header omits it.
- `style-src 'unsafe-inline'` is a known concession. Some libraries set inline styles. Styles are a smaller risk than scripts, but this is the line to tighten first if the libraries allow it. There is no `unsafe-eval` anywhere.
- `img-src` allows `https:` because user content and the assets CDN may come from different hosts, and `data:` for small inlined images.
- `worker-src 'self' blob:` is needed by Sentry Session Replay, which compresses events in a worker created from a blob.
- `object-src 'none'` and `base-uri 'self'` close two classic injection paths (plugins and a rewritten `<base>`).

**`frame-ancestors` has no effect in a meta tag.** The browser ignores that directive when the policy is delivered through `<meta>`; it is only honored in an HTTP response header. It stays in the tag as documentation of intent; the real protection is the `frame-ancestors 'none'` header that CloudFront sends (see [Headers Set by CloudFront](#headers-set-by-cloudfront)).

Because the policy is built into the HTML, a change to it is a code change that goes through review and a release, like any other.

## Token Storage

The client has to keep the token between page loads somewhere. There are three options:

| Option             | Readable by script | Sent automatically | Notes                                            |
| ------------------ | ------------------ | ------------------ | ------------------------------------------------ |
| `localStorage`     | yes                | no                 | simple, survives restart, exposed to any XSS     |
| Cookie, `HttpOnly` | no                 | yes                | script cannot read it, but needs CSRF protection |
| Memory only        | yes                | no                 | safest against theft, lost on every reload       |

An `HttpOnly` cookie is the stronger choice for a web app, because even a successful XSS cannot copy the token. It needs the backend to set the cookie, to define CORS with credentials and to defend against CSRF. The backend here returns no cookie and authenticates through the `Authorization: Bearer` header, so the cookie route is not available without a backend change.

This client therefore uses `localStorage`, through the `KeyValueStorage` adapter in `apps/web-client/src/services/core-setup.ts`. The adapter is what keeps the choice replaceable: core never touches `localStorage` directly. The auth listener in `packages/core/src/features/auth/auth.listeners.ts` writes under `auth-token` and `auth-user` after login or register, and removes them on logout. Reducers stay pure.

On mobile the same interface is backed by `expo-secure-store` (`apps/mobile-client/src/services/secure-store-adapter.ts`), which keeps the value in the iOS Keychain and the Android Keystore. A phone has no equivalent of a page-wide XSS, and the operating system encrypts the value, so the platform-native store is the right place there. See [Mobile Client](mobile-client.md).

## Authentication

The client signs in against the backend and sends the token it is given. It is real token authentication, but deliberately minimal: there is no password check and no registration on the server.

**Login.** The `login` thunk in `packages/core/src/features/auth/auth.thunks.ts` calls `authApi.login(email)` (`packages/core/src/api/auth.api.ts`), which posts `{ email }` to `POST /api/v1/auth/login`. For an email of an existing user the backend answers `200 { data: { accessToken, expiresIn } }`: `accessToken` is an HS256 JWT signed with the server's `JWT_SECRET`, and `expiresIn` is its lifetime in seconds (`JWT_TTL`, 3600 by default). The thunk stores the token in `auth.token`; the auth listener persists it under `auth-token`, and `apiRequest` sends it as `Authorization: Bearer <token>` on every request. The client never decodes or trusts the token itself: only the backend verifies the signature and expiry.

The password field on the login form is still validated for length and then ignored, because the backend has no passwords yet.

**Failures.** An unknown email is answered with `401 USER_IS_NOT_AUTHORIZED`; the login thunk turns it into "No account was found for this email." (`UNKNOWN_EMAIL_MESSAGE`), instead of the generic "Please log in to continue." A malformed email is a `422 DTO_VALIDATION_ERROR`, and the endpoint is throttled to 5 requests per 60 seconds per IP (`429 TOO_MANY_REQUESTS`); both show the mapped backend message. All of them carry a 4xx status, so they are not reported to Sentry.

**Register.** The backend has no sign-up endpoint. `register` therefore calls the same `POST /auth/login` and keeps the entered name only in the client (`auth.user.name`); registering with an email the backend does not know fails exactly like a login.

**Expired or revoked token.** When any authenticated request is rejected with a 401 while a session exists, a listener in `packages/core/src/features/auth/auth.listeners.ts` dispatches `logout()`. That removes the token and the user from storage, and the screens guarded by `selectIsAuthenticated` send the user back to sign in (the welcome screen on web, `/login` on mobile); the error toast shows "Please log in to continue." There is no refresh token, so a session ends after `expiresIn` seconds.

Out of scope: passwords, refresh tokens, sign-up and an identity provider. Until passwords exist, anyone who knows a registered email can sign in as that user, so do not deploy this application with real data.

Sentry receives a SHA-256 hash of the email as `user.id`, not the email (`sendDefaultPii` is `false`), which is described in [Client Observability](client-observability.md#sentry).

## XSS Surface

The application renders user text (todo titles and descriptions) and does it in the only safe way: as React children. React escapes string children, so a title of `<img src=x onerror=...>` is shown as text.

- There is no `dangerouslySetInnerHTML` anywhere in `apps` or `packages`. If a feature ever needs it, the input must pass through a sanitizer (such as DOMPurify) and the change should be called out in review.
- Links built from data (`href={user.url}`) accept `javascript:` URLs. The app builds links only from its own routes.
- There is no `eval` and no `new Function`; with the CSP above they would be blocked anyway.

Input validation with zod in `packages/core` is there for user feedback, not for safety. The server validates again (see [API Client and Errors](api-client-and-errors.md)).

## Dependency Hygiene

Most of the code in the bundle is not written by the team. What is in place:

- **Exact versions.** No `^` or `~` in any `package.json`, so a new release of a dependency cannot enter the build by itself.
- **Lockfile and `npm ci`.** `package-lock.json` is committed, and the workflows install with `npm ci`, which fails if it does not match `package.json`.
- **Knip** (`npm run knip`, part of the pre-push hook) reports dependencies that are declared and not used, and the opposite. A smaller list of dependencies is a smaller attack surface.
- **Hidden source maps** are not referenced from the bundle (no `sourceMappingURL`), so browsers do not load them. They are uploaded to Sentry and deleted after upload (`filesToDeleteAfterUpload`), and `cd.yml` excludes `*.map` from every S3 sync as a second guard, so they are not publicly fetchable.

What is not done and is worth adding:

- **Dependabot or Renovate** for update pull requests. Exact versions mean the updates stay manual otherwise, and a manual process gets forgotten. Group the updates so they do not drown the review queue.
- **`npm audit --omit=dev`** as a CI step, or a scheduled workflow, because a vulnerability can be published long after the version was chosen.
- **Provenance and install scripts.** `npm ci --ignore-scripts` for the lint and test jobs, where a build script of a dependency is not needed.

## Headers Set by CloudFront

Security headers that a meta tag cannot carry are the job of the CDN. In this setup the distribution is described in the Terraform repository: [Frontend Deployment](https://github.com/prod-forge/terraform/blob/main/docs/frontend.md). The distribution attaches a response headers policy (`aws_cloudfront_response_headers_policy.security`) to every cache behavior:

| Header                                           | Value                                 | Purpose                                     |
| ------------------------------------------------ | ------------------------------------- | ------------------------------------------- |
| `Content-Security-Policy` with `frame-ancestors` | `frame-ancestors 'none'`              | clickjacking, the part the meta tag ignores |
| `Strict-Transport-Security`                      | `max-age=63072000; includeSubDomains` | HTTPS only                                  |
| `X-Frame-Options`                                | `DENY`                                | clickjacking, for older browsers            |
| `X-Content-Type-Options`                         | `nosniff`                             | no MIME sniffing                            |
| `Referrer-Policy`                                | `strict-origin-when-cross-origin`     | do not leak paths to other sites            |

This tabThe header CSP carries only `frame-ancestors`: the full policy stays in the meta tag because it needs the build-time API URL, and the browser enforces every CSP it receives. Check the deployed response with `curl -I`. end headers (Helmet, CORS) are separate and are covered in the [backend chapter](https://github.com/prod-forge/backend/blob/main/docs/security.md#security-headers).
