import Database from '@tauri-apps/plugin-sql';
import type { HistoryEntryDto } from '@promptlens/core';

const DB_URL = 'sqlite:promptlens.db';

export interface StoredHistoryEntry extends HistoryEntryDto {
  thumbnailB64: string;
}

let dbPromise: Promise<Database> | null = null;
function getDb(): Promise<Database> {
  if (!dbPromise) dbPromise = Database.load(DB_URL);
  return dbPromise;
}

interface HistoryRow {
  id: string;
  created_at: number;
  page_url: string | null;
  mode: string;
  insight: string;
  thumbnail: string;
}

function rowToEntry(r: HistoryRow): StoredHistoryEntry {
  return {
    id: r.id,
    createdAt: r.created_at,
    pageUrl: r.page_url ?? '',
    mode: r.mode as StoredHistoryEntry['mode'],
    insight: JSON.parse(r.insight) as StoredHistoryEntry['insight'],
    thumbnailB64: r.thumbnail,
  };
}

export async function listHistory(): Promise<StoredHistoryEntry[]> {
  const db = await getDb();
  const rows = await db.select<HistoryRow[]>(
    'SELECT id, created_at, page_url, mode, insight, thumbnail FROM history ORDER BY created_at DESC',
  );
  return rows.map(rowToEntry);
}

export async function getHistoryEntry(id: string): Promise<StoredHistoryEntry | null> {
  const db = await getDb();
  const rows = await db.select<HistoryRow[]>(
    'SELECT id, created_at, page_url, mode, insight, thumbnail FROM history WHERE id = ?1',
    [id],
  );
  return rows.length ? rowToEntry(rows[0]) : null;
}

export async function addHistoryEntry(
  entry: StoredHistoryEntry,
  max: number,
): Promise<void> {
  const db = await getDb();
  await db.execute(
    `INSERT OR REPLACE INTO history (id, created_at, page_url, mode, insight, thumbnail)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6)`,
    [
      entry.id,
      entry.createdAt,
      entry.pageUrl ?? '',
      entry.mode,
      JSON.stringify(entry.insight),
      entry.thumbnailB64,
    ],
  );
  const cap = Math.max(10, max);
  await db.execute(
    `DELETE FROM history WHERE id IN (
       SELECT id FROM history ORDER BY created_at DESC LIMIT -1 OFFSET ?1
     )`,
    [cap],
  );
}

export async function deleteHistory(id: string): Promise<void> {
  const db = await getDb();
  await db.execute('DELETE FROM history WHERE id = ?1', [id]);
}

export async function clearHistory(): Promise<void> {
  const db = await getDb();
  await db.execute('DELETE FROM history');
}
