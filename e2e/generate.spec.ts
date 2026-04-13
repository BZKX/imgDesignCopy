import { test, expect } from './fixtures';

const VALID = {
  midjourney: 'cinematic neon alley --ar 16:9 --style raw --v 6',
  stable_diffusion: {
    positive: 'neon alley, rain, cinematic lighting',
    negative: 'blurry, lowres',
    weights_explained: 'rain weighted to emphasize reflections.',
  },
  dalle: 'A neon-lit alley after rain, cinematic wide composition, moody palette.',
};

async function seedConfig(serviceWorker: any) {
  await serviceWorker.evaluate(
    async (cfg: unknown) => {
      await chrome.storage.sync.set({ 'img2prompt.config': cfg });
    },
    {
      baseURL: 'https://mock.example.test/v1',
      apiKey: 'sk-e2e',
      model: 'gpt-4o',
      language: 'en',
      maxHistory: 50,
    },
  );
}

test('selection → mocked API → popup shows 3 tabs and copies', async ({
  context,
  extensionId,
  serviceWorker,
}) => {
  await seedConfig(serviceWorker);

  await context.route('**/chat/completions', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ choices: [{ message: { content: JSON.stringify(VALID) } }] }),
    }),
  );

  // Stage a result payload directly via session storage + broadcast to simulate
  // a completed selection, since driving captureVisibleTab inside an extension
  // E2E is unreliable without a real page capture.
  await serviceWorker.evaluate(
    async (payload: unknown) => {
      await chrome.storage.session.set({ latestPending: payload });
    },
    {
      type: 'IMG2PROMPT_RESULT',
      payload: {
        thumbnailB64:
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        prompts: VALID,
        pageUrl: 'https://example.com/test',
        createdAt: Date.now(),
      },
    },
  );

  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extensionId}/src/popup/index.html`);

  await expect(popup.getByRole('button', { name: 'MJ' })).toBeVisible();
  await expect(popup.getByRole('button', { name: /SD/i })).toBeVisible();
  await expect(popup.getByRole('button', { name: /DALL/i })).toBeVisible();
  await expect(popup.getByText(/cinematic neon alley/)).toBeVisible();

  // Grant clipboard permissions for this origin.
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], {
    origin: `chrome-extension://${extensionId}`,
  });
  await popup.getByRole('button', { name: /^copy$/i }).click();
  await expect(popup.getByText(/已复制|copied/i)).toBeVisible();

  const clipboard = await popup.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toContain('cinematic neon alley');
});
