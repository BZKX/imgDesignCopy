import { useEffect, useState } from 'react';
import { MSG } from '@promptlens/core';
import {
  Config,
  ConfigSchema,
  DEFAULT_CONFIG,
  Language,
  ProviderId,
} from '@promptlens/core';
import { loadConfig, saveConfig } from '@/lib/config';
import { PROVIDERS, PROVIDER_META } from '@promptlens/core';
import { rpc } from './panel-utils';
import { useT } from '@/lib/i18n';

export function SettingsBody({ onSaved }: { onSaved: () => void }) {
  const { t } = useT();
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

  /**
   * Persist uiLanguage immediately so the i18n hook picks it up and
   * re-renders the whole panel — no full form save required.
   */
  async function setUiLanguage(next: Language) {
    const merged = { ...config, uiLanguage: next };
    setConfig(merged);
    setSaved(false);
    setTestResult(null);
    const parsed = ConfigSchema.safeParse(merged);
    if (parsed.success) {
      try { await saveConfig(parsed.data); } catch { /* ignore */ }
    }
  }

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
  const uiLang: Language = config.uiLanguage === 'en' ? 'en' : 'zh';

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
          provider: config.provider,
          baseURL: config.baseURL,
          apiKey: config.apiKey,
          model: config.model,
        },
      });
      if (res?.ok) setTestResult({ ok: true, msg: `${t('settings.test.ok')} (${res.status ?? 200})` });
      else setTestResult({ ok: false, msg: res?.error || `${t('settings.test.failed')} (${res?.status ?? '?'})` });
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
        <div className="settings-section-title">{t('settings.language.ui.label')}</div>
        <div className="settings-section-desc">{t('settings.language.ui.helper')}</div>
        <div className="segment" role="tablist" style={{ marginTop: 4 }}>
          <button
            type="button"
            role="tab"
            aria-selected={uiLang === 'zh'}
            className={uiLang === 'zh' ? 'active' : ''}
            onClick={() => void setUiLanguage('zh')}
          >
            中文
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={uiLang === 'en'}
            className={uiLang === 'en' ? 'active' : ''}
            onClick={() => void setUiLanguage('en')}
          >
            English
          </button>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">{t('settings.api.title')}</div>
        <div className="settings-section-desc">{t('settings.api.desc')}</div>

        <label className="settings-field">
          <span className="settings-field-label">{t('settings.api.provider')}</span>
          <select
            className="settings-input"
            value={config.provider}
            onChange={(e) => onProviderChange(e.target.value as ProviderId)}
          >
            {PROVIDERS.map((p) => (
              <option key={p} value={p}>
                {uiLang === 'en' ? (PROVIDER_META[p].labelEn ?? PROVIDER_META[p].label) : PROVIDER_META[p].label}
              </option>
            ))}
          </select>
          <span className="settings-section-desc">
            {uiLang === 'en' ? (meta.helpTextEn ?? meta.helpText) : meta.helpText}
          </span>
        </label>

        <label className="settings-field">
          <span className="settings-field-label">{t('settings.api.baseUrl')}</span>
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
            <span className="settings-field-label">{t('settings.api.apiKey')}</span>
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
                {showKey ? t('settings.api.hide') : t('settings.api.show')}
              </button>
            </div>
            {errs.apiKey && <span className="settings-error">{errs.apiKey}</span>}
          </label>
        )}

        <label className="settings-field">
          <span className="settings-field-label">{t('settings.api.model')}</span>
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
        <div className="settings-section-title">{t('settings.pref.title')}</div>

        <label className="settings-field">
          <span className="settings-field-label">{t('settings.pref.maxHistory')}</span>
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
          <span className="settings-field-label">{t('settings.language.model.label')}</span>
          <select
            className="settings-input"
            value={config.language}
            onChange={(e) => update('language', e.target.value as Language)}
          >
            <option value="zh">中文</option>
            <option value="en">English</option>
          </select>
          <span className="settings-section-desc">{t('settings.language.model.helper')}</span>
        </label>
      </div>

      <div className="settings-actions">
        <button type="submit" className="btn btn-primary" disabled={saving || !validation.success}>
          {saving ? t('settings.save.saving') : saved ? t('settings.save.saved') : t('settings.save.save')}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onTest}
          disabled={testing || !validation.success}
        >
          {testing ? t('settings.test.testing') : t('settings.test')}
        </button>
        {testResult && (
          <span className={testResult.ok ? 'status-ok' : 'status-err'}>{testResult.msg}</span>
        )}
      </div>
    </form>
  );
}
