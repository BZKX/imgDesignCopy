import { useMemo, useState } from 'react';
import type { WebDesign } from '@promptlens/core';
import { useT } from '@/lib/i18n';

type DesignTokens = NonNullable<WebDesign['tokens']>;

type ExportTab = 'skill' | 'figma';

const EXPORT_TABS: { key: ExportTab; label: string }[] = [
  { key: 'skill', label: 'Skill.md' },
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
      <Section title={t('renderer.web.export')}>
        <DesignExports result={result} />
      </Section>
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
    </>
  );
}

function DesignExports({ result }: { result: WebDesign }) {
  const { t } = useT();
  const [tab, setTab] = useState<ExportTab>('skill');
  const payloads = useMemo(() => buildExports(result), [result]);
  const current = payloads[tab];
  const hint =
    tab === 'figma'
      ? t('renderer.web.tokens.figmaHint')
      : t('renderer.web.skillHint');
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
      <ExportPane text={current} hint={hint} />
    </>
  );
}

function ExportPane({ text, hint }: { text: string; hint?: string }) {
  const { t } = useT();
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }
  return (
    <div className="sub-card">
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: hint ? 8 : 0,
        }}
      >
        {hint ? (
          <div className="sub-card-label" style={{ flex: 1, margin: 0 }}>
            {hint}
          </div>
        ) : (
          <span />
        )}
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={copy}
          style={{ flexShrink: 0 }}
        >
          <CopyIcon />
          {copied ? t('common.copied') : t('common.copy')}
        </button>
      </div>
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

function prettyJson(obj: unknown): string {
  return JSON.stringify(obj, null, 2);
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

function buildExports(result: WebDesign): Record<ExportTab, string> {
  const skill = buildSkillMd(result);
  const figma = result.tokens ? prettyJson(toTokensStudio(result.tokens)) : '{}';
  return { skill, figma };
}

// Produce a skill-style markdown document describing the captured design.
// Intended to be dropped into an AI agent / design workflow as a reusable
// reference for reproducing the page's look-and-feel.
function buildSkillMd(result: WebDesign): string {
  const lines: string[] = [];
  lines.push('# Design Skill');
  lines.push('');
  lines.push(
    'Structured design reference extracted by PromptLens. Apply to Figma, code, or AI design workflows to reproduce this page\'s look and feel.',
  );
  lines.push('');

  lines.push('## Layout');
  lines.push(result.layout);
  lines.push('');

  lines.push('## Typography');
  lines.push(`- Heading: ${result.typography.heading}`);
  lines.push(`- Body: ${result.typography.body}`);
  lines.push('');

  lines.push('## Colors');
  lines.push(`- Primary: \`${result.colors.primary}\``);
  if (result.colors.accents.length) {
    lines.push(
      `- Accents: ${result.colors.accents.map((c) => `\`${c}\``).join(', ')}`,
    );
  }
  lines.push('');

  lines.push('## Components');
  for (const c of result.components) {
    lines.push(`- ${c}`);
  }
  lines.push('');

  lines.push('## Interactions');
  for (const i of result.interactions) {
    lines.push(`- ${i}`);
  }
  lines.push('');

  lines.push('## Tone');
  lines.push(result.tone);
  lines.push('');

  const tokens = result.tokens;
  if (tokens && hasAnyToken(tokens)) {
    lines.push('## Design Tokens');
    lines.push('');

    if (tokens.color && Object.keys(tokens.color).length) {
      lines.push('### Color');
      lines.push('| Name | Value |');
      lines.push('|------|-------|');
      for (const [name, v] of Object.entries(tokens.color)) {
        lines.push(`| \`${name}\` | \`${v.value}\` |`);
      }
      lines.push('');
    }

    if (tokens.font_size && Object.keys(tokens.font_size).length) {
      lines.push('### Font Size');
      lines.push('| Name | Size | Line Height |');
      lines.push('|------|------|-------------|');
      for (const [name, v] of Object.entries(tokens.font_size)) {
        lines.push(
          `| \`${name}\` | \`${v.value}\` | ${v.line_height ? `\`${v.line_height}\`` : '—'} |`,
        );
      }
      lines.push('');
    }

    if (tokens.spacing && Object.keys(tokens.spacing).length) {
      lines.push('### Spacing');
      lines.push('| Name | Value |');
      lines.push('|------|-------|');
      for (const [name, v] of Object.entries(tokens.spacing)) {
        lines.push(`| \`${name}\` | \`${v}\` |`);
      }
      lines.push('');
    }

    if (tokens.radius && Object.keys(tokens.radius).length) {
      lines.push('### Radius');
      lines.push('| Name | Value |');
      lines.push('|------|-------|');
      for (const [name, v] of Object.entries(tokens.radius)) {
        lines.push(`| \`${name}\` | \`${v}\` |`);
      }
      lines.push('');
    }

    if (tokens.shadow && Object.keys(tokens.shadow).length) {
      lines.push('### Shadow');
      lines.push('| Name | Value |');
      lines.push('|------|-------|');
      for (const [name, v] of Object.entries(tokens.shadow)) {
        lines.push(`| \`${name}\` | \`${v}\` |`);
      }
      lines.push('');
    }
  }

  lines.push('---');
  lines.push('Generated by PromptLens · promptlens.cc');
  lines.push('');

  return lines.join('\n');
}
