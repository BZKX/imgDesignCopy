import {
  defaultClassify,
  stripTrailingSlash,
  type BrowserCapability,
  type ProviderAdapter,
  type VisionRequestOpts,
} from './types';

export const browserCapability: BrowserCapability = {
  cors: 'header-required',
  requiredHeaders: { 'anthropic-dangerous-direct-browser-access': 'true' },
  fallbackHint: 'none',
  notes: 'anthropic-dangerous-direct-browser-access: true; UI surfaces warning',
} as const;

export const anthropicAdapter: ProviderAdapter = {
  buildRequest(opts: VisionRequestOpts) {
    const url = `${stripTrailingSlash(opts.baseURL)}/v1/messages`;
    const system = opts.retry
      ? `${opts.systemPrompt}\n\n${opts.retry.correctiveSystem}`
      : opts.systemPrompt;
    const userText = opts.retry
      ? `${opts.userText}\n\nPrevious attempt (invalid, do not repeat):\n${opts.retry.priorRaw}`
      : opts.userText;
    const body = {
      model: opts.model,
      max_tokens: opts.maxTokens,
      system,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: userText },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: opts.mime,
                data: opts.imageBase64,
              },
            },
          ],
        },
      ],
      temperature: opts.temperature,
    };
    return {
      url,
      init: {
        method: 'POST',
        signal: opts.signal,
        headers: {
          'content-type': 'application/json',
          'x-api-key': opts.apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify(body),
      },
    };
  },
  extractContent(body: unknown): string {
    if (!body || typeof body !== 'object') return '';
    const content = (body as { content?: unknown }).content;
    if (!Array.isArray(content)) return '';
    for (const block of content) {
      if (
        block &&
        typeof block === 'object' &&
        (block as { type?: unknown }).type === 'text' &&
        typeof (block as { text?: unknown }).text === 'string'
      ) {
        return (block as { text: string }).text;
      }
    }
    return '';
  },
  classifyStatus: defaultClassify,
};
