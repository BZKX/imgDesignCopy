import { anthropicAdapter, browserCapability as anthropicBrowserCapability } from './anthropic';
import { geminiAdapter, browserCapability as geminiBrowserCapability } from './gemini';
import { ollamaAdapter, browserCapability as ollamaBrowserCapability } from './ollama';
import { openaiAdapter, browserCapability as openaiBrowserCapability } from './openai';
import type { BrowserCapability, Provider, ProviderAdapter } from './types';

export type { BrowserCapability, Provider, ProviderAdapter, VisionRequestOpts, StatusClass } from './types';

export const PROVIDERS: Provider[] = ['openai', 'anthropic', 'gemini', 'ollama'];

export interface ProviderMeta {
  label: string;
  labelEn?: string;
  defaultBaseURL: string;
  defaultModel: string;
  apiKeyLabel: string;
  baseURLLabel: string;
  helpText: string;
  helpTextEn?: string;
}

export const PROVIDER_META: Record<Provider, ProviderMeta> = {
  openai: {
    label: 'OpenAI / 兼容',
    labelEn: 'OpenAI / Compatible',
    defaultBaseURL: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o',
    apiKeyLabel: 'API Key',
    baseURLLabel: 'Base URL',
    helpText: '支持 Azure / DeepSeek / Moonshot 等 OpenAI 兼容服务',
    helpTextEn: 'Supports Azure, DeepSeek, Moonshot, and other OpenAI-compatible services',
  },
  anthropic: {
    label: 'Anthropic Claude',
    labelEn: 'Anthropic Claude',
    defaultBaseURL: 'https://api.anthropic.com',
    defaultModel: 'claude-sonnet-4-5',
    apiKeyLabel: 'API Key',
    baseURLLabel: 'Base URL',
    helpText: '直连 Claude；需要 anthropic-dangerous-direct-browser-access 头已自动携带',
    helpTextEn: 'Direct Claude access; anthropic-dangerous-direct-browser-access header is sent automatically',
  },
  gemini: {
    label: 'Google Gemini',
    labelEn: 'Google Gemini',
    defaultBaseURL: 'https://generativelanguage.googleapis.com',
    defaultModel: 'gemini-2.5-flash',
    apiKeyLabel: 'API Key',
    baseURLLabel: 'Base URL',
    helpText: 'API Key 以 query 方式携带',
    helpTextEn: 'API Key is passed as a query parameter',
  },
  ollama: {
    label: 'Ollama 本地',
    labelEn: 'Ollama (Local)',
    defaultBaseURL: 'http://localhost:11434',
    defaultModel: 'llava',
    apiKeyLabel: '',
    baseURLLabel: 'Base URL',
    helpText: '本地需设置 OLLAMA_ORIGINS=chrome-extension://* 以允许扩展跨域',
    helpTextEn: 'Set OLLAMA_ORIGINS=chrome-extension://* locally to allow cross-origin requests from the extension',
  },
};

export const BROWSER_CAPABILITY: Record<Provider, BrowserCapability> = {
  openai: openaiBrowserCapability,
  anthropic: anthropicBrowserCapability,
  gemini: geminiBrowserCapability,
  ollama: ollamaBrowserCapability,
};

const ADAPTERS: Record<Provider, ProviderAdapter> = {
  openai: openaiAdapter,
  anthropic: anthropicAdapter,
  gemini: geminiAdapter,
  ollama: ollamaAdapter,
};

export function getAdapter(provider: Provider): ProviderAdapter {
  return ADAPTERS[provider];
}

export function isProvider(x: unknown): x is Provider {
  return typeof x === 'string' && (PROVIDERS as string[]).includes(x);
}
