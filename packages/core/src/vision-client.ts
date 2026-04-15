import type { ZodTypeAny } from 'zod';
import { buildSystemPrompt } from './system-prompts';
import type { Language } from './config-schema';
import type { Mode } from './modes';
import { SchemaByMode, type InsightByMode } from './schemas';
import { getAdapter, type Provider } from './providers';

export class AuthError extends Error {
  constructor(message = 'Unauthorized (401). Check your API key.') {
    super(message);
    this.name = 'AuthError';
  }
}

export class RateLimitError extends Error {
  constructor(message = 'Rate limited (429). Please retry later.') {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class SchemaError extends Error {
  constructor(message = 'Model response did not match expected schema.') {
    super(message);
    this.name = 'SchemaError';
  }
}

export interface GenerateInsightOptions {
  provider?: Provider;
  baseURL: string;
  apiKey: string;
  model: string;
  language: Language;
  imageBase64: string;
  mime?: string;
  signal?: AbortSignal;
}

/** @deprecated use GenerateInsightOptions */
export type GeneratePromptsOptions = GenerateInsightOptions;

const USER_INSTRUCTION = 'Produce a JSON response per the schema.';
const correctiveSystem = (mode: Mode) =>
  `Your previous response failed schema validation for mode '${mode}'. Return strictly valid JSON matching the schema.`;

export async function generateInsight<M extends Mode>(
  mode: M,
  opts: GenerateInsightOptions,
): Promise<InsightByMode[M]> {
  const systemPrompt = buildSystemPrompt({ mode, language: opts.language });
  const schema = SchemaByMode[mode];

  const firstRaw = await callOnce(opts, systemPrompt, USER_INSTRUCTION);
  const firstParsed = tryParseAndValidate(firstRaw, schema);
  if (firstParsed.ok) return firstParsed.value as InsightByMode[M];

  const secondRaw = await callOnce(opts, systemPrompt, USER_INSTRUCTION, {
    priorRaw: firstRaw,
    correctiveSystem: correctiveSystem(mode),
  });
  const secondParsed = tryParseAndValidate(secondRaw, schema);
  if (secondParsed.ok) return secondParsed.value as InsightByMode[M];

  throw new SchemaError(secondParsed.error);
}

/** @deprecated use generateInsight('image_to_prompt', opts) */
export function generatePrompts(opts: GenerateInsightOptions) {
  return generateInsight('image_to_prompt', opts);
}

async function callOnce(
  opts: GenerateInsightOptions,
  systemPrompt: string,
  userText: string,
  retry?: { priorRaw: string; correctiveSystem: string },
): Promise<string> {
  const provider: Provider = opts.provider ?? 'openai';
  const adapter = getAdapter(provider);
  const { url, init } = adapter.buildRequest({
    baseURL: opts.baseURL,
    apiKey: opts.apiKey,
    model: opts.model,
    systemPrompt,
    userText,
    imageBase64: opts.imageBase64,
    mime: opts.mime ?? 'image/jpeg',
    signal: opts.signal,
    temperature: 0.4,
    maxTokens: 800,
    retry,
  });

  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') throw err;
    throw new NetworkError(err instanceof Error ? err.message : String(err));
  }

  const cls = adapter.classifyStatus(res.status);
  if (cls === 'auth') throw new AuthError();
  if (cls === 'rate') throw new RateLimitError();
  if (cls !== 'ok') {
    const text = await res.text().catch(() => '');
    throw new NetworkError(`HTTP ${res.status}: ${text || res.statusText}`);
  }

  let body: unknown;
  try {
    body = await res.json();
  } catch (err) {
    throw new NetworkError(
      `Failed to read response: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  const content = adapter.extractContent(body);
  if (!content) throw new NetworkError('Empty response content from API.');
  return content;
}

type ParseOutcome =
  | { ok: true; value: unknown }
  | { ok: false; error: string };

function tryParseAndValidate(raw: string, schema: ZodTypeAny): ParseOutcome {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (err) {
    return {
      ok: false,
      error: `Invalid JSON: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'schema mismatch' };
  }
  return { ok: true, value: parsed.data };
}
