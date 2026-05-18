import { sentryVitePlugin } from '@sentry/vite-plugin';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const require = createRequire(import.meta.url);
const { version } = require('./package.json');
// eslint-disable-next-line no-undef
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig(async ({ command }) => {
  const extraPlugins = [];
  // eslint-disable-next-line no-undef
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
  // eslint-disable-next-line no-undef
  const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN;
  // eslint-disable-next-line no-undef
  const isAnalyze = process.env.ANALYZE === 'true';

  const plugins = [
    react(),
    tailwindcss(),
    ...extraPlugins,
    {
      name: 'html-version-comment',
      transformIndexHtml(html) {
        return `<!-- Version: ${version} -->\n` + html;
      },
    },
  ];

  if (isAnalyze) {
    const { visualizer } = await import('rollup-plugin-visualizer');
    plugins.push(
      visualizer({
        filename: 'dist/stats.html',
        gzipSize: true,
        open: true,
      }),
    );
  }

  // Need to keep 2 separate if statements because it will occurs eslint error
  if (isBuild) {
    if (sentryAuthToken) {
      plugins.push(
        sentryVitePlugin({
          authToken: sentryAuthToken,
          // eslint-disable-next-line no-undef
          org: process.env.SENTRY_ORG,
          // eslint-disable-next-line no-undef
          project: process.env.SENTRY_PROJECT,
          release: { name: version },
          sourcemaps: {
            // TODO: Need to delete sourcemaps?
            // filesToDeleteAfterUpload: ['dist/**/*.map'],
          },
          telemetry: false,
        }),
      );
    }
  }
  return {
    build: {
      sourcemap: 'hidden',
    },
    define: {
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(version),
    },
    plugins,
    test: {
      coverage: {
        exclude: [
          'src/**/*.test.{ts,tsx}',
          'src/**/*.stories.{ts,tsx}',
          'src/**/*.a11y-spec.ts',
          'src/**/*.visual-spec.ts',
          'src/**/*.d.ts',
          'src/test/**',
          'src/main.tsx',
        ],
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
      projects: [
        {
          extends: true,
          plugins: [
            // The plugin will run tests for the stories defined in your Storybook config
            // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
            storybookTest({
              configDir: path.join(dirname, '.storybook'),
            }),
          ],
          test: {
            browser: {
              enabled: true,
              headless: true,
              instances: [
                {
                  browser: 'chromium',
                },
              ],
              provider: playwright({}),
            },
            name: 'storybook',
          },
        },
        {
          extends: true,
          test: {
            environment: 'jsdom',
            globals: true,
            include: ['src/**/*.test.{ts,tsx}'],
            name: 'unit',
            setupFiles: ['./vitest.setup.ts'],
          },
        },
      ],
    },
  };
});
