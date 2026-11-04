import { beforeEach, describe, expect, it, vi } from 'vitest';

import type * as coreConfigModule from './core-config';
import type { CoreConfig } from './core-config';

type CoreConfigModule = typeof coreConfigModule;

const makeConfig = (overrides: Partial<CoreConfig> = {}): CoreConfig => ({
  apiBaseUrl: 'https://api.test/',
  getToken: () => null,
  logger: { debug: vi.fn(), error: vi.fn(), warn: vi.fn() },
  reportError: vi.fn(),
  storage: {
    getItem: vi.fn().mockResolvedValue(null),
    removeItem: vi.fn().mockResolvedValue(undefined),
    setItem: vi.fn().mockResolvedValue(undefined),
  },
  ...overrides,
});

// The shared test setup configures core before every test; a fresh module copy starts unconfigured.
const loadFreshModule = async (): Promise<CoreConfigModule> => {
  vi.resetModules();

  return import('./core-config');
};

describe('core config', () => {
  let coreConfig: CoreConfigModule;

  beforeEach(async () => {
    coreConfig = await loadFreshModule();
  });

  describe('negative cases', () => {
    it('throws CoreNotConfiguredError when getCoreConfig is called before configureCore', () => {
      expect(() => coreConfig.getCoreConfig()).toThrow(coreConfig.CoreNotConfiguredError);
    });

    it('throws when apiBaseUrl does not end with a slash', () => {
      expect(() => coreConfig.configureCore(makeConfig({ apiBaseUrl: 'https://api.test' }))).toThrow(Error);
    });

    it('stays unconfigured after a rejected configureCore call', () => {
      expect(() => coreConfig.configureCore(makeConfig({ apiBaseUrl: 'https://api.test' }))).toThrow();

      expect(() => coreConfig.getCoreConfig()).toThrow(coreConfig.CoreNotConfiguredError);
    });
  });

  describe('positive cases', () => {
    it('returns the same config object that was passed to configureCore', () => {
      const config = makeConfig();

      coreConfig.configureCore(config);

      expect(coreConfig.getCoreConfig()).toBe(config);
    });

    it('replaces the previous config on a repeated configureCore call', () => {
      const first = makeConfig();
      const second = makeConfig({ apiBaseUrl: 'https://other.test/' });

      coreConfig.configureCore(first);
      coreConfig.configureCore(second);

      expect(coreConfig.getCoreConfig()).toBe(second);
    });
  });
});
