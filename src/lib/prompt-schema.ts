import { z } from 'zod';

export const PromptResultSchema = z.object({
  midjourney: z.string().trim().min(1, 'midjourney prompt is required'),
  stable_diffusion: z.object({
    positive: z.string().trim().min(1, 'stable_diffusion.positive is required'),
    negative: z.string(),
    weights_explained: z.string(),
  }),
  dalle: z.string().trim().min(1, 'dalle prompt is required'),
});

export type PromptResult = z.infer<typeof PromptResultSchema>;
