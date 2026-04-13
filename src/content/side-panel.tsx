import { useEffect, useMemo, useRef, useState } from 'react';
import {
  MSG,
  type ErrorCode,
  type HistoryEntryDto,
  type Img2PromptMessage,
  type ResultPayload,
} from '@/lib/messages';
import type { PromptResult } from '@/lib/prompt-schema';
import {
  Config,
  ConfigSchema,
  DEFAULT_CONFIG,
  Language,
} from '@/lib/config-schema';
import { loadConfig, saveConfig } from '@/lib/config';

type Tab = 'midjourney' | 'stable_diffusion' | 'dalle';

type View =
  | { kind: 'launcher' }
  | { kind: 'loading' }
  | { kind: 'result'; payload: ResultPayload }
  | { kind: 'error'; code: ErrorCode; message: string }
  | { kind: 'history' }
  | { kind: 'history-detail'; entry: HistoryEntryDto }
  | { kind: 'settings' };

const TABS: { key: Tab; label: string }[] = [
  { key: 'midjourney', label: 'Midjourney' },
  { key: 'stable_diffusion', label: 'SD / Flux' },
  { key: 'dalle', label: 'DALL·E' },
];

const ERROR_HINTS: Record<ErrorCode, string> = {
  NO_CONFIG: '请先配置 API',
  UNAUTHORIZED: 'API Key 无效',
  RATE_LIMITED: '触发限流，请稍后再试',
  NETWORK_ERROR: '网络请求失败',
  TIMEOUT: '请求超时',
  INVALID_RESPONSE: '模型返回格式异常',
  CAPTURE_FAILED: '截图失败',
  RESTRICTED_PAGE: '该页面受浏览器限制',
  UNKNOWN: '出现未知错误',
};

export interface SidePanelProps {
  initialView: View;
  incoming: Img2PromptMessage | null;
  onClose: () => void;
  registerCloser?: (fn: () => void) => void;
}

export function SidePanel({ initialView, incoming, onClose, registerCloser }: SidePanelProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>(initialView);
  const prevIncoming = useRef<Img2PromptMessage | null>(null);

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
    if (incoming.type === MSG.LOADING) setView({ kind: 'loading' });
    else if (incoming.type === MSG.RESULT) setView({ kind: 'result', payload: incoming.payload });
    else if (incoming.type === MSG.ERROR)
      setView({ kind: 'error', code: incoming.code, message: incoming.message });
  }, [incoming]);

  function handleClose() {
    setOpen(false);
    setTimeout(onClose, 320);
  }

  function triggerSelection() {
    // Fire selection immediately; the overlay mount path will animate the panel out
    // via registerCloser so capture and animation feel simultaneous, not sequential.
    chrome.runtime
      .sendMessage({ type: MSG.RPC_START_SELECTION })
      .catch(() => {
        /* ignore */
      });
  }

  const title = viewTitle(view);
  const canBack =
    view.kind === 'history' ||
    view.kind === 'history-detail' ||
    view.kind === 'settings' ||
    view.kind === 'error';

  function back() {
    if (view.kind === 'history-detail') setView({ kind: 'history' });
    else setView({ kind: 'launcher' });
  }

  return (
    <div className={`panel ${open ? 'open' : ''}`} role="dialog" aria-label="img2prompt">
      <header className="header">
        <div className="header-left">
          {canBack ? (
            <button
              type="button"
              className="icon-btn"
              onClick={back}
              title="返回"
              aria-label="Back"
            >
              <BackIcon />
            </button>
          ) : (
            <span className="brand-dot" />
          )}
          <span className="brand">{title}</span>
        </div>
        <div className="header-actions">
          {view.kind !== 'settings' && (
            <button
              type="button"
              className="icon-btn"
              onClick={() => setView({ kind: 'settings' })}
              title="设置"
              aria-label="Settings"
            >
              <SettingsIcon />
            </button>
          )}
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
            onClick={handleClose}
            title="关闭"
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
        {view.kind === 'loading' && <LoadingBody />}
        {view.kind === 'error' && (
          <ErrorBody
            code={view.code}
            message={view.message}
            onOpenSettings={() => setView({ kind: 'settings' })}
          />
        )}
        {view.kind === 'result' && (
          <ResultBody
            payload={view.payload}
            onRecapture={() => {
              setView({ kind: 'launcher' });
              triggerSelection();
            }}
          />
        )}
        {view.kind === 'history' && (
          <HistoryList onOpen={(entry) => setView({ kind: 'history-detail', entry })} />
        )}
        {view.kind === 'history-detail' && (
          <HistoryDetail
            entry={view.entry}
            onDeleted={() => setView({ kind: 'history' })}
          />
        )}
        {view.kind === 'settings' && (
          <SettingsBody onSaved={() => setView({ kind: 'launcher' })} />
        )}
      </div>

      {view.kind === 'result' && view.payload.pageUrl && (
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
      )}
    </div>
  );
}

function viewTitle(v: View): string {
  switch (v.kind) {
    case 'launcher':
      return 'img2prompt';
    case 'loading':
      return '识别中';
    case 'result':
      return '识别结果';
    case 'error':
      return '出错了';
    case 'history':
      return '历史记录';
    case 'history-detail':
      return '历史详情';
    case 'settings':
      return '设置';
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
    loadConfig()
      .then((c) => setHasKey(Boolean(c.apiKey)))
      .catch(() => setHasKey(false));
  }, []);
  return (
    <div className="launcher">
      <div className="hero-card">
        <div className="hero-eyebrow">图片 → AI 绘图 prompt</div>
        <div className="hero-title">把你看到的图<br />变成可用的 prompt</div>
        <button type="button" className="btn btn-primary btn-lg" onClick={onCapture}>
          <ScissorIcon />开始截图
        </button>
        <div className="shortcut-row">
          <Kbd>⌘</Kbd><Kbd>⇧</Kbd><Kbd>Y</Kbd>
          <span className="shortcut-sep">·</span>
          <Kbd>Ctrl</Kbd><Kbd>⇧</Kbd><Kbd>Y</Kbd>
          <span className="shortcut-hint">全局快捷键</span>
        </div>
      </div>
      {hasKey === false && (
        <div className="warning-banner">
          <span>⚠</span>
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

function LoadingBody() {
  return (
    <div className="loading-state">
      <div className="spinner" aria-hidden />
      <div className="loading-label">正在识别图片风格…</div>
    </div>
  );
}

function ErrorBody({
  code,
  message,
  onOpenSettings,
}: {
  code: ErrorCode;
  message: string;
  onOpenSettings: () => void;
}) {
  const showSettings = code === 'NO_CONFIG' || code === 'UNAUTHORIZED';
  return (
    <div className="error-state">
      <div className="error-icon"><AlertIcon /></div>
      <div className="error-title">{ERROR_HINTS[code] ?? ERROR_HINTS.UNKNOWN}</div>
      <div className="error-message">{message}</div>
      {showSettings && (
        <div className="error-action">
          <button type="button" className="btn btn-primary" onClick={onOpenSettings}>
            打开设置
          </button>
        </div>
      )}
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
  const [tab, setTab] = useState<Tab>('midjourney');
  return (
    <>
      <div className="hero">
        <img src={`data:image/jpeg;base64,${payload.thumbnailB64}`} alt="selection" />
      </div>
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
      <TabContent prompts={payload.prompts} tab={tab} />
      <div className="result-footer-actions">
        <button type="button" className="btn btn-primary btn-lg" onClick={onRecapture}>
          <ScissorIcon /> 再截一张
        </button>
      </div>
    </>
  );
}

function TabContent({ prompts, tab }: { prompts: PromptResult; tab: Tab }) {
  if (tab === 'midjourney') {
    return <SinglePrompt label="Midjourney prompt" text={prompts.midjourney} />;
  }
  if (tab === 'dalle') {
    return <SinglePrompt label="DALL·E / GPT-4o prompt" text={prompts.dalle} />;
  }
  return <SdPrompt sd={prompts.stable_diffusion} />;
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
          <CopyIcon />Copy
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
          <CopyIcon />Copy 全部
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

function HistoryList({ onOpen }: { onOpen: (entry: HistoryEntryDto) => void }) {
  const [entries, setEntries] = useState<HistoryEntryDto[] | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  async function refresh() {
    const res = await rpc<{ ok: boolean; entries?: HistoryEntryDto[] }>({
      type: MSG.RPC_HISTORY_LIST,
    });
    setEntries(res?.entries ?? []);
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function clearAll() {
    await rpc({ type: MSG.RPC_HISTORY_CLEAR });
    setConfirmClear(false);
    await refresh();
  }

  if (entries === null) {
    return <div className="loading-state"><div className="spinner" /></div>;
  }
  if (entries.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-title">还没有记录</div>
        <div className="empty-desc">按 ⌘⇧Y 开始第一次识别</div>
      </div>
    );
  }
  return (
    <>
      {confirmClear ? (
        <div className="inline-confirm">
          <span>确定清空全部历史？</span>
          <div className="inline-confirm-actions">
            <button type="button" className="btn btn-danger" onClick={clearAll}>清空</button>
            <button type="button" className="btn btn-secondary" onClick={() => setConfirmClear(false)}>取消</button>
          </div>
        </div>
      ) : (
        <div className="history-toolbar">
          <span className="history-count">{entries.length} 条</span>
          <button type="button" className="link-danger" onClick={() => setConfirmClear(true)}>清空</button>
        </div>
      )}
      <div className="history-grid">
        {entries.map((e) => (
          <button key={e.id} type="button" className="history-item" onClick={() => onOpen(e)}>
            <div className="history-thumb">
              <LazyThumb id={e.id} />
            </div>
            <div className="history-time">{formatTime(e.createdAt)}</div>
          </button>
        ))}
      </div>
    </>
  );
}

function LazyThumb({ id }: { id: string }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    rpc<{ ok: boolean; thumbnailB64?: string }>({
      type: MSG.RPC_HISTORY_THUMB,
      id,
    }).then((res) => {
      if (cancelled) return;
      if (res?.ok && res.thumbnailB64) {
        setSrc(`data:image/jpeg;base64,${res.thumbnailB64}`);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [id]);
  if (!src) return <div className="thumb-skeleton" />;
  return <img src={src} alt="" />;
}

function HistoryDetail({
  entry,
  onDeleted,
}: {
  entry: HistoryEntryDto;
  onDeleted: () => void;
}) {
  const [tab, setTab] = useState<Tab>('midjourney');
  const [toast, setToast] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const text = useMemo(() => {
    if (tab === 'midjourney') return entry.prompts.midjourney;
    if (tab === 'dalle') return entry.prompts.dalle;
    const sd = entry.prompts.stable_diffusion;
    return `Positive: ${sd.positive}\nNegative: ${sd.negative}${
      sd.weights_explained ? `\nWeights: ${sd.weights_explained}` : ''
    }`.trim();
  }, [entry, tab]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setToast(true);
      setTimeout(() => setToast(false), 1500);
    } catch {
      /* ignore */
    }
  }

  async function del() {
    await rpc({ type: MSG.RPC_HISTORY_DELETE, id: entry.id });
    onDeleted();
  }

  return (
    <>
      <div className="hero">
        <LazyThumb id={entry.id} />
      </div>
      <div className="history-meta">
        <span>{formatTime(entry.createdAt)}</span>
        {confirm ? (
          <span className="inline-confirm-mini">
            <button type="button" className="btn btn-danger btn-sm" onClick={del}>确认删除</button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setConfirm(false)}>取消</button>
          </span>
        ) : (
          <button type="button" className="link-danger" onClick={() => setConfirm(true)}>删除</button>
        )}
      </div>
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
      <div className="prompt-card">
        <div className="prompt-text">{text}</div>
        <div className="actions">
          <button type="button" className="btn btn-primary" onClick={copy}>
            <CopyIcon />复制
          </button>
          <span className={`toast ${toast ? 'visible' : ''}`}>已复制</span>
        </div>
      </div>
      {entry.pageUrl && (
        <a className="link-source" href={entry.pageUrl} target="_blank" rel="noreferrer">
          来源：{entry.pageUrl}
        </a>
      )}
    </>
  );
}

function SettingsBody({ onSaved }: { onSaved: () => void }) {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [loaded, setLoaded] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    loadConfig()
      .then((c) => {
        setConfig(c);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const validation = ConfigSchema.safeParse(config);
  const errs: Partial<Record<keyof Config, string>> = {};
  if (!validation.success) {
    for (const issue of validation.error.issues) {
      const key = issue.path[0] as keyof Config | undefined;
      if (key && !errs[key]) errs[key] = issue.message;
    }
  }

  const update = <K extends keyof Config>(key: K, value: Config[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
    setTestResult(null);
  };

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!validation.success) return;
    setSaving(true);
    try {
      await saveConfig(validation.data);
      setSaved(true);
      setTimeout(() => onSaved(), 700);
    } finally {
      setSaving(false);
    }
  }

  async function onTest() {
    if (!validation.success) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await rpc<{ ok: boolean; status?: number; error?: string }>({
        type: MSG.RPC_TEST_CONNECTION,
        config: {
          baseURL: config.baseURL,
          apiKey: config.apiKey,
          model: config.model,
        },
      });
      if (res?.ok) setTestResult({ ok: true, msg: `连接成功 (${res.status ?? 200})` });
      else setTestResult({ ok: false, msg: res?.error || `失败 (${res?.status ?? '?'})` });
    } finally {
      setTesting(false);
    }
  }

  if (!loaded) {
    return <div className="loading-state"><div className="spinner" /></div>;
  }

  return (
    <form onSubmit={onSave} className="settings-form">
      <div className="settings-section">
        <div className="settings-section-title">API 连接</div>
        <div className="settings-section-desc">
          API Key 只保存在本地 chrome.storage.sync，仅发送到你配置的 Base URL。
        </div>

        <label className="settings-field">
          <span className="settings-field-label">Base URL</span>
          <input
            type="url"
            className="settings-input"
            value={config.baseURL}
            onChange={(e) => update('baseURL', e.target.value)}
            placeholder="https://api.openai.com/v1"
            required
          />
          {errs.baseURL && <span className="settings-error">{errs.baseURL}</span>}
        </label>

        <label className="settings-field">
          <span className="settings-field-label">API Key</span>
          <div className="settings-input-row">
            <input
              type={showKey ? 'text' : 'password'}
              className="settings-input"
              value={config.apiKey}
              onChange={(e) => update('apiKey', e.target.value)}
              placeholder="sk-…"
              required
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setShowKey((v) => !v)}
            >
              {showKey ? '隐藏' : '显示'}
            </button>
          </div>
          {errs.apiKey && <span className="settings-error">{errs.apiKey}</span>}
        </label>

        <label className="settings-field">
          <span className="settings-field-label">Model</span>
          <input
            type="text"
            className="settings-input"
            value={config.model}
            onChange={(e) => update('model', e.target.value)}
            placeholder="gpt-4o"
            required
          />
          {errs.model && <span className="settings-error">{errs.model}</span>}
        </label>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">偏好</div>

        <label className="settings-field">
          <span className="settings-field-label">历史记录数量（10–500）</span>
          <input
            type="number"
            className="settings-input"
            value={config.maxHistory}
            min={10}
            max={500}
            onChange={(e) =>
              update('maxHistory', Number.parseInt(e.target.value, 10) || 0)
            }
            required
          />
          {errs.maxHistory && <span className="settings-error">{errs.maxHistory}</span>}
        </label>

        <label className="settings-field">
          <span className="settings-field-label">语言</span>
          <select
            className="settings-input"
            value={config.language}
            onChange={(e) => update('language', e.target.value as Language)}
          >
            <option value="zh">中文</option>
            <option value="en">English</option>
          </select>
        </label>
      </div>

      <div className="settings-actions">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={saving || !validation.success}
        >
          {saving ? '保存中…' : saved ? '已保存 ✓' : '保存'}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onTest}
          disabled={testing || !validation.success}
        >
          {testing ? '测试中…' : '测试连接'}
        </button>
        {testResult && (
          <span className={testResult.ok ? 'status-ok' : 'status-err'}>{testResult.msg}</span>
        )}
      </div>
    </form>
  );
}

function formatTime(ms: number): string {
  const d = new Date(ms);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

async function rpc<T = unknown>(msg: unknown): Promise<T | null> {
  try {
    const res = await chrome.runtime.sendMessage(msg);
    return res as T;
  } catch {
    return null;
  }
}

function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="kbd">{children}</kbd>;
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <path d="M3 3l10 10M13 3L3 13" />
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="2" />
      <path d="M8 1.5v2M8 12.5v2M14.5 8h-2M3.5 8h-2M12.6 3.4l-1.4 1.4M4.8 11.2l-1.4 1.4M12.6 12.6l-1.4-1.4M4.8 4.8L3.4 3.4" strokeLinecap="round" />
    </svg>
  );
}
function CopyIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 13, height: 13 }}>
      <rect x="3.5" y="3.5" width="8" height="9" rx="1.5" />
      <path d="M6 3.5V2.5a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-.5" />
    </svg>
  );
}
function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width: 20, height: 20 }}>
      <path d="M12 8v5M12 16.5v.01" />
      <circle cx="12" cy="12" r="9.5" />
    </svg>
  );
}
function BackIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 3L5 8l5 5" />
    </svg>
  );
}
function HistoryIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M2.5 8a5.5 5.5 0 108-4.9" />
      <path d="M3 2.5v3.5h3.5" strokeLinejoin="round" />
      <path d="M8 5v3.5l2.2 1.3" />
    </svg>
  );
}
function ScissorIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
      <circle cx="4" cy="5" r="1.75" />
      <circle cx="4" cy="11" r="1.75" />
      <path d="M5.5 6.2L14 13M5.5 9.8L14 3" />
    </svg>
  );
}
