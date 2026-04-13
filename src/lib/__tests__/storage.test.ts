import { beforeEach, describe, expect, it } from 'vitest';
import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import * as storage from '../storage';
import type { PromptResult } from '../prompt-schema';

function makePrompts(seed: string): PromptResult {
  return {
    midjourney: `mj-${seed} --ar 1:1`,
    stable_diffusion: { positive: `pos-${seed}`, negative: `neg-${seed}`, weights_explained: '' },
    dalle: `dalle-${seed}`,
  };
}

function makeEntry(id: string, createdAt: number): storage.HistoryEntry {
  return {
    id,
    createdAt,
    thumbnailBlob: new Blob([id], { type: 'image/png' }),
    pageUrl: `https://example.com/${id}`,
    prompts: makePrompts(id),
  };
}

beforeEach(() => {
  // Fresh DB per test.
  globalThis.indexedDB = new IDBFactory();
  storage.__resetDbForTests();
});

describe('storage', () => {
  it('adds and retrieves an entry', async () => {
    const e = makeEntry('a', 1000);
    await storage.add(e);
    const got = await storage.getOne('a');
    expect(got?.id).toBe('a');
    expect(got?.pageUrl).toBe('https://example.com/a');
  });

  it('list returns entries ordered by createdAt desc', async () => {
    await storage.add(makeEntry('a', 1000));
    await storage.add(makeEntry('c', 3000));
    await storage.add(makeEntry('b', 2000));
    const rows = await storage.list();
    expect(rows.map((r) => r.id)).toEqual(['c', 'b', 'a']);
  });

  it('list respects limit', async () => {
    for (let i = 0; i < 5; i++) await storage.add(makeEntry(`x${i}`, 1000 + i));
    const rows = await storage.list(2);
    expect(rows).toHaveLength(2);
    expect(rows[0].id).toBe('x4');
    expect(rows[1].id).toBe('x3');
  });

  it('prune deletes oldest beyond maxKeep', async () => {
    for (let i = 0; i < 6; i++) await storage.add(makeEntry(`e${i}`, 1000 + i));
    const deleted = await storage.prune(3);
    expect(deleted).toBe(3);
    const rows = await storage.list();
    expect(rows.map((r) => r.id)).toEqual(['e5', 'e4', 'e3']);
  });

  it('delete removes by id', async () => {
    await storage.add(makeEntry('a', 1));
    await storage.add(makeEntry('b', 2));
    await storage.remove('a');
    const rows = await storage.list();
    expect(rows.map((r) => r.id)).toEqual(['b']);
    expect(await storage.getOne('a')).toBeUndefined();
  });

  it('clear wipes all entries', async () => {
    await storage.add(makeEntry('a', 1));
    await storage.add(makeEntry('b', 2));
    await storage.clear();
    const rows = await storage.list();
    expect(rows).toEqual([]);
  });

  it('addAndPrune keeps only maxKeep newest', async () => {
    for (let i = 0; i < 3; i++) await storage.addAndPrune(makeEntry(`n${i}`, 1000 + i), 2);
    const rows = await storage.list();
    expect(rows.map((r) => r.id)).toEqual(['n2', 'n1']);
  });
});
