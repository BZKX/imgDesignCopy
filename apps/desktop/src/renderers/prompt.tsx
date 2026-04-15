import { useState } from 'react';
import type { PromptResult } from '@promptlens/core';

type Tab = 'midjourney' | 'stable_diffusion' | 'dalle';

const TABS: { key: Tab; label: string }[] = [
  { key: 'midjourney', label: 'Midjourney' },
  { key: 'stable_diffusion', label: 'SD / Flux' },
  { key: 'dalle', label: 'DALL·E' },
];

export function PromptRenderer({ result }: { result: PromptResult }) {
  const [tab, setTab] = useState<Tab>('midjourney');
  return (
    <>
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
      {tab === 'dalle' && (
        <SinglePrompt label="DALL·E / GPT-4o prompt" text={result.dalle} />
      )}
      {tab === 'stable_diffusion' && <SdPrompt sd={result.stable_diffusion} />}
    </>
  );
}

function SinglePrompt({ label, text }: { label: string; text: string }) {
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
      <div className="prompt-text">{text}</div>
      <div className="actions">
        <button type="button" className="btn btn-primary" onClick={copy}>
          <CopyIcon />
          Copy
        </button>
        <span className={`toast ${toast ? 'visible' : ''}`}>已复制</span>
      </div>
    </div>
  );
}

function SdPrompt({ sd }: { sd: PromptResult['stable_diffusion'] }) {
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
      <div className="prompt-card-label">Stable Diffusion / Flux — Positive</div>
      <div className="prompt-text">{sd.positive}</div>
      <div className="actions">
        <button type="button" className="btn btn-primary" onClick={() => copy(combined)}>
          <CopyIcon />
          Copy 全部
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => copy(sd.positive)}>
          仅 Positive
        </button>
        <span className={`toast ${toast ? 'visible' : ''}`}>已复制</span>
      </div>
      {(sd.negative || sd.weights_explained) && (
        <button
          type="button"
          className="collapse-trigger"
          onClick={() => setShow((v) => !v)}
          aria-expanded={show}
        >
          {show ? '收起 negative / weights' : '展开 negative / weights'}
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
