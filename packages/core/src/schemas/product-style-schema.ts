import { z } from 'zod';

export const ProductStyleSchema = z.object({
  // legacy — always required for backward compat with v1.0 history
  palette: z.array(z.string()).min(3).max(8),
  materials: z.array(z.string()).min(1),
  lighting: z.string(),
  mood: z.array(z.string()).min(1),
  camera: z.string(),
  tags: z.array(z.string()).min(3),
  // new 6-dim — all optional
  cmf: z
    .object({
      colors: z.array(z.string()),
      materials: z.array(z.string()),
      finishes: z.array(z.string()),
    })
    .optional(),
  lighting_detail: z
    .object({
      key: z.string(),
      fill: z.string(),
      ambient: z.string(),
    })
    .optional(),
  lens: z
    .object({
      focal_length: z.string(),
      angle: z.string(),
      depth_of_field: z.string(),
    })
    .optional(),
  composition: z.string().optional(),
  scene: z
    .object({
      setting: z.string(),
      props: z.array(z.string()),
    })
    .optional(),
  shot_list: z
    .object({
      camera: z.string(),
      lighting: z.string(),
      background: z.string(),
      props: z.string(),
      post: z.string(),
    })
    .optional(),
  prompt: z
    .object({
      midjourney: z.string().optional(),
      natural_language: z.string().optional(),
    })
    .optional(),
});

export type ProductStyle = z.infer<typeof ProductStyleSchema>;
