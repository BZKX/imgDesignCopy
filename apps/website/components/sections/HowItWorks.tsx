'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useHeavyMotion } from '@/lib/capability';
import type { HowItWorksSceneProps } from '@/components/three/HowItWorksScene';

// Lazy-load the entire R3F scene — three.js must NOT enter the initial bundle
const HowItWorksScene = dynamic<HowItWorksSceneProps>(
  () => import('@/components/three/HowItWorksScene'),
  {
    ssr: false,
    loading: () => <ScenePoster />,
  },
);

function ScenePoster() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'var(--color-pl-bg-elev-1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/posters/how-it-works.svg"
        alt="How PromptLens works — interactive scene loading"
        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.75 }}
      />
    </div>
  );
}

const STEPS = [
  {
    num: '01',
    titleKey: 'step1Title' as const,
    desc: 'Drag to select any region on a webpage or screen.',
  },
  {
    num: '02',
    titleKey: 'step2Title' as const,
    desc: 'Multi-modal vision model reads composition, palette, typography, and mood.',
  },
  {
    num: '03',
    titleKey: 'step3Title' as const,
    desc: 'Get a structured prompt ready for MidJourney, SDXL, or your own model.',
  },
] as const;

export default function HowItWorks() {
  const t = useTranslations('sections.howItWorks');
  const canMount = useHeavyMotion();

  const sectionRef        = useRef<HTMLDivElement>(null);
  const scrollProgressRef = useRef(0);
  const [sceneMounted, setSceneMounted] = useState(false);

  // IntersectionObserver: lazy-mount 200 px before section enters viewport;
  // tear down after section has scrolled fully past.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !canMount) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          setSceneMounted(true);
        } else if (entry.boundingClientRect.bottom < 0) {
          // Section fully scrolled past — release WebGL context
          setSceneMounted(false);
        }
      },
      { rootMargin: '200px 0px' },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [canMount]);

  // Track scroll progress through this section (0 → 1)
  useEffect(() => {
    if (!sceneMounted) return;

    const onScroll = () => {
      const section = sectionRef.current;
      if (!section) return;
      const rect        = section.getBoundingClientRect();
      const totalScroll = rect.height - window.innerHeight;
      if (totalScroll <= 0) {
        scrollProgressRef.current = 0;
        return;
      }
      scrollProgressRef.current = Math.max(0, Math.min(1, -rect.top / totalScroll));
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // sync immediately
    return () => window.removeEventListener('scroll', onScroll);
  }, [sceneMounted]);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      style={{ minHeight: '300vh', position: 'relative' }}
    >
      {/* Sticky two-column layout — left: steps, right: canvas */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 32,
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 96px',
          alignItems: 'center',
          boxSizing: 'border-box',
        }}
      >
        {/* ── Left: step list ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
          <div>
            <p
              style={{
                fontSize: 'var(--text-pl-caption)',
                color: 'var(--color-pl-fg-tertiary)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
                margin: '0 0 0.5rem',
              }}
            >
              {t('eyebrow')}
            </p>
            <h2
              style={{
                fontSize: 'var(--text-pl-h1)',
                fontWeight: 700,
                color: 'var(--color-pl-fg-primary)',
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              {t('title')}
            </h2>
          </div>

          {STEPS.map((step) => (
            <div key={step.num} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span
                  style={{
                    fontSize: 'var(--text-pl-caption)',
                    fontFamily: 'var(--font-pl-mono)',
                    color: 'var(--color-pl-accent-from)',
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                  }}
                >
                  {step.num}
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background: 'var(--pl-border-subtle)',
                  }}
                />
              </div>
              <h3
                style={{
                  fontSize: 'var(--text-pl-h3)',
                  fontWeight: 600,
                  color: 'var(--color-pl-fg-primary)',
                  margin: 0,
                }}
              >
                {t(step.titleKey)}
              </h3>
              <p
                style={{
                  fontSize: 'var(--text-pl-body)',
                  color: 'var(--color-pl-fg-secondary)',
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* ── Right: R3F canvas or static poster ──────────────────────── */}
        <div
          style={{
            height: '62vh',
            borderRadius: 'var(--radius-pl-xl)',
            overflow: 'hidden',
            background: 'var(--color-pl-bg-elev-1)',
            border: '1px solid var(--pl-border-subtle)',
            position: 'relative',
          }}
        >
          {sceneMounted ? (
            <HowItWorksScene scrollProgress={scrollProgressRef} />
          ) : (
            <ScenePoster />
          )}
        </div>
      </div>
    </section>
  );
}
