import type { Plugin } from 'vite';

export function assertBuildEnv(env: Record<string, string | undefined>, isBuild: boolean): void {
  if (!isBuild) {
    return;
  }

  const apiBaseUrl = env.VITE_API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error('VITE_API_BASE_URL is required for production build');
  }

  if (!/^https?:\/\//.test(apiBaseUrl)) {
    throw new Error('VITE_API_BASE_URL must be an absolute http(s) URL for production build');
  }

  if (!apiBaseUrl.endsWith('/')) {
    throw new Error('VITE_API_BASE_URL must end with a trailing slash');
  }
}

// Runs the guard only when `vite build` resolves its config; tools that merely load vite.config.mts (knip) are unaffected.
export function buildEnvGuard(env: Record<string, string | undefined>): Plugin {
  return {
    apply: 'build',
    configResolved(): void {
      assertBuildEnv(env, true);
    },
    name: 'build-env-guard',
  };
}

// The meta tag is built from the same policy as the CloudFront header, which allows the API by origin.
// Reduces absolute connect-src URLs (https://api.example.com/api/v1/) to their origin, removes duplicates and drops
// relative ones (/api/v1/), which are invalid CSP sources; 'self' already covers them.
export function normalizeCspOrigins(html: string): string {
  return html.replace(/(connect-src )([^;"]*)/, (_match, directive: string, sources: string) => {
    const normalized = sources
      .split(/\s+/)
      .filter(Boolean)
      .filter((source) => !source.startsWith('/'))
      .map((source) => (/^https?:\/\/[^*]+$/.test(source) ? new URL(source).origin : source));

    return directive + [...new Set(normalized)].join(' ');
  });
}

// Vite substitutes %VITE_*% in index.html but leaves the token as-is when the variable is unset
// (VITE_ASSETS_BASE_URL is optional), which would put an invalid source into the CSP.
export function stripUnsetHtmlEnv(html: string): string {
  return html.replace(/ ?%VITE_[A-Z0-9_]+%/g, '');
}
