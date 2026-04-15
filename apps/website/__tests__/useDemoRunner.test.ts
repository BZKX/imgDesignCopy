/**
 * Unit tests for useDemoRunner pure helpers.
 * Tests classifyError and resultToText without requiring @testing-library/react.
 */
import { describe, it, expect } from 'vitest';
import { classifyError, resultToText } from '../components/sections/Demo/useDemoRunner';
import { AuthError, RateLimitError, NetworkError, SchemaError } from '@promptlens/core';

describe('classifyError', () => {
  it('classifies AuthError → auth', () => {
    const result = classifyError(new AuthError());
    expect(result.errorClass).toBe('auth');
    expect(result.hint).toBeTruthy();
  });

  it('classifies RateLimitError → rate_limit', () => {
    const result = classifyError(new RateLimitError());
    expect(result.errorClass).toBe('rate_limit');
  });

  it('classifies SchemaError → schema', () => {
    const result = classifyError(new SchemaError());
    expect(result.errorClass).toBe('schema');
  });

  it('classifies NetworkError with "Failed to fetch" → cors', () => {
    const result = classifyError(new NetworkError('Failed to fetch'));
    expect(result.errorClass).toBe('cors');
  });

  it('classifies NetworkError with "cors" in message → cors', () => {
    const result = classifyError(new NetworkError('CORS blocked by browser'));
    expect(result.errorClass).toBe('cors');
  });

  it('classifies NetworkError with "timeout" → timeout', () => {
    const result = classifyError(new NetworkError('request timeout'));
    expect(result.errorClass).toBe('timeout');
  });

  it('classifies generic NetworkError → network', () => {
    const result = classifyError(new NetworkError('HTTP 500: Internal Server Error'));
    expect(result.errorClass).toBe('network');
  });

  it('classifies AbortError → timeout', () => {
    const err = new Error('aborted');
    err.name = 'AbortError';
    const result = classifyError(err);
    expect(result.errorClass).toBe('timeout');
  });

  it('classifies unknown error → unknown', () => {
    const result = classifyError(new Error('something weird'));
    expect(result.errorClass).toBe('unknown');
  });

  it('never leaks API key or image bytes in error message', () => {
    const err = new AuthError('Unauthorized (401). Check your API key.');
    const result = classifyError(err);
    // result.message should not contain anything that looks like a key
    expect(result.message).not.toMatch(/sk-[a-zA-Z0-9]+/);
    expect(result.message).not.toMatch(/data:image/);
  });
});

describe('resultToText', () => {
  it('returns string unchanged', () => {
    expect(resultToText('hello world')).toBe('hello world');
  });

  it('extracts .prompt field', () => {
    expect(resultToText({ prompt: 'cinematic shot' })).toBe('cinematic shot');
  });

  it('extracts .result field when no .prompt', () => {
    expect(resultToText({ result: 'my result' })).toBe('my result');
  });

  it('extracts .description field', () => {
    expect(resultToText({ description: 'desc' })).toBe('desc');
  });

  it('falls back to JSON for unknown object shape', () => {
    const obj = { foo: 'bar', baz: 42 };
    const text = resultToText(obj);
    expect(text).toContain('foo');
    expect(text).toContain('bar');
  });

  it('handles primitives', () => {
    expect(resultToText(42)).toBe('42');
    expect(resultToText(null)).toBe('null');
  });
});
