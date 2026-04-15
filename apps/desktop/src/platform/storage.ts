import { Store } from '@tauri-apps/plugin-store';

let storePromise: Promise<Store> | null = null;

function getStore(): Promise<Store> {
  if (!storePromise) storePromise = Store.load('config.json');
  return storePromise;
}

export const storage = {
  async get<T = unknown>(key: string): Promise<T | null> {
    const s = await getStore();
    const v = await s.get<T>(key);
    return (v ?? null) as T | null;
  },
  async set(key: string, value: unknown): Promise<void> {
    const s = await getStore();
    await s.set(key, value);
    await s.save();
  },
  async delete(key: string): Promise<void> {
    const s = await getStore();
    await s.delete(key);
    await s.save();
  },
};
