import type { WebDesign } from '@promptlens/core';

export function WebDesignRenderer({ result }: { result: WebDesign }) {
  return (
    <div className="renderer">
      <Section title="布局">
        <div className="renderer-block">{result.layout}</div>
      </Section>
      <Section title="字体">
        <div className="renderer-row">
          <span className="renderer-row-label">Heading</span>
          <span className="renderer-row-value">{result.typography.heading}</span>
        </div>
        <div className="renderer-row">
          <span className="renderer-row-label">Body</span>
          <span className="renderer-row-value">{result.typography.body}</span>
        </div>
      </Section>
      <Section title="配色">
        <div className="renderer-palette">
          <ColorSwatch color={result.colors.primary} primary />
          {result.colors.accents.map((c, i) => (
            <ColorSwatch key={`${c}-${i}`} color={c} />
          ))}
        </div>
      </Section>
      <Section title="组件">
        <Chips items={result.components} />
      </Section>
      <Section title="交互">
        <Chips items={result.interactions} tone="accent" />
      </Section>
      <Section title="调性">
        <div className="renderer-block">{result.tone}</div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="renderer-section">
      <div className="renderer-section-title">{title}</div>
      {children}
    </div>
  );
}

function Chips({ items, tone }: { items: string[]; tone?: 'accent' }) {
  return (
    <div className="renderer-chips">
      {items.map((t, i) => (
        <span key={`${t}-${i}`} className={`renderer-chip${tone ? ` renderer-chip--${tone}` : ''}`}>
          {t}
        </span>
      ))}
    </div>
  );
}

function ColorSwatch({ color, primary }: { color: string; primary?: boolean }) {
  return (
    <span className={`palette-swatch${primary ? ' palette-swatch--primary' : ''}`} title={color}>
      <span className="palette-chip" style={{ background: color }} />
      <span className="palette-code">{color}</span>
    </span>
  );
}
