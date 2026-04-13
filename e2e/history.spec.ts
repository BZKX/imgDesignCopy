import { test, expect } from './fixtures';

const VALID = {
  midjourney: 'history entry mj --ar 1:1',
  stable_diffusion: {
    positive: 'history positive',
    negative: 'history negative',
    weights_explained: '',
  },
  dalle: 'history dalle paragraph',
};

test('history shows stored entry and delete removes it', async ({
  context,
  extensionId,
  serviceWorker,
}) => {
  // Write one history row directly via the extension's IndexedDB.
  await serviceWorker.evaluate(async (entry: unknown) => {
    const { openDB } = await import('/assets/idb.js').catch(() => import('idb'));
    const db = await (openDB as any)('img2prompt', 1, {
      upgrade(d: IDBDatabase) {
        if (!d.objectStoreNames.contains('history')) {
          const s = d.createObjectStore('history', { keyPath: 'id' });
          s.createIndex('createdAt', 'createdAt');
        }
      },
    });
    await db.put('history', entry);
  }, {
    id: 'e2e-1',
    createdAt: Date.now(),
    thumbnailBlob: new Blob(['x'], { type: 'image/png' }),
    pageUrl: 'https://example.com/h',
    prompts: VALID,
  });

  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extensionId}/src/popup/index.html`);
  await popup.getByRole('button', { name: /view history|history/i }).first().click();

  // Thumbnail grid visible → at least 1 image.
  const thumbs = popup.locator('img');
  await expect(thumbs.first()).toBeVisible();

  await thumbs.first().click();
  await expect(popup.getByText(/history entry mj/)).toBeVisible();
  await popup.getByRole('button', { name: /^delete$/i }).click();
  await popup.getByRole('button', { name: /^confirm$/i }).click();

  // Back on list, empty state.
  await expect(popup.getByText(/no history yet/i)).toBeVisible();
});
