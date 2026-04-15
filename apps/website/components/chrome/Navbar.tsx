'use client';

import { useEffect, useRef, useState } from 'react';

const NAV_LINKS = [
  { label: 'Why', href: '#problem' },
  { label: 'How', href: '#how-it-works' },
  { label: 'Demo', href: '#demo' },
  { label: 'Features', href: '#features' },
  { label: 'Platforms', href: '#platforms' },
];

export default function Navbar() {
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
            <span aria-hidden="true">◇</span> PromptLens
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
                {link.label}
              </a>
            ))}
          </div>

          {/* Right actions */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}
          >
            {/* Locale toggle */}
            <button
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
              中/EN
            </button>

            {/* GitHub */}
            <a
              href="https://github.com/promptlens"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '6px',
                color: 'var(--color-pl-fg-secondary)',
                borderRadius: '6px',
                textDecoration: 'none',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>

            {/* Install CTA */}
            <a
              href="#"
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
              Install ↗
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
              {link.label}
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
