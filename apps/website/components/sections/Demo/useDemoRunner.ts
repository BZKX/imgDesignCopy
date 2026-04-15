'use client';

/**
 * Privacy invariant: API key MUST NEVER be sent to any origin except the
 * selected provider's baseURL. This hook calls @promptlens/core generateInsight
 * directly from the browser — the key goes only in the `Authorization` header
 * (or equivalent) of the provider fetch, nowhere else.
 *
 * Telemetry emits ONLY: { provider, mode, latency_ms } on success and
 * { provider, mode, latency_ms, error_class } on failure — never image bytes,
 * prompts, headers, or key fragments.
 */

import { useCallback, useRef, useState } from 'react';
import { track } from '@vercel/analytics';
import {
  generateInsight,
  AuthError,
  RateLimitError,
  NetworkError,
  SchemaError,
} from '@promptlens/core';
import type { Mode } from '@promptlens/core';

export type ErrorClass =
  | 'auth'
  | 'rate_limit'
  | 'cors'
  | 'schema'
  | 'network'
  | 'timeout'
  | 'unknown';

export type DemoState = 'idle' | 'running' | 'done' | 'error';

export interface DemoConfig {
  provider: 'openai' | 'anthropic' | 'gemini' | 'ollama';
  baseURL: string;
  apiKey: string;
  model: string;
}

export interface DemoImage {
  base64: string;
  mime: string;
}

export interface DemoResult {
  raw: unknown;
  text: string;
}

export interface DemoError {
  message: string;
  errorClass: ErrorClass;
  hint?: string;
}

export interface UseDemoRunnerReturn {
  state: DemoState;
  result: DemoResult | null;
  error: DemoError | null;
  run: (mode: Mode, config: DemoConfig, image: DemoImage) => void;
  abort: () => void;
  reset: () => void;
}

export function classifyError(err: unknown): { message: string; errorClass: ErrorClass; hint?: string } {
  if (err instanceof AuthError) {
    return {
      message: err.message,
      errorClass: 'auth',
      hint: 'Double-check your API key in the provider settings.',
    };
  }
  if (err instanceof RateLimitError) {
    return {
      message: err.message,
      errorClass: 'rate_limit',
      hint: 'You have hit the provider rate limit. Wait a moment and try again.',
    };
  }
  if (err instanceof SchemaError) {
    return {
      message: err.message,
      errorClass: 'schema',
      hint: 'The model returned an unexpected format. Try a different model or mode.',
    };
  }
  if (err instanceof NetworkError) {
    const msg = err.message.toLowerCase();
    if (msg.includes('cors') || msg.includes('blocked') || msg.includes('failed to fetch')) {
      return {
        message: err.message,
        errorClass: 'cors',
        hint: 'The provider blocked the browser request (CORS). Some providers require the extension or desktop app.',
      };
    }
    if (msg.includes('timeout') || msg.includes('aborted')) {
      return { message: err.message, errorClass: 'timeout', hint: 'Request timed out. Check your connection.' };
    }
    return { message: err.message, errorClass: 'network', hint: 'A network error occurred. Check your connection and Base URL.' };
  }
  if (err instanceof Error && err.name === 'AbortError') {
    return { message: 'Request cancelled.', errorClass: 'timeout' };
  }
  return {
    message: err instanceof Error ? err.message : String(err),
    errorClass: 'unknown',
    hint: 'An unexpected error occurred.',
  };
}

export function resultToText(raw: unknown): string {
  if (typeof raw === 'string') return raw;
  if (raw && typeof raw === 'object') {
    // Try common prompt fields
    for (const key of ['prompt', 'result', 'description', 'text', 'output']) {
      const v = (raw as Record<string, unknown>)[key];
      if (typeof v === 'string') return v;
    }
    return JSON.stringify(raw, null, 2);
  }
  return String(raw);
}

export function useDemoRunner(): UseDemoRunnerReturn {
  const [state, setState] = useState<DemoState>('idle');
  const [result, setResult] = useState<DemoResult | null>(null);
  const [error, setError] = useState<DemoError | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const abort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState('idle');
    setResult(null);
    setError(null);
  }, []);

  const run = useCallback(
    (mode: Mode, config: DemoConfig, image: DemoImage) => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      setState('running');
      setResult(null);
      setError(null);

      const start = Date.now();

      generateInsight(mode, {
        provider: config.provider,
        baseURL: config.baseURL,
        apiKey: config.apiKey,
        model: config.model,
        language: 'zh',
        imageBase64: image.base64,
        mime: image.mime,
        signal: ac.signal,
      })
        .then((raw) => {
          if (ac.signal.aborted) return;
          const latency_ms = Date.now() - start;
          const text = resultToText(raw);
          setResult({ raw, text });
          setState('done');
          // Telemetry: success — no payload, no key, no image bytes
          track('demo_generation_completed', {
            provider: config.provider,
            mode,
            latency_ms,
          });
        })
        .catch((err: unknown) => {
          if (ac.signal.aborted && err instanceof Error && err.name === 'AbortError') return;
          const latency_ms = Date.now() - start;
          const classified = classifyError(err);
          setError(classified);
          setState('error');
          // Telemetry: failure — error_class only, no payload
          track('demo_generation_failed', {
            provider: config.provider,
            mode,
            latency_ms,
            error_class: classified.errorClass,
          });
        });
    },
    [],
  );

  return { state, result, error, run, abort, reset };
}
