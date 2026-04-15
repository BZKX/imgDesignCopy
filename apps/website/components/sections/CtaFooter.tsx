'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  phase: number;
}

const FOOTER_LINKS = [
  { label: 'GitHub', href: 'https://github.com/promptlens' },
  { label: 'X / Twitter', href: '#' },
  { label: 'Discord', href: '#' },
  { label: 'Privacy', href: '#' },
  { label: 'Changelog', href: '#' },
];

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

function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email || status === 'loading') return;
      setStatus('loading');
      try {
        const res = await fetch('/api/waitlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, feature: 'website_cta' }),
        });
        const data = (await res.json()) as { success?: boolean; message?: string; error?: string };
        if (res.ok && data.success) {
          setStatus('success');
          setMessage(data.message ?? "You're on the list!");
          setEmail('');
        } else {
          setStatus('error');
          setMessage(data.message ?? 'Something went wrong. Try again.');
        }
      } catch {
        setStatus('error');
        setMessage('Network error. Try again.');
      }
    },
    [email, status],
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
        {status === 'loading' ? 'Joining…' : 'Join waitlist →'}
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
      {/* Starfield canvas */}
      {mounted && <Starfield frozen={reducedMotion} />}

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
          padding: '128px 96px 80px',
          textAlign: 'center',
        }}
      >
        {/* Headline with shimmer */}
        <h2
          aria-label="See your designs through the eyes of an AI."
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
          See your designs through
          <br />
          the eyes of an AI.
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
            href="#demo"
            style={{
              padding: '14px 28px',
              fontSize: '1rem',
              fontWeight: 500,
              color: '#fff',
              background: 'var(--pl-grad-brand)',
              borderRadius: '8px',
              textDecoration: 'none',
              transition: 'box-shadow var(--pl-dur-base)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = 'var(--pl-shadow-glow)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            }}
          >
            Try the demo
          </a>
          <a
            href="#"
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
            Install ↗
          </a>
        </div>

        {/* Waitlist form */}
        <div
          style={{
            maxWidth: '500px',
            margin: '0 auto 96px',
            textAlign: 'left',
          }}
        >
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--color-pl-fg-tertiary)',
              margin: '0 0 12px',
            }}
          >
            Get notified about new features and platforms:
          </p>
          <WaitlistForm />
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
              {FOOTER_LINKS.map((link) => (
                <li key={link.label}>
                  <FooterLink label={link.label} href={link.href} />
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
            © 2026 · MIT License
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
          #cta-footer > div:last-child { padding: 80px 20px 48px !important; }
        }
      `}</style>
    </footer>
  );
}
