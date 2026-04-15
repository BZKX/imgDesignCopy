import { beforeEach, describe, expect, it, vi } from 'vitest';
import { generateInsight, SchemaError } from '../vision-client';

const promptPayload = {
  midjourney: 'mj',
  stable_diffusion: { positive: 'p', negative: 'n', weights_explained: 'w' },
  dalle: 'd',
};
const productPayload = {
  palette: ['#fff', '#000', '#f00'],
  materials: ['metal'],
  lighting: 'studio',
  mood: ['calm'],
  camera: '50mm',
  tags: ['a', 'b', 'c'],
};
const webPayload = {
  layout: 'grid',
  typography: { heading: 'Inter', body: 'Inter' },
  colors: { primary: '#000', accents: ['#fff'] },
  components: ['nav', 'card'],
  interactions: ['hover'],
  tone: 'clean',
};

function chatResponse(content: string): Response {
  return new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status: 200 });
}

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

beforeEach(() => vi.restoreAllMocks());

describe('generateInsight', () => {
  it('image_to_prompt dispatches PromptResult schema', async () => {
    installFetch(async () => chatResponse(JSON.stringify(promptPayload)));
    const r = await generateInsight('image_to_prompt', baseOpts);
    expect(r).toEqual(promptPayload);
  });

  it('product_style dispatches ProductStyle schema', async () => {
    installFetch(async () => chatResponse(JSON.stringify(productPayload)));
    const r = await generateInsight('product_style', baseOpts);
    expect(r.palette).toHaveLength(3);
    expect(r.tags).toEqual(['a', 'b', 'c']);
  });

  it('webpage_style dispatches WebDesign schema', async () => {
    installFetch(async () => chatResponse(JSON.stringify(webPayload)));
    const r = await generateInsight('webpage_style', baseOpts);
    expect(r.colors.primary).toBe('#000');
    expect(r.components).toContain('nav');
  });

  it('retries once on invalid JSON with corrective system prompt naming the mode', async () => {
    let call = 0;
    const fetchMock = installFetch(async () => {
      call += 1;
      if (call === 1) return chatResponse('not json');
      return chatResponse(JSON.stringify(productPayload));
    });
    const r = await generateInsight('product_style', baseOpts);
    expect(r.palette).toHaveLength(3);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const retryBody = JSON.parse(fetchMock.mock.calls[1][1].body as string);
    const last = retryBody.messages[retryBody.messages.length - 1];
    expect(last.role).toBe('system');
    expect(last.content).toMatch(/product_style/);
  });

  it('throws SchemaError when both attempts fail schema', async () => {
    installFetch(async () => chatResponse(JSON.stringify({ palette: [] })));
    await expect(generateInsight('product_style', baseOpts)).rejects.toBeInstanceOf(SchemaError);
  });
});
