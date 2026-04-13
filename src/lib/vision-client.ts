import { PromptResult, PromptResultSchema } from './prompt-schema';
import { buildSystemPrompt } from './system-prompts';
import type { Language } from './config-schema';

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

export interface GeneratePromptsOptions {
  baseURL: string;
  apiKey: string;
  model: string;
  language: Language;
  imageBase64: string;
  mime?: string;
  signal?: AbortSignal;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content:
    | string
    | Array<
        | { type: 'text'; text: string }
        | { type: 'image_url'; image_url: { url: string } }
      >;
}

const USER_INSTRUCTION = 'Produce reverse prompts for this image per the schema.';
const CORRECTIVE_SYSTEM =
  'Your previous response failed schema validation. Return strictly valid JSON matching the schema.';

export async function generatePrompts(
  opts: GeneratePromptsOptions,
): Promise<PromptResult> {
  const systemPrompt = buildSystemPrompt(opts.language);
  const baseMessages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: [
        { type: 'text', text: USER_INSTRUCTION },
        {
          type: 'image_url',
          image_url: {
            url: `data:${opts.mime ?? 'image/jpeg'};base64,${opts.imageBase64}`,
          },
        },
      ],
    },
  ];

  const firstRaw = await callOnce(opts, baseMessages);
  const firstParsed = tryParseAndValidate(firstRaw);
  if (firstParsed.ok) return firstParsed.value;

  const retryMessages: ChatMessage[] = [
    ...baseMessages,
    { role: 'assistant', content: firstRaw },
    { role: 'system', content: CORRECTIVE_SYSTEM },
  ];
  const secondRaw = await callOnce(opts, retryMessages);
  const secondParsed = tryParseAndValidate(secondRaw);
  if (secondParsed.ok) return secondParsed.value;

  throw new SchemaError(secondParsed.error);
}

async function callOnce(
  opts: GeneratePromptsOptions,
  messages: ChatMessage[],
): Promise<string> {
  let res: Response;
  try {
    res = await fetch(`${opts.baseURL}/chat/completions`, {
      method: 'POST',
      signal: opts.signal,
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${opts.apiKey}`,
      },
      body: JSON.stringify({
        model: opts.model,
        messages,
        response_format: { type: 'json_object' },
        temperature: 0.4,
        max_tokens: 800,
      }),
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') throw err;
    throw new NetworkError(err instanceof Error ? err.message : String(err));
  }

  if (res.status === 401) throw new AuthError();
  if (res.status === 429) throw new RateLimitError();
  if (!res.ok) {
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

  const content = extractContent(body);
  if (!content) throw new NetworkError('Empty response content from API.');
  return content;
}

function extractContent(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null;
  const choices = (body as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || choices.length === 0) return null;
  const msg = (choices[0] as { message?: { content?: unknown } }).message;
  if (!msg || typeof msg.content !== 'string') return null;
  return msg.content;
}

type ParseOutcome =
  | { ok: true; value: PromptResult }
  | { ok: false; error: string };

function tryParseAndValidate(raw: string): ParseOutcome {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (err) {
    return {
      ok: false,
      error: `Invalid JSON: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
  const parsed = PromptResultSchema.safeParse(json);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'schema mismatch' };
  }
  return { ok: true, value: parsed.data };
}
