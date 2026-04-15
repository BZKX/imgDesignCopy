export const MODES = ['image_to_prompt', 'product_style', 'webpage_style'] as const;
export type Mode = typeof MODES[number];
export const DEFAULT_MODE: Mode = 'image_to_prompt';

export function isMode(x: unknown): x is Mode {
  return typeof x === 'string' && (MODES as readonly string[]).includes(x);
}

export interface ModeMeta {
  label: string;
  icon: string;
  description: string;
  /** i18n display name for use in UI tabs/selectors */
  displayName: { 'zh-CN': string; en: string };
}

export const MODE_META: Record<Mode, ModeMeta> = {
  image_to_prompt: {
    label: '风格 Prompt',
    icon: '绘',
    description: '把你喜欢的图，变成能复用的 Prompt',
    displayName: { 'zh-CN': '风格 Prompt', en: 'Style Prompt' },
  },
  product_style: {
    label: '产品视觉解析',
    icon: '品',
    description: '解析产品设计，拆解设计语言',
    displayName: { 'zh-CN': '产品视觉解析', en: 'Product Visual' },
  },
  webpage_style: {
    label: '页面设计识别',
    icon: '网',
    description: '提取页面设计与组件设计',
    displayName: { 'zh-CN': '页面设计识别', en: 'Web Design' },
  },
};
