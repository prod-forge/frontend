import type { PluginOption, UserConfig } from 'vite';

import { sentryVitePlugin } from '@sentry/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const require = createRequire(import.meta.url);
const { version } = require('./package.json') as { version: string };
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(async ({ command }): Promise<UserConfig> => {
  const extraPlugins: PluginOption[] = [];

  if (process.env.VITE_COVERAGE === 'true') {
    const { default: istanbul } = await import('vite-plugin-istanbul');
    extraPlugins.push(
      istanbul({
        exclude: ['node_modules', 'src/test/**'],
        extension: ['.ts', '.tsx'],
        include: ['src/**'],
        requireEnv: false,
      }),
    );
  }

  const isBuild = command === 'build';
  const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN;
  const isAnalyze = process.env.ANALYZE === 'true';

  const plugins: PluginOption[] = [
    react(),
    tailwindcss(),
    ...extraPlugins,
    {
      name: 'html-version-comment',
      transformIndexHtml(html: string): string {
        return `<!-- Version: ${version} -->\n` + html;
      },
    },
  ];

  if (isAnalyze) {
    const { visualizer } = await import('rollup-plugin-visualizer');
    plugins.push(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      visualizer({
        filename: 'dist/stats.html',
        gzipSize: true,
        open: true,
      }),
    );
  }

  if (isBuild && sentryAuthToken) {
    plugins.push(
      sentryVitePlugin({
        authToken: sentryAuthToken,
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        release: { name: version },
        sourcemaps: {},
        telemetry: false,
      }),
    );
  }

  return {
    build: {
      sourcemap: 'hidden' as const,
    },
    define: {
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(version),
    },
    plugins,
    resolve: {
      alias: {
        '@prod-forge-todolist-frontend/core': path.resolve(dirname, '../../packages/core/src/index.ts'),
        '@prod-forge-todolist-frontend/design-tokens': path.resolve(dirname, '../../packages/design-tokens'),
        '@prod-forge-todolist-frontend/styles-web': path.resolve(dirname, '../../packages/styles-web/src'),
        '@prod-forge-todolist-frontend/ui-web': path.resolve(dirname, '../../packages/ui-web/src/index.ts'),
      },
    },
    test: {
      coverage: {
        exclude: ['src/**/*.test.{ts,tsx}', 'src/**/*.stories.{ts,tsx}', 'src/**/*.d.ts', 'src/main.tsx'],
        include: ['src/**/*.{ts,tsx}'],
        provider: 'v8',
        reporter: ['text', 'html', 'lcov'],
        thresholds: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
      environment: 'jsdom',
      globals: true,
      include: ['src/**/*.test.{ts,tsx}'],
      setupFiles: ['./vitest.setup.ts'],
    },
  };
});
