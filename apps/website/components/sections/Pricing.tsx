'use client';

import { useRef, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export default function Pricing() {
  const t = useTranslations('sections.pricing');
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
        paddingBlock: 'clamp(80px, 12vw, 128px)',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 clamp(20px, 7vw, 96px)',
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
            {t('titleLine1')}
            <br />
            {t('titleLine2')}
          </h2>

          <p
            style={{
              fontSize: '1.125rem',
              color: 'var(--color-pl-fg-secondary)',
              lineHeight: 1.6,
              margin: '0 0 48px',
            }}
          >
            {t('subtitle')}
            <br />
            {t('subtitleLine2')}
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
              t('bullet1'),
              t('bullet2'),
              t('bullet3'),
              t('bullet4'),
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

          {/* CTA */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a
              href="/install"
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
              {t('cta')}
            </a>
          </div>
        </div>
      </div>

    </section>
  );
}
