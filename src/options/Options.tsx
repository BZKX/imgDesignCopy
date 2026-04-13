import { useEffect, useMemo, useState } from 'react';
import {
  Config,
  ConfigSchema,
  DEFAULT_CONFIG,
  Language,
} from '@/lib/config-schema';
import { loadConfig, saveConfig, testConnection } from '@/lib/config';

type Status =
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'saved' }
  | { kind: 'testing' }
  | { kind: 'test-ok'; status: number }
  | { kind: 'test-fail'; message: string }
  | { kind: 'error'; message: string };

export function Options() {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    loadConfig()
      .then((c) => {
        setConfig(c);
        setLoaded(true);
      })
      .catch((err: unknown) => {
        setStatus({
          kind: 'error',
          message: err instanceof Error ? err.message : String(err),
        });
        setLoaded(true);
      });
  }, []);

  const validation = useMemo(() => ConfigSchema.safeParse(config), [config]);
  const fieldErrors = useMemo(() => {
    const errs: Partial<Record<keyof Config, string>> = {};
    if (!validation.success) {
      for (const issue of validation.error.issues) {
        const key = issue.path[0] as keyof Config | undefined;
        if (key && !errs[key]) errs[key] = issue.message;
      }
    }
    return errs;
  }, [validation]);

  const update = <K extends keyof Config>(key: K, value: Config[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setStatus({ kind: 'idle' });
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validation.success) {
      setStatus({ kind: 'error', message: validation.error.issues[0].message });
      return;
    }
    setStatus({ kind: 'saving' });
    try {
      await saveConfig(validation.data);
      setStatus({ kind: 'saved' });
    } catch (err) {
      setStatus({
        kind: 'error',
        message: err instanceof Error ? err.message : String(err),
      });
    }
  };

  const onTest = async () => {
    if (!validation.success) {
      setStatus({ kind: 'error', message: 'Fix validation errors first.' });
      return;
    }
    setStatus({ kind: 'testing' });
    const result = await testConnection(validation.data);
    if (result.ok) {
      setStatus({ kind: 'test-ok', status: result.status });
    } else {
      setStatus({
        kind: 'test-fail',
        message: `${result.status ?? ''} ${result.error}`.trim(),
      });
    }
  };

  if (!loaded) {
    return (
      <main className="min-h-screen bg-[#fbfbfd] py-24 text-center text-sm text-[#86868b]">
        Loading…
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f]">
      <div className="mx-auto max-w-[640px] px-6 pb-24 pt-16">
        <header className="mb-12 text-center">
          <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0071e3] to-[#5e5ce6] text-white shadow-[0_8px_24px_rgba(0,113,227,0.25)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <path d="M7 13l3-3 4 4 3-3" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="9" r="1" fill="currentColor" />
            </svg>
          </div>
          <h1 className="text-[34px] font-semibold leading-tight tracking-tight">
            img2prompt
          </h1>
          <p className="mt-2 text-[15px] text-[#86868b]">
            把看到的图片变成可用的 AI 绘图 prompt
          </p>
        </header>

        <form onSubmit={onSave} className="space-y-4">
          <Section title="API 连接" description="你的 Key 只保存在本地 chrome.storage.sync，仅发送到你配置的 Base URL。">
            <Field label="Base URL" hint="不含 /chat/completions" error={fieldErrors.baseURL}>
              <input
                type="url"
                className={inputClass}
                value={config.baseURL}
                onChange={(e) => update('baseURL', e.target.value)}
                placeholder="https://api.openai.com/v1"
                required
              />
            </Field>

            <Divider />

            <Field label="API Key" error={fieldErrors.apiKey}>
              <div className="flex gap-2">
                <input
                  type={showKey ? 'text' : 'password'}
                  className={inputClass}
                  value={config.apiKey}
                  onChange={(e) => update('apiKey', e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="sk-…"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="shrink-0 rounded-xl bg-[#f5f5f7] px-4 text-[13px] font-medium text-[#1d1d1f] transition-colors hover:bg-[#ebebed]"
                >
                  {showKey ? '隐藏' : '显示'}
                </button>
              </div>
            </Field>

            <Divider />

            <Field label="Model" hint="如 gpt-4o、gpt-4-vision-preview" error={fieldErrors.model}>
              <input
                type="text"
                className={inputClass}
                value={config.model}
                onChange={(e) => update('model', e.target.value)}
                placeholder="gpt-4o"
                required
              />
            </Field>
          </Section>

          <Section title="偏好">
            <Field label="历史记录数量" hint="10–500，本地 IndexedDB" error={fieldErrors.maxHistory}>
              <input
                type="number"
                className={inputClass}
                value={config.maxHistory}
                min={10}
                max={500}
                onChange={(e) =>
                  update('maxHistory', Number.parseInt(e.target.value, 10) || 0)
                }
                required
              />
            </Field>

            <Divider />

            <Field label="语言" error={fieldErrors.language}>
              <select
                className={inputClass}
                value={config.language}
                onChange={(e) => update('language', e.target.value as Language)}
              >
                <option value="zh">中文</option>
                <option value="en">English</option>
              </select>
            </Field>
          </Section>

          <div className="sticky bottom-4 mt-8 flex flex-wrap items-center gap-3 rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white/80 p-4 shadow-[0_4px_24px_rgba(0,0,0,0.06)] backdrop-blur-xl backdrop-saturate-150">
            <button
              type="submit"
              className="rounded-full bg-[#0071e3] px-6 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#0077ed] active:bg-[#006edb] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={status.kind === 'saving' || !validation.success}
            >
              {status.kind === 'saving' ? '保存中…' : '保存'}
            </button>
            <button
              type="button"
              onClick={onTest}
              className="rounded-full bg-[#f5f5f7] px-6 py-2 text-[13px] font-medium text-[#1d1d1f] transition-colors hover:bg-[#ebebed] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={status.kind === 'testing' || !validation.success}
            >
              {status.kind === 'testing' ? '测试中…' : '测试连接'}
            </button>
            <StatusBanner status={status} />
          </div>
        </form>

        <footer className="mt-12 text-center text-[11px] text-[#86868b]">
          v0.1.0 · 所有数据仅保存在你的浏览器
        </footer>
      </div>
    </main>
  );
}

const inputClass =
  'w-full rounded-xl border border-transparent bg-white px-3.5 py-2.5 text-[13.5px] text-[#1d1d1f] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] transition-shadow focus:border-transparent focus:shadow-[inset_0_0_0_2px_#0071e3] focus:outline-none';

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="border-b border-[rgba(0,0,0,0.06)] px-5 py-4">
        <h2 className="text-[14px] font-semibold tracking-tight text-[#1d1d1f]">{title}</h2>
        {description && (
          <p className="mt-1 text-[12px] leading-relaxed text-[#86868b]">{description}</p>
        )}
      </div>
      <div className="divide-y divide-transparent">{children}</div>
    </section>
  );
}

function Divider() {
  return <div className="mx-5 h-px bg-[rgba(0,0,0,0.06)]" />;
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2 px-5 py-4">
      <div className="flex items-baseline justify-between">
        <span className="text-[13px] font-medium text-[#1d1d1f]">{label}</span>
        {hint && <span className="text-[11.5px] text-[#86868b]">{hint}</span>}
      </div>
      {children}
      {error && <span className="text-[11.5px] text-[#ff3b30]">{error}</span>}
    </label>
  );
}

function StatusBanner({ status }: { status: Status }) {
  switch (status.kind) {
    case 'saved':
      return <span className="text-[12.5px] font-medium text-[#34c759]">已保存 ✓</span>;
    case 'test-ok':
      return (
        <span className="text-[12.5px] font-medium text-[#34c759]">
          连接成功 ({status.status})
        </span>
      );
    case 'test-fail':
      return (
        <span className="text-[12.5px] font-medium text-[#ff3b30]">
          测试失败：{status.message}
        </span>
      );
    case 'error':
      return <span className="text-[12.5px] font-medium text-[#ff3b30]">{status.message}</span>;
    default:
      return null;
  }
}
