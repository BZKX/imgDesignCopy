import { useState } from 'react';
import type { ProductStyle } from '@promptlens/core';
import { useT, type I18nKey } from '@/lib/i18n';

export function ProductStyleRenderer({ result }: { result: ProductStyle }) {
  const { t } = useT();
  return (
    <div className="renderer">
      <Section title={t('renderer.product.palette')}>
        <div className="renderer-palette">
          {result.palette.map((c, i) => (
            <ColorSwatch key={`${c}-${i}`} color={c} />
          ))}
        </div>
      </Section>

      {result.cmf ? (
        <Section title={t('renderer.product.cmf')}>
          <div className="renderer-row">
            <span className="renderer-row-label">{t('renderer.product.cmf.colors')}</span>
            <Chips items={result.cmf.colors} />
          </div>
          <div className="renderer-row">
            <span className="renderer-row-label">{t('renderer.product.cmf.materials')}</span>
            <Chips items={result.cmf.materials} />
          </div>
          <div className="renderer-row">
            <span className="renderer-row-label">{t('renderer.product.cmf.finishes')}</span>
            <Chips items={result.cmf.finishes} />
          </div>
        </Section>
      ) : (
        <Section title={t('renderer.product.materials')}>
          <Chips items={result.materials} />
        </Section>
      )}

      <Section title={t('renderer.product.lighting')}>
        {result.lighting_detail ? (
          <>
            <InfoRow label={t('renderer.product.lighting.key')} value={result.lighting_detail.key} />
            <InfoRow label={t('renderer.product.lighting.fill')} value={result.lighting_detail.fill} />
            <InfoRow label={t('renderer.product.lighting.ambient')} value={result.lighting_detail.ambient} />
          </>
        ) : (
          <InfoRow label={t('renderer.product.lighting.overall')} value={result.lighting} />
        )}
      </Section>

      <Section title={t('renderer.product.lens')}>
        {result.lens ? (
          <>
            <InfoRow label={t('renderer.product.lens.focal')} value={result.lens.focal_length} />
            <InfoRow label={t('renderer.product.lens.angle')} value={result.lens.angle} />
            <InfoRow label={t('renderer.product.lens.depth')} value={result.lens.depth_of_field} />
          </>
        ) : (
          <InfoRow label={t('renderer.product.lens.lens')} value={result.camera} />
        )}
      </Section>

      {result.composition ? (
        <Section title={t('renderer.product.composition')}>
          <div className="renderer-block">{result.composition}</div>
        </Section>
      ) : null}

      {result.scene ? (
        <Section title={t('renderer.product.scene')}>
          <InfoRow label={t('renderer.product.scene.setting')} value={result.scene.setting} />
          <div className="renderer-row">
            <span className="renderer-row-label">{t('renderer.product.scene.props')}</span>
            <Chips items={result.scene.props} />
          </div>
        </Section>
      ) : null}

      <Section title={t('renderer.product.mood')}>
        <Chips items={result.mood} tone="accent" />
      </Section>

      {result.prompt && (result.prompt.midjourney || result.prompt.natural_language) && (
        <ProductPromptCard prompt={result.prompt} />
      )}

      {result.shot_list ? <ShotListCard shotList={result.shot_list} /> : null}

      <Section title={t('renderer.product.tags')}>
        <Chips items={result.tags} />
      </Section>
    </div>
  );
}

function ProductPromptCard({ prompt }: { prompt: NonNullable<ProductStyle['prompt']> }) {
  const { t } = useT();
  const [mjToast, setMjToast] = useState(false);
  const [nlToast, setNlToast] = useState(false);

  async function copyMj() {
    try {
      await navigator.clipboard.writeText(prompt.midjourney ?? '');
      setMjToast(true);
      setTimeout(() => setMjToast(false), 1500);
    } catch {
      /* ignore */
    }
  }

  async function copyNl() {
    try {
      await navigator.clipboard.writeText(prompt.natural_language ?? '');
      setNlToast(true);
      setTimeout(() => setNlToast(false), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="prompt-card renderer-section" style={{ borderLeft: '3px solid var(--accent, #4f46e5)' }}>
      <div className="renderer-section-title">
        <span>{t('renderer.product.prompt.title')}</span>
        <span className="sub-card-label" style={{ fontWeight: 400, marginLeft: 8 }}>
          {t('renderer.product.prompt.hint')}
        </span>
      </div>
      {prompt.midjourney && (
        <div className="sub-card" style={{ marginTop: 8 }}>
          <div className="sub-card-label">Midjourney</div>
          <div className="prompt-text">{prompt.midjourney}</div>
          <div className="actions">
            <button type="button" className="btn btn-primary" onClick={copyMj}>
              <CopyIcon />
              {t('common.copy')}
            </button>
            <span className={`toast ${mjToast ? 'visible' : ''}`}>{t('common.copied')}</span>
          </div>
        </div>
      )}
      {prompt.natural_language && (
        <div className="sub-card" style={{ marginTop: 8 }}>
          <div className="sub-card-label">{t('prompt.naturalLanguage')}</div>
          <div className="prompt-text">{prompt.natural_language}</div>
          <div className="actions">
            <button type="button" className="btn btn-primary" onClick={copyNl}>
              <CopyIcon />
              {t('common.copy')}
            </button>
            <span className={`toast ${nlToast ? 'visible' : ''}`}>{t('common.copied')}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ShotListCard({ shotList }: { shotList: NonNullable<ProductStyle['shot_list']> }) {
  const { t } = useT();
  const [copied, setCopied] = useState(false);
  const rows: Array<{ key: keyof typeof shotList; labelKey: I18nKey }> = [
    { key: 'camera', labelKey: 'renderer.product.shotList.camera' },
    { key: 'lighting', labelKey: 'renderer.product.shotList.lighting' },
    { key: 'background', labelKey: 'renderer.product.shotList.background' },
    { key: 'props', labelKey: 'renderer.product.shotList.props' },
    { key: 'post', labelKey: 'renderer.product.shotList.post' },
  ];

  async function handleCopy() {
    const text = rows.map((r) => `${t(r.labelKey)}：${shotList[r.key]}`).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="prompt-card renderer-section" style={{ borderLeft: '3px solid var(--accent, #4f46e5)' }}>
      <div className="renderer-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{t('renderer.product.shotList.title')}</span>
        <button type="button" className="renderer-copy-btn" onClick={handleCopy}>
          {copied ? t('common.copied') : t('renderer.product.copyShotList')}
        </button>
      </div>
      {rows.map((r) => (
        <InfoRow key={r.key} label={t(r.labelKey)} value={shotList[r.key]} />
      ))}
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
