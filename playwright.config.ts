import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  retries: 0,
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    headless: false,
    viewport: { width: 1280, height: 800 },
    actionTimeout: 10_000,
  },
});
