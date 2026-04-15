import { createContext, createElement, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Language } from '@promptlens/core';

/**
 * Bilingual UI string dictionary. Keys are hierarchical dotted paths.
 * Kept alphabetized for maintainability.
 */
export const STRINGS = {
  'common.cancel': { zh: '取消', en: 'Cancel' },
  'common.confirm': { zh: '确认', en: 'Confirm' },
  'common.copied': { zh: '已复制', en: 'Copied' },
  'common.copy': { zh: 'Copy', en: 'Copy' },
  'common.delete': { zh: '删除', en: 'Delete' },

  'error.hint.CAPTURE_FAILED': { zh: '截图失败', en: 'Screenshot failed' },
  'error.hint.INVALID_RESPONSE': { zh: '模型返回格式异常', en: 'Invalid model response' },
  'error.hint.NETWORK_ERROR': { zh: '网络请求失败', en: 'Network request failed' },
  'error.hint.NO_CONFIG': { zh: '请先配置 API', en: 'Please configure the API first' },
  'error.hint.RATE_LIMITED': { zh: '触发限流，请稍后再试', en: 'Rate limited, please retry later' },
  'error.hint.RESTRICTED_PAGE': { zh: '该页面受浏览器限制', en: 'This page is restricted by the browser' },
  'error.hint.TIMEOUT': { zh: '请求超时', en: 'Request timed out' },
  'error.hint.UNAUTHORIZED': { zh: 'API Key 无效', en: 'Invalid API Key' },
  'error.hint.UNKNOWN': { zh: '出现未知错误', en: 'An unknown error occurred' },

  'error.retry': { zh: '重试', en: 'Retry' },
  'error.openSettings': { zh: '打开设置', en: 'Open Settings' },
  'error.stale': { zh: 'PromptLens 已更新，请刷新页面后重试', en: 'PromptLens was updated — please refresh the page and retry' },

  'header.back': { zh: '返回', en: 'Back' },
  'header.close': { zh: '关闭', en: 'Close' },
  'header.history': { zh: '历史', en: 'History' },
  'header.theme.dark': { zh: '切换为深色', en: 'Switch to dark mode' },
  'header.theme.light': { zh: '切换为浅色', en: 'Switch to light mode' },
  'header.title.error': { zh: '出错了', en: 'Something went wrong' },
  'header.title.history': { zh: '历史记录', en: 'History' },
  'header.title.historyDetail': { zh: '历史详情', en: 'History Detail' },
  'header.title.loading': { zh: '识别中', en: 'Analyzing' },
  'header.title.result': { zh: '识别结果', en: 'Result' },
  'header.title.settings': { zh: '设置', en: 'Settings' },

  'history.confirmClearDetail': { zh: '确认删除', en: 'Confirm delete' },
  'history.confirmClearPrompt': { zh: '确定清空全部历史？', en: 'Clear all history?' },
  'history.clear': { zh: '清空', en: 'Clear' },
  'history.count': { zh: '条', en: 'items' },
  'history.empty.desc': { zh: '按 ⌘⇧Y 开始第一次识别', en: 'Press ⌘⇧Y to start your first capture' },
  'history.empty.title': { zh: '还没有记录', en: 'No history yet' },
  'history.source': { zh: '来源', en: 'Source' },

  'launcher.capture': { zh: '开始截图', en: 'Start Capture' },
  'launcher.mode.aria': { zh: '识别模式', en: 'Recognition mode' },
  'launcher.noApiWarning': { zh: '尚未配置 API，点「设置」填写后即可使用。', en: 'API not configured yet. Open Settings to fill it in.' },
  'launcher.shortcut.hint': { zh: '全局快捷键', en: 'Global shortcut' },
  'launcher.tile.history.desc': { zh: '浏览过往识别结果', en: 'Browse past results' },
  'launcher.tile.history.label': { zh: '历史记录', en: 'History' },
  'launcher.tile.settings.desc': { zh: 'API、模型与偏好', en: 'API, model, and preferences' },
  'launcher.tile.settings.label': { zh: '设置', en: 'Settings' },

  'overlay.hint.element': { zh: '移动鼠标高亮元素，点击确认', en: 'Hover to highlight an element, click to confirm' },
  'overlay.hint.rect': { zh: '拖动选择任意区域', en: 'Drag to select any region' },
  'overlay.hint.switch': { zh: '切换模式', en: 'Switch mode' },
  'overlay.hint.cancel': { zh: '取消', en: 'Cancel' },
  'overlay.mode.element': { zh: '元素', en: 'Element' },
  'overlay.mode.rect': { zh: '框选', en: 'Region' },

  'prompt.copyAll': { zh: 'Copy 全部', en: 'Copy all' },
  'prompt.copyAllTags': { zh: 'Copy all tags', en: 'Copy all tags' },
  'prompt.copyPositive': { zh: '仅 Positive', en: 'Positive only' },
  'prompt.naturalLanguage': { zh: '自然语言描述', en: 'Natural language description' },
  'prompt.sd.collapseNegWeights': { zh: '收起 negative / weights', en: 'Hide negative / weights' },
  'prompt.sd.expandNegWeights': { zh: '展开 negative / weights', en: 'Show negative / weights' },
  'prompt.section.collapse': { zh: '收起', en: 'Hide' },
  'prompt.section.expand': { zh: '展开', en: 'Show' },
  'prompt.structuredTags': { zh: '结构化标签', en: 'Structured tags' },
  'prompt.flux.fallback': { zh: '已使用 DALL·E 回退 — 重新运行以获得 Flux 优化输出', en: 'Auto-filled from DALL·E — re-run for Flux-optimized output' },

  'renderer.product.cmf': { zh: 'CMF', en: 'CMF' },
  'renderer.product.cmf.colors': { zh: '色', en: 'Colors' },
  'renderer.product.cmf.finishes': { zh: '饰', en: 'Finishes' },
  'renderer.product.cmf.materials': { zh: '材', en: 'Materials' },
  'renderer.product.composition': { zh: '构图', en: 'Composition' },
  'renderer.product.copyShotList': { zh: '复制清单', en: 'Copy list' },
  'renderer.product.lens': { zh: '镜头', en: 'Lens' },
  'renderer.product.lens.angle': { zh: '角度', en: 'Angle' },
  'renderer.product.lens.depth': { zh: '景深', en: 'Depth of field' },
  'renderer.product.lens.focal': { zh: '焦段', en: 'Focal length' },
  'renderer.product.lens.lens': { zh: '镜头', en: 'Lens' },
  'renderer.product.lighting': { zh: '光线', en: 'Lighting' },
  'renderer.product.lighting.ambient': { zh: '氛围', en: 'Ambient' },
  'renderer.product.lighting.fill': { zh: '辅光', en: 'Fill' },
  'renderer.product.lighting.key': { zh: '主光', en: 'Key' },
  'renderer.product.lighting.overall': { zh: '光照', en: 'Lighting' },
  'renderer.product.materials': { zh: '材质', en: 'Materials' },
  'renderer.product.mood': { zh: '情绪', en: 'Mood' },
  'renderer.product.palette': { zh: '配色', en: 'Palette' },
  'renderer.product.prompt.hint': { zh: '可直接粘贴到图像生成器', en: 'Paste directly into your image generator' },
  'renderer.product.prompt.title': { zh: '产品 Prompt', en: 'Product Prompt' },
  'renderer.product.scene': { zh: '场景', en: 'Scene' },
  'renderer.product.scene.props': { zh: '道具', en: 'Props' },
  'renderer.product.scene.setting': { zh: '环境', en: 'Setting' },
  'renderer.product.shotList.background': { zh: '背景', en: 'Background' },
  'renderer.product.shotList.camera': { zh: '相机', en: 'Camera' },
  'renderer.product.shotList.lighting': { zh: '光线', en: 'Lighting' },
  'renderer.product.shotList.post': { zh: '后期', en: 'Post' },
  'renderer.product.shotList.props': { zh: '道具', en: 'Props' },
  'renderer.product.shotList.title': { zh: '复刻拍摄清单', en: 'Shot list' },
  'renderer.product.tags': { zh: '标签', en: 'Tags' },

  'renderer.web.colors': { zh: '配色', en: 'Colors' },
  'renderer.web.components': { zh: '组件', en: 'Components' },
  'renderer.web.interactions': { zh: '交互', en: 'Interactions' },
  'renderer.web.layout': { zh: '布局', en: 'Layout' },
  'renderer.web.tokens.export': { zh: '设计 Tokens · 导出', en: 'Design Tokens · Export' },
  'renderer.web.tokens.figmaHint': { zh: '粘贴到 Figma 的 Tokens Studio 插件（Tools → Load from JSON）', en: "Paste into Figma's Tokens Studio plugin (Tools → Load from JSON)" },
  'renderer.web.tokens.overview': { zh: '设计 Tokens · 概览', en: 'Design Tokens · Overview' },
  'renderer.web.tone': { zh: '调性', en: 'Tone' },
  'renderer.web.typography': { zh: '字体', en: 'Typography' },
  'renderer.web.typography.body': { zh: 'Body', en: 'Body' },
  'renderer.web.typography.heading': { zh: 'Heading', en: 'Heading' },

  'result.home': { zh: '返回首页', en: 'Back to Home' },
  'result.recapture': { zh: '再截一张', en: 'New Capture' },

  'settings.api.baseUrl': { zh: 'Base URL', en: 'Base URL' },
  'settings.api.apiKey': { zh: 'API Key', en: 'API Key' },
  'settings.api.desc': { zh: 'API Key 只保存在本地 chrome.storage.sync，仅发送到你配置的 Base URL。', en: 'The API Key is stored locally in chrome.storage.sync and only sent to the Base URL you configured.' },
  'settings.api.hide': { zh: '隐藏', en: 'Hide' },
  'settings.api.model': { zh: 'Model', en: 'Model' },
  'settings.api.provider': { zh: 'Provider', en: 'Provider' },
  'settings.api.show': { zh: '显示', en: 'Show' },
  'settings.api.title': { zh: 'API 连接', en: 'API Connection' },
  'settings.language.model.helper': { zh: '控制模型回复使用的语言。', en: "Controls the language the model uses in its responses." },
  'settings.language.model.label': { zh: '模型输出语言', en: 'Model Output Language' },
  'settings.language.ui.helper': { zh: '选择扩展界面显示的语言。', en: "Choose the language for the extension's interface." },
  'settings.language.ui.label': { zh: '显示语言', en: 'Display Language' },
  'settings.lang.en': { zh: 'English', en: 'English' },
  'settings.lang.zh': { zh: '中文', en: 'Chinese' },
  'settings.pref.maxHistory': { zh: '历史记录数量（10–500）', en: 'History size (10–500)' },
  'settings.pref.title': { zh: '偏好', en: 'Preferences' },
  'settings.save.saved': { zh: '已保存', en: 'Saved' },
  'settings.save.saving': { zh: '保存中…', en: 'Saving…' },
  'settings.save.save': { zh: '保存', en: 'Save' },
  'settings.test': { zh: '测试连接', en: 'Test Connection' },
  'settings.test.failed': { zh: '失败', en: 'Failed' },
  'settings.test.ok': { zh: '连接成功', en: 'Connected' },
  'settings.test.testing': { zh: '测试中…', en: 'Testing…' },

  'stepper.active.captured': { zh: '正在截图…', en: 'Capturing…' },
  'stepper.active.cropped': { zh: '正在压缩上传…', en: 'Compressing…' },
  'stepper.active.done': { zh: '完成', en: 'Done' },
  'stepper.active.inferring': { zh: '正在识别风格…', en: 'Analyzing…' },
  'stepper.active.parsing': { zh: '正在解析结构…', en: 'Parsing…' },
  'stepper.label.captured': { zh: '截图', en: 'Capture' },
  'stepper.label.cropped': { zh: '压缩上传', en: 'Compress' },
  'stepper.label.done': { zh: '完成', en: 'Done' },
  'stepper.label.inferring': { zh: '风格识别', en: 'Analyze' },
  'stepper.label.parsing': { zh: '结构解析', en: 'Parse' },
  'stepper.loading': { zh: 'loading…', en: 'loading…' },
} as const;

export type I18nKey = keyof typeof STRINGS;

export function t(key: I18nKey, lang: Language): string {
  const entry = STRINGS[key];
  return entry ? entry[lang] : key;
}

const CONFIG_STORAGE_KEY = 'img2prompt.config';

function readUiLangFromResult(r: unknown): Language | null {
  const cfg = (r as { [k: string]: { uiLanguage?: unknown } } | undefined)?.[CONFIG_STORAGE_KEY];
  const ui = cfg?.uiLanguage;
  return ui === 'zh' || ui === 'en' ? ui : null;
}

/**
 * Reads `config.uiLanguage` from chrome.storage.sync and subscribes to live changes.
 * Defaults to 'zh' when missing or storage is unavailable (e.g. in tests).
 */
export function useUiLanguage(): Language {
  const [lang, setLang] = useState<Language>('zh');
  useEffect(() => {
    try {
      chrome.storage?.sync?.get(CONFIG_STORAGE_KEY).then((r) => {
        const ui = readUiLangFromResult(r);
        if (ui) setLang(ui);
      }).catch(() => {});
    } catch {
      /* no chrome.storage — keep default */
    }
    const listener = (
      changes: Record<string, chrome.storage.StorageChange>,
      area: string,
    ) => {
      if (area !== 'sync') return;
      const change = changes[CONFIG_STORAGE_KEY];
      if (!change) return;
      const next = (change.newValue as { uiLanguage?: unknown } | undefined)?.uiLanguage;
      if (next === 'zh' || next === 'en') setLang(next);
    };
    try {
      chrome.storage?.onChanged?.addListener(listener);
    } catch { /* noop */ }
    return () => {
      try {
        chrome.storage?.onChanged?.removeListener(listener);
      } catch { /* noop */ }
    };
  }, []);
  return lang;
}

export interface I18n {
  lang: Language;
  t: (key: I18nKey) => string;
}

const I18nContext = createContext<I18n>({ lang: 'zh', t: (k) => t(k, 'zh') });

export function I18nProvider({ lang, children }: { lang: Language; children: ReactNode }) {
  const value: I18n = { lang, t: (k) => t(k, lang) };
  return createElement(I18nContext.Provider, { value }, children);
}

export function useT(): I18n {
  return useContext(I18nContext);
}

/**
 * One-shot read (no subscription) — used when mounting the overlay in a
 * separate React root. Returns 'zh' when storage is unavailable.
 */
export async function readUiLanguageOnce(): Promise<Language> {
  try {
    const r = await chrome.storage.sync.get(CONFIG_STORAGE_KEY);
    return readUiLangFromResult(r) ?? 'zh';
  } catch {
    return 'zh';
  }
}
