import {
  AuthError,
  NetworkError,
  RateLimitError,
  SchemaError,
  generateInsight,
  type Mode,
  type InsightByMode,
} from '@promptlens/core';
import { loadConfig } from './config';

export type VisionErrorCode =
  | 'NO_CONFIG'
  | 'UNAUTHORIZED'
  | 'RATE_LIMITED'
  | 'NETWORK_ERROR'
  | 'INVALID_RESPONSE'
  | 'TIMEOUT'
  | 'UNKNOWN';

export class VisionError extends Error {
  constructor(public code: VisionErrorCode, message: string) {
    super(message);
    this.name = 'VisionError';
  }
}

export async function runVisionInsight<M extends Mode>(
  mode: M,
  imageBase64: string,
  mime: string,
  signal?: AbortSignal,
): Promise<InsightByMode[M]> {
  const cfg = await loadConfig();
  if (cfg.provider !== 'ollama' && !cfg.apiKey.trim()) {
    throw new VisionError('NO_CONFIG', '请先在设置中填写 API Key');
  }
  try {
    return await generateInsight(mode, {
      provider: cfg.provider,
      baseURL: cfg.baseURL,
      apiKey: cfg.apiKey,
      model: cfg.model,
      language: cfg.language,
      imageBase64,
      mime,
      signal,
    });
  } catch (err) {
    if (err instanceof AuthError) throw new VisionError('UNAUTHORIZED', err.message);
    if (err instanceof RateLimitError) throw new VisionError('RATE_LIMITED', err.message);
    if (err instanceof SchemaError) throw new VisionError('INVALID_RESPONSE', err.message);
    if (err instanceof NetworkError) throw new VisionError('NETWORK_ERROR', err.message);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new VisionError('TIMEOUT', '请求已取消');
    }
    throw new VisionError('UNKNOWN', err instanceof Error ? err.message : String(err));
  }
}
