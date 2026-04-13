import { Config, ConfigSchema, DEFAULT_CONFIG } from './config-schema';

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
  return cfg.apiKey.trim().length > 0;
}

export type TestConnectionResult =
  | { ok: true; status: number }
  | { ok: false; status?: number; error: string };

export async function testConnection(
  config: Pick<Config, 'baseURL' | 'apiKey' | 'model'>,
  signal?: AbortSignal,
): Promise<TestConnectionResult> {
  try {
    const res = await fetch(`${config.baseURL}/chat/completions`, {
      method: 'POST',
      signal,
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: 'hi' }],
        max_tokens: 1,
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return { ok: false, status: res.status, error: text || res.statusText };
    }
    return { ok: true, status: res.status };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
