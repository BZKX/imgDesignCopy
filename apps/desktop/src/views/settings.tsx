import { useEffect, useState } from 'react';
import {
  ConfigSchema,
  DEFAULT_CONFIG,
  PROVIDERS,
  PROVIDER_META,
  type Config,
  type Language,
  type ProviderId,
} from '@promptlens/core';
import { loadConfig, saveConfig, testConnection } from '../platform/config';

export function SettingsView({ onSaved }: { onSaved: () => void }) {
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

  const onProviderChange = (next: ProviderId) => {
    setConfig((prev) => {
      const prevMeta = PROVIDER_META[prev.provider];
      const nextMeta = PROVIDER_META[next];
      const baseURL =
        !prev.baseURL || prev.baseURL === prevMeta.defaultBaseURL
          ? nextMeta.defaultBaseURL
          : prev.baseURL;
      const model =
        !prev.model || prev.model === prevMeta.defaultModel
          ? nextMeta.defaultModel
          : prev.model;
      return { ...prev, provider: next, baseURL, model };
    });
    setSaved(false);
    setTestResult(null);
  };

  const meta = PROVIDER_META[config.provider];
  const isOllama = config.provider === 'ollama';

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!validation.success) return;
    setSaving(true);
    try {
      await saveConfig(validation.data);
      setSaved(true);
      setTimeout(() => onSaved(), 600);
    } finally {
      setSaving(false);
    }
  }

  async function onTest() {
    if (!validation.success) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testConnection({
        provider: config.provider,
        baseURL: config.baseURL,
        apiKey: config.apiKey,
        model: config.model,
      });
      if (res.ok) setTestResult({ ok: true, msg: `连接成功 (${res.status})` });
      else setTestResult({ ok: false, msg: res.error || `失败 (${res.status ?? '?'})` });
    } finally {
      setTesting(false);
    }
  }

  if (!loaded) {
    return (
      <div className="loading-state">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <form onSubmit={onSave} className="settings-form">
      <div className="settings-section">
        <div className="settings-section-title">API 连接</div>
        <div className="settings-section-desc">
          API Key 只保存在本地存储，仅发送到你配置的 Base URL。
        </div>

        <label className="settings-field">
          <span className="settings-field-label">Provider</span>
          <select
            className="settings-input"
            value={config.provider}
            onChange={(e) => onProviderChange(e.target.value as ProviderId)}
          >
            {PROVIDERS.map((p) => (
              <option key={p} value={p}>
                {PROVIDER_META[p].label}
              </option>
            ))}
          </select>
          <span className="settings-section-desc">{meta.helpText}</span>
        </label>

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

        {!isOllama && (
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
        )}

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
            onChange={(e) => update('maxHistory', Number.parseInt(e.target.value, 10) || 0)}
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
        <button type="submit" className="btn btn-primary" disabled={saving || !validation.success}>
          {saving ? '保存中…' : saved ? '已保存' : '保存'}
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
