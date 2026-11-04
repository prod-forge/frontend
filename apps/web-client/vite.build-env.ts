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
