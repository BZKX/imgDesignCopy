import { z } from 'zod';

export const LanguageSchema = z.enum(['zh', 'en']);
export type Language = z.infer<typeof LanguageSchema>;

export const ProviderSchema = z.enum(['openai', 'anthropic', 'gemini', 'ollama']);
export type ProviderId = z.infer<typeof ProviderSchema>;

export const ConfigSchema = z
  .object({
    provider: ProviderSchema,
    baseURL: z
      .string()
      .trim()
      .url('baseURL must be a valid URL')
      .refine((v) => !v.endsWith('/'), 'baseURL must not end with /'),
    apiKey: z.string().trim(),
    model: z.string().trim().min(1, 'model is required'),
    maxHistory: z
      .number()
      .int()
      .min(10, 'maxHistory must be >= 10')
      .max(500, 'maxHistory must be <= 500'),
    language: LanguageSchema,
    uiLanguage: LanguageSchema.default('zh').optional(),
  })
  .superRefine((data, ctx) => {
    if (data.provider !== 'ollama' && data.apiKey.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['apiKey'],
        message: 'apiKey is required',
      });
    }
  });

export type Config = z.infer<typeof ConfigSchema>;

export const DEFAULT_CONFIG: Config = {
  provider: 'openai',
  baseURL: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-4o',
  maxHistory: 50,
  language: 'zh',
  uiLanguage: 'zh',
};
