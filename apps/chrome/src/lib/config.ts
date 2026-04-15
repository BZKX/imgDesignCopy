import { ConfigSchema, DEFAULT_CONFIG, getAdapter, type Config } from '@promptlens/core';

const STORAGE_KEY = 'img2prompt.config';

export async function loadConfig(): Promise<Config> {
  const raw = await chrome.storage.sync.get(STORAGE_KEY);
  const stored = raw?.[STORAGE_KEY];
  if (!stored) return { ...DEFAULT_CONFIG };
  const parsed = ConfigSchema.safeParse({ ...DEFAULT_CONFIG, ...stored });
  return parsed.success ? parsed.data : { ...DEFAULT_CONFIG };
}

export async function saveConfig(config: Config): Promise<void> {
  const parsed = ConfigSchema.parse(config);
  await chrome.storage.sync.set({ [STORAGE_KEY]: parsed });
}

export async function hasApiKey(): Promise<boolean> {
  const cfg = await loadConfig();
  if (cfg.provider === 'ollama') return true;
  return cfg.apiKey.trim().length > 0;
}

export type TestConnectionResult =
  | { ok: true; status: number }
  | { ok: false; status?: number; error: string };

export async function testConnection(
  config: Pick<Config, 'provider' | 'baseURL' | 'apiKey' | 'model'>,
  signal?: AbortSignal,
): Promise<TestConnectionResult> {
  try {
    const adapter = getAdapter(config.provider);
    const pingImage =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgAAIAAAUAAen63NgAAAAASUVORK5CYII=';
    const { url, init } = adapter.buildRequest({
      baseURL: config.baseURL,
      apiKey: config.apiKey,
      model: config.model,
      systemPrompt: 'ping',
      userText: 'ping',
      imageBase64: pingImage,
      mime: 'image/png',
      signal,
      temperature: 0,
      maxTokens: 1,
    });
    const res = await fetch(url, init);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return { ok: false, status: res.status, error: text || res.statusText };
    }
    return { ok: true, status: res.status };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
