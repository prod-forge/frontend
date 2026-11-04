import { secureStoreAdapter } from './secure-store-adapter';

describe('secureStoreAdapter', () => {
  describe('negative cases', () => {
    it('returns null for a key that was never stored', async () => {
      await expect(secureStoreAdapter.getItem('missing-key')).resolves.toBeNull();
    });

    it('returns null after the key is removed', async () => {
      await secureStoreAdapter.setItem('removed-key', 'value');
      await secureStoreAdapter.removeItem('removed-key');

      await expect(secureStoreAdapter.getItem('removed-key')).resolves.toBeNull();
    });
  });

  describe('positive cases', () => {
    it('returns the value that was stored under the key', async () => {
      await secureStoreAdapter.setItem('token', 'secret-token');

      await expect(secureStoreAdapter.getItem('token')).resolves.toBe('secret-token');
    });
  });
});
