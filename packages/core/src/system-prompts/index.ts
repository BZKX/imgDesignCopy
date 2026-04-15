import type { Language } from '../config-schema';
import type { Mode } from '../modes';
import { IMAGE_EN, IMAGE_ZH } from './image';
import { PRODUCT_EN, PRODUCT_ZH } from './product';
import { WEB_EN, WEB_ZH } from './web';

export interface BuildSystemPromptArgs {
  mode: Mode;
  language: Language;
}

export function buildSystemPrompt(args: BuildSystemPromptArgs): string {
  const { mode, language } = args;
  const zh = language === 'zh';
  switch (mode) {
    case 'image_to_prompt':
      return zh ? IMAGE_ZH : IMAGE_EN;
    case 'product_style':
      return zh ? PRODUCT_ZH : PRODUCT_EN;
    case 'webpage_style':
      return zh ? WEB_ZH : WEB_EN;
  }
}
