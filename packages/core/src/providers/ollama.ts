import {
  defaultClassify,
  stripTrailingSlash,
  type BrowserCapability,
  type ProviderAdapter,
  type VisionRequestOpts,
} from './types';

export const browserCapability: BrowserCapability = {
  cors: 'same-origin-only',
  fallbackHint: 'use-extension',
  notes: 'No browser-direct; demo shows "install extension / desktop app" CTA + inline 15s screen recording, not a disabled greyed select',
} as const;

export const ollamaAdapter: ProviderAdapter = {
  buildRequest(opts: VisionRequestOpts) {
    const url = `${stripTrailingSlash(opts.baseURL)}/api/chat`;
    const systemText = opts.retry
      ? `${opts.systemPrompt}\n\n${opts.retry.correctiveSystem}`
      : opts.systemPrompt;
    const userText = opts.retry
      ? `${opts.userText}\n\nPrevious attempt (invalid, do not repeat):\n${opts.retry.priorRaw}`
      : opts.userText;
    const body = {
      model: opts.model,
      messages: [
        { role: 'system', content: systemText },
        {
          role: 'user',
          content: userText,
          images: [opts.imageBase64],
        },
      ],
      stream: false,
      format: 'json',
      options: {
        temperature: opts.temperature,
        num_predict: opts.maxTokens,
      },
    };
    return {
      url,
      init: {
        method: 'POST',
        signal: opts.signal,
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    };
  },
  extractContent(body: unknown): string {
    if (!body || typeof body !== 'object') return '';
    const message = (body as { message?: { content?: unknown } }).message;
    if (!message || typeof message.content !== 'string') return '';
    return message.content;
  },
  classifyStatus: defaultClassify,
};
