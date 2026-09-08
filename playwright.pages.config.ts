import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/pages', workers: 1,
  use: { baseURL: 'http://127.0.0.1:4175/nala-catalogue/', trace: 'retain-on-failure' },
  projects: [
    { name: 'pages-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'pages-mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } },
  ],
  webServer: { command: 'node scripts/serve-pages.mjs', url: 'http://127.0.0.1:4175/nala-catalogue/', reuseExistingServer: !process.env.CI },
});
