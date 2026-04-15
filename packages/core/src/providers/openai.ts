import {
  defaultClassify,
  stripTrailingSlash,
  type BrowserCapability,
  type ProviderAdapter,
  type VisionRequestOpts,
} from './types';

export const browserCapability: BrowserCapability = {
  cors: 'yes',
  fallbackHint: 'none',
  notes: 'Supports CORS with Bearer header',
} as const;

export const openaiAdapter: ProviderAdapter = {
  buildRequest(opts: VisionRequestOpts) {
    const url = `${stripTrailingSlash(opts.baseURL)}/chat/completions`;
    const messages: unknown[] = [
      { role: 'system', content: opts.systemPrompt },
      {
        role: 'user',
        content: [
          { type: 'text', text: opts.userText },
          {
            type: 'image_url',
            image_url: {
              url: `data:${opts.mime};base64,${opts.imageBase64}`,
            },
          },
        ],
      },
    ];
    if (opts.retry) {
      messages.push({ role: 'assistant', content: opts.retry.priorRaw });
      messages.push({ role: 'system', content: opts.retry.correctiveSystem });
    }
    const body = {
      model: opts.model,
      messages,
      response_format: { type: 'json_object' },
      temperature: opts.temperature,
      max_tokens: opts.maxTokens,
    };
    return {
      url,
      init: {
        method: 'POST',
        signal: opts.signal,
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${opts.apiKey}`,
        },
        body: JSON.stringify(body),
      },
    };
  },
  extractContent(body: unknown): string {
    if (!body || typeof body !== 'object') return '';
    const choices = (body as { choices?: unknown }).choices;
    if (!Array.isArray(choices) || choices.length === 0) return '';
    const msg = (choices[0] as { message?: { content?: unknown } }).message;
    if (!msg || typeof msg.content !== 'string') return '';
    return msg.content;
  },
  classifyStatus: defaultClassify,
};
