import { defineConfig, devices } from '@playwright/test';

const isCI = Boolean(process.env.CI);
const runWebkit = isCI || process.env.PLAYWRIGHT_WEBKIT === '1';

const webkitProjects = runWebkit
  ? [
      {
        name: 'desktop-webkit',
        testMatch: /compatibility\.spec\.ts/,
        use: { ...devices['Desktop Safari'] },
      },
      {
        name: 'mobile-webkit',
        testMatch: /compatibility\.spec\.ts/,
        use: { ...devices['iPhone 13'] },
      },
    ]
  : [];

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  timeout: 60_000,
  reporter: isCI
    ? [['list'], ['html', { open: 'never' }], ['github']]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4322/futsal-cup/',
    trace: 'retain-on-failure',
  },
  webServer: {
    command:
      'npm run build:test && npm run preview:test -- --host 127.0.0.1 --port 4322 --ignore-lock',
    url: 'http://127.0.0.1:4322/futsal-cup/',
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 5'] } },
    {
      name: 'desktop-firefox',
      testMatch: /compatibility\.spec\.ts/,
      use: { ...devices['Desktop Firefox'] },
    },
    ...webkitProjects,
  ],
});
