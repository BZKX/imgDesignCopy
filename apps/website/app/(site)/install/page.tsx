'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

const CHROME_STORE_URL =
  'https://chromewebstore.google.com/detail/promptlens/immaimpdiapollebfajdjgjgkkoeedgm';

const ZIP_DOWNLOAD_URL = '/downloads/promptlens-chrome-0.2.0.zip';
const ZIP_VERSION = '0.2.0';
const ZIP_SIZE = '142 KB';

function CheckIcon() {
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: 'rgba(46,229,157,0.12)',
        color: '#2ee59d',
        border: '1px solid rgba(46,229,157,0.3)',
        fontSize: '0.75rem',
        flexShrink: 0,
      }}
    >
      ✓
    </span>
  );
}

function CopyableCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '4px 6px 4px 12px',
        borderRadius: '8px',
        background: 'var(--color-pl-bg-elev-2)',
        border: '1px solid var(--pl-border-subtle)',
        fontFamily: 'var(--font-pl-mono)',
        fontSize: '0.8125rem',
      }}
    >
      <span style={{ color: 'var(--color-pl-fg-primary)' }}>{code}</span>
      <button
        onClick={handleCopy}
        style={{
          padding: '4px 8px',
          fontSize: '0.6875rem',
          fontFamily: 'var(--font-pl-mono)',
          color: copied ? '#2ee59d' : 'var(--color-pl-fg-tertiary)',
          background: 'transparent',
          border: '1px solid var(--pl-border-subtle)',
          borderRadius: '6px',
          cursor: 'pointer',
          transition: 'color 200ms',
        }}
      >
        {copied ? '✓' : 'Copy'}
      </button>
    </div>
  );
}

export default function InstallPage() {
  const t = useTranslations('install');

  return (
    <main
      style={{
        position: 'relative',
        zIndex: 10,
        paddingBlock: 'clamp(96px, 14vw, 160px) clamp(80px, 12vw, 128px)',
        paddingInline: 'clamp(20px, 7vw, 96px)',
      }}
    >
      <div
        style={{
          maxWidth: '1080px',
          margin: '0 auto',
        }}
      >
        {/* Header */}
        <div style={{ maxWidth: '720px', marginBottom: 'clamp(48px, 8vw, 72px)' }}>
          <p
            style={{
              fontSize: '0.875rem',
              fontFamily: 'var(--font-pl-mono)',
              color: 'var(--color-pl-fg-tertiary)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              margin: '0 0 12px',
            }}
          >
            {t('eyebrow')}
          </p>
          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 700,
              color: 'var(--color-pl-fg-primary)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              margin: '0 0 20px',
            }}
          >
            {t('title')}
          </h1>
          <p
            style={{
              fontSize: '1.125rem',
              color: 'var(--color-pl-fg-secondary)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {t('subtitle')}
          </p>
        </div>

        {/* Two install cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            marginBottom: 'clamp(56px, 8vw, 80px)',
          }}
        >
          {/* ── Card A: Chrome Web Store ──────────────────────────────────── */}
          <div
            style={{
              position: 'relative',
              padding: '32px',
              borderRadius: '16px',
              background: 'var(--color-pl-bg-elev-1)',
              border: '1px solid rgba(124,92,255,0.25)',
              boxShadow: '0 0 0 1px rgba(124,92,255,0.08), var(--pl-shadow-card)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {/* Recommended pill */}
            <span
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                fontSize: '0.6875rem',
                fontFamily: 'var(--font-pl-mono)',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '4px 10px',
                borderRadius: '999px',
                background: 'var(--pl-grad-brand-soft)',
                border: '1px solid rgba(124,92,255,0.35)',
                color: 'var(--color-pl-accent-from)',
              }}
            >
              {t('storeCard.badge')}
            </span>

            {/* Icon */}
            <div
              aria-hidden="true"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'var(--pl-grad-brand-soft)',
                border: '1px solid var(--pl-border-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
              }}
            >
              ⬡
            </div>

            <h2
              style={{
                fontSize: '1.375rem',
                fontWeight: 600,
                color: 'var(--color-pl-fg-primary)',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {t('storeCard.title')}
            </h2>

            <p
              style={{
                fontSize: '0.9375rem',
                color: 'var(--color-pl-fg-secondary)',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {t('storeCard.description')}
            </p>

            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              {(['feature1', 'feature2', 'feature3'] as const).map((k) => (
                <li
                  key={k}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    fontSize: '0.875rem',
                    color: 'var(--color-pl-fg-secondary)',
                  }}
                >
                  <CheckIcon />
                  {t(`storeCard.${k}`)}
                </li>
              ))}
            </ul>

            <a
              href={CHROME_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                marginTop: 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '13px 24px',
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: '#fff',
                background: 'var(--pl-grad-brand)',
                borderRadius: '10px',
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
              {t('storeCard.cta')} ↗
            </a>
          </div>

          {/* ── Card B: Direct download ────────────────────────────────────── */}
          <div
            style={{
              position: 'relative',
              padding: '32px',
              borderRadius: '16px',
              background: 'var(--color-pl-bg-elev-1)',
              border: '1px solid var(--pl-border-default)',
              boxShadow: 'var(--pl-shadow-card)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {/* Region pill */}
            <span
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                fontSize: '0.6875rem',
                fontFamily: 'var(--font-pl-mono)',
                fontWeight: 500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '4px 10px',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--pl-border-subtle)',
                color: 'var(--color-pl-fg-tertiary)',
              }}
            >
              {t('zipCard.badge')}
            </span>

            <div
              aria-hidden="true"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'var(--color-pl-bg-elev-2)',
                border: '1px solid var(--pl-border-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
              }}
            >
              ↓
            </div>

            <h2
              style={{
                fontSize: '1.375rem',
                fontWeight: 600,
                color: 'var(--color-pl-fg-primary)',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {t('zipCard.title')}
            </h2>

            <p
              style={{
                fontSize: '0.9375rem',
                color: 'var(--color-pl-fg-secondary)',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {t('zipCard.description')}
            </p>

            {/* Meta row */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-pl-mono)',
                color: 'var(--color-pl-fg-tertiary)',
              }}
            >
              <span>v{ZIP_VERSION}</span>
              <span aria-hidden="true">·</span>
              <span>{ZIP_SIZE}</span>
              <span aria-hidden="true">·</span>
              <span>Manifest V3</span>
            </div>

            <a
              href={ZIP_DOWNLOAD_URL}
              download
              style={{
                marginTop: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '13px 24px',
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: 'var(--color-pl-fg-primary)',
                background: 'transparent',
                border: '1px solid var(--pl-border-default)',
                borderRadius: '10px',
                textDecoration: 'none',
                transition:
                  'border-color var(--pl-dur-quick), background var(--pl-dur-quick)',
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
              {t('zipCard.cta')} ↓
            </a>
          </div>
        </div>

        {/* ── Step-by-step instructions for ZIP install ──────────────────── */}
        <div
          style={{
            padding: 'clamp(28px, 5vw, 40px)',
            borderRadius: '16px',
            background: 'var(--color-pl-bg-elev-1)',
            border: '1px solid var(--pl-border-subtle)',
          }}
        >
          <p
            style={{
              fontSize: '0.75rem',
              fontFamily: 'var(--font-pl-mono)',
              color: 'var(--color-pl-fg-tertiary)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              margin: '0 0 12px',
            }}
          >
            {t('steps.eyebrow')}
          </p>
          <h2
            style={{
              fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
              fontWeight: 700,
              color: 'var(--color-pl-fg-primary)',
              lineHeight: 1.2,
              margin: '0 0 32px',
            }}
          >
            {t('steps.title')}
          </h2>

          <ol
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              counterReset: 'pl-step',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            {/* Step 1 */}
            <Step n={1} title={t('steps.step1.title')}>
              {t('steps.step1.body')}
            </Step>

            {/* Step 2 */}
            <Step n={2} title={t('steps.step2.title')}>
              <span style={{ marginRight: '10px' }}>{t('steps.step2.body')}</span>
              <CopyableCode code="chrome://extensions" />
            </Step>

            {/* Step 3 */}
            <Step n={3} title={t('steps.step3.title')}>
              {t('steps.step3.body')}
            </Step>

            {/* Step 4 */}
            <Step n={4} title={t('steps.step4.title')}>
              {t('steps.step4.body')}
            </Step>
          </ol>

          {/* Caveat */}
          <p
            style={{
              marginTop: '32px',
              padding: '16px',
              borderRadius: '10px',
              background: 'rgba(255,193,7,0.06)',
              border: '1px solid rgba(255,193,7,0.18)',
              fontSize: '0.8125rem',
              color: 'var(--color-pl-fg-secondary)',
              lineHeight: 1.6,
            }}
          >
            <span aria-hidden="true">⚠</span> {t('steps.caveat')}
          </p>
        </div>

        {/* Back to home */}
        <div style={{ textAlign: 'center', marginTop: 'clamp(40px, 6vw, 56px)' }}>
          <Link
            href="/"
            style={{
              fontSize: '0.875rem',
              color: 'var(--color-pl-fg-tertiary)',
              textDecoration: 'none',
              borderBottom: '1px solid var(--pl-border-subtle)',
              paddingBottom: '2px',
            }}
          >
            ← {t('backHome')}
          </Link>
        </div>
      </div>
    </main>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li
      style={{
        display: 'flex',
        gap: '20px',
        alignItems: 'flex-start',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          flexShrink: 0,
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'var(--pl-grad-brand-soft)',
          border: '1px solid rgba(124,92,255,0.3)',
          color: 'var(--color-pl-accent-from)',
          fontSize: '0.875rem',
          fontWeight: 600,
          fontFamily: 'var(--font-pl-mono)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {n}
      </span>
      <div style={{ flex: 1 }}>
        <h3
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--color-pl-fg-primary)',
            margin: '4px 0 8px',
            lineHeight: 1.3,
          }}
        >
          {title}
        </h3>
        <div
          style={{
            fontSize: '0.9375rem',
            color: 'var(--color-pl-fg-secondary)',
            lineHeight: 1.6,
          }}
        >
          {children}
        </div>
      </div>
    </li>
  );
}
