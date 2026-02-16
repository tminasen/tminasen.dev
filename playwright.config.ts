import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/visual-regression',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  timeout: 60 * 1000,
  reporter: process.env.CI
    ? [
        ['github'],
        ['json', { outputFile: 'test-results/playwright-report.json' }],
        ['html', { open: 'never' }],
      ]
    : 'list',
  use: {
    browserName: 'chromium',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'sp',
      use: {
        ...devices['iPhone 14'],
        viewport: { width: 375, height: 667 },
      },
    },
    {
      name: 'pc',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
  ],
});
