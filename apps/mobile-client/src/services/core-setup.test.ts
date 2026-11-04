import { getCoreConfig } from '@prod-forge-todolist-frontend/core';

import { setupCore } from './core-setup';
import { secureStoreAdapter } from './secure-store-adapter';

const API_BASE_URL = 'http://localhost:3000/api/v1/';

describe('setupCore', () => {
  const originalUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

  afterEach(() => {
    process.env.EXPO_PUBLIC_API_BASE_URL = originalUrl;
  });

  describe('negative cases', () => {
    it('throws a clear error when EXPO_PUBLIC_API_BASE_URL is not set', () => {
      delete process.env.EXPO_PUBLIC_API_BASE_URL;

      expect(() => {
        setupCore();
      }).toThrow(/EXPO_PUBLIC_API_BASE_URL/);
    });

    it('throws when EXPO_PUBLIC_API_BASE_URL is empty', () => {
      process.env.EXPO_PUBLIC_API_BASE_URL = '';

      expect(() => {
        setupCore();
      }).toThrow(/EXPO_PUBLIC_API_BASE_URL/);
    });
  });

  describe('positive cases', () => {
    it('configures core with the API URL and the SecureStore adapter', () => {
      process.env.EXPO_PUBLIC_API_BASE_URL = API_BASE_URL;

      setupCore();

      expect(getCoreConfig().apiBaseUrl).toBe(API_BASE_URL);
      expect(getCoreConfig().storage).toBe(secureStoreAdapter);
    });
  });
});
