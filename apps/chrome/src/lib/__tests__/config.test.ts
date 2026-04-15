import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  loadConfig,
  saveConfig,
  hasApiKey,
  testConnection,
} from '../config';
import { DEFAULT_CONFIG } from '@promptlens/core';

type StorageBag = Record<string, unknown>;

function mockChromeStorage() {
  const bag: StorageBag = {};
  const storage = {
    sync: {
      get: vi.fn(async (key: string) => {
        if (key in bag) return { [key]: bag[key] };
        return {};
      }),
      set: vi.fn(async (entries: StorageBag) => {
        Object.assign(bag, entries);
      }),
      clear: vi.fn(async () => {
        for (const k of Object.keys(bag)) delete bag[k];
      }),
    },
  };
  (globalThis as unknown as { chrome: unknown }).chrome = { storage };
  return { bag, storage };
}

describe('config', () => {
  beforeEach(() => {
    mockChromeStorage();
    vi.restoreAllMocks();
  });

  it('returns defaults when nothing is stored', async () => {
    const cfg = await loadConfig();
    expect(cfg).toEqual(DEFAULT_CONFIG);
  });

  it('round-trips saved config through chrome.storage.sync', async () => {
    await saveConfig({
      provider: 'openai',
      baseURL: 'https://api.example.com/v1',
      apiKey: 'sk-test',
      model: 'gpt-4o-mini',
      maxHistory: 25,
      language: 'en',
    });
    const loaded = await loadConfig();
    expect(loaded.apiKey).toBe('sk-test');
    expect(loaded.model).toBe('gpt-4o-mini');
    expect(loaded.maxHistory).toBe(25);
    expect(loaded.language).toBe('en');
  });

  it('rejects invalid baseURL via zod', async () => {
    await expect(
      saveConfig({
        provider: 'openai',
        baseURL: 'not-a-url',
        apiKey: 'x',
        model: 'gpt-4o',
        maxHistory: 50,
        language: 'zh',
      }),
    ).rejects.toThrow();
  });

  it('rejects maxHistory out of range', async () => {
    await expect(
      saveConfig({
        provider: 'openai',
        baseURL: 'https://api.openai.com/v1',
        apiKey: 'x',
        model: 'gpt-4o',
        maxHistory: 1000,
        language: 'zh',
      }),
    ).rejects.toThrow();
  });

  it('hasApiKey reflects stored state', async () => {
    expect(await hasApiKey()).toBe(false);
    await saveConfig({
      provider: 'openai',
      baseURL: 'https://api.openai.com/v1',
      apiKey: 'sk-live',
      model: 'gpt-4o',
      maxHistory: 50,
      language: 'zh',
    });
    expect(await hasApiKey()).toBe(true);
  });

  it('falls back to defaults when stored shape is corrupt', async () => {
    const { storage } = mockChromeStorage();
    (storage.sync.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      'img2prompt.config': { baseURL: 'not-a-url' },
    });
    const cfg = await loadConfig();
    expect(cfg).toEqual(DEFAULT_CONFIG);
  });

  it('testConnection returns ok on 200', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );
    (globalThis as unknown as { fetch: typeof fetch }).fetch =
      fetchMock as unknown as typeof fetch;
    const result = await testConnection({
      provider: 'openai',
      baseURL: 'https://api.example.com/v1',
      apiKey: 'sk-test',
      model: 'gpt-4o',
    });
    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.example.com/v1/chat/completions');
    const body = JSON.parse(init.body as string);
    expect(body.max_tokens).toBe(1);
  });

  it('testConnection surfaces non-2xx as error', async () => {
    (globalThis as unknown as { fetch: typeof fetch }).fetch = vi
      .fn()
      .mockResolvedValue(
        new Response('nope', { status: 401, statusText: 'Unauthorized' }),
      ) as unknown as typeof fetch;
    const result = await testConnection({
      provider: 'openai',
      baseURL: 'https://api.example.com/v1',
      apiKey: 'bad',
      model: 'gpt-4o',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(401);
  });

  it('testConnection catches thrown network errors', async () => {
    (globalThis as unknown as { fetch: typeof fetch }).fetch = vi
      .fn()
      .mockRejectedValue(new Error('boom')) as unknown as typeof fetch;
    const result = await testConnection({
      provider: 'openai',
      baseURL: 'https://api.example.com/v1',
      apiKey: 'x',
      model: 'gpt-4o',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('boom');
  });
});
