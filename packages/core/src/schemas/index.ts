import type { ZodTypeAny } from 'zod';
import type { Mode } from '../modes';
import { PromptResultSchema, type PromptResult } from './prompt-schema';
import { ProductStyleSchema, type ProductStyle } from './product-style-schema';
import { WebDesignSchema, type WebDesign } from './webpage-style-schema';

export const SchemaByMode: Record<Mode, ZodTypeAny> = {
  image_to_prompt: PromptResultSchema,
  product_style: ProductStyleSchema,
  webpage_style: WebDesignSchema,
};

export type InsightByMode = {
  image_to_prompt: PromptResult;
  product_style: ProductStyle;
  webpage_style: WebDesign;
};

export { PromptResultSchema, ProductStyleSchema, WebDesignSchema };
export type { PromptResult, ProductStyle, WebDesign };
