'use client';

import type { OutputProps } from '../types';

const SAMPLE_PROMPT =
  'A cinematic desert landscape at golden hour, vast sand dunes extending to the horizon. Shot from a low wide angle. Deep amber and orange palette with cosmic purple shadows. Film grain, anamorphic lens flares, Kodak Portra 400 emulation. Style of Roger Deakins. 8K, ultra-detailed.';

const STYLE_TOKENS = [
  { key: 'Color palette', value: 'Amber + cosmic purple' },
  { key: 'Lighting', value: 'Golden hour, god rays' },
  { key: 'Lens', value: 'Wide angle, anamorphic' },
  { key: 'Film stock', value: 'Kodak Portra 400' },
  { key: 'Mood', value: 'Epic, cinematic, vast' },
];

export default function StylePromptOutput({ visible, revealProgress }: OutputProps) {
  const p = visible ? revealProgress : 0;

  return (
    <div
      style={{
        opacity: p,
        transform: `scale(${0.9 + 0.1 * p}) translateY(${(1 - p) * 16}px)`,
        background: 'rgba(10,10,16,0.97)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(124,92,255,0.25)',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,92,255,0.08)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
        }}
      >
        <span
          style={{
            fontSize: '0.625rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#7c5cff',
            fontFamily: 'var(--font-pl-mono,monospace)',
          }}
        >
          Generated Prompt
        </span>
        <span
          style={{
            fontSize: '0.625rem',
            color: 'rgba(0,225,255,0.7)',
            fontFamily: 'var(--font-pl-mono,monospace)',
          }}
        >
          ◈ Ready
        </span>
      </div>

      {/* Prompt text */}
      <div
        style={{
          fontSize: '0.75rem',
          fontFamily: 'var(--font-pl-mono,monospace)',
          color: 'rgba(255,255,255,0.7)',
          lineHeight: 1.65,
          marginBottom: '14px',
          display: '-webkit-box',
          WebkitLineClamp: 4,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {SAMPLE_PROMPT}
      </div>

      {/* Style token breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {STYLE_TOKENS.map(({ key, value }) => (
          <div
            key={key}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '5px 8px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <span
              style={{
                fontSize: '0.6875rem',
                fontFamily: 'var(--font-pl-mono,monospace)',
                color: 'rgba(255,255,255,0.3)',
              }}
            >
              {key}
            </span>
            <span style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.75)' }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Copy CTA */}
      <div
        style={{
          marginTop: '14px',
          padding: '8px 12px',
          background: 'rgba(124,92,255,0.12)',
          borderRadius: '8px',
          border: '1px solid rgba(124,92,255,0.22)',
          fontSize: '0.8125rem',
          fontWeight: 500,
          color: 'rgba(196,181,253,0.9)',
          textAlign: 'center',
          cursor: 'pointer',
        }}
      >
        Copy Prompt ↗
      </div>
    </div>
  );
}
