'use client';

import { useRef, useEffect, useState } from 'react';

type RoadmapStatus = 'shipped' | 'building' | 'planned';

interface RoadmapItem {
  label: string;
  status: RoadmapStatus;
}

interface RoadmapQuadrant {
  phase: string;
  title: string;
  description: string;
  items: RoadmapItem[];
}

const ROADMAP: RoadmapQuadrant[] = [
  {
    phase: 'Now',
    title: 'Shipped',
    description: 'Already in your hands.',
    items: [
      { label: 'Chrome Extension (MV3)', status: 'shipped' },
      { label: 'Multi-provider: OpenAI, Anthropic, Gemini', status: 'shipped' },
      { label: 'Local history (SQLite)', status: 'shipped' },
      { label: 'JSON / Markdown export', status: 'shipped' },
      { label: 'Screenshot region capture', status: 'shipped' },
    ],
  },
  {
    phase: 'Next',
    title: 'Building',
    description: 'In active development.',
    items: [
      { label: 'macOS Menu Bar app', status: 'building' },
      { label: 'Windows Tray app', status: 'building' },
      { label: 'Global shortcut ⌘⇧Y', status: 'building' },
      { label: 'Ollama local-first mode', status: 'building' },
      { label: 'Batch prompt generation', status: 'planned' },
    ],
  },
  {
    phase: 'Later',
    title: 'Planned',
    description: 'On the horizon.',
    items: [
      { label: 'Firefox extension', status: 'planned' },
      { label: 'Figma plugin', status: 'planned' },
      { label: 'Style library & presets', status: 'planned' },
      { label: 'Team sharing (optional cloud)', status: 'planned' },
      { label: 'Pro tier (priority features)', status: 'planned' },
    ],
  },
];

const STATUS_COLORS: Record<RoadmapStatus, string> = {
  shipped: '#2ee59d',
  building: '#7c5cff',
  planned: '#6b6b73',
};

const STATUS_LABELS: Record<RoadmapStatus, string> = {
  shipped: '✓',
  building: '◎',
  planned: '○',
};

function QuadrantCard({ quadrant, index }: { quadrant: RoadmapQuadrant; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), index * 100);
          obs.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [index]);

  const isNow = index === 0;

  return (
    <div
      ref={cardRef}
      style={{
        flex: '1 1 260px',
        maxWidth: '380px',
        background: 'var(--color-pl-bg-elev-1)',
        border: `1px solid ${isNow ? 'rgba(46,229,157,0.2)' : 'var(--pl-border-subtle)'}`,
        borderRadius: '12px',
        padding: '32px 28px',
        boxShadow: isNow ? '0 0 0 1px rgba(46,229,157,0.08), var(--pl-shadow-card)' : 'var(--pl-shadow-card)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.5s var(--pl-ease-out), transform 0.5s var(--pl-ease-out)`,
      }}
    >
      {/* Phase label */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '20px',
        }}
      >
        <span
          style={{
            fontSize: '0.75rem',
            fontFamily: 'var(--font-pl-mono)',
            fontWeight: 600,
            color: isNow ? '#2ee59d' : index === 1 ? 'var(--color-pl-accent-from)' : 'var(--color-pl-fg-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {quadrant.phase}
        </span>
        {isNow && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              background: 'rgba(46,229,157,0.12)',
              border: '1px solid rgba(46,229,157,0.25)',
              borderRadius: '999px',
              fontSize: '0.6875rem',
              color: '#2ee59d',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: '#2ee59d',
                boxShadow: '0 0 6px #2ee59d',
                display: 'inline-block',
              }}
            />
            Live
          </span>
        )}
      </div>

      <h3
        style={{
          fontSize: '1.375rem',
          fontWeight: 600,
          color: 'var(--color-pl-fg-primary)',
          margin: '0 0 6px',
        }}
      >
        {quadrant.title}
      </h3>
      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--color-pl-fg-tertiary)',
          margin: '0 0 24px',
        }}
      >
        {quadrant.description}
      </p>

      {/* Items */}
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
        {quadrant.items.map((item) => (
          <li
            key={item.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.9rem',
              color: item.status === 'shipped'
                ? 'var(--color-pl-fg-secondary)'
                : item.status === 'building'
                ? 'var(--color-pl-fg-secondary)'
                : 'var(--color-pl-fg-tertiary)',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                fontSize: '0.8rem',
                color: STATUS_COLORS[item.status],
                flexShrink: 0,
                width: '14px',
                textAlign: 'center',
              }}
            >
              {STATUS_LABELS[item.status]}
            </span>
            <span
              style={{
                textDecoration: item.status === 'shipped' ? 'none' : 'none',
              }}
            >
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Roadmap() {
  return (
    <section
      id="roadmap"
      aria-label="Roadmap"
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
          ROADMAP
        </p>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '24px',
            marginBottom: '64px',
            flexWrap: 'wrap',
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              fontWeight: 700,
              color: 'var(--color-pl-fg-primary)',
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            What&apos;s coming next.
          </h2>
          <a
            href="https://github.com/promptlens"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '0.875rem',
              color: 'var(--color-pl-fg-tertiary)',
              textDecoration: 'none',
              borderBottom: '1px solid var(--pl-border-subtle)',
              paddingBottom: '2px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = 'var(--color-pl-fg-secondary)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = 'var(--color-pl-fg-tertiary)';
            }}
          >
            Suggest a feature →
          </a>
        </div>

        {/* Quadrant cards */}
        <div
          style={{
            display: 'flex',
            gap: '20px',
            flexWrap: 'wrap',
          }}
        >
          {ROADMAP.map((quadrant, index) => (
            <QuadrantCard key={quadrant.phase} quadrant={quadrant} index={index} />
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          #roadmap > div { padding: 0 20px !important; }
        }
      `}</style>
    </section>
  );
}
