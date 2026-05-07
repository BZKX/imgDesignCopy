'use client';

import { useRef, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface PlatformDef {
  id: 'chrome' | 'macos' | 'windows';
  ctaHref: string;
}

const PLATFORM_DEFS: PlatformDef[] = [
  { id: 'chrome',   ctaHref: '/install' },
  { id: 'macos',    ctaHref: '#waitlist' },
  { id: 'windows',  ctaHref: '#waitlist' },
];

// Chrome browser mockup SVG
function ChromeMockup({ tilted }: { tilted: boolean }) {
  return (
    <svg
      viewBox="0 0 280 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{
        width: '100%',
        height: 'auto',
        transform: tilted ? 'perspective(600px) rotateY(-5deg)' : 'perspective(600px) rotateY(0deg)',
        transition: 'transform 200ms var(--pl-ease-out)',
        filter: 'drop-shadow(0 24px 48px rgba(0,0,0,0.5))',
      }}
    >
      {/* Browser frame */}
      <rect x="2" y="2" width="276" height="196" rx="10" fill="#1a1a22" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
      {/* Chrome bar */}
      <rect x="2" y="2" width="276" height="36" rx="10" fill="#15151c" />
      <rect x="2" y="28" width="276" height="10" fill="#15151c" />
      {/* Window controls */}
      <circle cx="20" cy="19" r="5" fill="#ff5f57" />
      <circle cx="36" cy="19" r="5" fill="#febc2e" />
      <circle cx="52" cy="19" r="5" fill="#28c840" />
      {/* Address bar */}
      <rect x="70" y="11" width="140" height="16" rx="4" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <text x="140" y="22" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.3)" fontFamily="monospace">promptlens.cc</text>
      {/* Page content area */}
      <rect x="12" y="44" width="256" height="148" rx="4" fill="#0d0d12" />
      {/* Content skeleton */}
      <rect x="24" y="58" width="120" height="8" rx="2" fill="rgba(255,255,255,0.07)" />
      <rect x="24" y="72" width="180" height="6" rx="2" fill="rgba(255,255,255,0.05)" />
      <rect x="24" y="84" width="150" height="6" rx="2" fill="rgba(255,255,255,0.05)" />
      {/* PromptLens panel */}
      <rect x="170" y="44" width="98" height="148" rx="0" fill="#15151c" />
      <rect x="170" y="44" width="1" height="148" fill="rgba(124,92,255,0.3)" />
      {/* Panel header */}
      <text x="178" y="60" fontSize="7" fill="rgba(255,255,255,0.5)" fontWeight="600" fontFamily="sans-serif">◇ PromptLens</text>
      <rect x="178" y="65" width="80" height="1" fill="rgba(255,255,255,0.07)" />
      {/* Prompt output */}
      <rect x="178" y="72" width="76" height="5" rx="1" fill="rgba(124,92,255,0.3)" />
      <rect x="178" y="80" width="60" height="4" rx="1" fill="rgba(255,255,255,0.08)" />
      <rect x="178" y="87" width="68" height="4" rx="1" fill="rgba(255,255,255,0.06)" />
      <rect x="178" y="94" width="52" height="4" rx="1" fill="rgba(255,255,255,0.06)" />
      <rect x="178" y="101" width="64" height="4" rx="1" fill="rgba(255,255,255,0.06)" />
      {/* Copy button */}
      <rect x="178" y="118" width="76" height="18" rx="4" fill="rgba(124,92,255,0.25)" stroke="rgba(124,92,255,0.4)" strokeWidth="1" />
      <text x="216" y="130" textAnchor="middle" fontSize="7" fill="rgba(124,92,255,0.9)" fontFamily="sans-serif">Copy prompt</text>
      {/* Highlight overlay */}
      <rect x="170" y="44" width="98" height="40" rx="0" fill="url(#chrome-glare)" opacity="0.4" />
      <defs>
        <linearGradient id="chrome-glare" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="white" stopOpacity="0.08" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// macOS window mockup SVG
function MacMockup({ tilted }: { tilted: boolean }) {
  return (
    <svg
      viewBox="0 0 280 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{
        width: '100%',
        height: 'auto',
        transform: tilted ? 'perspective(600px) rotateY(-5deg)' : 'perspective(600px) rotateY(0deg)',
        transition: 'transform 200ms var(--pl-ease-out)',
        filter: 'drop-shadow(0 24px 48px rgba(0,0,0,0.5))',
      }}
    >
      {/* Desktop background */}
      <rect x="2" y="2" width="276" height="196" rx="10" fill="#0d0d12" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
      {/* Faux desktop gradient */}
      <rect x="2" y="2" width="276" height="196" rx="10" fill="url(#mac-bg)" opacity="0.5" />
      {/* Menu bar */}
      <rect x="2" y="2" width="276" height="22" rx="10" fill="rgba(0,0,0,0.6)" />
      <rect x="2" y="14" width="276" height="10" fill="rgba(0,0,0,0.6)" />
      {/* Apple logo */}
      <text x="16" y="16" fontSize="9" fill="rgba(255,255,255,0.7)" fontFamily="sans-serif">⌘</text>
      {/* Menu items */}
      <text x="32" y="16" fontSize="8" fill="rgba(255,255,255,0.6)" fontFamily="sans-serif">File  Edit  View</text>
      {/* Right menu bar: clock + PromptLens icon */}
      <text x="220" y="16" fontSize="7" fill="rgba(255,255,255,0.4)" fontFamily="monospace">16:42</text>
      <text x="248" y="16" fontSize="9" fill="rgba(124,92,255,0.9)" fontFamily="sans-serif">◇</text>
      {/* Window */}
      <rect x="20" y="32" width="200" height="155" rx="8" fill="#1a1a22" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <rect x="20" y="32" width="200" height="28" rx="8" fill="#15151c" />
      <rect x="20" y="48" width="200" height="12" fill="#15151c" />
      <circle cx="36" cy="46" r="4.5" fill="#ff5f57" />
      <circle cx="50" cy="46" r="4.5" fill="#febc2e" />
      <circle cx="64" cy="46" r="4.5" fill="#28c840" />
      <text x="110" y="50" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.4)" fontFamily="sans-serif">PromptLens</text>
      {/* App content */}
      <rect x="28" y="68" width="184" height="110" rx="4" fill="#0d0d12" />
      <rect x="36" y="78" width="90" height="6" rx="2" fill="rgba(255,255,255,0.07)" />
      <rect x="36" y="88" width="140" height="5" rx="2" fill="rgba(255,255,255,0.05)" />
      <rect x="36" y="97" width="110" height="5" rx="2" fill="rgba(255,255,255,0.05)" />
      {/* Dropdown panel from menu bar */}
      <rect x="228" y="22" width="44" height="80" rx="6" fill="#1e1e28" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <text x="250" y="38" textAnchor="middle" fontSize="7" fill="rgba(124,92,255,0.8)" fontWeight="600" fontFamily="sans-serif">◇</text>
      <rect x="236" y="43" width="28" height="1" fill="rgba(255,255,255,0.07)" />
      <text x="250" y="54" textAnchor="middle" fontSize="6.5" fill="rgba(255,255,255,0.5)" fontFamily="sans-serif">Capture</text>
      <text x="250" y="64" textAnchor="middle" fontSize="6.5" fill="rgba(255,255,255,0.35)" fontFamily="sans-serif">History</text>
      <text x="250" y="74" textAnchor="middle" fontSize="6.5" fill="rgba(255,255,255,0.35)" fontFamily="sans-serif">Settings</text>
      <rect x="236" y="80" width="28" height="1" fill="rgba(255,255,255,0.07)" />
      <text x="250" y="91" textAnchor="middle" fontSize="6" fill="rgba(255,255,255,0.2)" fontFamily="sans-serif">v1.0.0</text>
      <defs>
        <linearGradient id="mac-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7c5cff" />
          <stop offset="1" stopColor="#00e1ff" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Windows tray mockup SVG
function WindowsMockup({ tilted }: { tilted: boolean }) {
  return (
    <svg
      viewBox="0 0 280 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{
        width: '100%',
        height: 'auto',
        transform: tilted ? 'perspective(600px) rotateY(-5deg)' : 'perspective(600px) rotateY(0deg)',
        transition: 'transform 200ms var(--pl-ease-out)',
        filter: 'drop-shadow(0 24px 48px rgba(0,0,0,0.5))',
      }}
    >
      {/* Desktop */}
      <rect x="2" y="2" width="276" height="196" rx="10" fill="#0a0a10" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
      <rect x="2" y="2" width="276" height="196" rx="10" fill="url(#win-bg)" opacity="0.3" />
      {/* Window */}
      <rect x="16" y="14" width="200" height="158" rx="6" fill="#1a1a22" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <rect x="16" y="14" width="200" height="32" rx="6" fill="#15151c" />
      <rect x="16" y="38" width="200" height="8" fill="#15151c" />
      <text x="28" y="34" fontSize="8" fill="rgba(255,255,255,0.5)" fontFamily="sans-serif">◇ PromptLens</text>
      {/* Win chrome buttons */}
      <rect x="186" y="18" width="12" height="12" rx="2" fill="rgba(255,255,255,0.05)" />
      <rect x="202" y="18" width="12" height="12" rx="2" fill="rgba(255,255,255,0.05)" />
      <rect x="186" y="33" width="28" height="3" fill="#15151c" />
      {/* Content */}
      <rect x="24" y="50" width="184" height="116" rx="4" fill="#0d0d12" />
      <rect x="32" y="62" width="100" height="6" rx="2" fill="rgba(255,255,255,0.07)" />
      <rect x="32" y="72" width="150" height="5" rx="2" fill="rgba(255,255,255,0.05)" />
      <rect x="32" y="81" width="120" height="5" rx="2" fill="rgba(255,255,255,0.05)" />
      {/* Taskbar */}
      <rect x="2" y="180" width="276" height="16" rx="0" fill="#111118" />
      <rect x="2" y="180" width="276" height="1" fill="rgba(255,255,255,0.06)" />
      {/* Start button */}
      <rect x="8" y="183" width="20" height="10" rx="2" fill="rgba(255,255,255,0.06)" />
      <text x="18" y="191" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.4)" fontFamily="sans-serif">⊞</text>
      {/* Tray area */}
      <text x="232" y="190" fontSize="6.5" fill="rgba(255,255,255,0.3)" fontFamily="monospace">16:42</text>
      <text x="252" y="190" fontSize="8" fill="rgba(124,92,255,0.85)" fontFamily="sans-serif">◇</text>
      {/* Tray popup */}
      <rect x="222" y="118" width="52" height="58" rx="6" fill="#1e1e28" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <text x="248" y="133" textAnchor="middle" fontSize="7" fill="rgba(124,92,255,0.8)" fontWeight="600" fontFamily="sans-serif">◇</text>
      <rect x="230" y="137" width="36" height="1" fill="rgba(255,255,255,0.07)" />
      <text x="248" y="148" textAnchor="middle" fontSize="6.5" fill="rgba(255,255,255,0.5)" fontFamily="sans-serif">Capture</text>
      <text x="248" y="158" textAnchor="middle" fontSize="6.5" fill="rgba(255,255,255,0.35)" fontFamily="sans-serif">History</text>
      <text x="248" y="168" textAnchor="middle" fontSize="6.5" fill="rgba(255,255,255,0.35)" fontFamily="sans-serif">Settings</text>
      <defs>
        <linearGradient id="win-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7c5cff" />
          <stop offset="1" stopColor="#00e1ff" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const MOCKUPS = [ChromeMockup, MacMockup, WindowsMockup];

function PlatformCard({
  def,
  index,
  name,
  description,
  cta,
  badge,
}: {
  def: PlatformDef;
  index: number;
  name: string;
  description: string;
  cta: string;
  badge: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilted, setTilted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const isAvailable = def.id === 'chrome';

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), index * 120);
          obs.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [index]);

  const Mockup = MOCKUPS[index];

  return (
    <div
      ref={cardRef}
      style={{
        flex: '1 1 280px',
        maxWidth: '360px',
        opacity: reducedMotion ? 1 : visible ? 1 : 0,
        transform: reducedMotion ? 'none' : visible ? 'translateY(0)' : 'translateY(40px)',
        transition: `opacity 0.6s var(--pl-ease-out), transform 0.6s var(--pl-ease-out)`,
      }}
    >
      {/* Mockup area */}
      <div
        style={{ cursor: 'default' }}
        onMouseEnter={() => setTilted(true)}
        onMouseLeave={() => setTilted(false)}
      >
        <Mockup tilted={!reducedMotion && tilted} />
      </div>

      {/* Info */}
      <div style={{ marginTop: '28px' }}>
        {/* Name + badge row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <h3
            style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: 'var(--color-pl-fg-primary)',
              margin: 0,
            }}
          >
            {name}
          </h3>
          <span
            style={{
              fontSize: '0.6875rem',
              fontFamily: 'var(--font-pl-mono)',
              fontWeight: 500,
              padding: '2px 8px',
              borderRadius: '999px',
              border: `1px solid ${isAvailable ? 'rgba(46,229,157,0.3)' : 'rgba(124,92,255,0.3)'}`,
              background: isAvailable ? 'rgba(46,229,157,0.08)' : 'rgba(124,92,255,0.08)',
              color: isAvailable ? '#2ee59d' : 'var(--color-pl-accent-from)',
              whiteSpace: 'nowrap',
            }}
          >
            {badge}
          </span>
        </div>
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--color-pl-fg-secondary)',
            margin: '0 0 16px',
          }}
        >
          {description}
        </p>
        <a
          href={def.ctaHref}
          onClick={() => {
            // For waitlist CTAs, tag the form with the platform the user came from.
            // WaitlistForm reads this on mount and includes it in the submission.
            if (def.ctaHref === '#waitlist' && typeof window !== 'undefined') {
              try {
                window.sessionStorage.setItem('pl_waitlist_feature', def.id);
              } catch {
                // Safari private mode etc. — silently fall back to no feature tag
              }
            }
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '9px 18px',
            fontSize: '0.875rem',
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
          {cta}
        </a>
      </div>
    </div>
  );
}

export default function Platforms() {
  const t = useTranslations('sections.platforms');

  return (
    <section
      id="platforms"
      aria-label="Platforms"
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
        {/* Header */}
        <p
          style={{
            fontSize: '0.875rem',
            fontFamily: 'var(--font-pl-mono)',
            color: 'var(--color-pl-fg-tertiary)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            margin: '0 0 12px',
          }}
        >
          {t('eyebrow')}
        </p>
        <h2
          style={{
            fontSize: 'clamp(2rem, 4vw, 3.5rem)',
            fontWeight: 700,
            color: 'var(--color-pl-fg-primary)',
            lineHeight: 1.1,
            margin: '0 0 64px',
          }}
        >
          {t('title')}
        </h2>

        {/* Platform cards */}
        <div
          style={{
            display: 'flex',
            gap: '40px',
            flexWrap: 'wrap',
          }}
        >
          {PLATFORM_DEFS.map((def, index) => (
            <PlatformCard
              key={def.id}
              def={def}
              index={index}
              name={t(`${def.id}.name`)}
              description={t(`${def.id}.description`)}
              cta={t(`${def.id}.cta`)}
              badge={t(`${def.id}.badge`)}
            />
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          #platforms > div > div:last-child { flex-direction: column !important; gap: 48px !important; }
        }
      `}</style>
    </section>
  );
}
