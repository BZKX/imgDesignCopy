import { test as base, chromium, type BrowserContext, type Worker } from '@playwright/test';
import { execSync } from 'node:child_process';
import { mkdtempSync, existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const ROOT = path.resolve(__dirname, '..');
const DIST = path.resolve(ROOT, 'dist');

function ensureBuild() {
  if (!existsSync(path.join(DIST, 'manifest.json'))) {
    execSync('pnpm build', { cwd: ROOT, stdio: 'inherit' });
  }
}

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
  serviceWorker: Worker;
}>({
  context: async ({}, use) => {
    ensureBuild();
    const userDataDir = mkdtempSync(path.join(os.tmpdir(), 'img2prompt-e2e-'));
    const ctx = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      viewport: { width: 1280, height: 800 },
      args: [
        `--disable-extensions-except=${DIST}`,
        `--load-extension=${DIST}`,
        '--no-first-run',
      ],
    });
    await use(ctx);
    await ctx.close();
  },
  serviceWorker: async ({ context }, use) => {
    let [sw] = context.serviceWorkers();
    if (!sw) sw = await context.waitForEvent('serviceworker');
    await use(sw);
  },
  extensionId: async ({ serviceWorker }, use) => {
    const url = serviceWorker.url();
    const match = url.match(/chrome-extension:\/\/([^/]+)\//);
    if (!match) throw new Error(`Could not derive extension id from ${url}`);
    await use(match[1]);
  },
});

export const expect = test.expect;
