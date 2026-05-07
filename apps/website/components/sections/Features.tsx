'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
  tags: readonly string[];
}

const FEATURE_DEFS = [
  { id: 'multi-provider', icon: '⬡', titleKey: 'multiProvider.title', descKey: 'multiProvider.description', tags: ['OpenAI', 'Anthropic', 'Gemini', 'Ollama'] as const },
  { id: 'analysis-modes', icon: '◉', titleKey: 'analysisModes.title', descKey: 'analysisModes.description', tags: ['Style Prompt', 'Product Visual', 'Web Design'] as const },
  { id: 'dtcg-tokens', icon: '◈', titleKey: 'dtcgTokens.title', descKey: 'dtcgTokens.description', tags: ['DTCG', 'Standards-compliant'] as const },
  { id: 'shortcuts', icon: '⌘', titleKey: 'shortcuts.title', descKey: 'shortcuts.description', tags: ['⌘⇧Y', 'Global hotkey'] as const },
  { id: 'privacy', icon: '◎', titleKey: 'privacy.title', descKey: 'privacy.description', tags: ['No logs', 'No proxy', 'Local-first'] as const },
  { id: 'export', icon: '↗', titleKey: 'export.title', descKey: 'export.description', tags: ['JSON', 'Markdown', 'Clipboard'] as const },
];

interface TiltState {
  x: number;
  y: number;
}

function FeatureCard({
  feature,
  index,
  focused,
  onFocus,
}: {
  feature: Feature;
  index: number;
  focused: boolean;
  onFocus: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<TiltState>({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reducedMotion || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      setTilt({ x: -dy * 8, y: dx * 8 });
    },
    [reducedMotion],
  );

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
    setHovered(false);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setHovered(true);
  }, []);

  return (
    <div
      role="article"
      tabIndex={0}
      aria-label={feature.title}
      onFocus={onFocus}
      style={{
        outline: focused ? '2px solid var(--color-pl-accent-from)' : 'none',
        outlineOffset: '3px',
        borderRadius: '12px',
        flexShrink: 0,
        scrollSnapAlign: 'start',
      }}
    >
      {/* Rotating gradient border wrapper */}
      <div
        style={{
          position: 'relative',
          borderRadius: '13px',
          padding: '1px',
          overflow: 'hidden',
          width: '300px',
          height: '380px',
        }}
      >
        {/* Spinning gradient layer (shows on hover) */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: '-50%',
            background: hovered
              ? 'conic-gradient(from 0deg, #7c5cff, #00e1ff, #7c5cff, #00e1ff, #7c5cff)'
              : 'transparent',
            animation: hovered && !reducedMotion ? 'pl-border-spin 3s linear infinite' : 'none',
            transition: 'opacity 0.3s ease',
            opacity: hovered ? 1 : 0,
          }}
        />
        {/* Static subtle border (not hovered) */}
        {!hovered && (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '13px',
              border: '1px solid var(--pl-border-subtle)',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Card inner */}
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            position: 'relative',
            zIndex: 1,
            height: '100%',
            borderRadius: '12px',
            background: 'var(--color-pl-bg-elev-1)',
            padding: '32px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            cursor: 'default',
            transform: reducedMotion
              ? 'none'
              : `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: hovered
              ? 'transform 80ms linear'
              : 'transform 400ms var(--pl-ease-out)',
            boxShadow: hovered ? 'var(--pl-shadow-card)' : 'none',
          }}
        >
          {/* Icon */}
          <div
            aria-hidden="true"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '10px',
              background: 'var(--pl-grad-brand-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              border: '1px solid var(--pl-border-default)',
            }}
          >
            {feature.icon}
          </div>

          {/* Title */}
          <h3
            style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: 'var(--color-pl-fg-primary)',
              lineHeight: 1.3,
              margin: 0,
            }}
          >
            {feature.title}
          </h3>

          {/* Description */}
          <p
            style={{
              fontSize: '0.9375rem',
              color: 'var(--color-pl-fg-secondary)',
              lineHeight: 1.6,
              margin: 0,
              flex: 1,
            }}
          >
            {feature.description}
          </p>

          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {feature.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-pl-mono)',
                  color: 'var(--color-pl-fg-tertiary)',
                  background: 'var(--color-pl-bg-elev-2)',
                  border: '1px solid var(--pl-border-subtle)',
                  borderRadius: '999px',
                  padding: '3px 10px',
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Index number */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '28px',
              right: '24px',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-pl-mono)',
              color: 'var(--color-pl-fg-disabled)',
            }}
          >
            {String(index + 1).padStart(2, '0')}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Features() {
  const t = useTranslations('sections.features');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const features: Feature[] = FEATURE_DEFS.map((def) => ({
    id: def.id,
    icon: def.icon,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    title: t(def.titleKey as any),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    description: t(def.descKey as any),
    tags: def.tags,
  }));

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    return () => el.removeEventListener('scroll', updateScrollState);
  }, [updateScrollState]);

  const scroll = useCallback((dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setFocusedIndex((i) => Math.min(i + 1, features.length - 1));
        scroll('right');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setFocusedIndex((i) => Math.max(i - 1, 0));
        scroll('left');
      }
    },
    [scroll, features.length],
  );

  return (
    <section
      id="features"
      aria-label="Features"
      style={{
        paddingBlock: 'clamp(80px, 12vw, 128px)',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Header */}
      <div
        className="pl-features-header"
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 clamp(20px, 7vw, 96px)',
          marginBottom: 'clamp(40px, 8vw, 64px)',
        }}
      >
        <p
          style={{
            fontSize: '0.875rem',
            fontFamily: 'var(--font-pl-mono)',
            color: 'var(--color-pl-fg-tertiary)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            margin: '0 0 12px',
          }}
        >
          {t('eyebrow')}
        </p>
        <h2
          style={{
            fontSize: 'clamp(2rem, 4vw, 3.5rem)',
            fontWeight: 700,
            color: 'var(--color-pl-fg-primary)',
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          {t('title')}
        </h2>
      </div>

      {/* Scroll container */}
      <div style={{ position: 'relative' }}>
        {/* Left fade */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '96px',
            background: 'linear-gradient(to right, var(--color-pl-bg-base), transparent)',
            zIndex: 2,
            pointerEvents: 'none',
            opacity: canScrollLeft ? 1 : 0,
            transition: 'opacity 0.3s',
          }}
        />
        {/* Right fade */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '96px',
            background: 'linear-gradient(to left, var(--color-pl-bg-base), transparent)',
            zIndex: 2,
            pointerEvents: 'none',
            opacity: canScrollRight ? 1 : 0,
            transition: 'opacity 0.3s',
          }}
        />

        <div
          ref={scrollRef}
          onKeyDown={handleKeyDown}
          role="list"
          style={{
            display: 'flex',
            gap: '20px',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            scrollPaddingLeft: 'max(20px, calc((100vw - 1240px) / 2))',
            paddingLeft: 'max(20px, calc((100vw - 1240px) / 2))',
            paddingRight: 'max(20px, calc((100vw - 1240px) / 2))',
            paddingBottom: '24px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              index={index}
              focused={focusedIndex === index}
              onFocus={() => setFocusedIndex(index)}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div
        style={{
          maxWidth: '1280px',
          margin: '32px auto 0',
          padding: '0 clamp(20px, 7vw, 96px)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <button
          aria-label="Scroll left"
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: '1px solid var(--pl-border-default)',
            background: 'var(--color-pl-bg-elev-1)',
            color: canScrollLeft
              ? 'var(--color-pl-fg-secondary)'
              : 'var(--color-pl-fg-disabled)',
            cursor: canScrollLeft ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all var(--pl-dur-quick)',
            fontSize: '1rem',
          }}
        >
          ‹
        </button>
        <button
          aria-label="Scroll right"
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: '1px solid var(--pl-border-default)',
            background: 'var(--color-pl-bg-elev-1)',
            color: canScrollRight
              ? 'var(--color-pl-fg-secondary)'
              : 'var(--color-pl-fg-disabled)',
            cursor: canScrollRight ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all var(--pl-dur-quick)',
            fontSize: '1rem',
          }}
        >
          ›
        </button>

        <span
          aria-live="polite"
          style={{
            fontSize: '0.8125rem',
            fontFamily: 'var(--font-pl-mono)',
            color: 'var(--color-pl-fg-tertiary)',
            marginLeft: '4px',
          }}
        >
          {features.length} {t('eyebrow').toLowerCase()}
        </span>
      </div>

      <style>{`
        @keyframes pl-border-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        [role="list"]::-webkit-scrollbar { display: none; }

        /* Tighten cards on small viewports so they don't feel cramped */
        @media (max-width: 480px) {
          #features div[role="article"] > div {
            width: 280px !important;
            height: 360px !important;
          }
        }
      `}</style>
    </section>
  );
}
