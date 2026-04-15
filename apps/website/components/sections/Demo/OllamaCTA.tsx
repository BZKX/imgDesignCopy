'use client';

/**
 * Shown when provider === 'ollama' (browserCapability.cors === 'same-origin-only').
 * Per §3.4: renders the "use extension / desktop app" CTA + placeholder for
 * 15s screen recording. NOT a disabled greyed select.
 */
export default function OllamaCTA() {
  return (
    <div
      style={{
        borderRadius: 'var(--pl-radius-xl)',
        border: '1px solid var(--color-pl-border-default)',
        background: 'var(--color-pl-bg-elev-1)',
        padding: 32,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '1.5rem' }}>🦙</div>
      <div>
        <div style={{ color: 'var(--color-pl-fg-primary)', fontWeight: 600, fontSize: '1.0625rem', marginBottom: 8 }}>
          Ollama runs locally — your browser can&apos;t reach it from this site.
        </div>
        <div style={{ color: 'var(--color-pl-fg-secondary)', fontSize: '0.9375rem', lineHeight: 1.6, maxWidth: 480 }}>
          Use the desktop app or Chrome extension to keep everything fully offline and private.
        </div>
      </div>

      {/* Placeholder for 15s screen recording */}
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          aspectRatio: '16/9',
          borderRadius: 'var(--pl-radius-lg)',
          background: 'var(--color-pl-bg-elev-2)',
          border: '1px solid var(--color-pl-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-pl-fg-disabled)',
          fontSize: '0.875rem',
          gap: 10,
          cursor: 'not-allowed',
        }}
      >
        <span style={{ fontSize: '1.5rem' }}>▶</span>
        <span>Demo: Ollama + PromptLens Desktop (15s)</span>
        {/* TODO: Replace with actual <video> or embedded recording once available */}
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <a
          href="https://github.com/promptlens/promptlens/releases"
          target="_blank"
          rel="noreferrer"
          style={{
            padding: '10px 20px',
            borderRadius: 'var(--pl-radius-md)',
            background: 'var(--pl-grad-brand)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.9375rem',
            textDecoration: 'none',
          }}
        >
          Get the desktop app ↗
        </a>
        <a
          href="https://chromewebstore.google.com"
          target="_blank"
          rel="noreferrer"
          style={{
            padding: '10px 20px',
            borderRadius: 'var(--pl-radius-md)',
            border: '1px solid var(--color-pl-border-default)',
            background: 'var(--color-pl-bg-elev-2)',
            color: 'var(--color-pl-fg-primary)',
            fontWeight: 500,
            fontSize: '0.9375rem',
            textDecoration: 'none',
          }}
        >
          Add to Chrome ↗
        </a>
      </div>
    </div>
  );
}
