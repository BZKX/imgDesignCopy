import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { appendFile } from 'fs/promises';
import { Resend } from 'resend';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const schema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  feature: z.string().max(128).optional(),
});

// ---------------------------------------------------------------------------
// Rate limiting (in-process, per-instance — good enough for low traffic)
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
// Storage: Resend Audiences (primary) + local fallback (dev / Resend down)
// ---------------------------------------------------------------------------

interface WaitlistEntry {
  email: string;
  feature: string | null;
  ip: string;
}

/** Map feature → audience ID. Each feature can have its own Resend Audience.
 *  Use `||` (not `??`) so empty-string env vars (RESEND_AUDIENCE_ID_MACOS=) fall through. */
function audienceIdFor(feature: string | null): string | undefined {
  if (feature === 'macos')   return process.env.RESEND_AUDIENCE_ID_MACOS   || process.env.RESEND_AUDIENCE_ID;
  if (feature === 'windows') return process.env.RESEND_AUDIENCE_ID_WINDOWS || process.env.RESEND_AUDIENCE_ID;
  return process.env.RESEND_AUDIENCE_ID;
}

async function addToResendAudience(entry: WaitlistEntry): Promise<{
  ok: boolean;
  reason?: string;
}> {
  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = audienceIdFor(entry.feature);
  if (!apiKey || !audienceId) {
    return { ok: false, reason: 'no-credentials' };
  }

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.contacts.create({
      email: entry.email,
      audienceId,
      unsubscribed: false,
    });
    if (error) {
      // 409 Conflict = already in audience; treat as success (idempotent)
      const isDuplicate = /already exists|conflict/i.test(error.message ?? '');
      if (isDuplicate) return { ok: true, reason: 'duplicate' };
      console.error('[waitlist] Resend error:', error);
      return { ok: false, reason: error.message ?? 'resend-error' };
    }
    if (!data) return { ok: false, reason: 'no-data' };
    return { ok: true };
  } catch (err) {
    console.error('[waitlist] Resend exception:', err);
    return { ok: false, reason: 'exception' };
  }
}

/**
 * Optional: send a notification email to the founder when someone signs up.
 * Only fires if both env vars are set AND the sender domain is verified
 * in Resend. Failures are silent — primary success path is `addToResendAudience`.
 */
async function notifyFounder(entry: WaitlistEntry): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.WAITLIST_NOTIFY_FROM;
  const to = process.env.WAITLIST_NOTIFY_TO;
  if (!apiKey || !from || !to) return;

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from,
      to,
      subject: `[PromptLens] New waitlist signup: ${entry.email}`,
      text: [
        `Email:   ${entry.email}`,
        `Feature: ${entry.feature ?? '(none)'}`,
        `IP:      ${entry.ip}`,
        `Time:    ${new Date().toISOString()}`,
      ].join('\n'),
    });
  } catch (err) {
    console.error('[waitlist] notification email failed:', err);
  }
}

async function persistFallback(entry: WaitlistEntry): Promise<void> {
  const line = JSON.stringify({ ...entry, ts: new Date().toISOString() });
  try {
    await appendFile('/tmp/waitlist.jsonl', line + '\n', 'utf8');
  } catch {
    // Edge runtime / read-only fs — last-resort log so the entry isn't lost
    console.log('[waitlist:entry]', line);
  }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'rate_limit', message: 'Too many requests. Please try again in an hour.' },
      { status: 429 },
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'bad_request', message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

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

  const entry: WaitlistEntry = {
    email: result.data.email,
    feature: result.data.feature ?? null,
    ip,
  };

  const resendResult = await addToResendAudience(entry);

  if (!resendResult.ok) {
    // Always keep a local trail so we never lose a signup, even when Resend is unconfigured/down
    await persistFallback(entry);
  }

  // Fire-and-forget founder notification (non-blocking; await for cleaner logs)
  await notifyFounder(entry);

  // We treat duplicates as success ("you're on the list" is still true)
  return NextResponse.json(
    { success: true, message: "You're on the list! We'll reach out when it's ready." },
    { status: 200 },
  );
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ error: 'method_not_allowed' }, { status: 405 });
}
