'use client';

import { useEffect, useRef, useState } from 'react';
import type { DemoError, DemoState } from './useDemoRunner';

interface Props {
  state: DemoState;
  text: string;
  error: DemoError | null;
  onCopy: () => void;
  latencyMs?: number;
  provider?: string;
}

const CHARS_PER_FRAME = 3;

export default function PromptOutput({ state, text, error, onCopy, latencyMs, provider }: Props) {
  const [displayed, setDisplayed] = useState('');
  const [copied, setCopied] = useState(false);
  const rafRef = useRef<number>(0);
  const indexRef = useRef(0);

  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    if (state !== 'done') {
      setDisplayed('');
      indexRef.current = 0;
      return;
    }

    if (prefersReducedMotion) {
      setDisplayed(text);
      return;
    }

    indexRef.current = 0;
    const tick = () => {
      indexRef.current = Math.min(indexRef.current + CHARS_PER_FRAME, text.length);
      setDisplayed(text.slice(0, indexRef.current));
      if (indexRef.current < text.length) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [state, text, prefersReducedMotion]);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      onCopy();
      setTimeout(() => setCopied(false), 1500);
    });
  };

  // ---- idle placeholder ----
  if (state === 'idle') {
    return (
      <div
        style={{
          borderRadius: 'var(--pl-radius-lg)',
          border: '1px solid var(--color-pl-border-subtle)',
          background: 'var(--color-pl-bg-elev-2)',
          minHeight: 200,
          padding: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-pl-fg-disabled)',
          fontSize: '0.9375rem',
        }}
      >
        Your prompt will appear here…
      </div>
    );
  }

  // ---- running ----
  if (state === 'running') {
    return (
      <div
        style={{
          borderRadius: 'var(--pl-radius-lg)',
          border: '1px solid var(--color-pl-border-subtle)',
          background: 'var(--color-pl-bg-elev-2)',
          minHeight: 200,
          padding: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Progress shimmer */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: 'var(--pl-grad-brand)',
            animation: 'pl-progress-scan 1.4s ease-in-out infinite',
            transformOrigin: 'left center',
          }}
        />
        <span style={{ color: 'var(--color-pl-fg-tertiary)', fontSize: '0.9375rem' }}>Generating…</span>
        <style>{`
          @keyframes pl-progress-scan {
            0%   { transform: scaleX(0); transform-origin: left center; }
            50%  { transform: scaleX(1); transform-origin: left center; }
            50.1%{ transform: scaleX(1); transform-origin: right center; }
            100% { transform: scaleX(0); transform-origin: right center; }
          }
        `}</style>
      </div>
    );
  }

  // ---- error ----
  if (state === 'error' && error) {
    return (
      <div
        style={{
          borderRadius: 'var(--pl-radius-lg)',
          border: '1px solid var(--color-pl-danger)',
          background: 'rgba(255,92,124,0.06)',
          minHeight: 160,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ color: 'var(--color-pl-danger)', fontWeight: 600, fontSize: '0.9375rem' }}>
          {errorTitle(error.errorClass)}
        </div>
        <div style={{ color: 'var(--color-pl-fg-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
          {error.message}
        </div>
        {error.hint && (
          <div style={{ color: 'var(--color-pl-fg-tertiary)', fontSize: '0.8125rem' }}>
            💡 {error.hint}
          </div>
        )}
        {error.errorClass === 'auth' && (
          <button
            onClick={() => {/* open provider drawer */}}
            style={actionBtn}
          >
            Check API Key →
          </button>
        )}
      </div>
    );
  }

  // ---- done ----
  return (
    <div
      style={{
        borderRadius: 'var(--pl-radius-lg)',
        border: '1px solid var(--color-pl-border-default)',
        background: 'var(--color-pl-bg-elev-2)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Text area */}
      <div
        style={{
          padding: 24,
          fontFamily: 'var(--pl-font-mono, monospace)',
          fontSize: '0.875rem',
          lineHeight: 1.7,
          color: 'var(--color-pl-fg-primary)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          minHeight: 160,
          flex: 1,
        }}
      >
        {displayed}
        {displayed.length < text.length && (
          <span
            style={{
              display: 'inline-block',
              width: 2,
              height: '1em',
              background: 'var(--color-pl-accent-from)',
              marginLeft: 2,
              verticalAlign: 'text-bottom',
              animation: 'pl-blink 1s step-end infinite',
            }}
          />
        )}
        <style>{`
          @keyframes pl-blink { 0%,100%{opacity:1} 50%{opacity:0} }
        `}</style>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '10px 16px',
          borderTop: '1px solid var(--color-pl-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        {latencyMs !== undefined && (
          <span style={{ color: 'var(--color-pl-fg-tertiary)', fontSize: '0.8125rem', fontFamily: 'var(--pl-font-mono, monospace)' }}>
            {(latencyMs / 1000).toFixed(1)}s · {provider ?? ''}
          </span>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button onClick={handleCopy} style={actionBtn}>
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
}

function errorTitle(cls: string): string {
  switch (cls) {
    case 'auth': return 'Authentication Failed';
    case 'rate_limit': return 'Rate Limited';
    case 'cors': return 'Browser Access Blocked (CORS)';
    case 'schema': return 'Unexpected Response Format';
    case 'network': return 'Network Error';
    case 'timeout': return 'Request Timed Out';
    default: return 'Something Went Wrong';
  }
}

const actionBtn: React.CSSProperties = {
  padding: '6px 14px',
  borderRadius: 'var(--pl-radius-md)',
  border: '1px solid var(--color-pl-border-default)',
  background: 'var(--color-pl-bg-elev-1)',
  color: 'var(--color-pl-fg-primary)',
  fontSize: '0.8125rem',
  cursor: 'pointer',
  fontWeight: 500,
  transition: 'border-color 0.15s, background 0.15s',
};
