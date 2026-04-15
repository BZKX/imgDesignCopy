import { describe, expect, it } from 'vitest';
import { ProductStyleSchema } from '../product-style-schema';

const valid = {
  palette: ['#ffffff', '#000000', '#ff3366'],
  materials: ['matte plastic'],
  lighting: 'soft studio',
  mood: ['calm'],
  camera: '50mm product',
  tags: ['minimal', 'clean', 'premium'],
};

describe('ProductStyleSchema', () => {
  it('accepts a full valid (legacy 4-dim) payload', () => {
    expect(ProductStyleSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects palette with < 3 entries', () => {
    const bad = { ...valid, palette: ['#fff', '#000'] };
    expect(ProductStyleSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects empty materials', () => {
    const bad = { ...valid, materials: [] };
    expect(ProductStyleSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects tags with < 3 entries', () => {
    const bad = { ...valid, tags: ['a', 'b'] };
    expect(ProductStyleSchema.safeParse(bad).success).toBe(false);
  });

  it('accepts a full 6-dim payload with shot_list', () => {
    const full = {
      ...valid,
      cmf: {
        colors: ['#0a0a0a', '#1f1f1f'],
        materials: ['soft-touch plastic', 'stainless hinge'],
        finishes: ['matte', 'polished'],
      },
      lighting_detail: {
        key: 'soft top-left 45°',
        fill: 'silver bounce right',
        ambient: 'dim cool ambient',
      },
      lens: {
        focal_length: '50mm',
        angle: 'three-quarter front',
        depth_of_field: 'shallow',
      },
      composition: 'centered, rule-of-thirds, negative space top',
      scene: {
        setting: 'seamless dark grey paper',
        props: ['matte acrylic riser'],
      },
      shot_list: {
        camera: '50mm, three-quarter front, eye-level',
        lighting: 'soft key top-left 45°, silver bounce right',
        background: 'seamless dark grey paper sweep',
        props: 'matte acrylic riser only',
        post: 'keep deep blacks, preserve highlight roll-off',
      },
    };
    expect(ProductStyleSchema.safeParse(full).success).toBe(true);
  });

  it('accepts old payload with no prompt field (backward compat)', () => {
    expect(ProductStyleSchema.safeParse(valid).success).toBe(true);
    const parsed = ProductStyleSchema.safeParse(valid);
    if (parsed.success) {
      expect(parsed.data.prompt).toBeUndefined();
    }
  });

  it('accepts payload with full prompt field', () => {
    const withPrompt = {
      ...valid,
      prompt: {
        midjourney:
          'sleek product on seamless white, soft studio key light, 50mm, shallow DOF --ar 4:3 --style raw --v 6',
        natural_language:
          'A clean minimal product shot on a seamless white background with soft studio lighting.',
      },
    };
    const parsed = ProductStyleSchema.safeParse(withPrompt);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.prompt?.midjourney).toContain('--v 6');
      expect(parsed.data.prompt?.natural_language).toBeDefined();
    }
  });

  it('accepts payload with partial prompt (only midjourney)', () => {
    const withPartialPrompt = {
      ...valid,
      prompt: {
        midjourney:
          'minimal white product, soft box light, three-quarter front --ar 1:1 --style raw --v 6',
      },
    };
    const parsed = ProductStyleSchema.safeParse(withPartialPrompt);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.prompt?.midjourney).toBeDefined();
      expect(parsed.data.prompt?.natural_language).toBeUndefined();
    }
  });

  it('accepts a partial new payload (only cmf, no lens)', () => {
    const partial = {
      ...valid,
      cmf: {
        colors: ['#ffffff'],
        materials: ['ceramic'],
        finishes: ['glazed'],
      },
    };
    const parsed = ProductStyleSchema.safeParse(partial);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.cmf).toBeDefined();
      expect(parsed.data.lens).toBeUndefined();
      expect(parsed.data.shot_list).toBeUndefined();
    }
  });
});
