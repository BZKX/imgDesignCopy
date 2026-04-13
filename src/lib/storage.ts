import { openDB, type IDBPDatabase } from 'idb';
import type { PromptResult } from './prompt-schema';

export interface HistoryEntry {
  id: string;
  createdAt: number;
  thumbnailBlob: Blob;
  pageUrl: string;
  prompts: PromptResult;
}

const DB_NAME = 'img2prompt';
const DB_VERSION = 1;
const STORE = 'history';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt');
        }
      },
    });
  }
  return dbPromise;
}

export async function add(entry: HistoryEntry): Promise<void> {
  const db = await getDB();
  await db.put(STORE, entry);
}

export async function list(limit = 50): Promise<HistoryEntry[]> {
  const db = await getDB();
  const tx = db.transaction(STORE, 'readonly');
  const index = tx.store.index('createdAt');
  const out: HistoryEntry[] = [];
  let cursor = await index.openCursor(null, 'prev');
  while (cursor && out.length < limit) {
    out.push(cursor.value as HistoryEntry);
    cursor = await cursor.continue();
  }
  await tx.done;
  return out;
}

export async function getOne(id: string): Promise<HistoryEntry | undefined> {
  const db = await getDB();
  return (await db.get(STORE, id)) as HistoryEntry | undefined;
}

export async function remove(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE, id);
}

export async function clear(): Promise<void> {
  const db = await getDB();
  await db.clear(STORE);
}

export async function prune(maxKeep: number): Promise<number> {
  if (maxKeep < 0) maxKeep = 0;
  const db = await getDB();
  const tx = db.transaction(STORE, 'readwrite');
  const index = tx.store.index('createdAt');
  let cursor = await index.openCursor(null, 'prev');
  let kept = 0;
  let deleted = 0;
  while (cursor) {
    if (kept < maxKeep) {
      kept += 1;
    } else {
      await cursor.delete();
      deleted += 1;
    }
    cursor = await cursor.continue();
  }
  await tx.done;
  return deleted;
}

export async function addAndPrune(entry: HistoryEntry, maxKeep: number): Promise<void> {
  await add(entry);
  await prune(maxKeep);
}

// Test-only. Resets the cached DB handle so tests can swap IndexedDB impls.
export function __resetDbForTests(): void {
  dbPromise = null;
}
