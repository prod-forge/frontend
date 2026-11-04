import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { normalizeCspOrigins, stripUnsetHtmlEnv } from './vite.build-env';

// Keep in sync with the CSP assertion in the terraform repo (infrastructure/environments/prod/tests/edge.tftest.hcl).
const EXPECTED_CSP =
  "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.example.com https://*.sentry.io; font-src 'self' data:; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = readFileSync(path.join(dirname, 'index.html'), 'utf8');

function renderCsp(apiBaseUrl: string): string {
  const html = indexHtml.replace('%VITE_API_BASE_URL%', apiBaseUrl);
  const rendered = normalizeCspOrigins(stripUnsetHtmlEnv(html));
  const match = /http-equiv="Content-Security-Policy"\s+content="([^"]*)"/.exec(rendered);

  if (!match) {
    throw new Error('index.html has no Content-Security-Policy meta tag');
  }

  return match[1];
}

describe('index.html Content-Security-Policy', () => {
  describe('negative cases', () => {
    it('does not allow unsafe-eval', () => {
      expect(renderCsp('https://api.example.com/api/v1/')).not.toContain('unsafe-eval');
    });

    it('does not allow inline scripts', () => {
      const scriptSrc = /script-src ([^;]*)/.exec(renderCsp('https://api.example.com/api/v1/'))?.[1];

      expect(scriptSrc).toBe("'self'");
    });

    it('drops a relative API base URL instead of shipping an invalid source', () => {
      expect(renderCsp('/api/v1/')).toContain("connect-src 'self' https://*.sentry.io;");
    });
  });

  describe('positive cases', () => {
    it('matches the policy the CloudFront headers policy serves for https://api.example.com', () => {
      expect(renderCsp('https://api.example.com/api/v1/')).toBe(EXPECTED_CSP);
    });

    it('keeps frame-ancestors none, which only the CloudFront header enforces', () => {
      expect(renderCsp('https://api.example.com/api/v1/')).toContain("frame-ancestors 'none'");
    });
  });
});
