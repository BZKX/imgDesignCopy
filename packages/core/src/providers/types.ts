export type Provider = 'openai' | 'anthropic' | 'gemini' | 'ollama';

export interface VisionRequestOpts {
  baseURL: string;
  apiKey: string;
  model: string;
  systemPrompt: string;
  userText: string;
  imageBase64: string;
  mime: string;
  signal?: AbortSignal;
  temperature: number;
  maxTokens: number;
  /** When set, this is a retry attempt — the raw prior response that failed schema validation,
   *  plus the corrective system message to append. Adapters can choose to encode it as a
   *  multi-turn exchange (OpenAI) or stitch it into the system prompt (others). */
  retry?: {
    priorRaw: string;
    correctiveSystem: string;
  };
}

export type StatusClass = 'auth' | 'rate' | 'ok' | 'http';

export interface ProviderAdapter {
  buildRequest(opts: VisionRequestOpts): { url: string; init: RequestInit };
  extractContent(body: unknown): string;
  classifyStatus(status: number): StatusClass;
}

export interface BrowserCapability {
  cors: 'yes' | 'header-required' | 'same-origin-only';
  requiredHeaders?: Record<string, string>;
  fallbackHint: 'use-extension' | 'video-only' | 'none';
  notes: string;
}

export function defaultClassify(status: number): StatusClass {
  if (status === 401 || status === 403) return 'auth';
  if (status === 429) return 'rate';
  if (status >= 200 && status < 300) return 'ok';
  return 'http';
}

export function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}
