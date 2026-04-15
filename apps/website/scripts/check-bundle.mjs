#!/usr/bin/env node
/**
 * CI bundle gate — fails if:
 *   1. First-load JS > 180 KB gzip
 *   2. Any chunk matching /^three/ ships in the initial (non-lazy) bundle
 *
 * Reads .next/analyze/client.json produced by @next/bundle-analyzer with
 * ANALYZE=true pnpm build. Falls back to parsing .next/build-manifest.json
 * for chunk names (sufficient to detect eager three* chunks).
 */
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const WEBSITE_ROOT = join(__dirname, '..')
const BUILD_MANIFEST = join(WEBSITE_ROOT, '.next/build-manifest.json')
const APP_BUILD_MANIFEST = join(WEBSITE_ROOT, '.next/app-build-manifest.json')

const FIRST_LOAD_JS_LIMIT_BYTES = 180 * 1024 // 180 KB gzip
const THREE_CHUNK_PATTERN = /three/i

let failures = 0

function fail(msg) {
  console.error(`\n❌ BUNDLE GATE FAILED: ${msg}`)
  failures++
}

function ok(msg) {
  console.log(`✅ ${msg}`)
}

// ── 1. Check for eager three* chunks via build manifest ──────────────────────
if (!existsSync(BUILD_MANIFEST)) {
  fail(`Build manifest not found at ${BUILD_MANIFEST} — run 'pnpm build' first`)
  process.exit(1)
}

const manifest = JSON.parse(readFileSync(BUILD_MANIFEST, 'utf8'))

// pages/_app and pages/index are the "initial" chunks for the root route
const initialChunks = new Set([
  ...(manifest.pages?.['/_app'] ?? []),
  ...(manifest.pages?.['/'] ?? []),
])

// Also check App Router initial chunks
if (existsSync(APP_BUILD_MANIFEST)) {
  const appManifest = JSON.parse(readFileSync(APP_BUILD_MANIFEST, 'utf8'))
  const rootEntry = appManifest.pages?.['/'] ?? []
  rootEntry.forEach((c) => initialChunks.add(c))
}

const threeChunks = [...initialChunks].filter((chunk) => THREE_CHUNK_PATTERN.test(chunk))
if (threeChunks.length > 0) {
  fail(
    `three.js chunk(s) found in initial bundle (must be lazy-loaded):\n  ${threeChunks.join('\n  ')}`,
  )
} else {
  ok('No three.js chunks in initial bundle')
}

// ── 2. Check first-load JS size via Next.js build output stats ───────────────
// Next.js writes build output to stdout; we parse the .next/next-build-stats.json if present,
// otherwise we check .next/static/chunks sizes as a proxy.
const statsPath = join(WEBSITE_ROOT, '.next/next-build-stats.json')
if (existsSync(statsPath)) {
  const stats = JSON.parse(readFileSync(statsPath, 'utf8'))
  const firstLoadBytes = stats?.firstLoadJS ?? 0
  if (firstLoadBytes > FIRST_LOAD_JS_LIMIT_BYTES) {
    fail(
      `First-load JS is ${(firstLoadBytes / 1024).toFixed(1)} KB gzip (limit: ${FIRST_LOAD_JS_LIMIT_BYTES / 1024} KB)`,
    )
  } else if (firstLoadBytes > 0) {
    ok(`First-load JS: ${(firstLoadBytes / 1024).toFixed(1)} KB gzip (limit: ${FIRST_LOAD_JS_LIMIT_BYTES / 1024} KB)`)
  }
} else {
  // Fallback: sum sizes of chunks in .next/static/chunks that are listed as initial
  const chunksDir = join(WEBSITE_ROOT, '.next/static/chunks')
  if (existsSync(chunksDir)) {
    const { readdirSync, statSync } = await import('fs')
    let totalBytes = 0
    for (const chunk of initialChunks) {
      const basename = chunk.split('/').pop()
      const chunkPath = join(chunksDir, basename ?? '')
      if (existsSync(chunkPath)) {
        totalBytes += statSync(chunkPath).size
      }
    }
    // Raw (uncompressed) size will be larger than gzip; use 3× compression ratio as conservative estimate
    const estimatedGzip = Math.round(totalBytes / 3)
    if (estimatedGzip > FIRST_LOAD_JS_LIMIT_BYTES) {
      fail(
        `Estimated first-load JS ~${(estimatedGzip / 1024).toFixed(1)} KB gzip (limit: ${FIRST_LOAD_JS_LIMIT_BYTES / 1024} KB) — run with ANALYZE=true for exact measurement`,
      )
    } else {
      ok(`Estimated first-load JS: ~${(estimatedGzip / 1024).toFixed(1)} KB gzip`)
    }
  } else {
    console.warn('⚠️  Could not measure first-load JS size — no stats file and no chunks dir')
  }
}

if (failures > 0) {
  console.error(`\n${failures} bundle gate check(s) failed.`)
  process.exit(1)
}

console.log('\n✅ All bundle gate checks passed.')
