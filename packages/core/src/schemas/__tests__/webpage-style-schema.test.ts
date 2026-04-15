import { describe, expect, it } from 'vitest';
import { WebDesignSchema } from '../webpage-style-schema';

const valid = {
  layout: '12-col grid, hero + 3-up cards',
  typography: { heading: 'Inter 700', body: 'Inter 400' },
  colors: { primary: '#0055ff', accents: ['#ff3366', '#00cc99'] },
  components: ['nav', 'card', 'button'],
  interactions: ['hover lift'],
  tone: 'modern editorial',
};

const validWithTokens = {
  ...valid,
  tokens: {
    color: {
      'brand.primary': { value: '#0A84FF' },
      'text.body': { value: '#1D1D1F', description: 'primary body text' },
    },
    font_size: {
      base: { value: '16px', line_height: '1.6' },
      display: { value: '56px' },
    },
    spacing: { xs: '4px', sm: '8px', md: '16px' },
    radius: { sm: '4px', md: '8px' },
    shadow: { sm: '0 1px 2px rgba(0,0,0,0.06)' },
  },
};

describe('WebDesignSchema', () => {
  it('accepts a full valid payload', () => {
    expect(WebDesignSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts a payload without tokens (backward compat)', () => {
    const parsed = WebDesignSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.tokens).toBeUndefined();
    }
  });

  it('accepts a full tokens payload', () => {
    const parsed = WebDesignSchema.safeParse(validWithTokens);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.tokens?.color?.['brand.primary'].value).toBe('#0A84FF');
      expect(parsed.data.tokens?.spacing?.md).toBe('16px');
    }
  });

  it('rejects invalid token color value type', () => {
    const bad = {
      ...valid,
      tokens: { color: { 'brand.primary': { value: 123 } } },
    } as unknown;
    expect(WebDesignSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects invalid token spacing value type', () => {
    const bad = {
      ...valid,
      tokens: { spacing: { md: 16 } },
    } as unknown;
    expect(WebDesignSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects empty accents', () => {
    const bad = { ...valid, colors: { ...valid.colors, accents: [] } };
    expect(WebDesignSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects components with < 2 entries', () => {
    const bad = { ...valid, components: ['nav'] };
    expect(WebDesignSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects missing typography.body', () => {
    const bad = { ...valid, typography: { heading: 'Inter', body: '' } } as unknown;
    // empty string is allowed by z.string(); ensure missing key fails
    expect(WebDesignSchema.safeParse({ ...valid, typography: { heading: 'Inter' } }).success).toBe(false);
    expect(WebDesignSchema.safeParse(bad).success).toBe(true); // sanity: empty string is still a string
  });
});
