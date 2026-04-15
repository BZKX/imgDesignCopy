'use client';

import { useEffect, useRef, useState } from 'react';
import { PROVIDERS, PROVIDER_META, BROWSER_CAPABILITY } from '@promptlens/core';
import type { DemoConfig } from './useDemoRunner';

const STORAGE_KEY = 'pl.demo.config';

const DEFAULT_CONFIG: DemoConfig = {
  provider: 'openai',
  baseURL: PROVIDER_META.openai.defaultBaseURL,
  apiKey: '',
  model: PROVIDER_META.openai.defaultModel,
};

function loadConfig(): DemoConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw) as Partial<DemoConfig>;
    return {
      provider: PROVIDERS.includes(parsed.provider as never) ? (parsed.provider as DemoConfig['provider']) : DEFAULT_CONFIG.provider,
      baseURL: typeof parsed.baseURL === 'string' && parsed.baseURL ? parsed.baseURL : DEFAULT_CONFIG.baseURL,
      apiKey: typeof parsed.apiKey === 'string' ? parsed.apiKey : '',
      model: typeof parsed.model === 'string' && parsed.model ? parsed.model : DEFAULT_CONFIG.model,
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

function saveConfig(config: DemoConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Safari private-mode QuotaExceededError — fall back to in-memory (state already holds it)
  }
}

interface Props {
  open: boolean;
  onClose: () => void;
  config: DemoConfig;
  onChange: (config: DemoConfig) => void;
}

export default function ProviderForm({ open, onClose, config, onChange }: Props) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const [local, setLocal] = useState<DemoConfig>(config);

  // Sync incoming config → local state when drawer opens
  useEffect(() => {
    if (open) setLocal(config);
  }, [open, config]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const commit = (next: DemoConfig) => {
    setLocal(next);
    saveConfig(next);
    onChange(next);
  };

  const handleProviderChange = (provider: DemoConfig['provider']) => {
    const meta = PROVIDER_META[provider];
    commit({
      provider,
      baseURL: meta.defaultBaseURL,
      apiKey: local.apiKey,
      model: meta.defaultModel,
    });
  };

  const cap = BROWSER_CAPABILITY[local.provider];

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 40,
            background: 'rgba(7,7,10,0.5)',
            backdropFilter: 'blur(4px)',
          }}
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Provider settings"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 360,
          zIndex: 50,
          background: 'var(--color-pl-bg-elev-2)',
          borderLeft: '1px solid var(--color-pl-border-default)',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.28s cubic-bezier(0.16,1,0.3,1)',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--color-pl-fg-primary)', fontWeight: 600, fontSize: '1rem' }}>
            Provider Settings
          </span>
          <button
            onClick={onClose}
            aria-label="Close settings"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-pl-fg-secondary)',
              cursor: 'pointer',
              fontSize: '1.25rem',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Provider select */}
        <Field label="Provider">
          <select
            value={local.provider}
            onChange={(e) => handleProviderChange(e.target.value as DemoConfig['provider'])}
            style={selectStyle}
          >
            {PROVIDERS.map((p) => (
              <option key={p} value={p}>
                {PROVIDER_META[p].label}
              </option>
            ))}
          </select>
        </Field>

        {/* CORS capability warning */}
        {cap.cors === 'header-required' && (
          <Notice type="warn">
            {PROVIDER_META[local.provider].helpText}
          </Notice>
        )}
        {cap.cors === 'same-origin-only' && (
          <Notice type="info">
            Ollama can&apos;t be reached from a website. Use the desktop app or Chrome extension.
          </Notice>
        )}

        {/* Base URL */}
        <Field label={PROVIDER_META[local.provider].baseURLLabel} tooltip="The HTTP endpoint for the provider. Change only if using a proxy or compatible service.">
          <input
            type="url"
            value={local.baseURL}
            onChange={(e) => setLocal((c) => ({ ...c, baseURL: e.target.value }))}
            onBlur={() => commit(local)}
            placeholder={PROVIDER_META[local.provider].defaultBaseURL}
            style={inputStyle}
          />
        </Field>

        {/* API Key — hidden for Ollama */}
        {local.provider !== 'ollama' && (
          <Field label={PROVIDER_META[local.provider].apiKeyLabel} tooltip="Stays in your browser — never sent to our servers.">
            <input
              type="password"
              value={local.apiKey}
              onChange={(e) => setLocal((c) => ({ ...c, apiKey: e.target.value }))}
              onBlur={() => commit(local)}
              placeholder="sk-…"
              autoComplete="off"
              style={inputStyle}
            />
          </Field>
        )}

        {/* Model */}
        <Field label="Model" tooltip="The model to call. Must support vision (image) input.">
          <input
            type="text"
            value={local.model}
            onChange={(e) => setLocal((c) => ({ ...c, model: e.target.value }))}
            onBlur={() => commit(local)}
            placeholder={PROVIDER_META[local.provider].defaultModel}
            style={{ ...inputStyle, fontFamily: 'var(--pl-font-mono, monospace)', fontSize: '0.8125rem' }}
          />
        </Field>

        <div style={{ marginTop: 'auto', color: 'var(--color-pl-fg-disabled)', fontSize: '0.75rem', lineHeight: 1.5 }}>
          🔒 Your API key never leaves your browser. We don&apos;t log your images or prompts.
        </div>
      </div>
    </>
  );
}

// ---------- subcomponents ----------

function Field({ label, tooltip, children }: { label: string; tooltip?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <label style={{ color: 'var(--color-pl-fg-secondary)', fontSize: '0.8125rem', fontWeight: 500 }}>
          {label}
        </label>
        {tooltip && (
          <span
            title={tooltip}
            style={{
              color: 'var(--color-pl-fg-disabled)',
              fontSize: '0.75rem',
              cursor: 'help',
              border: '1px solid var(--color-pl-border-subtle)',
              borderRadius: '50%',
              width: 16,
              height: 16,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            i
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function Notice({ type, children }: { type: 'warn' | 'info'; children: React.ReactNode }) {
  const color = type === 'warn' ? 'var(--color-pl-warning)' : 'var(--color-pl-accent-mid)';
  return (
    <div
      style={{
        padding: '10px 12px',
        borderRadius: 'var(--pl-radius-md)',
        border: `1px solid ${color}44`,
        background: `${color}11`,
        color: 'var(--color-pl-fg-secondary)',
        fontSize: '0.8125rem',
        lineHeight: 1.5,
      }}
    >
      {children}
    </div>
  );
}

// ---------- shared styles ----------

const inputBase: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: 'var(--pl-radius-md)',
  border: '1px solid var(--color-pl-border-default)',
  background: 'var(--color-pl-bg-elev-1)',
  color: 'var(--color-pl-fg-primary)',
  fontSize: '0.9375rem',
  outline: 'none',
  boxSizing: 'border-box',
};

const inputStyle: React.CSSProperties = inputBase;
const selectStyle: React.CSSProperties = { ...inputBase, cursor: 'pointer' };

export { loadConfig };
