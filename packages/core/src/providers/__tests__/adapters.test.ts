import { describe, expect, it } from 'vitest';
import { getAdapter, PROVIDERS } from '..';
import type { VisionRequestOpts } from '..';

const base: VisionRequestOpts = {
  baseURL: 'https://example.test',
  apiKey: 'key-123',
  model: 'some-model',
  systemPrompt: 'SYS',
  userText: 'USER',
  imageBase64: 'AAAA',
  mime: 'image/png',
  temperature: 0.4,
  maxTokens: 100,
};

describe('provider adapters', () => {
  it('registers all four providers', () => {
    expect(PROVIDERS).toEqual(['openai', 'anthropic', 'gemini', 'ollama']);
  });

  it('openai: request shape + extract + status classify', () => {
    const a = getAdapter('openai');
    const { url, init } = a.buildRequest({ ...base, baseURL: 'https://api.openai.com/v1' });
    expect(url).toBe('https://api.openai.com/v1/chat/completions');
    expect((init.headers as Record<string, string>).authorization).toBe('Bearer key-123');
    const body = JSON.parse(init.body as string);
    expect(body.model).toBe('some-model');
    expect(body.response_format).toEqual({ type: 'json_object' });
    expect(body.messages[0].role).toBe('system');
    expect(body.messages[1].content[1].image_url.url).toBe('data:image/png;base64,AAAA');

    expect(a.extractContent({ choices: [{ message: { content: 'hi' } }] })).toBe('hi');
    expect(a.classifyStatus(401)).toBe('auth');
    expect(a.classifyStatus(429)).toBe('rate');
    expect(a.classifyStatus(200)).toBe('ok');
    expect(a.classifyStatus(500)).toBe('http');
  });

  it('anthropic: request shape + extract', () => {
    const a = getAdapter('anthropic');
    const { url, init } = a.buildRequest({ ...base, baseURL: 'https://api.anthropic.com' });
    expect(url).toBe('https://api.anthropic.com/v1/messages');
    const h = init.headers as Record<string, string>;
    expect(h['x-api-key']).toBe('key-123');
    expect(h['anthropic-version']).toBe('2023-06-01');
    expect(h['anthropic-dangerous-direct-browser-access']).toBe('true');
    const body = JSON.parse(init.body as string);
    expect(body.system).toBe('SYS');
    expect(body.messages[0].content[1].source).toEqual({
      type: 'base64',
      media_type: 'image/png',
      data: 'AAAA',
    });

    expect(
      a.extractContent({ content: [{ type: 'text', text: 'claude-hi' }] }),
    ).toBe('claude-hi');
  });

  it('gemini: request shape + extract', () => {
    const a = getAdapter('gemini');
    const { url, init } = a.buildRequest({
      ...base,
      baseURL: 'https://generativelanguage.googleapis.com',
      model: 'gemini-2.5-flash',
    });
    expect(url).toBe(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=key-123',
    );
    const body = JSON.parse(init.body as string);
    expect(body.systemInstruction.parts[0].text).toBe('SYS');
    expect(body.contents[0].parts[1].inlineData).toEqual({
      mimeType: 'image/png',
      data: 'AAAA',
    });
    expect(body.generationConfig.responseMimeType).toBe('application/json');

    expect(
      a.extractContent({ candidates: [{ content: { parts: [{ text: 'g-hi' }] } }] }),
    ).toBe('g-hi');
  });

  it('ollama: request shape + extract', () => {
    const a = getAdapter('ollama');
    const { url, init } = a.buildRequest({ ...base, baseURL: 'http://localhost:11434' });
    expect(url).toBe('http://localhost:11434/api/chat');
    const body = JSON.parse(init.body as string);
    expect(body.format).toBe('json');
    expect(body.stream).toBe(false);
    expect(body.messages[1].images).toEqual(['AAAA']);
    expect(body.options.num_predict).toBe(100);

    expect(a.extractContent({ message: { content: 'ollama-hi' } })).toBe('ollama-hi');
  });

  it('retry branch stitches prior attempt (non-openai)', () => {
    const anth = getAdapter('anthropic');
    const { init } = anth.buildRequest({
      ...base,
      retry: { priorRaw: 'BAD', correctiveSystem: 'FIX' },
    });
    const body = JSON.parse(init.body as string);
    expect(body.system).toMatch(/FIX/);
    expect(body.messages[0].content[0].text).toMatch(/BAD/);
  });
});
