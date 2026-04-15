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
  notes: '?key= query style; browser-safe',
} as const;

export const geminiAdapter: ProviderAdapter = {
  buildRequest(opts: VisionRequestOpts) {
    const url = `${stripTrailingSlash(opts.baseURL)}/v1beta/models/${encodeURIComponent(
      opts.model,
    )}:generateContent?key=${encodeURIComponent(opts.apiKey)}`;
    const systemText = opts.retry
      ? `${opts.systemPrompt}\n\n${opts.retry.correctiveSystem}`
      : opts.systemPrompt;
    const userText = opts.retry
      ? `${opts.userText}\n\nPrevious attempt (invalid, do not repeat):\n${opts.retry.priorRaw}`
      : opts.userText;
    const body = {
      systemInstruction: { parts: [{ text: systemText }] },
      contents: [
        {
          parts: [
            { text: userText },
            {
              inlineData: {
                mimeType: opts.mime,
                data: opts.imageBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: opts.temperature,
        maxOutputTokens: opts.maxTokens,
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
    const cands = (body as { candidates?: unknown }).candidates;
    if (!Array.isArray(cands) || cands.length === 0) return '';
    const content = (cands[0] as { content?: { parts?: unknown } }).content;
    if (!content || !Array.isArray(content.parts)) return '';
    for (const part of content.parts) {
      if (part && typeof part === 'object' && typeof (part as { text?: unknown }).text === 'string') {
        return (part as { text: string }).text;
      }
    }
    return '';
  },
  classifyStatus: defaultClassify,
};
