'use client';

import { useRef, useEffect, useState } from 'react';

export default function Pricing() {
  const lineRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = lineRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      id="pricing"
      aria-label="Pricing"
      style={{
        paddingBlock: '128px',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 96px',
        }}
      >
        {/* Animated gradient line */}
        <div
          ref={lineRef}
          aria-hidden="true"
          style={{
            width: '100%',
            height: '1px',
            background: 'var(--pl-grad-brand)',
            marginBottom: '80px',
            transformOrigin: 'center',
            transform: visible ? 'scaleX(1)' : 'scaleX(0)',
            transition: 'transform 1.2s var(--pl-ease-out)',
          }}
        />

        <div
          style={{
            maxWidth: '680px',
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              fontWeight: 700,
              color: 'var(--color-pl-fg-primary)',
              lineHeight: 1.1,
              margin: '0 0 24px',
            }}
          >
            Always free.
            <br />
            Always yours.
          </h2>

          <p
            style={{
              fontSize: '1.125rem',
              color: 'var(--color-pl-fg-secondary)',
              lineHeight: 1.6,
              margin: '0 0 48px',
            }}
          >
            No accounts. No telemetry by default. No vendor lock-in.
            <br />
            Source on GitHub, MIT license.
          </p>

          {/* Feature bullets */}
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: '0 0 48px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {[
              'Your API keys stay in your browser',
              'Your images never leave your device',
              'Full source code on GitHub',
              'Self-host anytime — zero lock-in',
            ].map((item) => (
              <li
                key={item}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '1rem',
                  color: 'var(--color-pl-fg-secondary)',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'var(--pl-grad-brand-soft)',
                    border: '1px solid rgba(124,92,255,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    color: 'var(--color-pl-accent-from)',
                    flexShrink: 0,
                  }}
                >
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a
              href="https://github.com/promptlens"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                fontSize: '0.9375rem',
                fontWeight: 500,
                color: '#fff',
                background: 'var(--pl-grad-brand)',
                borderRadius: '8px',
                textDecoration: 'none',
                transition: 'box-shadow var(--pl-dur-base) var(--pl-ease-out)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = 'var(--pl-shadow-glow)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              ★ Star on GitHub
            </a>
            <a
              href="https://github.com/promptlens"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                fontSize: '0.9375rem',
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
              Read the code →
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          #pricing > div { padding: 0 20px !important; }
        }
      `}</style>
    </section>
  );
}
