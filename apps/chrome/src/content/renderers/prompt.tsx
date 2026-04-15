import { useState } from 'react';
import type { PromptResult } from '@promptlens/core';
import { useT } from '@/lib/i18n';

type Tab = 'midjourney' | 'stable_diffusion' | 'flux' | 'dalle';

const TABS: { key: Tab; label: string }[] = [
  { key: 'midjourney', label: 'Midjourney' },
  { key: 'stable_diffusion', label: 'Stable Diffusion' },
  { key: 'flux', label: 'Flux' },
  { key: 'dalle', label: 'DALL·E' },
];

export function PromptRenderer({ result }: { result: PromptResult }) {
  const { t } = useT();
  const [tab, setTab] = useState<Tab>('midjourney');
  const fluxFallback = !result.flux?.prompt;
  const fluxText = result.flux?.prompt ?? result.dalle;

  return (
    <>
      {(result.style_summary || result.aspect_ratio) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 10,
          }}
        >
          {result.style_summary && (
            <span
              className="hero-eyebrow"
              style={{ marginBottom: 0, lineHeight: 1.4 }}
            >
              {result.style_summary}
            </span>
          )}
          {result.aspect_ratio && (
            <span
              className="renderer-chip renderer-chip--accent"
              style={{ lineHeight: 1.4 }}
            >
              📐 {result.aspect_ratio}
            </span>
          )}
        </div>
      )}

      <div className="segment" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            className={tab === t.key ? 'active' : ''}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'midjourney' && (
        <SinglePrompt label="Midjourney prompt" text={result.midjourney} />
      )}
      {tab === 'stable_diffusion' && <SdPrompt sd={result.stable_diffusion} />}
      {tab === 'flux' && (
        <SinglePrompt
          label="Flux prompt"
          text={fluxText}
          hint={fluxFallback ? t('prompt.flux.fallback') : undefined}
        />
      )}
      {tab === 'dalle' && (
        <SinglePrompt label="DALL·E / GPT-4o prompt" text={result.dalle} />
      )}

      {result.natural_language && (
        <CollapsibleSection
          title={t('prompt.naturalLanguage')}
          defaultOpen={false}
        >
          <NaturalLanguage text={result.natural_language} />
        </CollapsibleSection>
      )}
      {result.tags && result.tags.length > 0 && (
        <CollapsibleSection title={t('prompt.structuredTags')} defaultOpen={false}>
          <TagList tags={result.tags} />
        </CollapsibleSection>
      )}
    </>
  );
}

function SinglePrompt({
  label,
  text,
  hint,
}: {
  label: string;
  text: string;
  hint?: string;
}) {
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
    <div className="prompt-card">
      <div className="prompt-card-label">{label}</div>
      {hint && (
        <div className="sub-card-label" style={{ marginBottom: 6 }}>
          {hint}
        </div>
      )}
      <div className="prompt-text">{text}</div>
      <div className="actions">
        <button type="button" className="btn btn-primary" onClick={copy}>
          <CopyIcon />
          {t('common.copy')}
        </button>
        <span className={`toast ${toast ? 'visible' : ''}`}>{t('common.copied')}</span>
      </div>
    </div>
  );
}

function SdPrompt({ sd }: { sd: PromptResult['stable_diffusion'] }) {
  const { t } = useT();
  const [show, setShow] = useState(false);
  const [toast, setToast] = useState(false);
  const combined =
    `Positive: ${sd.positive}` +
    (sd.negative ? `\n\nNegative: ${sd.negative}` : '') +
    (sd.weights_explained ? `\n\nWeights: ${sd.weights_explained}` : '');
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setToast(true);
      setTimeout(() => setToast(false), 1500);
    } catch {
      /* ignore */
    }
  }
  return (
    <div className="prompt-card">
      <div className="prompt-card-label">Stable Diffusion — Positive</div>
      <div className="prompt-text">{sd.positive}</div>
      <div className="actions">
        <button type="button" className="btn btn-primary" onClick={() => copy(combined)}>
          <CopyIcon />
          {t('prompt.copyAll')}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => copy(sd.positive)}>
          {t('prompt.copyPositive')}
        </button>
        <span className={`toast ${toast ? 'visible' : ''}`}>{t('common.copied')}</span>
      </div>
      {(sd.negative || sd.weights_explained) && (
        <button
          type="button"
          className="collapse-trigger"
          onClick={() => setShow((v) => !v)}
          aria-expanded={show}
        >
          {show ? t('prompt.sd.collapseNegWeights') : t('prompt.sd.expandNegWeights')}
        </button>
      )}
      {show && (
        <>
          {sd.negative && (
            <div className="sub-card">
              <div className="sub-card-label">Negative</div>
              <pre>{sd.negative}</pre>
            </div>
          )}
          {sd.weights_explained && (
            <div className="sub-card">
              <div className="sub-card-label">Weights</div>
              <pre>{sd.weights_explained}</pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CollapsibleSection({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const { t } = useT();
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="prompt-card" style={{ marginTop: 10 }}>
      <button
        type="button"
        className="collapse-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{ marginTop: 0 }}
      >
        {open ? `${t('prompt.section.collapse')} ${title}` : `${t('prompt.section.expand')} ${title}`}
      </button>
      {open && <div style={{ marginTop: 8 }}>{children}</div>}
    </div>
  );
}

function NaturalLanguage({ text }: { text: string }) {
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
      <pre style={{ whiteSpace: 'pre-wrap' }}>{text}</pre>
      <div className="actions" style={{ marginTop: 8 }}>
        <button type="button" className="btn btn-secondary" onClick={copy}>
          <CopyIcon />
          {t('common.copy')}
        </button>
        <span className={`toast ${toast ? 'visible' : ''}`}>{t('common.copied')}</span>
      </div>
    </div>
  );
}

function TagList({ tags }: { tags: string[] }) {
  const { t } = useT();
  const [toast, setToast] = useState(false);
  async function copyAll() {
    try {
      await navigator.clipboard.writeText(tags.join(', '));
      setToast(true);
      setTimeout(() => setToast(false), 1500);
    } catch {
      /* ignore */
    }
  }
  return (
    <div className="sub-card">
      <div className="renderer-chips">
        {tags.map((t, i) => (
          <span key={`${t}-${i}`} className="renderer-chip">
            {t}
          </span>
        ))}
      </div>
      <div className="actions" style={{ marginTop: 8 }}>
        <button type="button" className="btn btn-secondary" onClick={copyAll}>
          <CopyIcon />
          {t('prompt.copyAllTags')}
        </button>
        <span className={`toast ${toast ? 'visible' : ''}`}>{t('common.copied')}</span>
      </div>
    </div>
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
