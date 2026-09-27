import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests', timeout: 45000, workers: 1, reporter: 'list',
  use: { baseURL: process.env.TEST_BASE_URL || 'http://localhost:3010', viewport: { width: 1440, height: 1000 }, trace: 'retain-on-failure' },
  webServer: { command: 'node scripts/test-server.mjs', url: 'http://localhost:3010', reuseExistingServer: false, timeout: 60000 },
});
