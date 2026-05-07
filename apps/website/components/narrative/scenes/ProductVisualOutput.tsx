'use client';

import type { OutputProps } from '../types';

const DIMENSIONS = [
  {
    key: 'CMF',
    value: 'Natural Walnut + Cream Bouclé',
    icon: '◑',
  },
  {
    key: 'Lighting',
    value: 'Soft diffused, 3-point studio',
    icon: '◉',
  },
  {
    key: 'Lens',
    value: '85mm f/2.8 portrait',
    icon: '◎',
  },
  {
    key: 'Composition',
    value: '45° angle, negative space',
    icon: '▦',
  },
  {
    key: 'Scene',
    value: 'Minimalist studio, warm neutral',
    icon: '▣',
  },
  {
    key: 'Mood',
    value: 'Premium, calm, aspirational',
    icon: '◇',
  },
];

export default function ProductVisualOutput({ visible, revealProgress }: OutputProps) {
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
          Visual Analysis
        </span>
        <span
          style={{
            fontSize: '0.625rem',
            color: 'rgba(0,225,255,0.7)',
            fontFamily: 'var(--font-pl-mono,monospace)',
          }}
        >
          6 dimensions
        </span>
      </div>

      {/* Dimension cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {DIMENSIONS.map(({ key, value, icon }) => (
          <div
            key={key}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              padding: '7px 9px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <span
              style={{
                fontSize: '0.875rem',
                opacity: 0.45,
                flexShrink: 0,
                lineHeight: 1.4,
              }}
            >
              {icon}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.5625rem',
                  fontFamily: 'var(--font-pl-mono,monospace)',
                  color: 'rgba(255,255,255,0.3)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '2px',
                }}
              >
                {key}
              </div>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'rgba(255,255,255,0.8)',
                  lineHeight: 1.35,
                }}
              >
                {value}
              </div>
            </div>
          </div>
        ))}
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
        Export JSON ↗
      </div>
    </div>
  );
}
