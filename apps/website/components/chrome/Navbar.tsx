'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLocaleContext } from '@/components/scroll/LocaleProvider';

const NAV_LINKS = [
  { labelKey: 'modes',     href: '/#style-prompt' },
  { labelKey: 'features',  href: '/#features' },
  { labelKey: 'platforms', href: '/#platforms' },
];

export default function Navbar() {
  const t = useTranslations('nav');
  const { locale, toggleLocale } = useLocaleContext();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 100);
        rafRef.current = null;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const borderColor = scrolled
    ? 'var(--pl-border-default)'
    : 'var(--pl-border-subtle)';

  return (
    <>
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          height: '64px',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          background: 'var(--pl-bg-overlay)',
          borderBottom: `1px solid ${borderColor}`,
          transition: `border-color var(--pl-dur-base) var(--pl-ease-out)`,
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            height: '100%',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '32px',
          }}
        >
          {/* Logo */}
          <a
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 600,
              fontSize: '1rem',
              color: 'var(--color-pl-fg-primary)',
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            <img src="/logo.png" alt="" width={24} height={24} style={{ borderRadius: 6 }} /> PromptLens
          </a>

          {/* Desktop nav links */}
          <div
            className="nav-links-desktop"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              flex: 1,
            }}
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.875rem',
                  color: 'var(--color-pl-fg-secondary)',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  transition: `color var(--pl-dur-quick) var(--pl-ease-out)`,
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.color =
                    'var(--color-pl-fg-primary)')
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color =
                    'var(--color-pl-fg-secondary)')
                }
              >
                {t(link.labelKey as Parameters<typeof t>[0])}
              </a>
            ))}
          </div>

          {/* Right actions */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}
          >
            {/* Locale toggle */}
            <button
              onClick={toggleLocale}
              style={{
                padding: '6px 10px',
                fontSize: '0.8125rem',
                color: 'var(--color-pl-fg-tertiary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '6px',
              }}
            >
              {locale === 'zh-CN' ? 'EN' : '中文'}
            </button>

            {/* Install CTA */}
            <a
              href="/install"
              style={{
                padding: '8px 16px',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#fff',
                background: 'var(--pl-grad-brand)',
                borderRadius: '8px',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {t('install')} ↗
            </a>

            {/* Mobile hamburger */}
            <button
              aria-label="Toggle menu"
              aria-expanded={drawerOpen}
              className="nav-hamburger"
              onClick={() => setDrawerOpen((v) => !v)}
              style={{
                display: 'none',
                padding: '6px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-pl-fg-primary)',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                {drawerOpen ? (
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  />
                ) : (
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div
          style={{
            position: 'fixed',
            top: '64px',
            left: 0,
            right: 0,
            zIndex: 49,
            background: 'var(--color-pl-bg-elev-1)',
            borderBottom: `1px solid var(--pl-border-subtle)`,
            padding: '16px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setDrawerOpen(false)}
              style={{
                padding: '12px 8px',
                fontSize: '1rem',
                color: 'var(--color-pl-fg-secondary)',
                textDecoration: 'none',
                borderBottom: `1px solid var(--pl-border-subtle)`,
              }}
            >
              {t(link.labelKey as Parameters<typeof t>[0])}
            </a>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 767px) {
          .nav-links-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
      `}</style>
    </>
  );
}
