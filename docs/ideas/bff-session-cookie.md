# Web session in an HttpOnly cookie (BFF)

## Problem

The web client keeps tokens in `localStorage` (plan `003-oidc-login`, decision 2026-11-18). Any XSS on the page can
read them and use them elsewhere until they expire. Short access tokens, refresh-token rotation and CSP limit the
damage but do not remove it. Raised in an r/expo review comment (2026-11-18); the IETF draft "OAuth 2.0 for
Browser-Based Applications" recommends a backend-for-frontend for this case.

## Direction

- A backend-for-frontend runs the OIDC code flow as a confidential client and keeps the tokens server-side; the
  browser gets only a session cookie (`HttpOnly`, `Secure`, `SameSite`). Mobile keeps its own flow and SecureStore.
- Where it lives: a module in the backend or a separate small service. Either way the backend changes (session store,
  most likely Redis, which already exists), so this is a backend idea too.
- CSRF protection for cookie-authenticated requests; CORS with credentials, or the API served on the same site as the
  web client (terraform: domains and the load balancer).
- `core` keeps `getToken`/`apiRequest` for mobile; web switches to `credentials: 'include'` without a bearer token, so
  the auth adapter in `CoreConfig` needs a cookie mode.
- Limit to state in the guide: a cookie stops token theft, not requests made by an XSS while the page is open.
- Open questions: BFF inside the backend or separate; version (likely a major for web and backend); whether it
  replaces the web part of `003-oidc-login` if that plan has not started yet.
