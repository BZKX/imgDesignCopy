'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';

const CARDS = [
  {
    stat: '12 min',
    label: 'writing a single prompt',
    problem: "You spent 12 minutes writing. The AI still doesn't understand the reference.",
  },
  {
    stat: '3 tries',
    label: 'to regenerate and fix',
    problem: 'Three generations later, still the wrong mood, wrong palette, wrong vibe.',
  },
  {
    stat: '???',
    label: 'result you actually want',
    problem: "There's no structured language to describe exactly what you see.",
  },
] as const;

export default function Problem() {
  const t = useTranslations('sections.problem');
  const contentRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let mounted = true;
    let stCleanup: (() => void) | null = null;

    void (async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      if (!mounted) return;

      gsap.registerPlugin(ScrollTrigger);

      const [leftCard, midCard, rightCard] = cardRefs.current;
      if (!leftCard || !midCard || !rightCard) return;

      const tl = gsap.timeline();

      // Phase 1 (0 → 50%): fan cards out from stacked position
      tl.to(leftCard,  { x: -260, rotate: -8, duration: 0.5, ease: 'none' }, 0)
        .to(rightCard, { x: 260,  rotate: 8,  duration: 0.5, ease: 'none' }, 0)
        .to(midCard,   { y: -20,              duration: 0.5, ease: 'none' }, 0);

      // Phase 2 (50 → 100%): danger underlines write in, problem text fades up
      const underlines = content.querySelectorAll<HTMLElement>('.problem-underline');
      const texts      = content.querySelectorAll<HTMLElement>('.problem-text');

      tl.to(underlines, { scaleX: 1, duration: 0.5, stagger: 0.12, ease: 'none' }, 0.5)
        .to(texts,      { opacity: 1, y: 0, duration: 0.4, stagger: 0.12, ease: 'none' }, 0.55);

      const st = ScrollTrigger.create({
        trigger: content,
        start: 'top top',
        end: '+=150%',
        pin: true,
        pinSpacing: true,
        scrub: 1,
        animation: tl,
      });

      ScrollTrigger.refresh();

      stCleanup = () => {
        st.kill();
        tl.kill();
      };
    })();

    return () => {
      mounted = false;
      stCleanup?.();
    };
  }, []);

  return (
    <section id="problem">
      <div
        ref={contentRef}
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 24px',
          paddingBlock: '96px',
          boxSizing: 'border-box',
        }}
      >
        {/* Section header */}
        <p
          style={{
            fontSize: 'var(--text-pl-caption)',
            color: 'var(--color-pl-fg-tertiary)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '1rem',
            margin: '0 0 1rem',
          }}
        >
          {t('eyebrow')}
        </p>
        <h2
          style={{
            fontSize: 'var(--text-pl-h1)',
            fontWeight: 700,
            textAlign: 'center',
            maxWidth: 700,
            marginBottom: '4rem',
            color: 'var(--color-pl-fg-primary)',
            lineHeight: 1.1,
            margin: '0 0 4rem',
          }}
        >
          {t('title')}
        </h2>

        {/* Cards — stacked initially, fan on scroll */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 900,
            height: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {CARDS.map((card, i) => (
            <div
              key={i}
              ref={(el) => { cardRefs.current[i] = el; }}
              style={{
                position: 'absolute',
                width: 280,
                background: 'var(--color-pl-bg-elev-1)',
                border: '1px solid var(--pl-border-default)',
                borderRadius: 'var(--radius-pl-lg)',
                padding: '2rem',
                boxShadow: 'var(--pl-shadow-card)',
                willChange: 'transform',
              }}
            >
              <div
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 700,
                  color: 'var(--color-pl-fg-primary)',
                  lineHeight: 1,
                  marginBottom: '0.25rem',
                  fontFamily: 'var(--font-pl-mono)',
                }}
              >
                {card.stat}
              </div>
              <div
                style={{
                  fontSize: 'var(--text-pl-caption)',
                  color: 'var(--color-pl-fg-secondary)',
                  marginBottom: '1.25rem',
                }}
              >
                {card.label}
              </div>
              <div
                className="problem-underline"
                style={{
                  height: 2,
                  background: 'var(--color-pl-danger)',
                  borderRadius: 1,
                  transform: 'scaleX(0)',
                  transformOrigin: 'left',
                  marginBottom: '0.75rem',
                }}
              />
              <p
                className="problem-text"
                style={{
                  fontSize: 'var(--text-pl-caption)',
                  color: 'var(--color-pl-fg-secondary)',
                  opacity: 0,
                  transform: 'translateY(8px)',
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                {card.problem}
              </p>
            </div>
          ))}
        </div>

        {/* Attribution note */}
        <p
          style={{
            marginTop: '3rem',
            fontSize: 'var(--text-pl-caption)',
            color: 'var(--color-pl-fg-tertiary)',
            fontStyle: 'italic',
          }}
        >
          avg. for &ldquo;make this image but in the style of&hellip;&rdquo;
        </p>
      </div>
    </section>
  );
}
