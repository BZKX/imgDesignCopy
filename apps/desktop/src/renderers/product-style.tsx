import type { ProductStyle } from '@promptlens/core';

export function ProductStyleRenderer({ result }: { result: ProductStyle }) {
  return (
    <div className="renderer">
      <Section title="配色">
        <div className="renderer-palette">
          {result.palette.map((c, i) => (
            <ColorSwatch key={`${c}-${i}`} color={c} />
          ))}
        </div>
      </Section>
      <Section title="材质">
        <Chips items={result.materials} />
      </Section>
      <Section title="情绪">
        <Chips items={result.mood} tone="accent" />
      </Section>
      <Section title="标签">
        <Chips items={result.tags} />
      </Section>
      <InfoRow label="光照" value={result.lighting} />
      <InfoRow label="镜头" value={result.camera} />
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="renderer-row">
      <span className="renderer-row-label">{label}</span>
      <span className="renderer-row-value">{value}</span>
    </div>
  );
}

function ColorSwatch({ color }: { color: string }) {
  const safe = /^#?[0-9a-fA-F]{3,8}$|^rgb|^hsl/.test(color)
    ? color.startsWith('#') || color.startsWith('rgb') || color.startsWith('hsl')
      ? color
      : `#${color}`
    : color;
  return (
    <span className="palette-swatch" title={color}>
      <span className="palette-chip" style={{ background: safe }} />
      <span className="palette-code">{color}</span>
    </span>
  );
}
