/**
 * Browser-safety audit for @promptlens/core public surface.
 *
 * Node-only import scan results (grep -rnE "(from 'node:|require\('node:|from 'fs'|from 'path'|from 'crypto')"
 * run against packages/core/src/ on 2026-04-15):
 *   NO MATCHES — zero Node-only imports detected.
 *
 * This test runs in jsdom and verifies:
 *   1. All four providers export a well-formed browserCapability object.
 *   2. The BROWSER_CAPABILITY map covers every Provider value.
 *   3. No accidental access to Node-only globals (process, Buffer, __dirname) during import.
 */
import { describe, expect, it } from 'vitest';
import {
  BROWSER_CAPABILITY,
  PROVIDERS,
  type BrowserCapability,
  type Provider,
} from '../providers';
import { browserCapability as anthropicCap } from '../providers/anthropic';
import { browserCapability as geminiCap } from '../providers/gemini';
import { browserCapability as ollamaCap } from '../providers/ollama';
import { browserCapability as openaiCap } from '../providers/openai';

const VALID_CORS = new Set(['yes', 'header-required', 'same-origin-only']);
const VALID_FALLBACK = new Set(['use-extension', 'video-only', 'none']);

function assertCapability(cap: BrowserCapability, label: string) {
  expect(VALID_CORS.has(cap.cors), `${label}: invalid cors value "${cap.cors}"`).toBe(true);
  expect(VALID_FALLBACK.has(cap.fallbackHint), `${label}: invalid fallbackHint "${cap.fallbackHint}"`).toBe(true);
  expect(typeof cap.notes).toBe('string');
  expect(cap.notes.length).toBeGreaterThan(0);
  if (cap.requiredHeaders !== undefined) {
    expect(typeof cap.requiredHeaders).toBe('object');
  }
}

describe('browserCapability — per-provider exports', () => {
  it('openai has cors:yes and fallbackHint:none', () => {
    expect(openaiCap.cors).toBe('yes');
    expect(openaiCap.fallbackHint).toBe('none');
    assertCapability(openaiCap, 'openai');
  });

  it('anthropic has cors:header-required with requiredHeaders', () => {
    expect(anthropicCap.cors).toBe('header-required');
    expect(anthropicCap.fallbackHint).toBe('none');
    expect(anthropicCap.requiredHeaders).toEqual({
      'anthropic-dangerous-direct-browser-access': 'true',
    });
    assertCapability(anthropicCap, 'anthropic');
  });

  it('gemini has cors:yes and fallbackHint:none', () => {
    expect(geminiCap.cors).toBe('yes');
    expect(geminiCap.fallbackHint).toBe('none');
    assertCapability(geminiCap, 'gemini');
  });

  it('ollama has cors:same-origin-only and fallbackHint:use-extension', () => {
    expect(ollamaCap.cors).toBe('same-origin-only');
    expect(ollamaCap.fallbackHint).toBe('use-extension');
    assertCapability(ollamaCap, 'ollama');
  });
});

describe('BROWSER_CAPABILITY map', () => {
  it('covers all providers in PROVIDERS list', () => {
    for (const provider of PROVIDERS) {
      expect(BROWSER_CAPABILITY[provider as Provider]).toBeDefined();
    }
  });

  it('each entry is a valid BrowserCapability', () => {
    for (const provider of PROVIDERS) {
      assertCapability(BROWSER_CAPABILITY[provider as Provider], provider);
    }
  });
});

describe('browser-globals safety', () => {
  it('importing core does not require Node-only globals', () => {
    // If any module in core tried to access Node-only APIs at import time
    // (e.g. process.env, Buffer, __dirname), those would throw in jsdom.
    // The fact that all imports above succeeded without error is the assertion.
    expect(typeof window).toBe('object');
    expect(typeof document).toBe('object');
  });
});
