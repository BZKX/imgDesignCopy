'use client';

import { useState } from 'react';
import type { SceneProps } from '../types';
import ExtensionPanelMock from '../ExtensionPanelMock';

// 6-stage config:
// 0 scene-and-plugin | 1 scan-full | 2 crack-open | 3 zoom-in | 4 modules-reveal | 5 rest

const clamp = (v: number) => Math.min(1, Math.max(0, v));

const FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', system-ui, sans-serif";
const MONO_FONT = "'JetBrains Mono', 'SF Mono', 'Fira Mono', 'Consolas', monospace";

// ── PromptLens brand colors ───────────────────────────────────────────────────
const PL = {
  bg: '#07070a',
  surface: '#0d0d12',
  fg: '#f5f5f7',
  muted: '#a1a1a8',
  accent: '#7c5cff',
  accentFg: '#ffffff',
  border: 'rgba(255,255,255,0.08)',
  gradient: 'linear-gradient(135deg, #7c5cff 0%, #00e1ff 100%)',
};

// ── SVG line-art icons ────────────────────────────────────────────────────────

function IconCapture() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="4" height="4" rx="1" stroke="#7c5cff" strokeWidth="1.2" />
      <rect x="9" y="1" width="4" height="4" rx="1" stroke="#7c5cff" strokeWidth="1.2" />
      <rect x="1" y="9" width="4" height="4" rx="1" stroke="#7c5cff" strokeWidth="1.2" />
      <rect x="9" y="9" width="4" height="4" rx="1" stroke="#7c5cff" strokeWidth="1.2" />
      <line x1="5.5" y1="7" x2="8.5" y2="7" stroke="#00e1ff" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="7" y1="5.5" x2="7" y2="8.5" stroke="#00e1ff" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function IconProviders() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7" cy="7" r="5.5" stroke="#7c5cff" strokeWidth="1.2" />
      <path d="M7 1.5 C5 4 5 10 7 12.5" stroke="#00e1ff" strokeWidth="1" strokeLinecap="round" />
      <path d="M7 1.5 C9 4 9 10 7 12.5" stroke="#00e1ff" strokeWidth="1" strokeLinecap="round" />
      <line x1="1.5" y1="7" x2="12.5" y2="7" stroke="#7c5cff" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function IconPrivacy() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2.5" y="6" width="9" height="6.5" rx="1.5" stroke="#7c5cff" strokeWidth="1.2" />
      <path d="M4.5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke="#7c5cff" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="7" cy="9.25" r="1" fill="#00e1ff" />
    </svg>
  );
}

function IconFormats() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="2" y1="3.5" x2="12" y2="3.5" stroke="#7c5cff" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="2" y1="6.5" x2="9" y2="6.5" stroke="#00e1ff" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="2" y1="9.5" x2="11" y2="9.5" stroke="#7c5cff" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function IconHistory() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7" cy="7" r="5.5" stroke="#7c5cff" strokeWidth="1.2" />
      <polyline points="7,4 7,7 9.5,8.5" stroke="#00e1ff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconModes() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="5" height="5" rx="1" stroke="#7c5cff" strokeWidth="1.2" />
      <rect x="8" y="1" width="5" height="5" rx="1" stroke="#7c5cff" strokeWidth="1.2" />
      <rect x="1" y="8" width="5" height="5" rx="1" stroke="#00e1ff" strokeWidth="1.2" />
      <line x1="8" y1="10.5" x2="13" y2="10.5" stroke="#00e1ff" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

// SVG icon for SkillsCard
function IconSkillsStack() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="4" width="14" height="2.5" rx="1.25" stroke="white" strokeWidth="1.3" />
      <rect x="2" y="7.75" width="14" height="2.5" rx="1.25" stroke="white" strokeWidth="1.3" />
      <rect x="2" y="11.5" width="14" height="2.5" rx="1.25" stroke="white" strokeWidth="1.3" />
    </svg>
  );
}

// SVG icon for FigmaCard
function IconFigmaExport() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="5.5" cy="5.5" r="3" stroke="white" strokeWidth="1.3" />
      <circle cx="12.5" cy="5.5" r="3" stroke="white" strokeWidth="1.3" />
      <circle cx="5.5" cy="12.5" r="3" stroke="white" strokeWidth="1.3" />
      <rect x="9.5" y="9.5" width="6" height="6" rx="1.5" stroke="white" strokeWidth="1.3" />
    </svg>
  );
}

// ── Inline webpage preview ────────────────────────────────────────────────────

const FEATURES = [
  { title: 'Capture Anywhere', desc: 'Select any region on any page and extract it instantly.', Icon: IconCapture },
  { title: 'Multi-Provider', desc: 'OpenAI, Anthropic, Gemini — switch in one click.', Icon: IconProviders },
  { title: 'Privacy-first', desc: 'Everything stays local. No data ever leaves your machine.', Icon: IconPrivacy },
  { title: '4 Prompt Formats', desc: 'MidJourney, Stable Diffusion, Flux, DALL-E.', Icon: IconFormats },
  { title: 'Local History', desc: 'Searchable, exportable prompt archive.', Icon: IconHistory },
  { title: '3 Analysis Modes', desc: 'Style, Product, and Web design analysis.', Icon: IconModes },
];

function WebpagePreview({ dimmed }: { dimmed?: boolean }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: PL.bg,
        color: PL.fg,
        fontFamily: FONT,
        overflow: 'hidden',
        opacity: dimmed ? 0.7 : 1,
        transition: 'none',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Navbar — glass blur, full-width border */}
      <nav
        style={{
          borderBottom: `1px solid ${PL.border}`,
          padding: '9px max(24px, calc((100% - 720px) / 2))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
          background: 'rgba(7,7,10,0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div
              style={{
                width: 13,
                height: 13,
                borderRadius: 3,
                background: PL.gradient,
                flexShrink: 0,
              }}
            />
            <span style={{ fontWeight: 700, fontSize: 11, letterSpacing: -0.3 }}>PromptLens</span>
          </div>
          <div style={{ display: 'flex', gap: 14, fontSize: 9, color: PL.muted }}>
            {['Features', 'Changelog', 'Docs', 'Pricing'].map((l) => (
              <span key={l} style={{ cursor: 'default' }}>{l}</span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 9, color: PL.muted }}>Dashboard</span>
          <button
            type="button"
            style={{
              background: PL.accent,
              color: '#fff',
              border: 'none',
              padding: '4px 10px',
              fontSize: 9,
              fontWeight: 600,
              borderRadius: 5,
              cursor: 'default',
              letterSpacing: 0.1,
            }}
          >
            Install Extension
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section
        style={{
          padding: '22px max(24px, calc((100% - 720px) / 2)) 16px',
          textAlign: 'center',
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow blob */}
        <div
          style={{
            position: 'absolute',
            top: '0%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '55%',
            height: '110px',
            background: 'radial-gradient(ellipse, rgba(124,92,255,0.16) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        {/* Badge */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 8,
            letterSpacing: 1.2,
            fontWeight: 600,
            color: PL.accent,
            background: 'rgba(124,92,255,0.10)',
            border: '1px solid rgba(124,92,255,0.18)',
            padding: '2px 8px',
            borderRadius: 999,
            marginBottom: 10,
          }}
        >
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#00e1ff', display: 'inline-block' }} />
          PROMPTLENS v1.0 — NOW IN PUBLIC BETA
        </span>

        <h1
          style={{
            fontSize: 24,
            fontWeight: 750,
            letterSpacing: -0.9,
            lineHeight: 1.08,
            marginBottom: 8,
            background: PL.gradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Turn any screenshot into<br />a perfect AI prompt.
        </h1>
        <p style={{ fontSize: 9.5, color: PL.muted, maxWidth: 300, margin: '0 auto 12px', lineHeight: 1.55 }}>
          Capture any region. Get MidJourney, SDXL, Flux, and DALL-E prompts in seconds.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 11 }}>
          <button
            type="button"
            style={{
              background: PL.accent,
              color: '#fff',
              border: 'none',
              padding: '6px 14px',
              fontSize: 9.5,
              fontWeight: 600,
              borderRadius: 6,
              cursor: 'default',
              boxShadow: '0 0 16px rgba(124,92,255,0.35)',
            }}
          >
            Install Extension
          </button>
          <button
            type="button"
            style={{
              background: 'transparent',
              color: PL.muted,
              border: `1px solid ${PL.border}`,
              padding: '5px 11px',
              fontSize: 9,
              fontWeight: 500,
              borderRadius: 6,
              cursor: 'default',
            }}
          >
            Get started
          </button>
        </div>

        {/* Social proof row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <div style={{ display: 'flex' }}>
            {['#7c5cff', '#00e1ff', '#ff6b6b', '#ffd166', '#06d6a0'].map((c, i) => (
              <div
                key={c}
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: c,
                  border: '1.5px solid #07070a',
                  marginLeft: i === 0 ? 0 : -5,
                  boxShadow: '0 0 4px rgba(0,0,0,0.5)',
                }}
              />
            ))}
          </div>
          <span style={{ fontSize: 8, color: PL.muted }}>
            Loved by <span style={{ color: PL.fg, fontWeight: 600 }}>12,000+</span> creators
          </span>
        </div>

        {/* Product mockup: 3 stacked result cards */}
        <div
          style={{
            marginTop: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            maxWidth: 340,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          {[
            { label: 'MidJourney', color: '#7c5cff', text: 'dark minimalist landing page, gradient brand...' },
            { label: 'Flux', color: '#00e1ff', text: 'SaaS hero, glass morphism, deep space bg...' },
            { label: 'DALL-E', color: '#ffd166', text: 'editorial layout, editorial typography, serif...' },
          ].map((r) => (
            <div
              key={r.label}
              style={{
                background: PL.surface,
                border: `1px solid ${PL.border}`,
                borderRadius: 6,
                padding: '5px 8px',
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: r.color,
                  flexShrink: 0,
                  boxShadow: `0 0 6px ${r.color}`,
                }}
              />
              <span style={{ fontSize: 8, fontWeight: 600, color: r.color, flexShrink: 0, width: 44 }}>{r.label}</span>
              <span
                style={{
                  fontFamily: MONO_FONT,
                  fontSize: 7,
                  color: 'rgba(255,255,255,0.4)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {r.text}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section
        style={{
          padding: '12px max(24px, calc((100% - 720px) / 2)) 10px',
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 7,
            width: '100%',
            maxWidth: 720,
          }}
        >
          {FEATURES.map((f) => (
            <div
              key={f.title}
              style={{
                background: PL.surface,
                border: `1px solid rgba(255,255,255,0.07)`,
                borderRadius: 7,
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: 5,
              }}
            >
              <div style={{ marginBottom: 2 }}>
                <f.Icon />
              </div>
              <div style={{ fontSize: 9, fontWeight: 650, letterSpacing: -0.2, color: PL.fg }}>{f.title}</div>
              <div style={{ fontSize: 8, color: PL.muted, lineHeight: 1.45, flex: 1 }}>{f.desc}</div>
              <div style={{ fontSize: 7.5, color: 'rgba(124,92,255,0.6)', marginTop: 2 }}>Learn more</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial strip */}
      <section
        style={{
          padding: '10px max(24px, calc((100% - 720px) / 2))',
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 720,
            background: 'rgba(255,255,255,0.025)',
            border: `1px solid ${PL.border}`,
            borderRadius: 8,
            padding: '10px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <p
            style={{
              fontSize: 9,
              fontStyle: 'italic',
              color: 'rgba(255,255,255,0.55)',
              lineHeight: 1.55,
              margin: 0,
            }}
          >
            "This reshaped how we spec visual references. The prompt output is immediately usable in production."
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #7c5cff, #00e1ff)',
                flexShrink: 0,
              }}
            />
            <div>
              <span style={{ fontSize: 8, fontWeight: 600, color: PL.fg }}>Maya R.</span>
              <span style={{ fontSize: 8, color: PL.muted }}>, Art Director</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats row */}
      <section
        style={{
          padding: '10px max(24px, calc((100% - 720px) / 2))',
          borderTop: `1px solid ${PL.border}`,
          borderBottom: `1px solid ${PL.border}`,
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        {[
          { stat: '50k+', label: 'Active users' },
          { stat: '4', label: 'AI Providers' },
          { stat: '3', label: 'Analysis Modes' },
          { stat: '100%', label: 'Privacy' },
        ].map((s, i) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {i > 0 && (
              <div
                style={{
                  width: 1,
                  height: 28,
                  background: PL.border,
                  marginRight: 20,
                  flexShrink: 0,
                }}
              />
            )}
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: -0.5,
                  background: PL.gradient,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  lineHeight: 1.1,
                }}
              >
                {s.stat}
              </div>
              <div style={{ fontSize: 8, color: PL.muted, marginTop: 2, letterSpacing: 0.1 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Code block preview card */}
      <section
        style={{
          padding: '10px max(24px, calc((100% - 720px) / 2)) 8px',
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 720,
            background: '#0a0a0f',
            border: `1px solid rgba(255,255,255,0.07)`,
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          {/* Terminal header bar */}
          <div
            style={{
              padding: '5px 10px',
              borderBottom: `1px solid ${PL.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: 'rgba(255,255,255,0.03)',
            }}
          >
            {['#ff5f56', '#ffbd2e', '#27c93f'].map((c) => (
              <div key={c} style={{ width: 6, height: 6, borderRadius: '50%', background: c }} />
            ))}
            <span style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.25)', marginLeft: 6, fontFamily: MONO_FONT }}>
              prompt-output.json
            </span>
          </div>
          {/* Code lines */}
          <div style={{ padding: '8px 12px', fontFamily: MONO_FONT, fontSize: 8, lineHeight: 1.7 }}>
            <div>
              <span style={{ color: 'rgba(255,255,255,0.25)' }}>{'{'}</span>
            </div>
            <div style={{ paddingLeft: 12 }}>
              <span style={{ color: 'rgba(124,92,255,0.8)' }}>"mode"</span>
              <span style={{ color: 'rgba(255,255,255,0.25)' }}>: </span>
              <span style={{ color: '#00e1ff' }}>"web-design"</span>
              <span style={{ color: 'rgba(255,255,255,0.25)' }}>,</span>
            </div>
            <div style={{ paddingLeft: 12 }}>
              <span style={{ color: 'rgba(124,92,255,0.8)' }}>"prompt"</span>
              <span style={{ color: 'rgba(255,255,255,0.25)' }}>: </span>
              <span style={{ color: 'rgba(255,255,255,0.55)' }}>"dark minimalist SaaS, gradient brand, grid layout..."</span>
            </div>
            <div style={{ paddingLeft: 12 }}>
              <span style={{ color: 'rgba(124,92,255,0.8)' }}>"provider"</span>
              <span style={{ color: 'rgba(255,255,255,0.25)' }}>: </span>
              <span style={{ color: '#00e1ff' }}>"midjourney"</span>
            </div>
            <div>
              <span style={{ color: 'rgba(255,255,255,0.25)' }}>{'}'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA band */}
      <section
        style={{
          padding: '14px max(24px, calc((100% - 720px) / 2))',
          textAlign: 'center',
          flexShrink: 0,
          background: 'rgba(124,92,255,0.05)',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 7,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative gradient line above */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(124,92,255,0.5) 30%, rgba(0,225,255,0.5) 70%, transparent 100%)',
          }}
        />
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: -0.4 }}>
          Start capturing in 30 seconds.
        </div>
        <div style={{ fontSize: 8, color: PL.muted }}>Free plan. No credit card required.</div>
        <button
          type="button"
          style={{
            background: PL.accent,
            color: '#fff',
            border: 'none',
            padding: '6px 14px',
            fontSize: 9,
            fontWeight: 600,
            borderRadius: 6,
            cursor: 'default',
            boxShadow: '0 0 16px rgba(124,92,255,0.35)',
          }}
        >
          Install Extension
        </button>
      </section>
    </div>
  );
}

// ── Analysis modules ──────────────────────────────────────────────────────────

const PALETTE_SWATCHES = ['#07070a', '#0d0d12', '#f5f5f7', '#7c5cff', '#00e1ff'];

const sectionLabel: React.CSSProperties = {
  fontSize: '10px',
  textTransform: 'uppercase',
  color: '#86868b',
  letterSpacing: '0.08em',
  marginBottom: '8px',
  fontFamily: FONT,
};

const divider: React.CSSProperties = {
  height: '1px',
  background: 'rgba(255,255,255,0.06)',
  margin: '16px 0',
};

const chipStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '3px 9px',
  fontSize: '10px',
  background: 'rgba(124,92,255,0.12)',
  color: '#7c5cff',
  borderRadius: '980px',
  marginRight: '5px',
  marginBottom: '5px',
  whiteSpace: 'nowrap',
  fontFamily: FONT,
};

const neutralChip: React.CSSProperties = {
  ...chipStyle,
  background: 'rgba(255,255,255,0.06)',
  color: '#c7c7cc',
};

// Card hover glow styles shared by all 3 cards
const CARD_BASE_STYLE: React.CSSProperties = {
  background: '#0d0d12',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '16px',
  boxSizing: 'border-box',
  transition: 'border-color 220ms cubic-bezier(0.16,1,0.3,1), box-shadow 220ms cubic-bezier(0.16,1,0.3,1)',
  cursor: 'default',
};

const CARD_HOVER_SHADOW = '0 0 0 1px rgba(124,92,255,0.3), 0 12px 40px rgba(124,92,255,0.15)';
const CARD_HOVER_BORDER = 'rgba(124,92,255,0.3)';

function useCardHover() {
  const [hovered, setHovered] = useState(false);
  return {
    hovered,
    handlers: {
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
    },
  };
}

function DesignAnalysisPanel() {
  const { hovered, handlers } = useCardHover();

  return (
    <div
      {...handlers}
      style={{
        ...CARD_BASE_STYLE,
        padding: '24px',
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        fontFamily: FONT,
        borderColor: hovered ? CARD_HOVER_BORDER : 'rgba(255,255,255,0.08)',
        boxShadow: hovered ? CARD_HOVER_SHADOW : 'none',
      }}
    >
      <div
        style={{
          fontSize: '13px',
          fontWeight: 600,
          color: '#f5f5f7',
          marginBottom: '20px',
          letterSpacing: '-0.01em',
        }}
      >
        Design Analysis / 设计分析
      </div>

      {/* Section 1: Palette */}
      <div style={sectionLabel}>配色</div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {PALETTE_SWATCHES.map((c) => (
          <div key={c} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '7px',
                background: c,
                border: '1px solid rgba(255,255,255,0.08)',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: MONO_FONT,
                fontSize: '8px',
                color: '#6e6e73',
                letterSpacing: '0.02em',
              }}
            >
              {c}
            </span>
          </div>
        ))}
      </div>

      <div style={divider} />

      {/* Section 2: Typography */}
      <div style={sectionLabel}>字体排版</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {[
          { label: 'Heading', value: 'Inter Display / 600' },
          { label: 'Body', value: 'Inter Text / 400' },
          { label: 'Mono', value: 'JetBrains Mono / 500' },
        ].map((row) => (
          <div
            key={row.label}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <span style={{ fontSize: '11px', color: '#c7c7cc' }}>{row.label}</span>
            <span style={{ fontFamily: MONO_FONT, fontSize: '9px', color: '#6e6e73' }}>{row.value}</span>
          </div>
        ))}
      </div>

      <div style={divider} />

      {/* Section 3: Layout */}
      <div style={sectionLabel}>布局结构</div>
      <div>
        {['Hero', 'Features Grid', 'Stats', 'Pricing', 'CTA', 'Footer'].map((chip) => (
          <span key={chip} style={neutralChip}>
            {chip}
          </span>
        ))}
      </div>

      <div style={divider} />

      {/* Section 4: Interactions */}
      <div style={sectionLabel}>交互模式</div>
      <div>
        {['Scroll-driven', 'Parallax', 'Hover Tilt', 'Fade Reveal', 'Sticky Nav'].map((chip) => (
          <span key={chip} style={neutralChip}>
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}

function SkillsCard() {
  const { hovered, handlers } = useCardHover();

  return (
    <div
      {...handlers}
      style={{
        ...CARD_BASE_STYLE,
        padding: '20px',
        fontFamily: FONT,
        borderColor: hovered ? CARD_HOVER_BORDER : 'rgba(255,255,255,0.08)',
        boxShadow: hovered ? CARD_HOVER_SHADOW : 'none',
      }}
    >
      {/* Title */}
      <div
        style={{
          fontSize: '12px',
          fontWeight: 600,
          color: '#f5f5f7',
          marginBottom: '14px',
          letterSpacing: '-0.01em',
        }}
      >
        Skills Export / 导出设计特征
      </div>

      {/* Icon + description row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #7c5cff 0%, #00e1ff 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <IconSkillsStack />
        </div>
        <span style={{ fontSize: '11px', color: '#a1a1a8', lineHeight: 1.4, flex: 1 }}>
          Structured JSON tags for AI / 结构化设计特征 JSON 格式
        </span>
      </div>

      {/* JSON preview */}
      <div
        style={{
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '8px',
          padding: '8px 10px',
          marginBottom: '12px',
          fontFamily: MONO_FONT,
          fontSize: '9px',
          color: 'rgba(255,255,255,0.35)',
          lineHeight: 1.6,
        }}
      >
        <span style={{ color: 'rgba(124,92,255,0.7)' }}>{'"skills"'}</span>
        {': [\n'}
        <span style={{ paddingLeft: 12, display: 'inline-block' }}>
          <span style={{ color: '#00e1ff' }}>"landing"</span>
          {', '}
          <span style={{ color: '#00e1ff' }}>"dark-theme"</span>
          {',\n'}
        </span>
        <span style={{ paddingLeft: 12, display: 'inline-block' }}>
          <span style={{ color: '#00e1ff' }}>"gradient-brand"</span>
          {', '}
          <span style={{ color: '#00e1ff' }}>"grid"</span>
        </span>
        {'\n]'}
      </div>

      {/* Action button */}
      <button
        type="button"
        style={{
          display: 'block',
          width: '100%',
          background: '#7c5cff',
          color: '#fff',
          border: 'none',
          padding: '8px',
          fontSize: '11px',
          fontWeight: 600,
          borderRadius: '8px',
          cursor: 'default',
          fontFamily: FONT,
          textAlign: 'center',
        }}
      >
        Export as JSON
      </button>
    </div>
  );
}

function FigmaCard() {
  const { hovered, handlers } = useCardHover();

  return (
    <div
      {...handlers}
      style={{
        ...CARD_BASE_STYLE,
        padding: '20px',
        fontFamily: FONT,
        borderColor: hovered ? CARD_HOVER_BORDER : 'rgba(255,255,255,0.08)',
        boxShadow: hovered ? CARD_HOVER_SHADOW : 'none',
      }}
    >
      {/* Title */}
      <div
        style={{
          fontSize: '12px',
          fontWeight: 600,
          color: '#f5f5f7',
          marginBottom: '14px',
          letterSpacing: '-0.01em',
        }}
      >
        Figma Export / 导出到 Figma
      </div>

      {/* Icon + description row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #7c5cff 0%, #00e1ff 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <IconFigmaExport />
        </div>
        <span style={{ fontSize: '11px', color: '#a1a1a8', lineHeight: 1.4, flex: 1 }}>
          Ready to import via Tokens Studio / 可通过 Tokens Studio 导入
        </span>
      </div>

      {/* JSON tokens preview */}
      <div
        style={{
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '8px',
          padding: '8px 10px',
          marginBottom: '12px',
          fontFamily: MONO_FONT,
          fontSize: '9px',
          color: 'rgba(255,255,255,0.35)',
          lineHeight: 1.6,
        }}
      >
        <span style={{ color: 'rgba(124,92,255,0.7)' }}>{'"color.accent"'}</span>
        {': "#7c5cff",\n'}
        <span style={{ color: 'rgba(124,92,255,0.7)' }}>{'"color.bg"'}</span>
        {': "#07070a",\n'}
        <span style={{ color: 'rgba(124,92,255,0.7)' }}>{'"radius.card"'}</span>
        {': "16px"'}
      </div>

      <button
        type="button"
        style={{
          display: 'block',
          width: '100%',
          background: '#7c5cff',
          color: '#fff',
          border: 'none',
          padding: '8px',
          fontSize: '11px',
          fontWeight: 600,
          borderRadius: '8px',
          cursor: 'default',
          fontFamily: FONT,
          textAlign: 'center',
        }}
      >
        Open in Figma
      </button>
    </div>
  );
}

// ── Main scene ────────────────────────────────────────────────────────────────

export default function WebDesignScene({ stage, stageProgress }: SceneProps) {
  // ── Stage 0: scene AND plugin enter simultaneously ────────────────────────
  const enterProg = clamp(stage === 0 ? stageProgress : stage > 0 ? 1 : 0);
  const sceneOpacity = enterProg;
  const enterY = stage === 0 ? 30 * (1 - stageProgress) : 0;

  // Plugin: enters from right in stage 0, stays through stage 2, retracts in stage 3
  const pluginX =
    stage === 0
      ? (1 - enterProg) * 100
      : stage <= 2
      ? 0
      : clamp(stage === 3 ? stageProgress : 1) * 100;
  const pluginOpacity =
    stage === 0
      ? enterProg
      : stage <= 2
      ? 1
      : clamp(1 - (stage === 3 ? stageProgress : 1));

  // ── Stage 1: full-page scan line ─────────────────────────────────────────
  const scanProg = clamp(stage === 1 ? stageProgress : stage > 1 ? 1 : 0);
  const showScan = stage === 1 && stageProgress > 0;

  // ── Stage 2: crack open ───────────────────────────────────────────────────
  const crackProg = clamp(stage === 2 ? stageProgress : stage > 2 ? 1 : 0);
  // Top half slides up, bottom half slides down
  const topHalfTY = crackProg * -50; // in vh
  const botHalfTY = crackProg * 50;  // in vh

  // Webpage visible until crack animation moves halves fully off
  const webpageVisible = stage <= 3;

  // ── Stage 3: zoom into void ───────────────────────────────────────────────
  // Halves continue translating beyond viewport
  const zoomProg = clamp(stage === 3 ? stageProgress : stage > 3 ? 1 : 0);
  const extraTopTY = topHalfTY + zoomProg * -20; // continue pushing off
  const extraBotTY = botHalfTY + zoomProg * 20;
  const voidScale = 1 + zoomProg * 0.08; // subtle scale push

  // ── Stage 4: modules reveal ───────────────────────────────────────────────
  const modulesProg = clamp(stage === 4 ? stageProgress : stage > 4 ? 1 : 0);
  const showModules = stage >= 4;

  // Staggered slide-in for each of the 3 children
  const stagger = [0, 0.08, 0.16];
  const moduleProg = stagger.map((s) => clamp((modulesProg - s) / (1 - s)));

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: PL.bg }}>

      {/* ── Webpage preview — two halves with clip-path ──────────────────── */}
      {webpageVisible && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            paddingRight: stage <= 2 ? '472px' : 0,
            opacity: sceneOpacity,
            transform: `translateY(${enterY}px)`,
            zIndex: 1,
          }}
        >
          {/* Top half */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)',
              transform: `translateY(${stage >= 2 ? (stage === 2 ? topHalfTY : extraTopTY) : 0}vh)`,
              zIndex: 1,
              overflow: 'hidden',
            }}
          >
            <WebpagePreview />
          </div>

          {/* Bottom half */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              clipPath: 'polygon(0 50%, 100% 50%, 100% 100%, 0 100%)',
              transform: `translateY(${stage >= 2 ? (stage === 2 ? botHalfTY : extraBotTY) : 0}vh)`,
              zIndex: 1,
              overflow: 'hidden',
            }}
          >
            <WebpagePreview />
          </div>

          {/* Scan line overlay — stage 1 */}
          {showScan && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 3,
                pointerEvents: 'none',
                overflow: 'hidden',
              }}
            >
              {/* Scan line */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: `${scanProg * 100}%`,
                  height: '2px',
                  background:
                    'linear-gradient(90deg, transparent 0%, rgba(124,92,255,0.8) 20%, rgba(124,92,255,1) 50%, rgba(124,92,255,0.8) 80%, transparent 100%)',
                  boxShadow: '0 0 16px rgba(124,92,255,0.9), 0 0 40px rgba(124,92,255,0.4)',
                }}
              />
              {/* Trail glow above the line */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  height: `${scanProg * 100}%`,
                  background:
                    'linear-gradient(180deg, transparent 0%, rgba(124,92,255,0.04) 80%, rgba(124,92,255,0.12) 100%)',
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* ── Dark void that appears as halves split apart ─────────────────── */}
      {stage >= 2 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: PL.bg,
            zIndex: 0,
            transform: stage === 3 ? `scale(${voidScale})` : undefined,
          }}
        />
      )}

      {/* ── Analysis modules (stage 4+) — centered with max-width ─────────── */}
      {showModules && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            padding: '80px max(48px, calc((100% - 1040px) / 2)) 48px',
            display: 'flex',
            gap: '32px',
            justifyContent: 'center',
            zIndex: 5,
            boxSizing: 'border-box',
          }}
        >
          {/* Left: Design Analysis panel */}
          <div
            style={{
              flex: '1 1 48%',
              maxWidth: '560px',
              opacity: moduleProg[0],
              transform: `translateX(${(1 - moduleProg[0]) * -40}px)`,
              transition: 'none',
            }}
          >
            <DesignAnalysisPanel />
          </div>

          {/* Right: Skills + Figma stacked */}
          <div
            style={{
              flex: '1 1 48%',
              maxWidth: '420px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            {/* Skills card */}
            <div
              style={{
                opacity: moduleProg[1],
                transform: `translateX(${(1 - moduleProg[1]) * 40}px)`,
                transition: 'none',
              }}
            >
              <SkillsCard />
            </div>

            {/* Figma card */}
            <div
              style={{
                opacity: moduleProg[2],
                transform: `translateX(${(1 - moduleProg[2]) * 40}px)`,
                transition: 'none',
                flex: 1,
              }}
            >
              <FigmaCard />
            </div>
          </div>
        </div>
      )}

      {/* ── Plugin panel ───────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: '80px',
          right: '16px',
          bottom: '16px',
          width: '440px',
          zIndex: 10,
          transform: `translateX(${pluginX.toFixed(2)}%)`,
          opacity: pluginOpacity,
          transition: 'none',
        }}
      >
        <ExtensionPanelMock mode="web" stage={stage} />
      </div>
    </div>
  );
}
