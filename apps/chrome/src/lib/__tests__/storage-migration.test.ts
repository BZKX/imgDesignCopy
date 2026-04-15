import { beforeEach, describe, expect, it } from 'vitest';
import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { openDB } from 'idb';
import * as storage from '../storage';

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
  storage.__resetDbForTests();
});

describe('storage migration (normalizeRow)', () => {
  it('maps legacy {prompts} rows to {mode, insight} on list()', async () => {
    // Insert a legacy-shaped row directly via raw IDB, bypassing storage.add().
    const legacy = {
      id: 'legacy-1',
      createdAt: 100,
      thumbnailBlob: new Blob(['x'], { type: 'image/png' }),
      pageUrl: 'https://legacy.example/a',
      prompts: {
        midjourney: 'mj',
        stable_diffusion: { positive: 'p', negative: 'n', weights_explained: 'w' },
        dalle: 'd',
      },
    };
    const rawDb = await openDB('img2prompt', 2, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('history')) {
          const s = db.createObjectStore('history', { keyPath: 'id' });
          s.createIndex('createdAt', 'createdAt');
        }
      },
    });
    await rawDb.put('history', legacy);
    rawDb.close();
    storage.__resetDbForTests();

    const rows = await storage.list();
    expect(rows).toHaveLength(1);
    expect(rows[0].mode).toBe('image_to_prompt');
    expect(rows[0].insight).toEqual(legacy.prompts);
    expect((rows[0] as unknown as { prompts?: unknown }).prompts).toBeUndefined();
  });

  it('leaves already-normalized {mode, insight} rows untouched', async () => {
    await storage.add({
      id: 'new-1',
      createdAt: 200,
      thumbnailBlob: new Blob(['y'], { type: 'image/png' }),
      pageUrl: 'https://new.example/b',
      mode: 'product_style',
      insight: { palette: ['#fff', '#000', '#f00'] },
    });
    const rows = await storage.list();
    expect(rows[0].mode).toBe('product_style');
    expect(rows[0].insight).toEqual({ palette: ['#fff', '#000', '#f00'] });
  });
});
