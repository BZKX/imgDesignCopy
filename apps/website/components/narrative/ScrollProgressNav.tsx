'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollNarrative } from './ScrollNarrativeContext';
import { useLenis } from '@/components/scroll/LenisProvider';

const NAV_ITEMS = [
  { id: 'style-prompt',   labelKey: 'sections.stylePrompt.eyebrow' },
  { id: 'product-visual', labelKey: 'sections.productVisual.eyebrow' },
  { id: 'web-design',     labelKey: 'sections.webDesign.eyebrow' },
] as const;

function scrollToId(id: string, lenis: { scrollTo?: (target: string | HTMLElement | number, opts?: object) => void } | null) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis?.scrollTo) {
    lenis.scrollTo(el, { duration: 1.2 });
  } else {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

/**
 * Fixed right-side dot nav that tracks which narrative the user is in.
 * Visible only while narratives are in viewport (globalProgress 0–1 exclusive).
 * Hidden entirely on mobile (narratives are static cards there).
 */
export default function ScrollProgressNav() {
  const t = useTranslations();
  const { activeNarrativeId, globalProgress } = useScrollNarrative();
  const lenisRef = useLenis();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Visible when we're somewhere inside the narrative zone
  const visible = !isMobile && globalProgress > 0 && globalProgress < 1;

  return (
    <nav
      aria-label="Narrative sections"
      style={{
        position: 'fixed',
        right: '28px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 0.4s ease',
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = activeNarrativeId === item.id;
        const isHovered = hoveredId === item.id;
        const label = t(item.labelKey);

        return (
          <button
            key={item.id}
            aria-label={`Go to ${label}`}
            aria-current={isActive ? 'true' : undefined}
            onClick={() => scrollToId(item.id, lenisRef.current)}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 0',
              justifyContent: 'flex-end',
            }}
          >
            {/* Label — visible on hover (desktop) */}
            <span
              aria-hidden="true"
              style={{
                fontSize: '0.6875rem',
                fontFamily: 'var(--font-pl-mono)',
                color: isActive
                  ? 'var(--color-pl-accent-from)'
                  : 'var(--color-pl-fg-tertiary)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                opacity: isHovered ? 1 : 0,
                transform: isHovered ? 'translateX(0)' : 'translateX(6px)',
                transition: 'opacity 0.2s ease, transform 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </span>

            {/* Dot */}
            <span
              style={{
                display: 'block',
                width: isActive ? '10px' : '6px',
                height: isActive ? '10px' : '6px',
                borderRadius: '50%',
                background: isActive
                  ? 'var(--color-pl-accent-from, #7c5cff)'
                  : isHovered
                  ? 'var(--color-pl-fg-secondary)'
                  : 'var(--color-pl-fg-disabled, #44444c)',
                boxShadow: isActive
                  ? '0 0 8px 2px rgba(124,92,255,0.5)'
                  : 'none',
                transition: 'all 0.25s ease',
                flexShrink: 0,
              }}
            />
          </button>
        );
      })}

      <style>{`
        @media (max-width: 767px) {
          [aria-label="Narrative sections"] { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
