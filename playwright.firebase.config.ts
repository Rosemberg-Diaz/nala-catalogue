import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/firebase', workers: 1, globalSetup: './tests/firebase/setup.ts',
  use: { baseURL: 'http://127.0.0.1:5176', trace: 'retain-on-failure', ...devices['Desktop Chrome'] },
  webServer: { command: 'node node_modules/vite/bin/vite.js --mode emulator --host 127.0.0.1 --port 5176', url: 'http://127.0.0.1:5176', reuseExistingServer: false },
});
