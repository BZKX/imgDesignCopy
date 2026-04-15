'use client';

import { useEffect, useState } from 'react';
import { MODE_META, MODES, PROVIDER_META } from '@promptlens/core';
import type { Mode } from '@promptlens/core';
import ImageDropzone from './ImageDropzone';
import OllamaCTA from './OllamaCTA';
import PromptOutput from './PromptOutput';
import ProviderForm, { loadConfig } from './ProviderForm';
import type { DemoConfig } from './useDemoRunner';
import { useDemoRunner } from './useDemoRunner';
import type { ProcessedImage } from './imagePreprocess';

// Safari-safe localStorage init — falls back to in-memory default
function initConfig(): DemoConfig {
  if (typeof window === 'undefined') {
    return { provider: 'openai', baseURL: PROVIDER_META.openai.defaultBaseURL, apiKey: '', model: PROVIDER_META.openai.defaultModel };
  }
  return loadConfig();
}

export default function DemoSection() {
  const [mode, setMode] = useState<Mode>('image_to_prompt');
  const [config, setConfig] = useState<DemoConfig>(() => ({
    provider: 'openai',
    baseURL: PROVIDER_META.openai.defaultBaseURL,
    apiKey: '',
    model: PROVIDER_META.openai.defaultModel,
  }));
  const [image, setImage] = useState<ProcessedImage | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [latencyStart, setLatencyStart] = useState<number | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | undefined>(undefined);

  const { state, result, error, run, abort, reset } = useDemoRunner();

  // Hydrate config from localStorage after mount (SSR-safe)
  useEffect(() => {
    setConfig(initConfig());
  }, []);

  // Track latency
  useEffect(() => {
    if (state === 'running') {
      setLatencyStart(Date.now());
      setLatencyMs(undefined);
    } else if ((state === 'done' || state === 'error') && latencyStart !== null) {
      setLatencyMs(Date.now() - latencyStart);
      setLatencyStart(null);
    }
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  const isOllama = config.provider === 'ollama';
  const canRun = !!image && !isOllama && config.apiKey !== '' && state !== 'running';

  const handleRun = () => {
    if (!image || !canRun) return;
    run(mode, config, { base64: image.base64, mime: image.mime });
  };

  const handleModeChange = (next: Mode) => {
    setMode(next);
    reset();
  };

  const locale = 'en'; // TODO: wire to LocaleProvider when i18n toggle is in scope

  return (
    <section
      id="demo"
      style={{
        padding: 'var(--pl-space-32, 128px) var(--pl-space-6, 24px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 48,
        color: 'var(--color-pl-fg-primary)',
      }}
    >
      {/* Section header */}
      <div style={{ textAlign: 'center', maxWidth: 640 }}>
        <p style={{
          fontSize: '0.8125rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--color-pl-fg-tertiary)',
          marginBottom: 12,
        }}>
          LIVE DEMO
        </p>
        <h2 style={{ fontSize: 'var(--text-pl-h1)', fontWeight: 700, margin: 0, lineHeight: 1.15 }}>
          Try it without installing.
        </h2>
      </div>

      {/* Demo card */}
      <div
        style={{
          width: '90vw',
          maxWidth: 1100,
          borderRadius: 'var(--pl-radius-xl)',
          // 1px gradient border via box-shadow + transparent background
          background: 'var(--color-pl-bg-elev-1)',
          boxShadow:
            '0 0 0 1px rgba(124,92,255,0.35), 0 0 0 1px rgba(0,225,255,0.15), var(--pl-shadow-card, 0 24px 48px -16px rgba(0,0,0,0.6))',
          overflow: 'hidden',
        }}
      >
        {/* Top bar: mode tabs + provider selector */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-pl-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          {/* Mode tabs */}
          <div style={{ display: 'flex', gap: 4, flex: 1 }}>
            {MODES.map((m) => {
              const active = m === mode;
              return (
                <button
                  key={m}
                  onClick={() => handleModeChange(m)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--pl-radius-md)',
                    border: active
                      ? '1px solid var(--color-pl-accent-from)'
                      : '1px solid transparent',
                    background: active
                      ? 'rgba(124,92,255,0.15)'
                      : 'transparent',
                    color: active
                      ? 'var(--color-pl-fg-primary)'
                      : 'var(--color-pl-fg-secondary)',
                    fontWeight: active ? 600 : 400,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'background 0.15s, border-color 0.15s, color 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                  aria-pressed={active}
                >
                  {MODE_META[m].displayName[locale]}
                </button>
              );
            })}
          </div>

          {/* Provider button */}
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open provider settings"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 'var(--pl-radius-md)',
              border: '1px solid var(--color-pl-border-default)',
              background: 'var(--color-pl-bg-elev-2)',
              color: 'var(--color-pl-fg-secondary)',
              fontSize: '0.8125rem',
              cursor: 'pointer',
              fontFamily: 'var(--pl-font-mono, monospace)',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ color: 'var(--color-pl-fg-primary)' }}>
              {PROVIDER_META[config.provider].label}
            </span>
            <span>·</span>
            <span>{config.model}</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>⚙</span>
          </button>
        </div>

        {/* Body: two-column layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 0,
            minHeight: 360,
          }}
        >
          {/* Left: dropzone + run */}
          <div
            style={{
              padding: 24,
              borderRight: '1px solid var(--color-pl-border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <ImageDropzone
              onImage={(img) => { setImage(img); setImageError(null); reset(); }}
              onError={(msg) => setImageError(msg)}
              disabled={state === 'running'}
              currentImage={image}
            />

            {imageError && (
              <div style={{ color: 'var(--color-pl-danger)', fontSize: '0.8125rem' }}>{imageError}</div>
            )}

            {/* Run / Abort button */}
            {state === 'running' ? (
              <button onClick={abort} style={abortBtnStyle}>
                Stop
              </button>
            ) : (
              <button
                onClick={handleRun}
                disabled={!canRun}
                title={
                  isOllama
                    ? 'Ollama cannot be used from a website — switch to OpenAI, Anthropic, or Gemini'
                    : !image
                    ? 'Drop or paste an image first'
                    : !config.apiKey
                    ? 'Enter your API key in provider settings'
                    : undefined
                }
                style={{
                  ...runBtnStyle,
                  opacity: canRun ? 1 : 0.45,
                  cursor: canRun ? 'pointer' : 'not-allowed',
                }}
              >
                Run →
              </button>
            )}
          </div>

          {/* Right: output */}
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {isOllama ? (
              <OllamaCTA />
            ) : (
              <PromptOutput
                state={state}
                text={result?.text ?? ''}
                error={error}
                onCopy={() => {}}
                latencyMs={latencyMs}
                provider={config.provider}
              />
            )}
          </div>
        </div>

        {/* Footer privacy note */}
        <div
          style={{
            padding: '12px 24px',
            borderTop: '1px solid var(--color-pl-border-subtle)',
            color: 'var(--color-pl-fg-disabled)',
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span>🔒</span>
          <span>Your API key never leaves your browser. We don't see your images.</span>
        </div>
      </div>

      {/* Provider drawer */}
      <ProviderForm
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        config={config}
        onChange={setConfig}
      />
    </section>
  );
}

// ---- style constants ----

const runBtnStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 0',
  borderRadius: 'var(--pl-radius-md)',
  border: 'none',
  background: 'linear-gradient(135deg, #7c5cff 0%, #00e1ff 100%)',
  color: '#fff',
  fontWeight: 700,
  fontSize: '1rem',
  letterSpacing: '0.02em',
  transition: 'opacity 0.15s, box-shadow 0.15s',
};

const abortBtnStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 0',
  borderRadius: 'var(--pl-radius-md)',
  border: '1px solid var(--color-pl-border-default)',
  background: 'var(--color-pl-bg-elev-2)',
  color: 'var(--color-pl-fg-secondary)',
  fontWeight: 500,
  fontSize: '1rem',
  cursor: 'pointer',
  transition: 'background 0.15s',
};
