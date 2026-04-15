import { z } from 'zod';

const TokenColorValue = z.object({
  value: z.string(),
  description: z.string().optional(),
});

const TokenFontSizeValue = z.object({
  value: z.string(),
  line_height: z.string().optional(),
});

export const DesignTokensSchema = z.object({
  color: z.record(z.string(), TokenColorValue).optional(),
  font_size: z.record(z.string(), TokenFontSizeValue).optional(),
  spacing: z.record(z.string(), z.string()).optional(),
  radius: z.record(z.string(), z.string()).optional(),
  shadow: z.record(z.string(), z.string()).optional(),
});

export const WebDesignSchema = z.object({
  layout: z.string(),
  typography: z.object({
    heading: z.string(),
    body: z.string(),
  }),
  colors: z.object({
    primary: z.string(),
    accents: z.array(z.string()).min(1),
  }),
  components: z.array(z.string()).min(2),
  interactions: z.array(z.string()).min(1),
  tone: z.string(),
  tokens: DesignTokensSchema.optional(),
});

export type WebDesign = z.infer<typeof WebDesignSchema>;
export type DesignTokens = z.infer<typeof DesignTokensSchema>;
