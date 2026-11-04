import { assertBuildEnv } from './vite.build-env';

describe('assertBuildEnv', () => {
  describe('negative cases', () => {
    it('throws when VITE_API_BASE_URL is missing on build', () => {
      expect(() => assertBuildEnv({}, true)).toThrow('VITE_API_BASE_URL is required');
    });

    it('throws when VITE_API_BASE_URL is empty on build', () => {
      expect(() => assertBuildEnv({ VITE_API_BASE_URL: '' }, true)).toThrow('VITE_API_BASE_URL is required');
    });

    it('throws when VITE_API_BASE_URL has no trailing slash', () => {
      expect(() => assertBuildEnv({ VITE_API_BASE_URL: 'https://api.example.com/v1' }, true)).toThrow('trailing slash');
    });
  });

  describe('positive cases', () => {
    it('does nothing in dev mode', () => {
      expect(() => assertBuildEnv({}, false)).not.toThrow();
    });

    it('accepts a valid URL with trailing slash', () => {
      expect(() => assertBuildEnv({ VITE_API_BASE_URL: 'https://api.example.com/v1/' }, true)).not.toThrow();
    });
  });
});
