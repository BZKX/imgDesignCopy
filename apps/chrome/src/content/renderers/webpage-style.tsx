import { useMemo, useState } from 'react';
import type { WebDesign } from '@promptlens/core';
import { useT } from '@/lib/i18n';

type DesignTokens = NonNullable<WebDesign['tokens']>;

type ExportTab = 'dtcg' | 'tailwind' | 'css' | 'shadcn' | 'figma';

const EXPORT_TABS: { key: ExportTab; label: string }[] = [
  { key: 'dtcg', label: 'W3C DTCG' },
  { key: 'tailwind', label: 'Tailwind' },
  { key: 'css', label: 'CSS Variables' },
  { key: 'shadcn', label: 'shadcn' },
  { key: 'figma', label: 'Figma' },
];

export function WebDesignRenderer({ result }: { result: WebDesign }) {
  const { t } = useT();
  return (
    <div className="renderer">
      <Section title={t('renderer.web.layout')}>
        <div className="renderer-block">{result.layout}</div>
      </Section>
      <Section title={t('renderer.web.typography')}>
        <div className="renderer-row">
          <span className="renderer-row-label">{t('renderer.web.typography.heading')}</span>
          <span className="renderer-row-value">{result.typography.heading}</span>
        </div>
        <div className="renderer-row">
          <span className="renderer-row-label">{t('renderer.web.typography.body')}</span>
          <span className="renderer-row-value">{result.typography.body}</span>
        </div>
      </Section>
      <Section title={t('renderer.web.colors')}>
        <div className="renderer-palette">
          <ColorSwatch color={result.colors.primary} primary />
          {result.colors.accents.map((c, i) => (
            <ColorSwatch key={`${c}-${i}`} color={c} />
          ))}
        </div>
      </Section>
      <Section title={t('renderer.web.components')}>
        <Chips items={result.components} />
      </Section>
      <Section title={t('renderer.web.interactions')}>
        <Chips items={result.interactions} tone="accent" />
      </Section>
      <Section title={t('renderer.web.tone')}>
        <div className="renderer-block">{result.tone}</div>
      </Section>
      {result.tokens && hasAnyToken(result.tokens) && (
        <TokensView tokens={result.tokens} />
      )}
    </div>
  );
}

function hasAnyToken(t: DesignTokens): boolean {
  return Boolean(
    (t.color && Object.keys(t.color).length) ||
      (t.font_size && Object.keys(t.font_size).length) ||
      (t.spacing && Object.keys(t.spacing).length) ||
      (t.radius && Object.keys(t.radius).length) ||
      (t.shadow && Object.keys(t.shadow).length),
  );
}

function TokensView({ tokens }: { tokens: DesignTokens }) {
  const { t } = useT();
  return (
    <>
      <Section title={t('renderer.web.tokens.overview')}>
        {tokens.color && Object.keys(tokens.color).length > 0 && (
          <SubSection label="Color">
            <div className="renderer-palette">
              {Object.entries(tokens.color).map(([name, v]) => (
                <NamedSwatch key={name} name={name} color={v.value} />
              ))}
            </div>
          </SubSection>
        )}
        {tokens.font_size && Object.keys(tokens.font_size).length > 0 && (
          <SubSection label="Font Size">
            {Object.entries(tokens.font_size).map(([name, v]) => (
              <div className="renderer-row" key={name}>
                <span className="renderer-row-label">{name}</span>
                <span className="renderer-row-value">
                  {v.value}
                  {v.line_height ? ` / ${v.line_height}` : ''}
                </span>
              </div>
            ))}
          </SubSection>
        )}
        {tokens.spacing && Object.keys(tokens.spacing).length > 0 && (
          <SubSection label="Spacing">
            {Object.entries(tokens.spacing).map(([name, v]) => (
              <div className="renderer-row" key={name}>
                <span className="renderer-row-label">{name}</span>
                <span className="renderer-row-value">{v}</span>
              </div>
            ))}
          </SubSection>
        )}
        {tokens.radius && Object.keys(tokens.radius).length > 0 && (
          <SubSection label="Radius">
            {Object.entries(tokens.radius).map(([name, v]) => (
              <div className="renderer-row" key={name}>
                <span className="renderer-row-label">{name}</span>
                <span className="renderer-row-value">{v}</span>
              </div>
            ))}
          </SubSection>
        )}
        {tokens.shadow && Object.keys(tokens.shadow).length > 0 && (
          <SubSection label="Shadow">
            {Object.entries(tokens.shadow).map(([name, v]) => (
              <div className="renderer-row" key={name}>
                <span className="renderer-row-label">{name}</span>
                <span className="renderer-row-value">{v}</span>
              </div>
            ))}
          </SubSection>
        )}
      </Section>
      <Section title={t('renderer.web.tokens.export')}>
        <TokenExports tokens={tokens} />
      </Section>
    </>
  );
}

function TokenExports({ tokens }: { tokens: DesignTokens }) {
  const { t } = useT();
  const [tab, setTab] = useState<ExportTab>('dtcg');
  const payloads = useMemo(() => buildExports(tokens), [tokens]);
  const current = payloads[tab];
  return (
    <>
      <div className="segment" role="tablist">
        {EXPORT_TABS.map((et) => (
          <button
            key={et.key}
            type="button"
            role="tab"
            aria-selected={tab === et.key}
            className={tab === et.key ? 'active' : ''}
            onClick={() => setTab(et.key)}
          >
            {et.label}
          </button>
        ))}
      </div>
      {tab === 'figma' ? (
        <ExportPane text={current} hint={t('renderer.web.tokens.figmaHint')} />
      ) : (
        <ExportPane text={current} />
      )}
    </>
  );
}

function ExportPane({ text, hint }: { text: string; hint?: string }) {
  const { t } = useT();
  const [toast, setToast] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setToast(true);
      setTimeout(() => setToast(false), 1500);
    } catch {
      /* ignore */
    }
  }
  return (
    <div className="sub-card">
      <div className="actions">
        <button type="button" className="btn btn-primary" onClick={copy}>
          <CopyIcon />
          {t('common.copy')}
        </button>
        <span className={`toast ${toast ? 'visible' : ''}`}>{t('common.copied')}</span>
      </div>
      {hint && <div className="sub-card-label">{hint}</div>}
      <pre>{text}</pre>
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

function SubSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="renderer-section">
      <div className="renderer-row-label" style={{ marginBottom: 6 }}>
        {label}
      </div>
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

function NamedSwatch({ name, color }: { name: string; color: string }) {
  return (
    <span className="palette-swatch" title={`${name} ${color}`}>
      <span className="palette-chip" style={{ background: color }} />
      <span className="palette-code">{name}</span>
    </span>
  );
}

function CopyIcon() {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      style={{ width: 13, height: 13 }}
    >
      <rect x="3.5" y="3.5" width="8" height="9" rx="1.5" />
      <path d="M6 3.5V2.5a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-.5" />
    </svg>
  );
}

// ---------- code-gen helpers ----------

function dottedToKebab(key: string): string {
  return key.replace(/\./g, '-').replace(/_/g, '-');
}

type ColorMap = NonNullable<DesignTokens['color']>;
type FontSizeMap = NonNullable<DesignTokens['font_size']>;
type SimpleMap = Record<string, string>;

function dottedToNestedColors(obj: ColorMap): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, v] of Object.entries(obj)) {
    assignNested(out, key.split('.'), v.value);
  }
  return out;
}

function dottedToNestedStrings(obj: SimpleMap): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, v] of Object.entries(obj)) {
    assignNested(out, key.split('.'), v);
  }
  return out;
}

function assignNested(root: Record<string, unknown>, path: string[], value: string) {
  let cur: Record<string, unknown> = root;
  for (let i = 0; i < path.length - 1; i++) {
    const seg = path[i];
    const existing = cur[seg];
    if (existing && typeof existing === 'object' && !Array.isArray(existing)) {
      cur = existing as Record<string, unknown>;
    } else {
      // Nesting collision: earlier assignment placed a string at this node.
      // Resolve by moving that string to a DEFAULT key so the nesting can continue.
      const nextObj: Record<string, unknown> = {};
      if (typeof existing === 'string') nextObj.DEFAULT = existing;
      cur[seg] = nextObj;
      cur = nextObj;
    }
  }
  const last = path[path.length - 1];
  const existing = cur[last];
  if (existing && typeof existing === 'object' && !Array.isArray(existing)) {
    (existing as Record<string, unknown>).DEFAULT = value;
  } else {
    cur[last] = value;
  }
}

function fontSizeToTailwind(obj: FontSizeMap): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, v] of Object.entries(obj)) {
    if (v.line_height) {
      out[key] = [v.value, { lineHeight: v.line_height }];
    } else {
      out[key] = v.value;
    }
  }
  return out;
}

function parseHex(input: string): { r: number; g: number; b: number } | null {
  const raw = input.trim();
  const m = raw.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/);
  if (!m) return null;
  let hex = m[1];
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('');
  }
  // Drop alpha if present
  if (hex.length === 8) hex = hex.slice(0, 6);
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return null;
  return { r, g, b };
}

function hexToHsl(hex: string): string {
  const rgb = parseHex(hex);
  if (!rgb) return `/* invalid hex: ${hex} */ 0 0% 0%`;
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  const H = Math.round(h * 360);
  const S = Math.round(s * 100);
  const L = Math.round(l * 100);
  return `${H} ${S}% ${L}%`;
}

function prettyJson(obj: unknown): string {
  return JSON.stringify(obj, null, 2);
}

// Emit a Tailwind-style JS object literal (unquoted keys when safe).
function toJsObjectLiteral(value: unknown, indent = 0): string {
  const pad = (n: number) => ' '.repeat(n);
  if (value === null) return 'null';
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    const inner = value.map((v) => toJsObjectLiteral(v, indent + 2)).join(', ');
    return `[${inner}]`;
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return '{}';
    const lines = entries.map(([k, v]) => {
      const key = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k) ? k : JSON.stringify(k);
      return `${pad(indent + 2)}${key}: ${toJsObjectLiteral(v, indent + 2)}`;
    });
    return `{\n${lines.join(',\n')}\n${pad(indent)}}`;
  }
  return 'undefined';
}

// Tokens Studio (Figma) JSON format
type TSLeaf = { value: string; type: string; description?: string };
type TSNode = TSLeaf | Record<string, TSLeaf | Record<string, unknown>>;

function assignNestedTS(
  root: Record<string, unknown>,
  path: string[],
  leaf: TSLeaf,
) {
  let cur: Record<string, unknown> = root;
  for (let i = 0; i < path.length - 1; i++) {
    const seg = path[i];
    if (cur[seg] == null || typeof cur[seg] !== 'object') {
      cur[seg] = {};
    }
    cur = cur[seg] as Record<string, unknown>;
  }
  cur[path[path.length - 1]] = leaf;
}

function toTokensStudio(tokens: DesignTokens): Record<string, TSNode> {
  const out: Record<string, unknown> = {};

  if (tokens.color && Object.keys(tokens.color).length) {
    const group: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(tokens.color)) {
      const leaf: TSLeaf = { value: v.value, type: 'color' };
      if (v.description) leaf.description = v.description;
      assignNestedTS(group, key.split('.'), leaf);
    }
    out.color = group;
  }

  if (tokens.font_size && Object.keys(tokens.font_size).length) {
    const sizeGroup: Record<string, unknown> = {};
    const lhGroup: Record<string, unknown> = {};
    let hasLh = false;
    for (const [key, v] of Object.entries(tokens.font_size)) {
      assignNestedTS(sizeGroup, key.split('.'), { value: v.value, type: 'fontSizes' });
      if (v.line_height) {
        hasLh = true;
        assignNestedTS(lhGroup, key.split('.'), { value: v.line_height, type: 'lineHeights' });
      }
    }
    out.fontSize = sizeGroup;
    if (hasLh) out.lineHeight = lhGroup;
  }

  if (tokens.spacing && Object.keys(tokens.spacing).length) {
    const group: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(tokens.spacing)) {
      assignNestedTS(group, key.split('.'), { value: v, type: 'spacing' });
    }
    out.spacing = group;
  }

  if (tokens.radius && Object.keys(tokens.radius).length) {
    const group: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(tokens.radius)) {
      assignNestedTS(group, key.split('.'), { value: v, type: 'borderRadius' });
    }
    out.borderRadius = group;
  }

  if (tokens.shadow && Object.keys(tokens.shadow).length) {
    const group: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(tokens.shadow)) {
      assignNestedTS(group, key.split('.'), { value: v, type: 'boxShadow' });
    }
    out.boxShadow = group;
  }

  return out as Record<string, TSNode>;
}

function buildExports(tokens: DesignTokens): Record<ExportTab, string> {
  // DTCG: wrap under "tokens" root. Use the token object as-is (already DTCG-compatible shorthand).
  const dtcg = prettyJson({ tokens });

  // Tailwind
  const twExtend: Record<string, unknown> = {};
  if (tokens.color && Object.keys(tokens.color).length) {
    twExtend.colors = dottedToNestedColors(tokens.color);
  }
  if (tokens.font_size && Object.keys(tokens.font_size).length) {
    twExtend.fontSize = fontSizeToTailwind(tokens.font_size);
  }
  if (tokens.spacing && Object.keys(tokens.spacing).length) {
    twExtend.spacing = dottedToNestedStrings(tokens.spacing);
  }
  if (tokens.radius && Object.keys(tokens.radius).length) {
    twExtend.borderRadius = dottedToNestedStrings(tokens.radius);
  }
  if (tokens.shadow && Object.keys(tokens.shadow).length) {
    twExtend.boxShadow = dottedToNestedStrings(tokens.shadow);
  }
  const tailwind =
    '/** @type {import("tailwindcss").Config} */\nmodule.exports = ' +
    toJsObjectLiteral({ theme: { extend: twExtend } }) +
    ';';

  // CSS variables (plain)
  const cssLines: string[] = [':root {'];
  if (tokens.color) {
    for (const [k, v] of Object.entries(tokens.color)) {
      cssLines.push(`  --${dottedToKebab(k)}: ${v.value};`);
    }
  }
  if (tokens.font_size) {
    for (const [k, v] of Object.entries(tokens.font_size)) {
      cssLines.push(`  --fs-${dottedToKebab(k)}: ${v.value};`);
      if (v.line_height) cssLines.push(`  --lh-${dottedToKebab(k)}: ${v.line_height};`);
    }
  }
  if (tokens.spacing) {
    for (const [k, v] of Object.entries(tokens.spacing)) {
      cssLines.push(`  --sp-${dottedToKebab(k)}: ${v};`);
    }
  }
  if (tokens.radius) {
    for (const [k, v] of Object.entries(tokens.radius)) {
      cssLines.push(`  --radius-${dottedToKebab(k)}: ${v};`);
    }
  }
  if (tokens.shadow) {
    for (const [k, v] of Object.entries(tokens.shadow)) {
      cssLines.push(`  --shadow-${dottedToKebab(k)}: ${v};`);
    }
  }
  cssLines.push('}');
  const css = cssLines.join('\n');

  // shadcn: HSL for colors, raw for others. Light only.
  const shadcnLines: string[] = [':root {'];
  if (tokens.color) {
    for (const [k, v] of Object.entries(tokens.color)) {
      const hsl = hexToHsl(v.value);
      shadcnLines.push(`  --${dottedToKebab(k)}: ${hsl};`);
    }
  }
  if (tokens.font_size) {
    for (const [k, v] of Object.entries(tokens.font_size)) {
      shadcnLines.push(`  --fs-${dottedToKebab(k)}: ${v.value};`);
    }
  }
  if (tokens.spacing) {
    for (const [k, v] of Object.entries(tokens.spacing)) {
      shadcnLines.push(`  --sp-${dottedToKebab(k)}: ${v};`);
    }
  }
  if (tokens.radius) {
    for (const [k, v] of Object.entries(tokens.radius)) {
      shadcnLines.push(`  --radius-${dottedToKebab(k)}: ${v};`);
    }
  }
  if (tokens.shadow) {
    for (const [k, v] of Object.entries(tokens.shadow)) {
      shadcnLines.push(`  --shadow-${dottedToKebab(k)}: ${v};`);
    }
  }
  shadcnLines.push('}');
  shadcnLines.push('');
  shadcnLines.push('/* Usage: color: hsl(var(--brand-primary)); */');
  const shadcn = shadcnLines.join('\n');

  const figma = prettyJson(toTokensStudio(tokens));

  return { dtcg, tailwind, css, shadcn, figma };
}
