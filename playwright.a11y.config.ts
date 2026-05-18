import { defineConfig, devices } from '@playwright/test';

const PORT = 6006;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  forbidOnly: Boolean(process.env.CI),
  fullyParallel: true,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  reporter: process.env.CI ? 'github' : 'list',
  retries: process.env.CI ? 2 : 0,
  testDir: './src',
  testMatch: '**/*.a11y-spec.{ts,tsx}',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run storybook -- --ci',
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    url: baseURL,
  },
  workers: process.env.CI ? 1 : undefined,
});
