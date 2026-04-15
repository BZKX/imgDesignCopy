import { describe, expect, it } from 'vitest';
import { PromptResultSchema } from '../prompt-schema';

describe('PromptResultSchema', () => {
  it('accepts a valid payload', () => {
    const ok = PromptResultSchema.safeParse({
      midjourney: 'cinematic neon alley --ar 16:9',
      stable_diffusion: {
        positive: 'cyberpunk alley, rain',
        negative: 'blurry',
        weights_explained: 'rain emphasized',
      },
      dalle: 'A cyberpunk alley at night.',
    });
    expect(ok.success).toBe(true);
  });

  it('rejects empty midjourney', () => {
    const bad = PromptResultSchema.safeParse({
      midjourney: '',
      stable_diffusion: { positive: 'x', negative: '', weights_explained: '' },
      dalle: 'x',
    });
    expect(bad.success).toBe(false);
  });

  it('rejects missing stable_diffusion.positive', () => {
    const bad = PromptResultSchema.safeParse({
      midjourney: 'x',
      stable_diffusion: { positive: '', negative: '', weights_explained: '' },
      dalle: 'x',
    });
    expect(bad.success).toBe(false);
  });

  it('accepts legacy v1.0 payload without new optional fields (backward compat)', () => {
    const legacy = PromptResultSchema.safeParse({
      midjourney: 'legacy prompt --ar 1:1 --v 6',
      stable_diffusion: {
        positive: 'legacy, stack',
        negative: '',
        weights_explained: '',
      },
      dalle: 'A legacy description.',
    });
    expect(legacy.success).toBe(true);
    if (legacy.success) {
      expect(legacy.data.aspect_ratio).toBeUndefined();
      expect(legacy.data.flux).toBeUndefined();
      expect(legacy.data.natural_language).toBeUndefined();
      expect(legacy.data.tags).toBeUndefined();
      expect(legacy.data.style_summary).toBeUndefined();
    }
  });

  it('accepts full v1.1 payload with all new optional fields', () => {
    const full = PromptResultSchema.safeParse({
      midjourney: 'cinematic neon alley --ar 16:9 --v 6',
      stable_diffusion: {
        positive: 'cyberpunk alley, rain',
        negative: 'blurry',
        weights_explained: 'rain emphasized',
      },
      dalle: 'A cyberpunk alley at night.',
      aspect_ratio: '16:9',
      flux: { prompt: 'A rainy cyberpunk alley, neon reflections, cinematic composition.' },
      natural_language: 'A rainy cyberpunk alley glowing with neon reflections at night.',
      tags: ['cyberpunk', 'neon', 'rain', 'night', 'alley'],
      style_summary: 'Neon-soaked cyberpunk alley at night',
    });
    expect(full.success).toBe(true);
  });

  it('rejects invalid aspect_ratio type (number) when present', () => {
    const bad = PromptResultSchema.safeParse({
      midjourney: 'x --ar 1:1 --v 6',
      stable_diffusion: { positive: 'x', negative: '', weights_explained: '' },
      dalle: 'x',
      aspect_ratio: 169,
    });
    expect(bad.success).toBe(false);
  });
});
