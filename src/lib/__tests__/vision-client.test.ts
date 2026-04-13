import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  generatePrompts,
  AuthError,
  RateLimitError,
  SchemaError,
  NetworkError,
} from '../vision-client';

const validPayload = {
  midjourney: 'cinematic neon cyberpunk alley --ar 16:9 --style raw --v 6',
  stable_diffusion: {
    positive: 'cyberpunk alley, neon, (rain:1.2), cinematic lighting',
    negative: 'blurry, lowres, watermark',
    weights_explained: 'rain boosted to emphasize wet reflections.',
  },
  dalle:
    'A rain-soaked cyberpunk alley at night, neon signs reflected in puddles, cinematic wide-angle composition, moody teal-and-magenta palette, gritty film grain texture.',
};

function chatResponse(content: string, init: ResponseInit = {}): Response {
  return new Response(
    JSON.stringify({ choices: [{ message: { content } }] }),
    { status: 200, ...init },
  );
}

function installFetch(impl: (url: string, init: RequestInit) => Promise<Response>) {
  const mock = vi.fn(impl);
  (globalThis as unknown as { fetch: typeof fetch }).fetch =
    mock as unknown as typeof fetch;
  return mock;
}

const baseOpts = {
  baseURL: 'https://api.example.com/v1',
  apiKey: 'sk-test',
  model: 'gpt-4o',
  language: 'en' as const,
  imageBase64: 'AAAA',
};

describe('generatePrompts', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns parsed PromptResult on success', async () => {
    const fetchMock = installFetch(async () =>
      chatResponse(JSON.stringify(validPayload)),
    );
    const result = await generatePrompts(baseOpts);
    expect(result).toEqual(validPayload);
    expect(fetchMock).toHaveBeenCalledOnce();
    const init = fetchMock.mock.calls[0][1];
    const body = JSON.parse(init.body as string);
    expect(body.model).toBe('gpt-4o');
    expect(body.response_format).toEqual({ type: 'json_object' });
    expect(body.temperature).toBe(0.4);
    expect(body.max_tokens).toBe(800);
    expect(body.messages[0].role).toBe('system');
    expect(body.messages[1].content[1].image_url.url).toContain(
      'data:image/jpeg;base64,AAAA',
    );
  });

  it('throws AuthError on 401', async () => {
    installFetch(async () => new Response('unauth', { status: 401 }));
    await expect(generatePrompts(baseOpts)).rejects.toBeInstanceOf(AuthError);
  });

  it('throws RateLimitError on 429', async () => {
    installFetch(async () => new Response('slow', { status: 429 }));
    await expect(generatePrompts(baseOpts)).rejects.toBeInstanceOf(
      RateLimitError,
    );
  });

  it('retries once on invalid JSON, then succeeds', async () => {
    let call = 0;
    const fetchMock = installFetch(async () => {
      call += 1;
      if (call === 1) return chatResponse('not json at all');
      return chatResponse(JSON.stringify(validPayload));
    });
    const result = await generatePrompts(baseOpts);
    expect(result).toEqual(validPayload);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const retryBody = JSON.parse(fetchMock.mock.calls[1][1].body as string);
    const last = retryBody.messages[retryBody.messages.length - 1];
    expect(last.role).toBe('system');
    expect(last.content).toMatch(/failed schema validation/i);
  });

  it('throws SchemaError when both attempts fail schema', async () => {
    const fetchMock = installFetch(async () =>
      chatResponse(JSON.stringify({ midjourney: '' })),
    );
    await expect(generatePrompts(baseOpts)).rejects.toBeInstanceOf(SchemaError);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('wraps fetch failures in NetworkError', async () => {
    installFetch(async () => {
      throw new Error('connection reset');
    });
    await expect(generatePrompts(baseOpts)).rejects.toBeInstanceOf(
      NetworkError,
    );
  });
});
