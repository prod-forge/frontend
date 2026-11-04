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

// Vite substitutes %VITE_*% in index.html but leaves the token as-is when the variable is unset
// (VITE_ASSETS_BASE_URL is optional), which would put an invalid source into the CSP.
export function stripUnsetHtmlEnv(html: string): string {
  return html.replace(/ ?%VITE_[A-Z0-9_]+%/g, '');
}
