import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  generatePrompts,
  AuthError,
  RateLimitError,
  SchemaError,
  NetworkError,
} from '../vision-client';

function installFetch(impl: (url: string, init: RequestInit) => Promise<Response>) {
  const mock = vi.fn(impl);
  (globalThis as unknown as { fetch: typeof fetch }).fetch = mock as unknown as typeof fetch;
  return mock;
}

const baseOpts = {
  baseURL: 'https://api.example.com/v1',
  apiKey: 'sk-test',
  model: 'gpt-4o',
  language: 'en' as const,
  imageBase64: 'AAAA',
};

describe('generatePrompts error paths', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('AuthError on 401 carries an actionable message about API key', async () => {
    installFetch(async () => new Response('nope', { status: 401 }));
    const err = await generatePrompts(baseOpts).catch((e) => e);
    expect(err).toBeInstanceOf(AuthError);
    expect(String(err.message)).toMatch(/api key/i);
    expect(String(err.message)).toMatch(/401/);
  });

  it('RateLimitError on 429 mentions retry / later', async () => {
    installFetch(
      async () =>
        new Response('slow down', {
          status: 429,
          headers: { 'retry-after': '30' },
        }),
    );
    const err = await generatePrompts(baseOpts).catch((e) => e);
    expect(err).toBeInstanceOf(RateLimitError);
    expect(String(err.message)).toMatch(/retry|later|429/i);
  });

  it('NetworkError wraps fetch rejections with underlying reason', async () => {
    installFetch(async () => {
      throw new TypeError('Failed to fetch');
    });
    const err = await generatePrompts(baseOpts).catch((e) => e);
    expect(err).toBeInstanceOf(NetworkError);
    expect(String(err.message)).toMatch(/failed to fetch/i);
  });

  it('NetworkError on non-2xx non-401/429 responses', async () => {
    installFetch(async () => new Response('server boom', { status: 500 }));
    const err = await generatePrompts(baseOpts).catch((e) => e);
    expect(err).toBeInstanceOf(NetworkError);
    expect(String(err.message)).toMatch(/500/);
  });

  it('SchemaError after a retry when both responses fail schema', async () => {
    const bad = JSON.stringify({ midjourney: '', stable_diffusion: {}, dalle: '' });
    const fetchMock = installFetch(
      async () =>
        new Response(JSON.stringify({ choices: [{ message: { content: bad } }] }), {
          status: 200,
        }),
    );
    const err = await generatePrompts(baseOpts).catch((e) => e);
    expect(err).toBeInstanceOf(SchemaError);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
