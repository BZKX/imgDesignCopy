'use client';

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
      href="#style-prompt"
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
      href="/install"
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
            {t('badge')}
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
            {t('socialProof')}
          </motion.p>

        </motion.div>
      </section>
    </>
  );
}
