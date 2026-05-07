'use client';

import type { OutputProps } from '../types';

const COLOR_TOKENS = [
  { name: '--color-primary', hex: '#7c5cff' },
  { name: '--color-accent', hex: '#00e1ff' },
  { name: '--color-bg-base', hex: '#07070a' },
  { name: '--color-surface', hex: '#0d0d12' },
];

const SPACING = ['4', '8', '12', '16', '24', '32', '48'];

const RADIUS_TOKENS = [
  { name: 'sm', px: '4px' },
  { name: 'md', px: '8px' },
  { name: 'lg', px: '12px' },
  { name: 'xl', px: '20px' },
];

export default function WebDesignOutput({ visible, revealProgress }: OutputProps) {
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
          marginBottom: '14px',
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
          Design Tokens
        </span>
        <span
          style={{
            fontSize: '0.625rem',
            color: 'rgba(0,225,255,0.7)',
            fontFamily: 'var(--font-pl-mono,monospace)',
          }}
        >
          DTCG
        </span>
      </div>

      {/* Colors */}
      <div style={{ marginBottom: '12px' }}>
        <p
          style={{
            fontSize: '0.5625rem',
            fontFamily: 'var(--font-pl-mono,monospace)',
            color: 'rgba(255,255,255,0.3)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            margin: '0 0 6px',
          }}
        >
          Color
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {COLOR_TOKENS.map(({ name, hex }) => (
            <div
              key={name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 6px',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '6px',
              }}
            >
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '4px',
                  background: hex,
                  flexShrink: 0,
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              />
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontFamily: 'var(--font-pl-mono,monospace)',
                  color: 'rgba(255,255,255,0.6)',
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {name}
              </span>
              <span
                style={{
                  fontSize: '0.625rem',
                  fontFamily: 'var(--font-pl-mono,monospace)',
                  color: 'rgba(255,255,255,0.25)',
                  flexShrink: 0,
                }}
              >
                {hex}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Border radius */}
      <div style={{ marginBottom: '12px' }}>
        <p
          style={{
            fontSize: '0.5625rem',
            fontFamily: 'var(--font-pl-mono,monospace)',
            color: 'rgba(255,255,255,0.3)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            margin: '0 0 6px',
          }}
        >
          Radius
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          {RADIUS_TOKENS.map(({ name, px }) => (
            <div key={name} style={{ flex: 1, textAlign: 'center' }}>
              <div
                style={{
                  height: '28px',
                  background: 'rgba(124,92,255,0.15)',
                  borderRadius: px,
                  border: '1px solid rgba(124,92,255,0.25)',
                  marginBottom: '4px',
                }}
              />
              <span
                style={{
                  fontSize: '0.5625rem',
                  fontFamily: 'var(--font-pl-mono,monospace)',
                  color: 'rgba(255,255,255,0.3)',
                }}
              >
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Spacing scale */}
      <div>
        <p
          style={{
            fontSize: '0.5625rem',
            fontFamily: 'var(--font-pl-mono,monospace)',
            color: 'rgba(255,255,255,0.3)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            margin: '0 0 6px',
          }}
        >
          Spacing
        </p>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end' }}>
          {SPACING.map((val) => {
            const size = Math.min(32, parseInt(val) * 0.65 + 6);
            return (
              <div
                key={val}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <div
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    background: 'rgba(124,92,255,0.22)',
                    borderRadius: '3px',
                    border: '1px solid rgba(124,92,255,0.28)',
                  }}
                />
                <span
                  style={{
                    fontSize: '0.5rem',
                    fontFamily: 'var(--font-pl-mono,monospace)',
                    color: 'rgba(255,255,255,0.2)',
                  }}
                >
                  {val}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Export CTA */}
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
        Export DTCG JSON ↗
      </div>
    </div>
  );
}
