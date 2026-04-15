'use client';

import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import PromptLensLogo from '@/components/chrome/PromptLensLogo';

// ─── Animation variants ───────────────────────────────────────────────────────

const CONTAINER = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

function makeItem(reduced: boolean) {
  return {
    hidden: {
      opacity: 0,
      ...(reduced ? {} : { y: 22, filter: 'blur(6px)' }),
    },
    visible: {
      opacity: 1,
      ...(reduced ? {} : { y: 0, filter: 'blur(0px)' }),
      transition: {
        duration: reduced ? 0.2 : 0.65,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CtaPrimary({ label, reduced }: { label: string; reduced: boolean }) {
  return (
    <motion.a
      href="#demo"
      className="pl-cta-primary"
      whileHover={
        reduced
          ? {}
          : {
              boxShadow:
                '0 0 0 1px rgba(124,92,255,0.45), 0 8px 24px -4px rgba(124,92,255,0.45)',
            }
      }
      whileTap={{ scale: 0.98 }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '13px 28px',
        borderRadius: 'var(--radius-pl-md, 8px)',
        background: 'var(--pl-grad-brand)',
        color: '#fff',
        fontWeight: 600,
        fontSize: '0.9375rem',
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'box-shadow var(--pl-dur-base, 240ms) var(--pl-ease-out)',
        position: 'relative',
        overflow: 'hidden',
        outline: 'none',
      }}
      tabIndex={0}
    >
      {label}
    </motion.a>
  );
}

function CtaSecondary({ label }: { label: string }) {
  return (
    <motion.a
      href="https://chrome.google.com/webstore"
      target="_blank"
      rel="noopener noreferrer"
      className="pl-cta-secondary"
      whileTap={{ scale: 0.98 }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '13px 28px',
        borderRadius: 'var(--radius-pl-md, 8px)',
        // gradient border via background-clip
        background:
          'linear-gradient(var(--color-pl-bg-base, #07070a), var(--color-pl-bg-base, #07070a)) padding-box, var(--pl-grad-brand) border-box',
        border: '1px solid transparent',
        color: 'var(--color-pl-fg-primary)',
        fontWeight: 500,
        fontSize: '0.9375rem',
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'opacity var(--pl-dur-quick, 120ms) var(--pl-ease-out)',
        outline: 'none',
      }}
      tabIndex={0}
    >
      {label} ↗
    </motion.a>
  );
}

// TODO: Replace this placeholder card with the real product screenshot once
//       /stage/style and /stage/product pages are live. See DESIGN.md §3 S1
//       for target dimensions (1440×900). The -webkit-box-reflect CSS class
//       (hero-mirror-reflect) handles the CSS reflection below the card.
function MirrorPlaceholder() {
  return (
    <div
      className="hero-mirror-reflect"
      style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}
      aria-hidden="true"
    >
      <div
        className="hero-mirror-card"
        style={{
          height: '400px',
          background: 'var(--color-pl-bg-elev-1, #0d0d12)',
          borderRadius: 'var(--radius-pl-xl, 20px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle inner glow */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 60% 40% at 50% 40%, rgba(124,92,255,0.07) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Icon */}
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          style={{ opacity: 0.25 }}
        >
          <rect
            x="3"
            y="5"
            width="18"
            height="14"
            rx="2"
            stroke="url(#mirror-icon-grad)"
            strokeWidth="1.5"
          />
          <circle cx="12" cy="12" r="3" stroke="url(#mirror-icon-grad)" strokeWidth="1.5" />
          <defs>
            <linearGradient id="mirror-icon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7c5cff" />
              <stop offset="100%" stopColor="#00e1ff" />
            </linearGradient>
          </defs>
        </svg>

        <p
          style={{
            fontSize: 'var(--text-pl-caption, 0.875rem)',
            color: 'var(--color-pl-fg-tertiary, #6b6b73)',
            textAlign: 'center',
            lineHeight: 1.6,
            zIndex: 1,
          }}
        >
          Your screenshot goes here
          <br />
          <span style={{ opacity: 0.55 }}>stage captures landing soon</span>
        </p>
      </div>
    </div>
  );
}

// ─── CSS injected into document ───────────────────────────────────────────────

function HeroStyles() {
  return (
    <style>{`
      /* Shimmer on hero headline line 3 */
      .hero-shimmer-text {
        background: var(--pl-grad-text-shimmer,
          linear-gradient(110deg, #f5f5f7 0%, #c9b8ff 30%, #7ce0ff 55%, #f5f5f7 80%));
        background-size: 200% 100%;
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        color: transparent;
        animation: pl-shimmer 8s linear infinite;
      }

      @keyframes pl-shimmer {
        0%   { background-position: 200% center; }
        100% { background-position: -200% center; }
      }

      @media (prefers-reduced-motion: reduce) {
        .hero-shimmer-text {
          animation: none;
          background-position: 0% center;
        }
      }

      /* Mirror card — breathing dashed border */
      .hero-mirror-card {
        outline: 1.5px dashed rgba(124,92,255,0.28);
        outline-offset: 0px;
        animation: pl-mirror-breathe 4s ease-in-out infinite;
      }

      @keyframes pl-mirror-breathe {
        0%, 100% {
          outline-color: rgba(124,92,255,0.18);
          box-shadow: var(--pl-shadow-card,
            0 1px 0 rgba(255,255,255,0.04) inset,
            0 24px 48px -16px rgba(0,0,0,0.6));
        }
        50% {
          outline-color: rgba(0,225,255,0.35);
          box-shadow: var(--pl-shadow-card),
            0 0 32px -10px rgba(124,92,255,0.2);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .hero-mirror-card { animation: none; }
      }

      /* CSS reflection — Chrome + Safari (M1 targets) */
      .hero-mirror-reflect {
        -webkit-box-reflect: below 0px
          linear-gradient(transparent 55%, rgba(7,7,10,0.30) 100%);
      }

      /* CTA focus-visible rings */
      .pl-cta-primary:focus-visible,
      .pl-cta-secondary:focus-visible {
        outline: 2px solid rgba(124,92,255,0.8);
        outline-offset: 3px;
      }

      /* Hero badge */
      .hero-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 14px;
        border-radius: var(--radius-pl-full, 9999px);
        border: 1px solid rgba(124,92,255,0.25);
        background: rgba(124,92,255,0.08);
        font-size: var(--text-pl-caption, 0.875rem);
        color: var(--color-pl-fg-secondary, #a1a1a8);
        font-weight: 500;
        letter-spacing: 0.01em;
        cursor: default;
      }

      .hero-badge:focus-visible {
        outline: 2px solid rgba(124,92,255,0.8);
        outline-offset: 3px;
      }
    `}</style>
  );
}

// ─── Main Hero component ──────────────────────────────────────────────────────

export default function Hero() {
  const t = useTranslations('hero');
  const prefersReduced = useReducedMotion();
  const reduced = prefersReduced ?? false;
  const orbRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  // conic-gradient orb: cursor-follow with rAF lerp 0.08, ±15°, 6°/s auto-rotate
  useEffect(() => {
    if (reduced) return;

    let baseAngle = 0;
    let mouseOffset = 0;
    let targetMouseOffset = 0;
    let lastTime = 0;

    const onMouseMove = (e: MouseEvent) => {
      const ratio =
        (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      targetMouseOffset = ratio * 15; // ±15°
    };

    const tick = (ts: number) => {
      const delta = lastTime ? (ts - lastTime) / 1000 : 0;
      lastTime = ts;
      baseAngle += 6 * delta; // 6°/s slow auto-rotation
      mouseOffset += (targetMouseOffset - mouseOffset) * 0.08; // damped lerp
      orbRef.current?.style.setProperty(
        '--pl-hero-angle',
        `${baseAngle + mouseOffset}deg`
      );
      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [reduced]);

  const iv = makeItem(reduced);
  const titleLines = [
    t('titleLine1'),
    t('titleLine2'),
    t('titleLine3'),
  ] as const;

  return (
    <>
      <HeroStyles />

      <section
        id="hero"
        style={{
          position: 'relative',
          overflow: 'hidden',
          paddingBlock: '128px 80px',
          paddingInline: '24px',
          minHeight: '100svh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Radial brand spot */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--pl-grad-radial-spot)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        {/* Conic-gradient cursor orb — top-right quadrant */}
        <div
          ref={orbRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-120px',
            right: '5%',
            width: '520px',
            height: '520px',
            pointerEvents: 'none',
            zIndex: 0,
            background: `conic-gradient(
              from var(--pl-hero-angle, 20deg) at 50% 50%,
              rgba(124,92,255,0.28) 0%,
              rgba(0,225,255,0.10) 22%,
              transparent 45%,
              rgba(124,92,255,0.06) 70%,
              rgba(124,92,255,0.28) 360deg
            )`,
            filter: 'blur(80px)',
            borderRadius: '50%',
          }}
        />

        {/* ── Content stack ─────────────────────────────────────────────── */}
        <motion.div
          variants={CONTAINER}
          initial="hidden"
          animate="visible"
          style={{
            position: 'relative',
            zIndex: 10,
            width: '100%',
            maxWidth: '900px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '0',
          }}
        >
          {/* Badge */}
          <motion.div
            variants={iv}
            className="hero-badge"
            tabIndex={0}
            role="status"
          >
            <span aria-hidden="true">◈</span>
            {t('badge')}&nbsp;·&nbsp;macOS/Windows 桌面版 v1.1 等你
          </motion.div>

          {/* Logo */}
          <motion.div
            variants={iv}
            style={{ marginTop: '28px' }}
          >
            <PromptLensLogo />
          </motion.div>

          {/* Headline — three lines, line 3 gets shimmer */}
          <motion.h1
            style={{
              marginTop: '20px',
              marginBottom: 0,
              fontSize: 'clamp(2.5rem, 7vw, var(--text-pl-display, 5.5rem))',
              fontWeight: 700,
              lineHeight: 1.06,
              letterSpacing: '-0.02em',
              color: 'var(--color-pl-fg-primary)',
            }}
          >
            {titleLines.map((line, i) => (
              <motion.span
                key={i}
                variants={iv}
                style={{ display: 'block' }}
                className={i === 2 ? 'hero-shimmer-text' : undefined}
              >
                {line}
              </motion.span>
            ))}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={iv}
            style={{
              marginTop: '24px',
              fontSize: 'var(--text-pl-body-lg, 1.125rem)',
              color: 'var(--color-pl-fg-secondary)',
              maxWidth: '580px',
              lineHeight: 1.6,
            }}
          >
            {t('subtitle')}
          </motion.p>

          {/* CTA row */}
          <motion.div
            variants={iv}
            style={{
              marginTop: '40px',
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <CtaPrimary label={t('ctaPrimary')} reduced={reduced} />
            <CtaSecondary label={t('ctaSecondary')} />
          </motion.div>

          {/* Social proof line */}
          <motion.p
            variants={iv}
            style={{
              marginTop: '28px',
              fontSize: 'var(--text-pl-caption, 0.875rem)',
              color: 'var(--color-pl-fg-tertiary)',
            }}
          >
            <span aria-hidden="true">◇</span>{' '}
            Used by 600+ designers&nbsp;·&nbsp;Open source&nbsp;·&nbsp;MIT licensed
          </motion.p>

          {/* Mirror placeholder */}
          <motion.div
            variants={iv}
            style={{ marginTop: '72px', width: '100%' }}
          >
            <MirrorPlaceholder />
          </motion.div>
        </motion.div>
      </section>
    </>
  );
}
