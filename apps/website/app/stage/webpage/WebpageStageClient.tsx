'use client';

import { useSearchParams } from 'next/navigation';

type Theme = {
  bg: string;
  surface: string;
  fg: string;
  muted: string;
  accent: string;
  accentFg: string;
  border: string;
  brand: string;
};

const THEMES: Record<'light' | 'crypto' | 'promptlens', Theme> = {
  light: {
    bg: '#fafafa',
    surface: '#ffffff',
    fg: '#0a0a0a',
    muted: '#525252',
    accent: '#ff6a1a',
    accentFg: '#ffffff',
    border: '#e5e5e5',
    brand: 'Velocity',
  },
  crypto: {
    bg: '#070715',
    surface: '#0e0e25',
    fg: '#eeeeff',
    muted: '#8888aa',
    accent: '#00e58f',
    accentFg: '#001a10',
    border: 'rgba(255,255,255,0.08)',
    brand: 'Chainforge',
  },
  promptlens: {
    bg: '#07070a',
    surface: '#0d0d12',
    fg: '#f5f5f7',
    muted: '#a1a1a8',
    accent: '#7c5cff',
    accentFg: '#ffffff',
    border: 'rgba(255,255,255,0.08)',
    brand: 'PromptLens Studio',
  },
};

export default function WebpageStageClient() {
  const params = useSearchParams();
  const themeKey = ['crypto', 'promptlens'].includes(params.get('theme') ?? '')
    ? (params.get('theme') as 'crypto' | 'promptlens')
    : 'light';
  const t = THEMES[themeKey];
  const isLight = themeKey === 'light';
  const isPromptlens = themeKey === 'promptlens';

  const heroCopy = isPromptlens
    ? { eyebrow: 'PROMPTLENS · v1.0', title: 'Turn any screenshot into a perfect prompt.', subtitle: 'Capture any region. Get MidJourney / SDXL / Flux / DALL·E prompts instantly.', cta: 'Install Extension', ctaSub: 'Watch demo →' }
    : isLight
    ? { eyebrow: 'NEW · v2.4', title: 'Ship faster than your competitors.', subtitle: 'The developer platform your team already wanted. Deploy in seconds, scale to billions.', cta: 'Start free trial', ctaSub: 'Watch a 2-min demo →' }
    : { eyebrow: 'MAINNET · LIVE', title: 'On-chain intelligence, decoded.', subtitle: 'Real-time analytics, MEV protection, and portfolio tracking for DeFi power users. No wallet connect required.', cta: 'Explore the dashboard', ctaSub: 'Read the whitepaper →' };

  const features = isPromptlens
    ? [
        { icon: '✂', title: 'Capture Anywhere', desc: 'Press ⌘⇧Y on any page. Drag to select.' },
        { icon: '🧠', title: 'Multi-Provider', desc: 'OpenAI, Anthropic, Gemini, Ollama. Your choice.' },
        { icon: '🔒', title: 'Privacy-first', desc: 'Images and keys never touch a server.' },
        { icon: '📋', title: '4 Prompt Formats', desc: 'MidJourney, SD, Flux, DALL·E — tabbed copy-paste.' },
        { icon: '💾', title: 'Local History', desc: 'Searchable, exportable, yours.' },
        { icon: '🎨', title: '3 Analysis Modes', desc: 'Style, Product Visual, Web Design.' },
      ]
    : isLight
    ? [
        { icon: '⚡', title: 'Edge-first runtime', desc: 'Your code runs in 300+ cities. Average p95 latency: 24ms.' },
        { icon: '🔒', title: 'SOC 2 Type II', desc: 'Enterprise-grade security, audited yearly. GDPR & CCPA compliant.' },
        { icon: '📊', title: 'Observability built-in', desc: 'Traces, metrics, and logs in one dashboard. Zero-config.' },
        { icon: '🧩', title: 'Framework agnostic', desc: 'Next.js, Remix, SvelteKit, Astro, Solid. Bring your stack.' },
        { icon: '🌐', title: 'Instant rollback', desc: 'One click to any previous deployment. Immutable forever.' },
        { icon: '💬', title: '24/7 human support', desc: 'Slack Connect for Pro+. Average first response: 4 minutes.' },
      ]
    : [
        { icon: '⛓', title: 'Multi-chain ready', desc: 'EVM, Solana, Sui, Aptos. One API, every network.' },
        { icon: '🛡', title: 'MEV shield', desc: 'Private mempool routing. Save up to 87% on sandwich attacks.' },
        { icon: '📈', title: 'Real-time P&L', desc: 'Track every wallet, token, and LP position. Tax-ready exports.' },
        { icon: '🔔', title: 'Smart alerts', desc: 'Whale movements, governance proposals, bridge exploits.' },
        { icon: '🧠', title: 'AI copilot', desc: 'Ask "what happened to ETH at 3am?" Get a narrative answer.' },
        { icon: '🔗', title: 'Open data layer', desc: '10B+ events indexed. GraphQL and SQL endpoints.' },
      ];

  const pricing = isLight
    ? [
        { tier: 'Hobby', price: 'Free', period: 'forever', features: ['100k edge requests/mo', 'Community Discord', 'Public projects only'], highlight: false },
        { tier: 'Pro', price: '$20', period: 'per seat / mo', features: ['10M edge requests/mo', 'Private projects', 'Slack support', 'Custom domains'], highlight: true },
        { tier: 'Team', price: '$99', period: 'per seat / mo', features: ['Unlimited requests', 'SSO/SAML', 'Audit logs', 'Dedicated CSM'], highlight: false },
      ]
    : isPromptlens
    ? [
        { tier: 'Free', price: 'Free', period: 'forever', features: ['100 captures/mo', 'All 3 analysis modes', 'Local history'], highlight: false },
        { tier: 'Pro', price: '$9', period: 'per month', features: ['Unlimited captures', 'All providers', 'Priority support', 'Bulk export'], highlight: true },
        { tier: 'Team', price: '$29', period: 'per month', features: ['Everything in Pro', 'Shared workspace', 'Admin controls', 'Custom prompts'], highlight: false },
      ]
    : [
        { tier: 'Watch', price: 'Free', period: '1 wallet', features: ['Real-time prices', 'Basic alerts', 'Portfolio ≤ $10k tracked'], highlight: false },
        { tier: 'Alpha', price: '$49', period: 'per month', features: ['Unlimited wallets', 'MEV shield', 'AI copilot', 'CSV tax export'], highlight: true },
        { tier: 'Guild', price: 'Custom', period: 'contact us', features: ['DAO treasury mode', 'Dedicated node', 'White-glove onboarding'], highlight: false },
      ];

  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.fg, fontFamily: '"Inter", system-ui, sans-serif' }}>
      {/* Fake navbar */}
      <nav
        style={{
          borderBottom: `1px solid ${t.border}`,
          padding: '16px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: -0.5 }}>{t.brand}</span>
          <div style={{ display: 'flex', gap: 22, fontSize: 14, color: t.muted }}>
            <span>Product</span>
            <span>Solutions</span>
            <span>Docs</span>
            <span>Pricing</span>
            <span>Blog</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 14, color: t.muted }}>Sign in</span>
          <button
            type="button"
            style={{
              background: t.accent,
              color: t.accentFg,
              border: 'none',
              padding: '9px 18px',
              fontSize: 13,
              borderRadius: 8,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {heroCopy.cta}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 40px 40px', textAlign: 'center' }}>
        <span
          style={{
            display: 'inline-block',
            fontSize: 11,
            letterSpacing: 2,
            fontWeight: 600,
            color: t.accent,
            background: isLight ? '#fff3eb' : isPromptlens ? 'rgba(124,92,255,0.12)' : 'rgba(0,229,143,0.08)',
            padding: '5px 12px',
            borderRadius: 999,
            marginBottom: 24,
          }}
        >
          {heroCopy.eyebrow}
        </span>
        <h1
          style={{
            fontSize: 64,
            fontWeight: 700,
            letterSpacing: -2,
            lineHeight: 1.05,
            marginBottom: 20,
            ...(isPromptlens
              ? {
                  background: 'linear-gradient(135deg, #7c5cff 0%, #00e1ff 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }
              : {}),
          }}
        >
          {heroCopy.title}
        </h1>
        <p style={{ fontSize: 19, color: t.muted, maxWidth: 640, margin: '0 auto 32px', lineHeight: 1.5 }}>
          {heroCopy.subtitle}
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 56 }}>
          <button
            type="button"
            style={{
              background: t.accent,
              color: t.accentFg,
              border: 'none',
              padding: '14px 28px',
              fontSize: 15,
              fontWeight: 600,
              borderRadius: 10,
              cursor: 'pointer',
            }}
          >
            {heroCopy.cta} →
          </button>
          <span style={{ fontSize: 14, color: t.muted, cursor: 'pointer' }}>{heroCopy.ctaSub}</span>
        </div>
        {/* Product screenshot */}
        <div
          style={{
            maxWidth: 1080,
            margin: '0 auto',
            aspectRatio: '16/10',
            borderRadius: 12,
            overflow: 'hidden',
            border: `1px solid ${t.border}`,
            boxShadow: isLight ? '0 40px 80px -20px rgba(0,0,0,0.18)' : isPromptlens ? '0 40px 80px -20px rgba(124,92,255,0.25)' : '0 40px 80px -20px rgba(0,229,143,0.15)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/stage/webpage/dashboard-mock.webp"
            alt="Product dashboard preview"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      </section>

      {/* Social proof strip */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '40px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: t.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 18 }}>
          Trusted by 40,000+ teams
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap', opacity: 0.55 }}>
          {['Acme', 'Linear', 'Vercel', 'Stripe', 'Figma', 'Retool'].map((brand) => (
            <span key={brand} style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.5 }}>
              {brand}
            </span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontSize: 12, color: t.accent, letterSpacing: 2, fontWeight: 600, marginBottom: 12 }}>
            FEATURES
          </p>
          <h2 style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>Everything you need. Nothing you don&apos;t.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {features.map((f) => (
            <div
              key={f.title}
              style={{
                background: t.surface,
                border: `1px solid ${t.border}`,
                borderRadius: 12,
                padding: '24px',
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 14 }}>{f.icon}</div>
              <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: t.muted, lineHeight: 1.55 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontSize: 12, color: t.accent, letterSpacing: 2, fontWeight: 600, marginBottom: 12 }}>
            PRICING
          </p>
          <h2 style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>Simple, transparent pricing.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, maxWidth: 980, margin: '0 auto' }}>
          {pricing.map((p) => (
            <div
              key={p.tier}
              style={{
                background: t.surface,
                border: p.highlight ? `2px solid ${t.accent}` : `1px solid ${t.border}`,
                borderRadius: 14,
                padding: '32px 24px',
                position: 'relative',
              }}
            >
              {p.highlight && (
                <span
                  style={{
                    position: 'absolute',
                    top: -12,
                    right: 20,
                    background: t.accent,
                    color: t.accentFg,
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: 1,
                    padding: '4px 10px',
                    borderRadius: 999,
                  }}
                >
                  POPULAR
                </span>
              )}
              <h3 style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: 2, color: t.muted, marginBottom: 16 }}>
                {p.tier}
              </h3>
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 38, fontWeight: 700, letterSpacing: -1 }}>{p.price}</span>
                <span style={{ fontSize: 14, color: t.muted, marginLeft: 8 }}>{p.period}</span>
              </div>
              <button
                type="button"
                style={{
                  width: '100%',
                  background: p.highlight ? t.accent : 'transparent',
                  color: p.highlight ? t.accentFg : t.fg,
                  border: p.highlight ? 'none' : `1px solid ${t.border}`,
                  padding: '11px',
                  fontSize: 14,
                  fontWeight: 600,
                  borderRadius: 8,
                  cursor: 'pointer',
                  marginBottom: 24,
                }}
              >
                Get started
              </button>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
                {p.features.map((f) => (
                  <li key={f} style={{ fontSize: 13, color: t.muted, display: 'flex', gap: 8 }}>
                    <span style={{ color: t.accent }}>✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${t.border}`, marginTop: 40, padding: '40px' }}>
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '2fr repeat(4, 1fr)',
            gap: 32,
          }}
        >
          <div>
            <span style={{ fontWeight: 700, fontSize: 17, display: 'block', marginBottom: 8 }}>{t.brand}</span>
            <p style={{ fontSize: 13, color: t.muted, lineHeight: 1.5 }}>
              Built by engineers, for engineers. Made in SF, NY, and remote everywhere.
            </p>
          </div>
          {[
            { h: 'Product', items: ['Platform', 'Runtime', 'Analytics', 'Changelog'] },
            { h: 'Company', items: ['About', 'Customers', 'Careers', 'Press'] },
            { h: 'Resources', items: ['Docs', 'Guides', 'API ref', 'Status'] },
            { h: 'Legal', items: ['Privacy', 'Terms', 'Security', 'DPA'] },
          ].map((col) => (
            <div key={col.h}>
              <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 14 }}>
                {col.h}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
                {col.items.map((i) => (
                  <li key={i} style={{ fontSize: 13, color: t.muted }}>
                    {i}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ maxWidth: 1200, margin: '32px auto 0', fontSize: 11, color: t.muted, textAlign: 'center' }}>
          © 2026 {t.brand} Inc. All rights reserved. · More scenes coming in v1.1
        </div>
      </footer>
    </div>
  );
}
