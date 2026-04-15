import * as Sentry from '@sentry/nextjs'
import type { ErrorEvent, Breadcrumb } from '@sentry/nextjs'

type SentryEvent = ErrorEvent
type SentryBreadcrumb = Breadcrumb

const SCRUB_KEYS = ['imageBase64', 'authorization', 'x-api-key', 'apiKey']
const PROVIDER_PATTERN = /(openai|anthropic|googleapis|ollama)\.com/

function scrubKeys(obj: Record<string, unknown>, keys: string[]): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    result[k] = keys.some((sk) => k.toLowerCase() === sk.toLowerCase()) ? '[scrubbed]' : v
  }
  return result
}

function deepScrubDataUrls(obj: unknown): unknown {
  if (typeof obj === 'string') {
    return obj.match(/^data:[^,]+,/) ? '[scrubbed-data-url]' : obj
  }
  if (Array.isArray(obj)) return obj.map(deepScrubDataUrls)
  if (obj && typeof obj === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      out[k] = deepScrubDataUrls(v)
    }
    return out
  }
  return obj
}

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? 'development',
  sendDefaultPii: false,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,

  beforeSend(event: SentryEvent) {
    // 1. Strip request bodies + headers for any provider domain
    if (event.request?.url?.match(PROVIDER_PATTERN)) {
      if (event.request) {
        event.request.data = '[scrubbed]'
        delete event.request.headers
      }
    }
    // 2. Drop data: URLs anywhere in the event
    return deepScrubDataUrls(event) as SentryEvent
  },

  beforeBreadcrumb(bc: SentryBreadcrumb) {
    if (bc.category === 'fetch' && (bc.data as Record<string, string> | undefined)?.url?.match(/^data:/)) {
      return null
    }
    if (bc.data) {
      bc.data = scrubKeys(bc.data as Record<string, unknown>, SCRUB_KEYS) as typeof bc.data
    }
    return bc
  },
})
