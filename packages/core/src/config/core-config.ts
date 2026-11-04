import type { CoreLogger } from '../services/logger/core-logger';
import type { KeyValueStorage } from '../services/storage/key-value-storage';

export type CoreConfig = {
  /** Base URL of the backend API, must end with a trailing slash. */
  readonly apiBaseUrl: string;
  /** Read on every request, so a token change takes effect immediately. */
  readonly getToken: () => null | string;
  readonly logger: CoreLogger;
  readonly reportError: (error: unknown, context?: Record<string, unknown>) => void;
  readonly storage: KeyValueStorage;
};

export class CoreNotConfiguredError extends Error {
  constructor() {
    super('Core is not configured. Call configureCore() in the app entry point before using the store or the API.');
    this.name = 'CoreNotConfiguredError';
  }
}

let currentConfig: CoreConfig | null = null;

export function configureCore(config: CoreConfig): void {
  if (!config.apiBaseUrl.endsWith('/')) {
    throw new Error(`configureCore: apiBaseUrl must end with "/", received "${config.apiBaseUrl}".`);
  }

  currentConfig = config;
}

export function getCoreConfig(): CoreConfig {
  if (!currentConfig) {
    throw new CoreNotConfiguredError();
  }

  return currentConfig;
}
