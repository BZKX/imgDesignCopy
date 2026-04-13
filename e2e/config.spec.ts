import { test, expect } from './fixtures';

test('saves config to chrome.storage.sync and reloads persisted', async ({
  context,
  extensionId,
}) => {
  const page = await context.newPage();
  const optionsUrl = `chrome-extension://${extensionId}/src/options/index.html`;
  await page.goto(optionsUrl);

  await page.getByLabel(/base url/i).fill('https://api.example.com/v1');
  await page.getByLabel(/api key/i).fill('sk-e2e-test');
  await page.getByLabel(/^model$/i).fill('gpt-4o-mini');
  await page.getByRole('button', { name: /^save$/i }).click();
  await expect(page.getByText(/saved/i)).toBeVisible();

  await page.reload();
  await expect(page.getByLabel(/base url/i)).toHaveValue('https://api.example.com/v1');
  await expect(page.getByLabel(/^model$/i)).toHaveValue('gpt-4o-mini');
  await expect(page.getByLabel(/api key/i)).toHaveValue('sk-e2e-test');
});
