import { assertBuildEnv, buildEnvGuard, stripUnsetHtmlEnv } from './vite.build-env';

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

describe('stripUnsetHtmlEnv', () => {
  describe('negative cases', () => {
    it('leaves HTML without placeholders unchanged', () => {
      const html = `<meta content="connect-src 'self' https://api.example.com/v1/">`;

      expect(stripUnsetHtmlEnv(html)).toBe(html);
    });

    it('does not touch percent signs that are not VITE_ placeholders', () => {
      const html = '<div style="width: 100%">%NOT_VITE%</div>';

      expect(stripUnsetHtmlEnv(html)).toBe(html);
    });
  });

  describe('positive cases', () => {
    it('removes a placeholder Vite left because the variable is unset', () => {
      const html = `<meta content="connect-src 'self' https://api.example.com/v1/ %VITE_ASSETS_BASE_URL% https://*.sentry.io">`;

      expect(stripUnsetHtmlEnv(html)).toBe(
        `<meta content="connect-src 'self' https://api.example.com/v1/ https://*.sentry.io">`,
      );
    });
  });
});

describe('buildEnvGuard', () => {
  const runConfigResolved = (env: Record<string, string | undefined>): void => {
    const hook = buildEnvGuard(env).configResolved as () => void;
    hook();
  };

  describe('negative cases', () => {
    it('does not check the env while the config is only being evaluated (dev server, knip)', () => {
      expect(() => buildEnvGuard({})).not.toThrow();
    });

    it('throws from configResolved when VITE_API_BASE_URL is missing', () => {
      expect(() => runConfigResolved({})).toThrow('VITE_API_BASE_URL is required');
    });
  });

  describe('positive cases', () => {
    it('applies only to vite build', () => {
      expect(buildEnvGuard({}).apply).toBe('build');
    });

    it('accepts a valid VITE_API_BASE_URL in configResolved', () => {
      expect(() => runConfigResolved({ VITE_API_BASE_URL: 'https://api.example.com/v1/' })).not.toThrow();
    });
  });
});
