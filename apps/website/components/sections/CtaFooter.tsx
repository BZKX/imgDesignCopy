'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  phase: number;
}

const FOOTER_LINK_KEYS = ['twitter', 'discord', 'privacy', 'changelog'] as const;
const FOOTER_LINK_HREFS: Record<string, string> = {
  twitter: '#',
  discord: '#',
  privacy: '#',
  changelog: '#',
};

function Starfield({ frozen }: { frozen: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      canvas.width = rect?.width ?? window.innerWidth;
      canvas.height = rect?.height ?? 600;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Init 120 particles
    const init = () => {
      particlesRef.current = Array.from({ length: 120 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: 0,
        vy: 0,
        size: 0.8 + Math.random() * 1.2,
        opacity: 0.2 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
      }));
    };
    init();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };
    canvas.parentElement?.addEventListener('mousemove', handleMouseMove, { passive: true });

    const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };
    canvas.parentElement?.addEventListener('mouseleave', handleMouseLeave);

    let t0 = 0;

    const draw = (ts: number) => {
      if (!t0) t0 = ts;
      const t = ts - t0;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (const p of particlesRef.current) {
        if (!frozen) {
          // Mouse spring attraction (radius 200px, force 0.3, damping 0.08)
          const dx = mx - p.x;
          const dy = my - p.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 200 * 200 && distSq > 0) {
            const dist = Math.sqrt(distSq);
            const force = 0.3 * (1 - dist / 200);
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
          // Spring damping 0.08
          p.vx *= 1 - 0.08;
          p.vy *= 1 - 0.08;

          // Slow ambient drift
          p.x += Math.sin(p.phase + t * 0.00025) * 0.12 + p.vx;
          p.y += Math.cos(p.phase * 1.3 + t * 0.0002) * 0.09 + p.vy;
        }

        // Wrap edges
        if (p.x < -2) p.x += canvas.width + 4;
        if (p.x > canvas.width + 2) p.x -= canvas.width + 4;
        if (p.y < -2) p.y += canvas.height + 4;
        if (p.y > canvas.height + 2) p.y -= canvas.height + 4;

        // Draw star
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      canvas.parentElement?.removeEventListener('mousemove', handleMouseMove);
      canvas.parentElement?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [frozen]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  );
}

function FooterLink({ label, href }: { label: string; href: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontSize: '0.875rem',
        color: hovered ? 'var(--color-pl-fg-secondary)' : 'var(--color-pl-fg-tertiary)',
        textDecoration: 'none',
        position: 'relative',
        paddingBottom: '2px',
        transition: 'color var(--pl-dur-quick)',
      }}
    >
      {label}
      {/* Underline expands from center */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          right: '50%',
          height: '1px',
          background: 'var(--pl-grad-brand)',
          transition: 'left var(--pl-dur-base) var(--pl-ease-out), right var(--pl-dur-base) var(--pl-ease-out)',
          ...(hovered ? { left: 0, right: 0 } : {}),
        }}
      />
    </a>
  );
}

interface WaitlistLabels {
  joinWaitlist: string;
  joining: string;
  waitlistSuccess: string;
  waitlistError: string;
  networkError: string;
  /** Map of feature tag → human-readable platform label (e.g. macos → "macOS Desktop") */
  featureLabels?: Record<string, string>;
  /** Translated prefix shown before the feature label, e.g. "Signing up for: " */
  featurePrefix?: string;
}

function WaitlistForm({ labels }: { labels: WaitlistLabels }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [feature, setFeature] = useState<string>('website_cta');
  const [contextLabel, setContextLabel] = useState<string | null>(null);

  // Pick up a feature tag set by Platforms.tsx CTAs (sessionStorage).
  // We re-check on every hashchange because the user clicks a platform CTA
  // AFTER this form has mounted, so the initial mount read is too early.
  useEffect(() => {
    const readFeatureTag = () => {
      try {
        const tag = window.sessionStorage.getItem('pl_waitlist_feature');
        if (tag) {
          setFeature(tag);
          setContextLabel(labels.featureLabels?.[tag] ?? null);
          window.sessionStorage.removeItem('pl_waitlist_feature');
        }
      } catch {
        // sessionStorage unavailable (Safari private mode) — silently keep default
      }
    };

    // Initial read covers the case where the user landed via a #waitlist URL
    // with the tag already in storage (e.g. cross-page navigation).
    readFeatureTag();

    // Subsequent reads cover the in-page case: user clicks a platform CTA
    // → onClick writes sessionStorage → browser scrolls and updates hash.
    window.addEventListener('hashchange', readFeatureTag);
    return () => window.removeEventListener('hashchange', readFeatureTag);
  }, [labels.featureLabels]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email || status === 'loading') return;
      setStatus('loading');
      try {
        const res = await fetch('/api/waitlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, feature }),
        });
        const data = (await res.json()) as { success?: boolean; message?: string; error?: string };
        if (res.ok && data.success) {
          setStatus('success');
          setMessage(data.message ?? labels.waitlistSuccess);
          setEmail('');
        } else {
          setStatus('error');
          setMessage(data.message ?? labels.waitlistError);
        }
      } catch {
        setStatus('error');
        setMessage(labels.networkError);
      }
    },
    [email, status, feature, labels.waitlistSuccess, labels.waitlistError, labels.networkError],
  );

  if (status === 'success') {
    return (
      <p
        style={{
          fontSize: '0.9375rem',
          color: 'var(--color-pl-success)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span aria-hidden="true">✓</span> {message}
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}
      aria-label="Waitlist signup"
    >
      {contextLabel && (
        <span
          aria-live="polite"
          style={{
            width: '100%',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '4px',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-pl-mono)',
            letterSpacing: '0.04em',
            padding: '4px 12px',
            borderRadius: '999px',
            background: 'var(--pl-grad-brand-soft)',
            border: '1px solid rgba(124,92,255,0.3)',
            color: 'var(--color-pl-accent-from)',
            alignSelf: 'flex-start',
          }}
        >
          <span aria-hidden="true">→</span>
          {(labels.featurePrefix ?? 'Signing up for:') + ' ' + contextLabel}
        </span>
      )}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        disabled={status === 'loading'}
        aria-label="Email address"
        style={{
          flex: '1 1 200px',
          minWidth: '180px',
          padding: '10px 16px',
          fontSize: '0.9375rem',
          color: 'var(--color-pl-fg-primary)',
          background: 'rgba(255,255,255,0.05)',
          border: `1px solid ${status === 'error' ? 'var(--color-pl-danger)' : 'var(--pl-border-default)'}`,
          borderRadius: '8px',
          outline: 'none',
          transition: 'border-color var(--pl-dur-quick)',
        }}
        onFocus={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-pl-accent-from)';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 3px rgba(124,92,255,0.18)';
        }}
        onBlur={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor =
            status === 'error' ? 'var(--color-pl-danger)' : 'var(--pl-border-default)';
          (e.currentTarget as HTMLElement).style.boxShadow = 'none';
        }}
      />
      <button
        type="submit"
        disabled={status === 'loading' || !email}
        style={{
          padding: '10px 20px',
          fontSize: '0.9375rem',
          fontWeight: 500,
          color: '#fff',
          background: status === 'loading' ? 'rgba(124,92,255,0.5)' : 'var(--pl-grad-brand)',
          border: 'none',
          borderRadius: '8px',
          cursor: status === 'loading' ? 'wait' : 'pointer',
          transition: 'box-shadow var(--pl-dur-base)',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => {
          if (status !== 'loading')
            (e.currentTarget as HTMLElement).style.boxShadow = 'var(--pl-shadow-glow)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = 'none';
        }}
      >
        {status === 'loading' ? labels.joining : labels.joinWaitlist}
      </button>
      {status === 'error' && message && (
        <p
          role="alert"
          style={{
            width: '100%',
            fontSize: '0.8125rem',
            color: 'var(--color-pl-danger)',
            margin: '4px 0 0',
          }}
        >
          {message}
        </p>
      )}
    </form>
  );
}

export default function CtaFooter() {
  const t = useTranslations('sections.cta');
  const tPlat = useTranslations('sections.platforms');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <footer
      id="cta-footer"
      aria-label="Call to action and footer"
      style={{
        position: 'relative',
        zIndex: 10,
        overflow: 'hidden',
        background: 'var(--color-pl-bg-base)',
      }}
    >
      {/* Starfield canvas — omitted when prefers-reduced-motion: reduce */}
      {mounted && !reducedMotion && <Starfield frozen={false} />}

      {/* Radial gradient overlay to blend starfield with content */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 70% 50% at 50% 60%, rgba(124,92,255,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* CTA content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '1280px',
          margin: '0 auto',
          padding: 'clamp(80px, 12vw, 128px) clamp(20px, 7vw, 96px) clamp(56px, 8vw, 80px)',
          textAlign: 'center',
        }}
      >
        {/* Headline with shimmer */}
        <h2
          aria-label={t('title')}
          style={{
            fontSize: 'clamp(2.25rem, 5vw, 4rem)',
            fontWeight: 700,
            lineHeight: 1.1,
            margin: '0 0 48px',
            background: 'var(--pl-grad-text-shimmer)',
            backgroundSize: '300% 100%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: reducedMotion ? 'none' : 'pl-shimmer-slide 8s linear infinite',
          }}
        >
          {t('titleLine1')}
          <br />
          {t('titleLine2')}
        </h2>

        {/* CTAs */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '64px',
          }}
        >
          <a
            href="/install"
            style={{
              padding: '14px 28px',
              fontSize: '1rem',
              fontWeight: 500,
              color: 'var(--color-pl-fg-primary)',
              background: 'transparent',
              border: '1px solid var(--pl-border-default)',
              borderRadius: '8px',
              textDecoration: 'none',
              transition: 'border-color var(--pl-dur-quick), background var(--pl-dur-quick)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--pl-border-strong)';
              (e.currentTarget as HTMLElement).style.background = 'var(--pl-grad-brand-soft)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--pl-border-default)';
              (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
          >
            {t('installChrome')}
          </a>
        </div>

        {/* Waitlist form — id="waitlist" is the scroll target for Platforms macOS/Windows CTAs */}
        <div
          id="waitlist"
          style={{
            maxWidth: '500px',
            margin: '0 auto 96px',
            textAlign: 'left',
            scrollMarginTop: '80px',
          }}
        >
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--color-pl-fg-tertiary)',
              margin: '0 0 12px',
            }}
          >
            {t('waitlistPrompt')}
          </p>
          <WaitlistForm labels={{
            joinWaitlist: t('joinWaitlist'),
            joining: t('joining'),
            waitlistSuccess: t('waitlistSuccess'),
            waitlistError: t('waitlistError'),
            networkError: t('networkError'),
            featurePrefix: t('featurePrefix'),
            featureLabels: {
              macos: tPlat('macos.name'),
              windows: tPlat('windows.name'),
            },
          }} />
        </div>

        {/* Divider */}
        <div
          aria-hidden="true"
          style={{
            height: '1px',
            background: 'var(--pl-border-subtle)',
            marginBottom: '40px',
          }}
        />

        {/* Footer bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          {/* Brand */}
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 600,
              fontSize: '1rem',
              color: 'var(--color-pl-fg-secondary)',
            }}
          >
            <span aria-hidden="true">◇</span> PromptLens
          </span>

          {/* Links */}
          <nav aria-label="Footer navigation">
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                gap: '24px',
                flexWrap: 'wrap',
              }}
            >
              {FOOTER_LINK_KEYS.map((key) => (
                <li key={key}>
                  <FooterLink label={t(`footerLinks.${key}` as Parameters<typeof t>[0])} href={FOOTER_LINK_HREFS[key]} />
                </li>
              ))}
            </ul>
          </nav>

          {/* Copyright */}
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--color-pl-fg-disabled)',
              margin: 0,
            }}
          >
            © 2026 PromptLens
          </p>
        </div>
      </div>

      <style>{`
        @keyframes pl-shimmer-slide {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @supports not (background-clip: text) {
          #cta-footer h2 {
            -webkit-text-fill-color: unset;
            background: none;
            color: var(--color-pl-fg-primary);
            animation: none;
          }
        }
        @media (max-width: 767px) {
          /* Stack footer bar vertically on small screens */
          #cta-footer nav ul { gap: 16px !important; }
        }
      `}</style>
    </footer>
  );
}
