import { z } from 'zod';

export const PromptResultSchema = z.object({
  midjourney: z.string().trim().min(1, 'midjourney prompt is required'),
  stable_diffusion: z.object({
    positive: z.string().trim().min(1, 'stable_diffusion.positive is required'),
    negative: z.string(),
    weights_explained: z.string(),
  }),
  dalle: z.string().trim().min(1, 'dalle prompt is required'),
  // v1.1 optional fields — older history records may not have these.
  aspect_ratio: z.string().optional(),
  flux: z.object({ prompt: z.string() }).optional(),
  natural_language: z.string().optional(),
  tags: z.array(z.string()).optional(),
  style_summary: z.string().optional(),
});

export type PromptResult = z.infer<typeof PromptResultSchema>;
