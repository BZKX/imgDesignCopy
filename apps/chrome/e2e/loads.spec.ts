import { test, expect } from './fixtures';

test('options page loads and renders form', async ({ context, extensionId }) => {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/src/options/index.html`);
  await expect(page.getByRole('heading', { name: /img2prompt settings/i })).toBeVisible();
  await expect(page.getByLabel(/base url/i)).toBeVisible();
  await expect(page.getByLabel(/api key/i)).toBeVisible();
  await expect(page.getByLabel(/^model$/i)).toBeVisible();
});
