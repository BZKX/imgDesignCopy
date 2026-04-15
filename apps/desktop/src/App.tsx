import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DEFAULT_MODE,
  MODES,
  MODE_META,
  isMode,
  type Mode,
  type LoadingStep,
  type ResultPayload,
  type PromptResult,
  type ProductStyle,
  type WebDesign,
} from '@promptlens/core';
import { LoadingStepper, type StepHistoryEntry } from './loading-stepper';
import { PromptRenderer } from './renderers/prompt';
import { ProductStyleRenderer } from './renderers/product-style';
import { WebDesignRenderer } from './renderers/webpage-style';
import {
  AlertIcon,
  BackIcon,
  HistoryIcon,
  Kbd,
  ModeIcon,
  MoonIcon,
  ScissorIcon,
  SettingsIcon,
  SunIcon,
} from './icons';
import { SettingsView } from './views/settings';
import { HistoryList, HistoryDetail } from './views/history';
import type { StoredHistoryEntry } from './platform/history';
import { addHistoryEntry } from './platform/history';
import { captureRegionViaOverlay, captureScreen } from './platform/screenshot';
import { hasApiKey, loadConfig } from './platform/config';
import { runVisionInsight, VisionError, type VisionErrorCode } from './platform/vision';
import { storage } from './platform/storage';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import { CloseIcon } from './icons';

type Theme = 'light' | 'dark';
const THEME_KEY = 'promptlens.theme';
const MODE_KEY = 'promptlens.mode';

function initialTheme(): Theme {
  try {
    const v = localStorage.getItem(THEME_KEY);
    if (v === 'light' || v === 'dark') return v;
  } catch { /* noop */ }
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

interface LoadingState {
  currentStep: LoadingStep;
  history: StepHistoryEntry[];
  failedAt?: LoadingStep;
  errorCode?: VisionErrorCode;
  startedAt: number;
}

type View =
  | { kind: 'launcher' }
  | { kind: 'loading'; state: LoadingState }
  | { kind: 'result'; payload: ResultPayload }
  | { kind: 'error'; code: VisionErrorCode; message: string }
  | { kind: 'history' }
  | { kind: 'history-detail'; entry: StoredHistoryEntry }
  | { kind: 'settings' };

const ERROR_HINTS: Record<VisionErrorCode, string> = {
  NO_CONFIG: '请先配置 API',
  UNAUTHORIZED: 'API Key 无效',
  RATE_LIMITED: '触发限流，请稍后再试',
  NETWORK_ERROR: '网络请求失败',
  TIMEOUT: '请求超时',
  INVALID_RESPONSE: '模型返回格式异常',
  UNKNOWN: '出现未知错误',
};

export function App() {
  const [view, setView] = useState<View>({ kind: 'launcher' });
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [open, setOpen] = useState(false);
  const runningRef = useRef(false);

  useEffect(() => {
    // Slide in on mount.
    const id = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const closeDrawer = useCallback(() => {
    setOpen(false);
    setTimeout(() => { void invoke('hide_drawer'); }, 180);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && view.kind !== 'loading') closeDrawer();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [view.kind, closeDrawer]);

  const toggleTheme = () => {
    setTheme((t) => {
      const next: Theme = t === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(THEME_KEY, next); } catch { /* noop */ }
      return next;
    });
  };

  const startCapture = useCallback(async (modeArg?: unknown) => {
    const mode: 'region' | 'full' = modeArg === 'full' ? 'full' : 'region';
    if (runningRef.current) return;
    runningRef.current = true;
    const startedAt = Date.now();
    const history: StepHistoryEntry[] = [];

    const setStep = (step: LoadingStep) => {
      const elapsedMs = Date.now() - startedAt;
      if (history[history.length - 1]?.step !== step) history.push({ step, elapsedMs });
      setView({
        kind: 'loading',
        state: { currentStep: step, history: [...history], startedAt },
      });
    };

    try {
      const insightMode = (await getStoredMode()) ?? DEFAULT_MODE;
      const shot =
        mode === 'full' ? await captureScreen() : await captureRegionViaOverlay();
      setStep('captured');
      setStep('cropped');
      setStep('inferring');
      const insight = await runVisionInsight(insightMode, shot.base64, shot.mime);
      setStep('parsing');

      const payload: ResultPayload = {
        thumbnailB64: shot.base64,
        mode: insightMode,
        insight,
        pageUrl: '',
        createdAt: Date.now(),
      };
      setStep('done');
      setView({ kind: 'result', payload });

      const cfg = await loadConfig();
      const entry: StoredHistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: payload.createdAt,
        pageUrl: '',
        mode: insightMode,
        insight,
        thumbnailB64: shot.base64,
      };
      void addHistoryEntry(entry, cfg.maxHistory);
    } catch (err) {
      if (err instanceof Error && err.message === 'CAPTURE_CANCELLED') {
        setView({ kind: 'launcher' });
        return;
      }
      const code: VisionErrorCode =
        err instanceof VisionError ? err.code : 'UNKNOWN';
      const message = err instanceof Error ? err.message : String(err);
      setView({ kind: 'error', code, message });
    } finally {
      runningRef.current = false;
    }
  }, []);

  useEffect(() => {
    const offs: Array<() => void> = [];
    void listen('capture-shortcut', () => { void startCapture('region'); }).then((u) => offs.push(u));
    void listen('drawer-shown', () => {
      // Fresh summon → reset to launcher and play slide-in.
      setView({ kind: 'launcher' });
      setOpen(false);
      requestAnimationFrame(() => setOpen(true));
    }).then((u) => offs.push(u));
    void listen('drawer-closing', () => { setOpen(false); }).then((u) => offs.push(u));
    return () => { offs.forEach((f) => f()); };
  }, [startCapture]);

  const title = viewTitle(view);
  const canBack =
    view.kind === 'history' ||
    view.kind === 'history-detail' ||
    view.kind === 'settings' ||
    view.kind === 'error';

  const back = () => {
    if (view.kind === 'history-detail') setView({ kind: 'history' });
    else setView({ kind: 'launcher' });
  };

  return (
    <>
    <div className="drawer-dismiss" onClick={closeDrawer} aria-hidden />
    <div className={`panel theme-${theme} window-fill drawer-shell${open ? ' open' : ''}`} role="dialog" aria-label="PromptLens">
      <header className="header">
        <div className="header-left">
          {canBack ? (
            <button type="button" className="icon-btn" onClick={back} title="返回" aria-label="Back">
              <BackIcon />
            </button>
          ) : (
            <span className="brand-dot" />
          )}
          <span className="brand">{title}</span>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="icon-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? '切换为浅色' : '切换为深色'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          {view.kind !== 'history' && view.kind !== 'history-detail' && (
            <button
              type="button"
              className="icon-btn"
              onClick={() => setView({ kind: 'history' })}
              title="历史"
              aria-label="History"
            >
              <HistoryIcon />
            </button>
          )}
          <button
            type="button"
            className="icon-btn"
            onClick={closeDrawer}
            title="收起"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>
      </header>

      <div className="body" key={view.kind}>
        {view.kind === 'launcher' && (
          <LauncherBody
            onCapture={startCapture}
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
              errorCode={view.state.errorCode as never}
            />
          </div>
        )}
        {view.kind === 'error' && (
          <ErrorBody
            code={view.code}
            message={view.message}
            onOpenSettings={() => setView({ kind: 'settings' })}
            onRetry={startCapture}
          />
        )}
        {view.kind === 'result' && (
          <ResultBody
            payload={view.payload}
            onRecapture={() => {
              setView({ kind: 'launcher' });
              void startCapture();
            }}
          />
        )}
        {view.kind === 'history' && (
          <HistoryList onOpen={(entry) => setView({ kind: 'history-detail', entry })} />
        )}
        {view.kind === 'history-detail' && (
          <HistoryDetail entry={view.entry} onDeleted={() => setView({ kind: 'history' })} />
        )}
        {view.kind === 'settings' && (
          <SettingsView onSaved={() => setView({ kind: 'launcher' })} />
        )}
      </div>
    </div>
    </>
  );
}

async function getStoredMode(): Promise<Mode | null> {
  const m = await storage.get<unknown>(MODE_KEY);
  return isMode(m) ? m : null;
}

function viewTitle(v: View): string {
  switch (v.kind) {
    case 'launcher': return 'PromptLens';
    case 'loading': return '识别中';
    case 'result': return '识别结果';
    case 'error': return '出错了';
    case 'history': return '历史记录';
    case 'history-detail': return '历史详情';
    case 'settings': return '设置';
  }
}

function LauncherBody({
  onCapture,
  onHistory,
  onSettings,
}: {
  onCapture: () => void;
  onHistory: () => void;
  onSettings: () => void;
}) {
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  useEffect(() => {
    hasApiKey().then(setHasKey).catch(() => setHasKey(false));
  }, []);
  return (
    <div className="launcher">
      <ModeSegment />
      <div className="hero-card">
        <div className="hero-eyebrow">视觉洞察工具箱</div>
        <div className="hero-title">
          把你看到的内容
          <br />
          变成结构化洞察
        </div>
        <button type="button" className="btn btn-primary btn-lg" onClick={onCapture}>
          <ScissorIcon />
          全屏截图识别
        </button>
        <div className="shortcut-row">
          <Kbd>⌘</Kbd>
          <Kbd>⇧</Kbd>
          <Kbd>Y</Kbd>
          <span className="shortcut-sep">·</span>
          <Kbd>Ctrl</Kbd>
          <Kbd>⇧</Kbd>
          <Kbd>Y</Kbd>
          <span className="shortcut-hint">全局快捷键</span>
        </div>
      </div>
      {hasKey === false && (
        <div className="warning-banner">
          <span className="hero-badge">!</span>
          <span>尚未配置 API，点「设置」填写后即可使用。</span>
        </div>
      )}
      <div className="tile-grid">
        <button type="button" className="tile" onClick={onHistory}>
          <HistoryIcon />
          <span className="tile-label">历史记录</span>
          <span className="tile-desc">浏览过往识别结果</span>
        </button>
        <button type="button" className="tile" onClick={onSettings}>
          <SettingsIcon />
          <span className="tile-label">设置</span>
          <span className="tile-desc">API、模型与偏好</span>
        </button>
      </div>
    </div>
  );
}

function ModeSegment() {
  const [mode, setMode] = useState<Mode>(DEFAULT_MODE);
  useEffect(() => {
    getStoredMode().then((m) => { if (m) setMode(m); });
  }, []);
  function pick(m: Mode) {
    setMode(m);
    void storage.set(MODE_KEY, m);
  }
  return (
    <div className="mode-segment" role="tablist" aria-label="识别模式">
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
            <span className="mode-segment-label">{meta.label}</span>
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
  code: VisionErrorCode;
  message: string;
  onOpenSettings: () => void;
  onRetry: () => void;
}) {
  const showSettings = code === 'NO_CONFIG' || code === 'UNAUTHORIZED';
  return (
    <div className="error-state">
      <div className="error-icon"><AlertIcon /></div>
      <div className="error-title">{ERROR_HINTS[code] ?? ERROR_HINTS.UNKNOWN}</div>
      <div className="error-message">{message}</div>
      <div className="error-action">
        {showSettings ? (
          <button type="button" className="btn btn-primary" onClick={onOpenSettings}>
            打开设置
          </button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={onRetry}>
            <ScissorIcon /> 重试
          </button>
        )}
      </div>
    </div>
  );
}

function ResultBody({
  payload,
  onRecapture,
}: {
  payload: ResultPayload;
  onRecapture: () => void;
}) {
  const mode = payload.mode;
  const insight = payload.insight ?? payload.prompts;
  return (
    <>
      <div className="hero">
        <img src={`data:image/jpeg;base64,${payload.thumbnailB64}`} alt="selection" />
      </div>
      <div className="result-mode">
        <span className="result-mode-icon"><ModeIcon mode={mode} /></span>
        <span className="result-mode-label">{MODE_META[mode]?.label ?? mode}</span>
      </div>
      {mode === 'image_to_prompt' && <PromptRenderer result={insight as PromptResult} />}
      {mode === 'product_style' && <ProductStyleRenderer result={insight as ProductStyle} />}
      {mode === 'webpage_style' && <WebDesignRenderer result={insight as WebDesign} />}
      <div className="result-footer-actions">
        <button type="button" className="btn btn-primary btn-lg" onClick={onRecapture}>
          <ScissorIcon /> 再截一张
        </button>
      </div>
    </>
  );
}
