import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { appendFile } from 'fs/promises';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const schema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  feature: z.string().max(128).optional(),
});

// ---------------------------------------------------------------------------
// Rate limiting (in-process, per-instance — good enough for low traffic)
// For production at scale, swap the Map for Vercel KV INCR + TTL.
// ---------------------------------------------------------------------------

const rlMap = new Map<string, number[]>();
const RL_LIMIT = 5;
const RL_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const history = (rlMap.get(ip) ?? []).filter((t) => now - t < RL_WINDOW_MS);
  if (history.length >= RL_LIMIT) return false;
  history.push(now);
  rlMap.set(ip, history);
  return true;
}

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

async function persistEntry(entry: Record<string, unknown>): Promise<void> {
  const line = JSON.stringify({ ...entry, ts: new Date().toISOString() });

  // Primary: Vercel KV REST API (set KV_REST_API_URL + KV_REST_API_TOKEN in Vercel dashboard)
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;
  if (kvUrl && kvToken) {
    try {
      const res = await fetch(`${kvUrl}/lpush/waitlist`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${kvToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([line]),
      });
      if (res.ok) return;
      console.error('[waitlist] KV error:', res.status, await res.text());
    } catch (err) {
      console.error('[waitlist] KV fetch failed:', err);
    }
  }

  // Fallback: append to /tmp/waitlist.jsonl (dev-friendly, works in Node.js runtime)
  try {
    await appendFile('/tmp/waitlist.jsonl', line + '\n', 'utf8');
    return;
  } catch (err) {
    // Edge runtime or read-only filesystem — log as last resort
    console.log('[waitlist:entry]', line);
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[waitlist] Could not write to /tmp:', err);
    }
  }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Resolve IP
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';

  // Rate limit
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      {
        error: 'rate_limit',
        message: 'Too many requests. Please try again in an hour.',
      },
      { status: 429 },
    );
  }

  // Parse body
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'bad_request', message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  // Validate
  const result = schema.safeParse(raw);
  if (!result.success) {
    const first = result.error.errors[0];
    return NextResponse.json(
      {
        error: 'validation',
        message: first?.message ?? 'Invalid input.',
        fields: result.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { email, feature } = result.data;

  // Persist (fire-and-forget errors are caught internally)
  await persistEntry({ email, feature: feature ?? null });

  return NextResponse.json(
    { success: true, message: "You're on the list! We'll reach out when it's ready." },
    { status: 200 },
  );
}

// Reject other methods explicitly
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ error: 'method_not_allowed' }, { status: 405 });
}
