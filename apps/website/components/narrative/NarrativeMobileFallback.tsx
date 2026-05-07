'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import type { NarrativeConfig } from './types';

interface NarrativeMobileFallbackProps {
  config: NarrativeConfig;
}

interface PreviewSpec {
  src: string;
  aspectRatio: string;
  /** Selection rectangle in % of the image */
  selection: { top: number; left: number; width: number; height: number };
}

const PREVIEWS: Record<string, PreviewSpec> = {
  'style-prompt': {
    src: '/stage/style/09-street-neon-tokyo.webp',
    aspectRatio: '9 / 16',
    selection: { top: 6, left: 6, width: 88, height: 88 },
  },
  'product-visual': {
    src: '/stage/product/chair.webp',
    aspectRatio: '1 / 1',
    selection: { top: 8, left: 10, width: 80, height: 84 },
  },
  'web-design': {
    src: '/stage/webpage/dashboard-mock.webp',
    aspectRatio: '16 / 10',
    selection: { top: 8, left: 6, width: 88, height: 84 },
  },
};

/**
 * Map narrative config id ('style-prompt') to its i18n key segment ('stylePrompt').
 */
function getModeKey(id: string): 'stylePrompt' | 'productVisual' | 'webDesign' {
  if (id === 'product-visual') return 'productVisual';
  if (id === 'web-design') return 'webDesign';
  return 'stylePrompt';
}

/** Static "before" frame: a hero image with a glowing selection rectangle. */
function PreviewFrame({ spec }: { spec: PreviewSpec }) {
  const { src, aspectRatio, selection } = spec;
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio,
        borderRadius: '14px',
        overflow: 'hidden',
        background: 'var(--color-pl-bg-elev-1)',
        border: '1px solid var(--pl-border-subtle)',
        boxShadow: 'var(--pl-shadow-card)',
      }}
    >
      <Image
        src={src}
        alt=""
        aria-hidden="true"
        fill
        sizes="(max-width: 480px) 100vw, 480px"
        style={{ objectFit: 'cover' }}
      />
      {/* Subtle dim overlay outside selection for emphasis */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.32)',
          pointerEvents: 'none',
        }}
      />
      {/* Selection rectangle: clear window cut from the dim overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: `${selection.top}%`,
          left: `${selection.left}%`,
          width: `${selection.width}%`,
          height: `${selection.height}%`,
          borderRadius: '8px',
          border: '2px solid rgba(124,92,255,0.9)',
          boxShadow:
            '0 0 0 9999px rgba(0,0,0,0.4), 0 0 24px rgba(124,92,255,0.45) inset, 0 0 18px rgba(124,92,255,0.55)',
          pointerEvents: 'none',
        }}
      />
      {/* Corner ticks for selection */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: `calc(${selection.top}% - 1px)`,
          left: `calc(${selection.left}% - 1px)`,
          width: '14px',
          height: '14px',
          borderTop: '2px solid #7c5cff',
          borderLeft: '2px solid #7c5cff',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: `calc(${selection.top}% - 1px)`,
          left: `calc(${selection.left + selection.width}% - 13px)`,
          width: '14px',
          height: '14px',
          borderTop: '2px solid #7c5cff',
          borderRight: '2px solid #7c5cff',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: `calc(${selection.top + selection.height}% - 13px)`,
          left: `calc(${selection.left}% - 1px)`,
          width: '14px',
          height: '14px',
          borderBottom: '2px solid #7c5cff',
          borderLeft: '2px solid #7c5cff',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: `calc(${selection.top + selection.height}% - 13px)`,
          left: `calc(${selection.left + selection.width}% - 13px)`,
          width: '14px',
          height: '14px',
          borderBottom: '2px solid #7c5cff',
          borderRight: '2px solid #7c5cff',
          pointerEvents: 'none',
        }}
      />
      {/* Top-left badge */}
      <span
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          fontSize: '0.6875rem',
          fontFamily: 'var(--font-pl-mono)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          padding: '4px 10px',
          borderRadius: '999px',
          background: 'rgba(10,10,16,0.8)',
          backdropFilter: 'blur(8px)',
          color: 'var(--color-pl-fg-secondary)',
          border: '1px solid var(--pl-border-subtle)',
        }}
      >
        ◇ PromptLens
      </span>
    </div>
  );
}

/** Vertical connector with a label pill, used between storyboard frames. */
function ConnectorPill({ label }: { label: string }) {
  return (
    <div
      aria-hidden="true"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 0',
      }}
    >
      <div
        style={{
          width: '1px',
          height: '20px',
          background:
            'linear-gradient(to bottom, transparent, rgba(124,92,255,0.6))',
        }}
      />
      <span
        style={{
          fontSize: '0.6875rem',
          fontFamily: 'var(--font-pl-mono)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          padding: '4px 12px',
          borderRadius: '999px',
          background: 'var(--pl-grad-brand-soft)',
          border: '1px solid rgba(124,92,255,0.3)',
          color: 'var(--color-pl-accent-from)',
        }}
      >
        {label}
      </span>
      <div
        style={{
          width: '1px',
          height: '20px',
          background:
            'linear-gradient(to top, transparent, rgba(124,92,255,0.6))',
        }}
      />
    </div>
  );
}

/**
 * Static storyboard rendered for viewports <768px and prefers-reduced-motion.
 * Three vertically stacked frames mirror the desktop narrative arc:
 *   1. Hero image with selection rectangle (the "before")
 *   2. AI processing pill (the "transform")
 *   3. Output card (the "after")
 * Followed by 3 capability bullets pulled from existing i18n.
 */
export default function NarrativeMobileFallback({ config }: NarrativeMobileFallbackProps) {
  const t = useTranslations();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const preview = PREVIEWS[config.id];
  const OutputComponent = config.outputComponent;
  const modeKey = getModeKey(config.id);

  // Bullets: pick the most "promise-like" stages (3, 5, 7) to summarize the mode
  const bulletKeys = [`sections.${modeKey}.stage3`, `sections.${modeKey}.stage5`, `sections.${modeKey}.stage7`] as const;

  return (
    <section
      id={config.id}
      aria-label={t(config.eyebrowKey)}
      style={{
        padding: '72px 20px',
        position: 'relative',
      }}
    >
      <div
        ref={ref}
        style={{
          maxWidth: '480px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      >
        {/* Eyebrow */}
        <p
          style={{
            fontSize: '0.6875rem',
            fontFamily: 'var(--font-pl-mono)',
            color: 'var(--color-pl-accent-from)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            margin: 0,
          }}
        >
          {t(config.eyebrowKey)}
        </p>

        {/* Title */}
        <h2
          style={{
            fontSize: 'clamp(1.625rem, 6vw, 2.25rem)',
            fontWeight: 700,
            color: 'var(--color-pl-fg-primary)',
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
            margin: 0,
          }}
        >
          {t(config.titleKey)}
        </h2>

        {/* ── Storyboard frames ─────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            gap: '0',
            marginTop: '12px',
          }}
        >
          {/* Frame 1: page preview with selection */}
          {preview && <PreviewFrame spec={preview} />}

          {/* Connector */}
          <ConnectorPill label="◎ AI" />

          {/* Frame 2: output card */}
          <div
            style={{
              background: 'var(--color-pl-bg-elev-1)',
              borderRadius: '14px',
              border: '1px solid var(--pl-border-default)',
              padding: '20px',
              boxShadow: 'var(--pl-shadow-card)',
              overflow: 'hidden',
            }}
          >
            <OutputComponent visible revealProgress={1} />
          </div>
        </div>

        {/* Capability bullets */}
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: '12px 0 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {bulletKeys.map((key) => (
            <li
              key={key}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                fontSize: '0.9375rem',
                color: 'var(--color-pl-fg-secondary)',
                lineHeight: 1.5,
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  flexShrink: 0,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: 'var(--pl-grad-brand-soft)',
                  border: '1px solid rgba(124,92,255,0.3)',
                  color: 'var(--color-pl-accent-from)',
                  fontSize: '0.6875rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '2px',
                }}
              >
                ✓
              </span>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {t(key as any)}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
