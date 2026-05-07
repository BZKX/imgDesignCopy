import { useEffect, useRef, useState } from 'react';
import {
  MSG,
  type ErrorCode,
  type HistoryEntryDto,
  type Img2PromptMessage,
  type Language,
  type LoadingStep,
  type ResultPayload,
} from '@promptlens/core';
import { DEFAULT_MODE, MODE_META, MODES, isMode, type Mode } from '@promptlens/core';
import type { PromptResult, ProductStyle, WebDesign } from '@promptlens/core';
import { loadConfig } from '@/lib/config';
import { I18nProvider, useT, useUiLanguage, type I18nKey } from '@/lib/i18n';
import { LoadingStepper, type StepHistoryEntry } from './loading-stepper';
import { PromptRenderer } from './renderers/prompt';
import { ProductStyleRenderer } from './renderers/product-style';
import { WebDesignRenderer } from './renderers/webpage-style';
import { HistoryDetail, HistoryList } from './history';
import { SettingsBody } from './settings';
import { isExtensionAlive } from './panel-utils';
import {
  AlertIcon,
  BackIcon,
  CloseIcon,
  HistoryIcon,
  Kbd,
  ModeIcon,
  MoonIcon,
  ScissorIcon,
  SettingsIcon,
  SunIcon,
} from './icons';

type Theme = 'light' | 'dark';
const THEME_KEY = 'promptlens.theme';
function initialTheme(): Theme {
  try {
    const v = localStorage.getItem(THEME_KEY);
    if (v === 'light' || v === 'dark') return v;
  } catch { /* noop */ }
  return (typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
}

interface LoadingState {
  currentStep: LoadingStep;
  history: StepHistoryEntry[];
  failedAt?: LoadingStep;
  errorCode?: ErrorCode;
  lastSeq: number;
}

type View =
  | { kind: 'launcher' }
  | { kind: 'loading'; state: LoadingState }
  | { kind: 'result'; payload: ResultPayload }
  | { kind: 'error'; code: ErrorCode; message: string }
  | { kind: 'history' }
  | { kind: 'history-detail'; entry: HistoryEntryDto }
  | { kind: 'settings' };

const ERROR_HINT_KEYS: Record<ErrorCode, I18nKey> = {
  NO_CONFIG: 'error.hint.NO_CONFIG',
  UNAUTHORIZED: 'error.hint.UNAUTHORIZED',
  RATE_LIMITED: 'error.hint.RATE_LIMITED',
  NETWORK_ERROR: 'error.hint.NETWORK_ERROR',
  TIMEOUT: 'error.hint.TIMEOUT',
  INVALID_RESPONSE: 'error.hint.INVALID_RESPONSE',
  CAPTURE_FAILED: 'error.hint.CAPTURE_FAILED',
  RESTRICTED_PAGE: 'error.hint.RESTRICTED_PAGE',
  UNKNOWN: 'error.hint.UNKNOWN',
};

function emptyLoadingState(): LoadingState {
  return { currentStep: 'captured', history: [], lastSeq: -1 };
}

export interface SidePanelProps {
  initialView: View;
  incoming: Img2PromptMessage | null;
  onClose: () => void;
  registerCloser?: (fn: () => void) => void;
}

export function SidePanel(props: SidePanelProps) {
  const lang = useUiLanguage();
  return (
    <I18nProvider lang={lang}>
      <SidePanelInner {...props} />
    </I18nProvider>
  );
}

function SidePanelInner({ initialView, incoming, onClose, registerCloser }: SidePanelProps) {
  const { t, lang } = useT();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>(initialView);
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const prevIncoming = useRef<Img2PromptMessage | null>(null);

  function toggleTheme() {
    setTheme((tt) => {
      const next: Theme = tt === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(THEME_KEY, next); } catch { /* noop */ }
      return next;
    });
  }

  useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!registerCloser) return;
    registerCloser(() => {
      setOpen(false);
      setTimeout(onClose, 320);
    });
  }, [registerCloser, onClose]);

  useEffect(() => {
    if (!incoming || incoming === prevIncoming.current) return;
    prevIncoming.current = incoming;
    if (incoming.type === MSG.LOADING) {
      setView((prev) => {
        const base =
          prev.kind === 'loading' ? prev.state : emptyLoadingState();
        if (incoming.seq <= base.lastSeq) return prev;
        const nextHistory =
          incoming.step !== 'failed' && incoming.step !== base.currentStep
            ? [...base.history, { step: incoming.step, elapsedMs: incoming.elapsedMs }]
            : base.history;
        return {
          kind: 'loading',
          state: {
            currentStep: incoming.step,
            history: nextHistory,
            failedAt: incoming.step === 'failed' ? incoming.failedAt : base.failedAt,
            errorCode: incoming.errorCode ?? base.errorCode,
            lastSeq: incoming.seq,
          },
        };
      });
    } else if (incoming.type === MSG.RESULT) {
      setView({ kind: 'result', payload: incoming.payload });
    } else if (incoming.type === MSG.ERROR) {
      setView({ kind: 'error', code: incoming.code, message: incoming.message });
    }
  }, [incoming]);

  function handleClose() {
    setOpen(false);
    setTimeout(onClose, 320);
  }

  function triggerSelection() {
    if (!isExtensionAlive()) {
      setView({
        kind: 'error',
        code: 'UNKNOWN',
        message: t('error.stale'),
      });
      return;
    }
    chrome.runtime.sendMessage({ type: MSG.RPC_START_SELECTION }).catch(() => {});
  }

  const title = viewTitle(view, t);
  const canBack =
    view.kind === 'history' ||
    view.kind === 'history-detail' ||
    view.kind === 'settings' ||
    view.kind === 'error' ||
    view.kind === 'result';

  function back() {
    if (view.kind === 'history-detail') setView({ kind: 'history' });
    else setView({ kind: 'launcher' });
  }

  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function onDocPointerDown(ev: MouseEvent) {
      if (view.kind === 'loading') return; // don't interrupt in-flight work
      const path = ev.composedPath();
      const hit = panelRef.current;
      if (hit && path.includes(hit)) return;
      handleClose();
    }
    document.addEventListener('mousedown', onDocPointerDown, true);
    return () => document.removeEventListener('mousedown', onDocPointerDown, true);
  }, [open, view.kind]);

  return (
    <div ref={panelRef} className={`panel theme-${theme} ${open ? 'open' : ''}`} role="dialog" aria-label="PromptLens">
      <header className="header">
        <div className="header-left">
          {canBack ? (
            <button type="button" className="icon-btn" onClick={back} title={t('header.back')} aria-label="Back">
              <BackIcon />
            </button>
          ) : (
            <img
              className="brand-logo"
              src={chrome.runtime.getURL('icons/icon-48.png')}
              alt=""
              aria-hidden="true"
            />
          )}
          <span className="brand">{title}</span>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="icon-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? t('header.theme.light') : t('header.theme.dark')}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          {view.kind !== 'history' && view.kind !== 'history-detail' && (
            <button
              type="button"
              className="icon-btn"
              onClick={() => setView({ kind: 'history' })}
              title={t('header.history')}
              aria-label="History"
            >
              <HistoryIcon />
            </button>
          )}
          <button
            type="button"
            className="icon-btn"
            onClick={handleClose}
            title={t('header.close')}
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>
      </header>

      <div className="body" key={view.kind}>
        {view.kind === 'launcher' && (
          <LauncherBody
            onCapture={triggerSelection}
            onHistory={() => setView({ kind: 'history' })}
            onSettings={() => setView({ kind: 'settings' })}
          />
        )}
        {view.kind === 'loading' && (
          <div className="loading-state stepper-state">
            <LoadingStepper
              currentStep={view.state.currentStep}
              history={view.state.history}
              failedAt={view.state.failedAt}
              errorCode={view.state.errorCode}
              lang={lang}
            />
            {view.state.currentStep === 'failed' && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={triggerSelection}
              >
                <ScissorIcon /> {t('error.retry')}
              </button>
            )}
          </div>
        )}
        {view.kind === 'error' && (
          <ErrorBody
            code={view.code}
            message={view.message}
            onOpenSettings={() => setView({ kind: 'settings' })}
            onRetry={triggerSelection}
          />
        )}
        {view.kind === 'result' && (
          <ResultBody
            payload={view.payload}
            onRecapture={() => {
              setView({ kind: 'launcher' });
              triggerSelection();
            }}
            onHome={() => setView({ kind: 'launcher' })}
          />
        )}
        {view.kind === 'history' && (
          <HistoryList onOpen={(entry) => setView({ kind: 'history-detail', entry })} />
        )}
        {view.kind === 'history-detail' && (
          <HistoryDetail entry={view.entry} onDeleted={() => setView({ kind: 'history' })} />
        )}
        {view.kind === 'settings' && (
          <SettingsBody onSaved={() => setView({ kind: 'launcher' })} />
        )}
      </div>

      {view.kind === 'result' && view.payload.pageUrl ? (
        <footer className="footer">
          <span>Source</span>
          <a
            href={view.payload.pageUrl}
            target="_blank"
            rel="noreferrer"
            title={view.payload.pageUrl}
          >
            {view.payload.pageUrl}
          </a>
        </footer>
      ) : (
        <footer className="footer">
          <span>PromptLens</span>
          <a
            href="https://promptlens.cc"
            target="_blank"
            rel="noreferrer"
            title="promptlens.cc"
          >
            promptlens.cc
          </a>
        </footer>
      )}
    </div>
  );
}

function modeDisplayName(mode: Mode, lang: Language): string {
  const meta = MODE_META[mode];
  return lang === 'en' ? meta.displayName.en : meta.displayName['zh-CN'];
}

function viewTitle(v: View, tr: (k: I18nKey) => string): string {
  switch (v.kind) {
    case 'launcher':
      return 'PromptLens';
    case 'loading':
      return tr('header.title.loading');
    case 'result':
      return tr('header.title.result');
    case 'error':
      return tr('header.title.error');
    case 'history':
      return tr('header.title.history');
    case 'history-detail':
      return tr('header.title.historyDetail');
    case 'settings':
      return tr('header.title.settings');
  }
}

const HERO_COPY_KEYS: Record<Mode, { line1: { zh: string; en: string }; line2: { zh: string; en: string } }> = {
  image_to_prompt: {
    line1: { zh: '把你喜欢的图', en: 'Turn any image you love' },
    line2: { zh: '变成能复用的 Prompt', en: 'into a reusable prompt' },
  },
  product_style: {
    line1: { zh: '解析产品设计', en: 'Analyze product design' },
    line2: { zh: '拆解设计语言', en: 'unpack its visual language' },
  },
  webpage_style: {
    line1: { zh: '提取页面设计', en: 'Extract page design' },
    line2: { zh: '与组件设计', en: 'and components' },
  },
};

function LauncherBody({
  onCapture,
  onHistory,
  onSettings,
}: {
  onCapture: () => void;
  onHistory: () => void;
  onSettings: () => void;
}) {
  const { t, lang } = useT();
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [mode, setMode] = useState<Mode>(DEFAULT_MODE);
  useEffect(() => {
    loadConfig()
      .then((c) => setHasKey(Boolean(c.apiKey)))
      .catch(() => setHasKey(false));
  }, []);
  useEffect(() => {
    chrome.storage.sync.get('mode').then((r) => {
      const m = (r as { mode?: unknown }).mode;
      if (isMode(m)) setMode(m);
    }).catch(() => {});
  }, []);
  function pickMode(m: Mode) {
    setMode(m);
    chrome.storage.sync.set({ mode: m }).catch(() => {});
  }
  const copy = HERO_COPY_KEYS[mode];
  return (
    <div className="launcher">
      <ModeSegment mode={mode} onPick={pickMode} />
      <div className="hero-card" key={mode}>
        <div className="hero-eyebrow">{modeDisplayName(mode, lang)}</div>
        <div className="hero-title">
          {copy.line1[lang]}
          <br />
          {copy.line2[lang]}
        </div>
        <button type="button" className="btn btn-primary btn-lg" onClick={onCapture}>
          <ScissorIcon />
          {t('launcher.capture')}
        </button>
        <div className="shortcut-row">
          <Kbd>⌘</Kbd>
          <Kbd>⇧</Kbd>
          <Kbd>Y</Kbd>
          <span className="shortcut-sep">·</span>
          <Kbd>Ctrl</Kbd>
          <Kbd>⇧</Kbd>
          <Kbd>Y</Kbd>
          <span className="shortcut-hint">{t('launcher.shortcut.hint')}</span>
        </div>
      </div>
      {hasKey === false && (
        <div className="warning-banner">
          <span className="hero-badge">!</span>
          <span>{t('launcher.noApiWarning')}</span>
        </div>
      )}
      <div className="tile-grid">
        <button type="button" className="tile" onClick={onHistory}>
          <HistoryIcon />
          <span className="tile-label">{t('launcher.tile.history.label')}</span>
          <span className="tile-desc">{t('launcher.tile.history.desc')}</span>
        </button>
        <button type="button" className="tile" onClick={onSettings}>
          <SettingsIcon />
          <span className="tile-label">{t('launcher.tile.settings.label')}</span>
          <span className="tile-desc">{t('launcher.tile.settings.desc')}</span>
        </button>
      </div>
    </div>
  );
}

function ModeSegment({ mode, onPick }: { mode: Mode; onPick: (m: Mode) => void }) {
  const { t, lang } = useT();
  const pick = onPick;
  return (
    <div className="mode-segment" role="tablist" aria-label={t('launcher.mode.aria')}>
      {MODES.map((m) => {
        const meta = MODE_META[m];
        const active = mode === m;
        return (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={active}
            className={`mode-segment-btn${active ? ' mode-segment-btn--active' : ''}`}
            onClick={() => pick(m)}
            title={meta.description}
          >
            <span className="mode-segment-icon"><ModeIcon mode={m} /></span>
            <span className="mode-segment-label">{modeDisplayName(m, lang)}</span>
          </button>
        );
      })}
    </div>
  );
}

function ErrorBody({
  code,
  message,
  onOpenSettings,
  onRetry,
}: {
  code: ErrorCode;
  message: string;
  onOpenSettings: () => void;
  onRetry: () => void;
}) {
  const { t } = useT();
  const showSettings = code === 'NO_CONFIG' || code === 'UNAUTHORIZED';
  return (
    <div className="error-state">
      <div className="error-icon">
        <AlertIcon />
      </div>
      <div className="error-title">{t(ERROR_HINT_KEYS[code] ?? 'error.hint.UNKNOWN')}</div>
      <div className="error-message">{message}</div>
      <div className="error-action">
        {showSettings ? (
          <button type="button" className="btn btn-primary" onClick={onOpenSettings}>
            {t('error.openSettings')}
          </button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={onRetry}>
            <ScissorIcon /> {t('error.retry')}
          </button>
        )}
      </div>
    </div>
  );
}

function ResultBody({
  payload,
  onRecapture,
  onHome,
}: {
  payload: ResultPayload;
  onRecapture: () => void;
  onHome: () => void;
}) {
  const { t, lang } = useT();
  const mode = payload.mode;
  const insight = payload.insight ?? payload.prompts;
  return (
    <>
      <div className="hero">
        <img src={`data:image/jpeg;base64,${payload.thumbnailB64}`} alt="selection" />
      </div>
      <div className="result-mode">
        <span className="result-mode-icon"><ModeIcon mode={mode} /></span>
        <span className="result-mode-label">{modeDisplayName(mode, lang)}</span>
      </div>
      {mode === 'image_to_prompt' && (
        <PromptRenderer result={insight as PromptResult} />
      )}
      {mode === 'product_style' && (
        <ProductStyleRenderer result={insight as ProductStyle} />
      )}
      {mode === 'webpage_style' && (
        <WebDesignRenderer result={insight as WebDesign} />
      )}
      <div className="result-footer-actions">
        <button type="button" className="btn btn-primary btn-lg" onClick={onRecapture}>
          <ScissorIcon /> {t('result.recapture')}
        </button>
        <button type="button" className="btn btn-secondary btn-lg" onClick={onHome}>
          {t('result.home')}
        </button>
      </div>
    </>
  );
}
