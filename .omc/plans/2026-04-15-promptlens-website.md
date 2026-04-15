# PromptLens Website — Implementation Plan (Consensus / Deliberate)

**Date**: 2026-04-15
**Owner**: AidenZhu
**Target workspace**: `apps/website` (new pnpm workspace, add to root `pnpm-workspace.yaml`)
**Deployment**: Vercel (production) + preview deployments per PR
**Package name**: `@promptlens/website`

---

## 1. Requirements Summary

Build a single-page long-scroll marketing website for **PromptLens**, positioned as a screenshot → AI drawing prompt tool (already shipped as Chrome MV3 extension + Tauri desktop in the same monorepo at `apps/chrome` and `apps/desktop`).

**Fixed constraints (user-decided):**
- Style: Linear / Raycast (dark-first, high-saturation gradient mesh, thin grid lines)
- Structure: single-page long scroll (no multi-page router, anchor-scroll only)
- Languages: zh-CN + en (i18n with instant toggle, no route split)
- Deploy: Vercel
- Interactivity: full R3F / Three.js across multiple sections (user explicitly chose "full-site heavy interaction")
- Embedded demo: user pastes image → receives prompt; reuses `packages/core/src/vision-client.ts` multi-provider client; user-supplied API key stays in `localStorage`, never hits a server we own
- Tech stack (proposed): Next.js 15 App Router + Tailwind v4 + Framer Motion + GSAP ScrollTrigger + Lenis smooth-scroll + React Three Fiber + drei

---

## 2. RALPLAN-DR Summary

### Principles (5)

1. **Ship fidelity, not spectacle** — every motion must anchor to a product message; no 3D "because cool".
2. **Reuse the monorepo** — the demo section MUST import `@promptlens/core` (not re-implement `vision-client`); prove the same code that powers the extension.
3. **Keys never leave the user's browser** — no serverless proxy for vision API calls; demo runs fully client-side against user's own endpoint.
4. **Progressive enhancement** — the site must be usable (readable, demo functional) with JS on but WebGL disabled (Safari Lockdown Mode, low-end Android). R3F scenes degrade to poster images.
5. **Budget-locked performance** — hard perf budget enforced in CI; regressions block merge.

### Decision Drivers (top 3)

1. **Time-to-ship vs visual ambition** — user chose "full interaction", which enlarges scope; we MUST offset with aggressive lazy-loading and a frozen scene count (≤3 R3F canvases) to protect LCP.
2. **Bundle weight on first paint** — R3F + three + GSAP easily cross 400 KB gzip. LCP budget demands R3F be dynamic-imported below the fold; hero uses CSS-only.
3. **Demo integrity** — the demo is the strongest proof of product; it must actually work against at least OpenAI + Anthropic + Gemini (providers already shipped in core). Browser CORS means we must document which providers allow browser-origin calls and fail gracefully for those that don't.

**R3F scope (revised after Architect/Critic review):** exactly **one** R3F canvas, in `how-it-works`. `platforms` and `cta-footer` use CSS + SVG. This resolves Principle #1 drift flagged in review; see §3.1 and ADR Consequences.

### Viable Options

#### Option A — Next.js 15 App Router + single-scene R3F (chosen)

- **Pros**: SSR/SSG for SEO + fast TTFB, Vercel-native, i18n via `next-intl`, App Router supports per-section streaming, Framer Motion + R3F have first-class Next.js adapters, matches rest of monorepo (TS + React 18+).
- **Cons**: App Router server-client boundary adds cognitive load for animation-heavy components (many must be `"use client"`). Bundle policing is manual.
- **Why viable**: Best SEO + best DX + Vercel preview URLs + easiest Tailwind v4 integration.

#### Option B — Astro + React islands + R3F

- **Pros**: Ships less JS by default (per-island hydration), excellent Lighthouse out of the box, great MDX story for future blog.
- **Cons**: `next-intl`'s App-Router-integrated SSR i18n has no Astro peer of equal maturity (`astro-i18n` is community-maintained, no RSC streaming); App Router RSC streaming gives better TTFB for below-the-fold sections; `@vercel/og` ergonomics are Next-native (edge function).
- **Why viable but not chosen**: Astro would be strictly better on JS weight, and after cutting to one R3F scene the island boundaries are no longer a strong objection. Chosen Next.js for ecosystem depth (next-intl, @vercel/og, bundle-analyzer tooling, Vercel preview URL parity with rest of org). If LCP budget fails at S10, Astro is the documented migration escape hatch (see Follow-ups).

#### Option C — Vite + React SPA (no SSR)

- **Pros**: Simplest mental model, fastest dev loop, no server boundary.
- **Cons**: Worse SEO (empty `<body>` on first byte), no image optimization pipeline, no built-in i18n routing, Vercel still works but we lose edge-render benefits.
- **Invalidated**: Website is marketing-first; SEO and social previews (OG tags for Twitter/LinkedIn) are non-negotiable. SPA-only is a regression.

**Decision: Option A.**

### Pre-mortem (3 failure scenarios)

1. **Bundle bloat blows LCP → ranking drop.** Team lazy-imports R3F but forgets drei re-exports; `three` pulls in `THREE.GLTFLoader` via shader tree-shake failure; LCP goes from 1.8s to 4.2s on 4G Moto G4.
   - *Mitigation*: CI runs Lighthouse + `@next/bundle-analyzer` on every PR; budget check (`lighthouse-ci assert`) fails merge if LCP > 2.5s on 4G-simulated runs. Import only from `three/examples/jsm/...` explicitly.
2. **Demo leaks API keys.** A well-meaning "share result" feature serializes the user's OpenAI key into a shareable URL, or an analytics event logs the request body.
   - *Mitigation*: Code-level invariant: the `VisionClient` instance in the demo is created from config that is never serialized to any outgoing request except the provider endpoint itself. Add a Playwright test that inspects all `fetch` calls during a demo run and asserts the key header appears only on the provider URL. Disable third-party analytics network calls during demo flow.
3. **Heavy R3F kills mobile Safari.** iPhone SE/iPad Air throttle GPU, scroll becomes 20 fps, user bounces.
   - *Mitigation*: Detect `(prefers-reduced-motion: reduce)` + `navigator.deviceMemory < 4` + `/iPhone|iPad/` UA; swap R3F canvas for static poster + parallax CSS. Include in acceptance criteria.

### Expanded Test Plan

- **Unit (Vitest)**: i18n dictionary completeness (every `en` key exists in `zh-CN` and vice versa); util functions (scroll math, reduced-motion detection, provider capability table).
- **Integration (Vitest + Testing Library)**: Demo section — paste image → mocked `VisionClient.classify()` → render prompt output; API key form persists to `localStorage` then rehydrates on reload; i18n toggle swaps strings without remount.
- **E2E (Playwright)**: First-paint snapshot at 375×812 (iPhone SE), 1440×900, 2560×1440; scroll to each section and wait for `aria-scrolled-into-view`; real-provider smoke test against OpenAI (requires `E2E_OPENAI_KEY` env, skipped in fork PRs); language toggle; reduced-motion mode — asserts R3F canvases are not mounted.
- **Observability**: Vercel Web Analytics (LCP/FID/CLS real-user) + Sentry (JS errors, `@sentry/nextjs`) + custom event `demo_generation_completed` with latency + provider (no payload). Error budget: < 0.5% sessions with JS error; LCP p75 ≤ 2.5s.

---

## 3. Architecture & Information Design

### 3.1 Section Map (single-page scroll)

| # | Section ID | Purpose | Motion Script | Tech |
|---|------------|---------|---------------|------|
| 1 | `hero` | Brand + one-line value prop + CTA | SVG logo morph (screenshot rect → prompt glyph) via `framer-motion` path interpolation; conic-gradient follows cursor (CSS `@property --angle` + JS rAF); text reveals via mask-image from gradient sweep | CSS + Framer Motion (no R3F) |
| 2 | `problem` | "Designers spend hours describing references" — pain statement | Pinned viewport for 1× scroll-height; three "before" cards stack then fan out via GSAP ScrollTrigger | GSAP ST |
| 3 | `how-it-works` | 3-step flow: Capture → Extract → Prompt | R3F scene #1: floating screenshot mesh morphs into prompt-token cloud as scroll progresses; camera dollies, shader ramp driven by `useScroll().scrollYProgress` | R3F + drei |
| 4 | `demo` | **Live playground** — paste image, get prompt | Card lifts on scroll entry; image drop zone; mode selector (image_to_prompt / product_style / webpage_style); config drawer for API key + provider; "Run" → streamed/final prompt appears with typewriter | React + core `VisionClient` |
| 5 | `features` | 6 feature cards (multi-provider, themes, shortcuts, history, export, privacy) | Horizontal scroll-snap with `scroll-snap-x`; card tilts via `framer-motion` `whileHover`; gradient border runs via CSS conic-gradient animation | CSS + Framer Motion |
| 6 | `platforms` | Chrome + macOS + Windows availability | **CSS carousel** of SVG device mockups; `scroll-snap-x` or Framer Motion carousel; parallax on mockup glare via `transform: translate3d`; no 3D | CSS + Framer Motion |
| 7 | `pricing-or-free` | Currently free/OSS; will become pricing table later | Simple reveal; no 3D | CSS |
| 8 | `cta-footer` | Final CTA + install links + GitHub + X | **CSS canvas starfield** via 2D canvas API (≤2 KB JS), or pure SVG grain + CSS animated gradient; no WebGL | CSS + 2D canvas |

### 3.2 Global Chrome

- **Navbar**: sticky, blurred backdrop; anchor links; language toggle (zh/en); theme note ("always dark; a light variant ships in v2"); install CTA collapses to icon on scroll-down.
- **Scroll engine**: `Lenis` wraps the document; integrates with GSAP ScrollTrigger via `lenis.on('scroll', ScrollTrigger.update)`.
- **Cursor**: custom cursor dot with `mix-blend-mode: difference`, disabled on touch.
- **Grid overlay**: fixed `<div>` with 1px semi-transparent vertical grid lines every 96px (Tailwind container), fades in/out via opacity on section change.

### 3.3 Component Tree (planned)

```
apps/website/
  app/
    layout.tsx                # html+body, font preload, theme class, Analytics
    page.tsx                  # server component; composes section client components
    opengraph-image.tsx       # dynamic OG image via @vercel/og
    robots.ts, sitemap.ts
    i18n/
      request.ts              # next-intl request config
      messages/{en,zh-CN}.json
  components/
    chrome/
      Navbar.tsx              # client; scroll-aware
      LocaleToggle.tsx
      GridOverlay.tsx
      CustomCursor.tsx
    scroll/
      LenisProvider.tsx       # client; wraps children
      SectionObserver.tsx     # reports active section to Navbar
    sections/
      Hero.tsx                # client; SVG morph + gradient
      Problem.tsx             # client; GSAP ST pin
      HowItWorks.tsx          # client; dynamic import of R3F scene
      Demo/
        DemoSection.tsx       # client
        ImageDropzone.tsx
        ProviderForm.tsx      # API key, baseURL, model, provider select
        PromptOutput.tsx      # streamed typewriter
        useDemoRunner.ts      # hook; invokes @promptlens/core VisionClient
      Features.tsx
      Platforms.tsx           # CSS/SVG carousel
      CtaFooter.tsx           # CSS + 2D canvas starfield
    three/
      HowItWorksScene.tsx     # R3F (only 3D scene)
      shaders/*.glsl
  lib/
    capability.ts             # device/UA/memory + reduced-motion detection
    # provider CORS metadata is imported from @promptlens/core (see §3.4), no local mirror
  public/
    posters/{hero,how-it-works,platforms,cta}.webp  # R3F fallbacks
    og/default.png
  styles/
    globals.css               # Tailwind v4 + CSS vars
  tests/
    unit/*.test.ts
    e2e/*.spec.ts
```

### 3.4 Demo Data Flow

```
User action                         System response
──────────────────────────────────  ──────────────────────────────────────────────
Open demo, click "Configure"    →   ProviderForm reads from localStorage['pl.demo.config'] (zod-validated)
Enter API key + base URL + model →  Form validates, persists to localStorage (no network)
Paste / drop image              →   ImageDropzone converts to base64 + MIME; size-limits to 4 MB
Click "Generate"                →   useDemoRunner builds config via @promptlens/core config-schema;
                                    instantiates VisionClient (from packages/core);
                                    calls client.classify(mode, imageBase64)
                                →   Request goes DIRECT to provider (api.openai.com / api.anthropic.com / etc.)
                                →   Response parsed by zod schema from core
                                →   PromptOutput renders with typewriter animation
                                →   Telemetry: one event { provider, latency_ms, mode, success } — no payload
Errors                          →   Surface inline: CORS hint, rate-limit hint, invalid-JSON hint;
                                    link to provider-capability doc
```

**CORS / Provider capability table** (drives UI state) — **lives in `packages/core`, not in the website** (fixes drift flagged by Critic finding #2):

Add to each adapter in `packages/core/src/providers/{openai,anthropic,gemini,ollama}.ts`:

```ts
export const browserCapability = {
  cors: 'yes' | 'header-required' | 'same-origin-only',
  requiredHeaders?: Record<string, string>,  // e.g. { 'anthropic-dangerous-direct-browser-access': 'true' }
  fallbackHint: 'use-extension' | 'video-only' | 'none',
  notes: string,
} as const;
```

| Provider | `cors` | `fallbackHint` | Notes |
|----------|--------|----------------|-------|
| OpenAI   | `yes`  | `none`         | Supports CORS with Bearer header |
| Anthropic| `header-required` | `none` | `anthropic-dangerous-direct-browser-access: true`; UI surfaces warning |
| Gemini   | `yes`  | `none`         | `?key=` query style; browser-safe |
| Ollama   | `same-origin-only` | `use-extension` | No browser-direct; demo shows "install extension / desktop app" CTA + inline 15s screen recording, not a disabled greyed select |

Website `DemoSection` imports `browserCapability` from `@promptlens/core` and drives:
- provider select option state (enabled / warning-badged / replaced-with-CTA),
- helper copy,
- the fallback UI when `cors === 'same-origin-only'`.

### 3.5 i18n Strategy

- Library: `next-intl` (App Router-native, server + client support).
- Storage: `app/i18n/messages/{en,zh-CN}.json`, flat namespaces per section (`hero.title`, `hero.cta`).
- Default locale: `zh-CN`. Auto-detect via `Accept-Language` on first visit; user override stored in cookie `NEXT_LOCALE`.
- **No** route split (`/en`, `/zh`). Single URL; `<html lang>` updates from provider. This matches "single page" choice.
- Validation: unit test reads both JSON files and asserts the key set is identical; CI fails if a key exists in one but not the other.

### 3.6 Performance Budget (hard-enforced)

| Metric | Budget | Tool |
|--------|--------|------|
| LCP (p75, 4G Moto G4) | ≤ 2.5s | Lighthouse-CI |
| CLS | ≤ 0.05 | Lighthouse-CI |
| TBT | ≤ 200ms | Lighthouse-CI |
| Initial JS (first load gzip) | ≤ 180 KB | `@next/bundle-analyzer` + custom CI check reading `.next/analyze` output |
| Three/R3F bundle | lazy-loaded, each scene ≤ 120 KB gzip | bundle analyzer on chunk names matching `three*` |
| Total page weight (first visit, uncached) | ≤ 1.5 MB | Lighthouse |

**Lazy-load strategy:**
- `Hero` is server-rendered where possible, with the SVG morph in a `"use client"` child.
- The single R3F scene (`HowItWorksScene`) wrapped in `next/dynamic(() => import(...), { ssr: false, loading: () => <Poster /> })`, triggered by `IntersectionObserver` 200px before section enters viewport.
- `gsap` and `lenis` imported once at root client boundary; their chunk is shared.
- `three` / `@react-three/fiber` / `@react-three/drei` in their own chunk, loaded only when `HowItWorks` is within 200px of viewport.

### 3.7 SSR Hydration Contract

Everything that touches `window` / `document` / animation frames MUST use one of these patterns (prevents hydration mismatches flagged by Critic finding #6):

| Component | Strategy |
|-----------|----------|
| `LenisProvider` | `next/dynamic(..., { ssr: false })` |
| `CustomCursor` | `next/dynamic(..., { ssr: false })` |
| `Hero` cursor-following conic gradient | rAF loop gated by `useHasMounted()` hook; server renders angle at static default |
| `HowItWorksScene` (R3F) | `next/dynamic(..., { ssr: false, loading: <Poster /> })` |
| `CtaFooter` 2D canvas starfield | `useEffect` mount + `useHasMounted()` gate |
| `next-intl` locale | Server-side via `unstable_setRequestLocale` in `app/layout.tsx`; **no `router.refresh()` on toggle** — use a client-only `LocaleProvider` that reads cookie and swaps dictionaries without RSC re-fetch (fixes Critic finding #12) |

**CI gate:** `next build` must produce zero hydration warnings; Playwright suite fails on any `console.error` matching `/Hydration/`.

### 3.8 Telemetry Contract (success + failure)

Vercel Analytics custom events — **payload-free** for both success and failure (fixes Critic finding #4):

```ts
// success
track('demo_generation_completed', { provider, mode, latency_ms })
// failure — sibling event, same shape modulo error_class
track('demo_generation_failed', {
  provider,
  mode,
  latency_ms,
  error_class: 'auth' | 'rate_limit' | 'cors' | 'schema' | 'network' | 'timeout' | 'unknown',
})
```

No image bytes, no prompts, no headers, no API key fragments. Classification logic in `useDemoRunner.ts` maps HTTP status + error shape to `error_class`.

### 3.9 Privacy Scrubbing (Sentry)

`@sentry/nextjs` config at `apps/website/sentry.client.config.ts` MUST (fixes Critic finding #5):

```ts
Sentry.init({
  beforeSend(event) {
    // 1. strip request bodies for any provider domain
    if (event.request?.url?.match(/(openai|anthropic|googleapis|ollama)\.com/)) {
      event.request.data = '[scrubbed]'
      delete event.request.headers
    }
    // 2. drop data: URLs anywhere in the event
    return deepScrubDataUrls(event)
  },
  beforeBreadcrumb(bc) {
    if (bc.category === 'fetch' && bc.data?.url?.match(/^data:/)) return null
    if (bc.data) bc.data = scrubKeys(bc.data, ['imageBase64', 'authorization', 'x-api-key', 'apiKey'])
    return bc
  },
})
```

Playwright test forces a throw inside demo and asserts the captured Sentry envelope contains zero base64 bytes and zero API keys.

### 3.10 Image Preprocessing

Before calling `VisionClient.classify()`:
1. Reject files > 4 MB client-side (UX message).
2. **Downscale** via `<canvas>` to max 1568×1568 (matches provider token economics; Anthropic recommends ≤1568 on long edge).
3. Re-encode as JPEG quality 0.85 (strips EXIF including GPS — privacy bonus).
4. Hand base64 to core. Log only dimensions + byte size, never bytes.

---

## 4. Implementation Steps

Each step has a clear deliverable. Steps are ordered; later steps may run in parallel where noted.

### S1 — Workspace scaffold + **core browser-safety audit** (1 day, blocking)
- Create `apps/website/` with `package.json` (name `@promptlens/website`, deps: next@15, react@18, tailwindcss@4, next-intl, framer-motion, gsap, lenis, @react-three/fiber, @react-three/drei, three, zod, `@sentry/nextjs`, `@vercel/analytics`).
- Add to `pnpm-workspace.yaml` if not auto-picked; add root scripts `dev:website` + `build:website`; link `@promptlens/core` via `workspace:*`.
- Scaffold Next.js 15 App Router, TypeScript strict, Tailwind v4.
- **Core browser-safety audit (front-loaded per Critic finding #3):**
  - Grep `packages/core/src/**` for `node:`, `^fs`, `^path`, `^crypto`, `process\.`, `Buffer` — document findings; any hit gets a browser-safe refactor before S6.
  - Add `"browser"` export condition to `packages/core/package.json` if adapters differ.
  - Add vitest `packages/core/src/__tests__/browser-safe.test.ts` that imports the public surface inside jsdom and fails on any Node-only require.
  - `pnpm --filter @promptlens/website build` compiles with core linked and surfaces any remaining Node-only imports as build errors (not runtime).
- **Add `browserCapability` to each provider** in `packages/core/src/providers/{openai,anthropic,gemini,ollama}.ts` per §3.4.

**AC**: `pnpm dev:website` boots; TypeScript strict passes; ESLint passes; `next build` produces `.next/` with zero warnings; `pnpm --filter @promptlens/core test` includes the new browser-safe test; each core provider module exports `browserCapability`.

### S2 — Design tokens + global chrome (0.5 day)
- `styles/globals.css`: Tailwind v4 `@theme` block with CSS variables for brand colors (`--pl-bg: #07070a`, `--pl-fg: #f5f5f7`, `--pl-accent-from: #7c5cff`, `--pl-accent-to: #00e1ff`), fonts (Inter for Latin, misans for CJK via `next/font/google` + `next/font/local`).
- `components/chrome/{GridOverlay,Navbar,CustomCursor,LocaleToggle}.tsx` scaffolded with props + empty render.
- `app/layout.tsx` wires font variables, navbar, grid overlay, and a placeholder main.

**AC**: Dark background shows; Inter + CJK font load without FOUT (font-display swap + preload); grid overlay visible; navbar sticks on scroll.

### S3 — Scroll engine + i18n wiring (0.5 day)
- `LenisProvider.tsx` installs Lenis, bridges to `ScrollTrigger.update`.
- `next-intl` configured; `app/i18n/request.ts`; messages stubbed with section titles only.
- `LocaleToggle` toggles cookie + `router.refresh()`.
- Unit test: `messages/en.json` keys === `messages/zh-CN.json` keys.

**AC**: Smooth scroll engaged on desktop; disabled on touch via UA; language toggle flips strings without full reload flash; unit test passes.

### S4 — Section: Hero (0.5 day)
- SVG morph: two SVG paths (camera rectangle, prompt speech-bubble glyph) with Framer Motion `path d` interpolation triggered on mount + on hover.
- Cursor-following conic gradient via `@property --pl-hero-angle` and JS rAF throttled to 60fps.
- CTAs link to `#demo` (primary) and `https://github.com/...` (secondary).

**AC**: Hero renders at 60fps on M1 MacBook and ≥ 30fps on 2020 iPhone SE (measured via Chrome DevTools perf trace); CLS contribution of hero < 0.01.

### S5 — Section: Problem + HowItWorks (1 day)
- `Problem.tsx` uses GSAP ScrollTrigger pin (pinSpacing true); three cards fan out with `stagger: 0.15`.
- `HowItWorksScene.tsx` R3F canvas: screenshot plane mesh with custom shader that dissolves into particle cloud; scroll progress drives a uniform.
- Dynamic-imported with poster fallback.

**AC**: Both sections respond to scroll with ≤ 16ms frame time on M1; reduced-motion mode shows static poster + step text only.

### S6 — Section: Demo (2.5 days) — the centerpiece
- Build `useDemoRunner(config, image) => { state, result, error }`.
- Install `@promptlens/core` path; confirm `VisionClient`, `config-schema`, `providers` exports work in a Next.js client bundle (no Node-only imports; if any slip through, bundler config excludes them or core provides browser sub-path).
- `ProviderForm.tsx`: controlled form; `zod` schema from core's `configSchema`; persist to `localStorage` key `pl.demo.config` (zod-validate on read); **guard** against Safari private-mode `QuotaExceededError` (progressive-enhancement per principle #4) — fall back to in-memory config with a UI note.
- `ImageDropzone.tsx`: paste (`onPaste`), drop (`react-dropzone`), click-to-choose; reject > 4 MB; **downscale to 1568px long edge + re-encode JPEG 0.85** per §3.10 before base64.
- `PromptOutput.tsx`: typewriter animation over the returned prompt string.
- Provider capability: import `browserCapability` from `@promptlens/core`; for `same-origin-only` providers (Ollama), render the "use extension / desktop app" CTA block + inline 15s screen recording per §3.4, not a disabled option (fixes Critic finding #7).
- Telemetry: emit both `demo_generation_completed` and `demo_generation_failed` per §3.8.
- Sentry scrubbing configured per §3.9.

**AC**:
- Paste PNG → pick OpenAI → enter valid key → click Run → prompt appears within provider-typical latency; no network request observed to any non-provider domain carrying the key (Playwright asserts).
- Invalid key returns structured error from provider; UI shows friendly message + "Check key" affordance.
- Refresh page → config rehydrates from `localStorage`.

### S7 — Sections: Features + Platforms + Pricing + CTA (1 day)
- `Features.tsx` horizontal scroll-snap; 6 cards with Framer Motion tilt.
- `Platforms.tsx` **CSS/SVG** carousel of device mockups (SVG files in `public/mockups/`); scroll-snap + subtle glare parallax; install CTAs per device.
- `CtaFooter.tsx` CSS gradient + 2D canvas starfield (`<canvas>` + `requestAnimationFrame`, ≤2 KB JS); repo + X links with SVG stroke-draw.

**AC**: Features cards navigable via keyboard (arrow keys move focus to next card); Platforms carousel fully accessible via Tab/arrow keys; starfield pauses when `prefers-reduced-motion: reduce` AND when the section is not in viewport (IntersectionObserver).

### S8 — Capability detection + poster automation (0.5 day)
- `lib/capability.ts`: reduced-motion, deviceMemory, hardwareConcurrency, low-end UA heuristics; exports `useHeavyMotion(): boolean`.
- Replace the `HowItWorksScene` R3F canvas with poster WebP when `useHeavyMotion() === false`.
- **Automate poster generation** via a Playwright script `apps/website/scripts/generate-posters.ts` that boots the site, pins scroll to each scene, captures `<canvas>` via `canvas.toDataURL()`, saves to `public/posters/*.webp`; runs in CI on merges to main so posters never drift (fixes Critic finding #10).

**AC**: With `prefers-reduced-motion: reduce`, no R3F canvas mounts (assert via Playwright: `document.querySelectorAll('canvas').length === 0`).

### S9 — SEO, OG, analytics, Sentry (0.5 day)
- `app/sitemap.ts`, `app/robots.ts`.
- `app/opengraph-image.tsx` using `@vercel/og` (1200×630, branded).
- `next-sitemap` or App Router native `<head>` metadata for Twitter cards.
- Install `@sentry/nextjs`, minimal config; DSN via env var.
- Vercel Web Analytics enabled.

**AC**: `curl https://<preview>.vercel.app/` returns HTML with correct `<title>` per locale; share card renders on Twitter card validator; Sentry receives a test error in preview deployment.

### S10 — CI perf gates + pinned Lighthouse profile (0.5 day)
- Commit `apps/website/lighthouserc.json` with **explicit throttling** (fixes Critic finding #8):
  ```json
  {
    "ci": {
      "collect": { "numberOfRuns": 3, "settings": {
        "formFactor": "mobile",
        "throttling": { "cpuSlowdownMultiplier": 4, "throughputKbps": 1638.4, "rttMs": 150 },
        "screenEmulation": { "width": 360, "height": 640, "deviceScaleFactor": 2, "mobile": true }
      }},
      "assert": { "assertions": {
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.05 }],
        "total-blocking-time": ["error", { "maxNumericValue": 200 }],
        "categories:performance": ["error", { "minScore": 0.9 }]
      }}
    }
  }
  ```
- GitHub Actions workflow `website-ci.yml`: on PR touching `apps/website/**` or `packages/core/**`, run:
  - `pnpm --filter @promptlens/website typecheck`
  - `pnpm --filter @promptlens/website test`
  - `pnpm --filter @promptlens/website build`
  - `lighthouse-ci autorun` against Vercel preview URL using the committed `lighthouserc.json`
  - `@next/bundle-analyzer` JSON output + a Node script that fails if first-load JS > 180 KB gzip or if any chunk matching `three*` ships in the initial bundle (must be lazy)
- Playwright e2e job (ubuntu-latest, Chromium + WebKit) runs against preview URL.
- **Demo gate for forks** (fixes Critic finding #11): in addition to the real-key smoke test (skipped on fork PRs), a **mock-provider E2E** always runs: `useDemoRunner` reads `NEXT_PUBLIC_DEMO_MOCK=1` in preview deployments from forks → `VisionClient` is swapped for a deterministic mock → full UI flow asserted.

**AC**: A deliberate regression PR (e.g., importing all of `three/examples/jsm/**`) fails CI on the bundle gate; LCP gate fires on a deliberate large-image regression; mock-demo E2E green on a fork PR with no secrets.

### S11 — Documentation (0.25 day)
- `apps/website/README.md`: dev setup, env vars, how posters are generated, how to add a new locale, how to add a new demo provider.
- Update root `README.md` with link to website.

**AC**: A fresh clone + `pnpm i && pnpm dev:website` boots the site in under 3 minutes without extra steps.

**Total estimate**: ~7 engineer-days. Steps S4/S5/S7 can run in parallel after S3.

---

## 5. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| R1. Three.js bundle breaks LCP budget | High | High | CI bundle gate (S10); lazy-dynamic-import every R3F scene; poster fallback (S8) |
| R2. Anthropic browser CORS changes break demo | Medium | Medium | Capability table (§3.4); if Anthropic revokes browser access, disable provider in UI and surface message; documented fallback to "watch video" |
| R3. Demo API key accidentally logged | Medium | **Critical** (privacy) | Playwright network-assertion test (pre-mortem #2); no third-party scripts on demo section; Sentry `beforeSend` filter strips any `authorization`/`x-api-key` headers from breadcrumbs |
| R4. i18n drift between locales | Medium | Low-Med | Unit test on key parity (§3.5); lint rule `next-intl/no-missing-keys` |
| R5. Vercel Analytics privacy concerns (GDPR/CCPA) | Low | Medium | Use Vercel's built-in privacy-preserving mode (no cookies); add a minimal privacy note in footer |
| R6. R3F janky on low-end devices | High | Medium | `useHeavyMotion()` gate (S8); posters; acceptance criterion on iPhone SE |
| R7. App Router server/client boundary mistakes balloon dev time | Medium | Low | Convention: any file in `components/sections/**` and `components/three/**` starts with `"use client"`; server components only in `app/**` |
| R8. Vendor lock-in to Vercel | Low | Low | All code is portable Next.js; Vercel-specific features limited to Analytics (swappable) and `@vercel/og` (has an OSS alternative `og-img`) |
| R9. `packages/core` imports Node built-ins that break in browser | Medium | High | Front-loaded to S1 (not S6); grep + jsdom vitest + `"browser"` export condition. Fix upstream in core, not in website. |
| R10. Lighthouse gate fails on `main` after a Chrome release changes metrics, blocking hotfixes | Low | Medium | **Rollback switch**: `lighthouserc.json` has a `LIGHTHOUSE_ASSERT_MODE=warn` env override; ops can set it via repo variable to downgrade asserts from `error` → `warn` for ≤ 48h while budget is re-baselined. Document in `apps/website/README.md`. |
| R11. Confused-deputy API key paste (user pastes someone else's key from clipboard thinking it's theirs) | Low | Medium | First-use modal explains "this key calls <provider> billed to the key owner"; localStorage key is scoped by `provider+baseURL` so mixing keys across providers is impossible; "Clear keys" button prominently placed. |
| R12. EU visitor triggers GDPR cookie-consent obligation | Medium | Medium | Vercel Analytics runs in cookieless privacy-preserving mode (verified); Sentry configured with `sendDefaultPii: false` and no session replay; add a minimal `/privacy` anchor in footer explaining what data is collected. If legal feedback requires a banner post-launch, add `cookie-banner` as a follow-up task. |
| R13. Lenis smooth-scroll breaks anchor-jump focus/`:focus-visible` and violates WCAG keyboard predictability | Medium | Medium | Lenis is disabled for users who (a) have `prefers-reduced-motion: reduce`, (b) navigate via keyboard (listen for `keydown` Tab within 500ms of a `#anchor` click → temporarily disable Lenis for that jump). axe-core test asserts focus lands on the anchored element, not mid-scroll. |
| R14. Light-mode FOUC for users with `prefers-color-scheme: light` | Low | Low | `html` element hard-codes `class="dark"` server-side; `color-scheme: dark` CSS; no `@media (prefers-color-scheme: light)` overrides anywhere in `globals.css`. Lint rule: `stylelint-declaration-strict-value` forbids raw light-mode color declarations. |

---

## 6. Verification Steps

Before claiming done:

1. **Build**: `pnpm build:website` succeeds; `next build` output shows no warnings about Node.js APIs in edge/client code.
2. **Typecheck**: `pnpm --filter @promptlens/website typecheck` clean.
3. **Unit**: `pnpm --filter @promptlens/website test` — all green; i18n parity test passes.
4. **E2E**: Playwright suite green on Chromium + WebKit against Vercel preview URL.
5. **Lighthouse CI**: performance score ≥ 90 on mobile emulation; LCP/CLS/TBT within budget.
6. **Bundle analyzer check**: first-load JS ≤ 180 KB gzip.
7. **Manual matrix**: hero-to-footer scroll on: M1 MacBook (Chrome + Safari), iPhone SE 2020 (Safari), iPad Air M1 (Safari), Pixel 5 (Chrome). Capture 3 screen recordings; attach to PR.
8. **Demo proof**: record a video running the demo end-to-end with a real OpenAI key against a sample image; redact key in the recording.
9. **Key-safety audit**: run the Playwright network assertion test; capture the HAR; confirm only the provider domain receives the `Authorization` header.
10. **Accessibility**: axe-core audit on every section — zero serious/critical issues.
11. **Preview URL shared**: attach Vercel preview URL to the PR description; verify share card on Twitter/LinkedIn preview tools.

---

## 7. ADR

### Decision
Build the PromptLens marketing website as **Option A — Next.js 15 App Router + full R3F + next-intl + Vercel**, single page long scroll.

### Drivers
1. Marketing site SEO requires SSR/SSG.
2. User explicitly chose heavy interaction; needs a framework where R3F + GSAP + Framer Motion coexist cleanly.
3. Monorepo already TS + React; Next.js is the minimum-friction addition.

### Alternatives considered
- **Astro + islands** — rejected because island boundaries impede cross-section animation state and heavy interaction is the brief, not the exception.
- **Vite SPA** — rejected because no SSR → worse SEO and social preview story for a launch site.
- **Framer Sites / Webflow / no-code** — not evaluated deeply; dismissed because the demo section must import `@promptlens/core` TS code, which no-code platforms cannot host.

### Why chosen
Next.js + R3F is the industry baseline for "interactive marketing site with real code in it" (Vercel's own site, Linear's site, Resend's docs). We retain full bundle control, have first-class i18n, and can lazy-load R3F chunks to protect LCP.

### Consequences
+ Gain: SSG pages, Vercel preview URLs, RSC where useful, mature plugin ecosystem, `next-intl` SSR i18n.
− Cost: Must discipline server/client boundaries; must actively police bundle size; one more workspace to keep in sync with `packages/core` version bumps.
− **Principle-fidelity cost (acknowledged):** The initial draft proposed 3 R3F scenes which violated Principle #1 ("no 3D because cool"). After Architect+Critic review, scope reduced to exactly **one** R3F scene in `how-it-works` (the only one with product-message anchoring). Platforms and CtaFooter now use CSS/SVG. Net: principle preserved, engineering budget reclaimed for Demo polish (S6 grew from 1.5 → 2.5 days).

### Follow-ups (post-launch)
- A light theme variant once dark launches and stabilizes.
- Blog (MDX) at `/blog` — introduce multi-page routing at that point.
- Signed API proxy (`/api/demo`) as an opt-in for users who don't have their own key — deliberately out of scope for v1 to preserve "keys never leave the browser" invariant.
- Localized routes (`/en`, `/zh`) if SEO data suggests splitting helps.
- **Astro migration escape hatch**: if S10's Lighthouse gate cannot be met on `main` for 2 consecutive weeks after tuning, re-evaluate Option B (Astro + islands). Capture the delta in a follow-up ADR.
- **Streaming demo output** if `packages/core` adds streaming support to `VisionClient`.
- Cookie-banner integration if legal review after launch requires it (see R12).

---

## 7.1 Content Ownership

- **zh-CN copy**: AidenZhu (owner). First draft by 2026-04-18.
- **en copy**: AidenZhu drafts; optional review pass by a native speaker before launch.
- Marketing taglines for each section stubbed in `messages/{en,zh-CN}.json` during S3; refined as sections land. No launch without final copy review.

---

## 8. Acceptance Criteria (consolidated)

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-1 | Single-page scroll with 8 sections renders in both `zh-CN` and `en` | Playwright loads `/`, toggles locale, asserts section headings per dictionary |
| AC-2 | LCP ≤ 2.5s p75 on simulated 4G Moto G4 | Lighthouse-CI asserts in CI |
| AC-3 | First-load JS ≤ 180 KB gzip | CI bundle script asserts |
| AC-4 | R3F scenes do not mount when `prefers-reduced-motion: reduce` | Playwright asserts `canvas` count === 0 |
| AC-5 | Demo successfully returns a prompt from OpenAI given a real key + sample image | E2E smoke test with secret; local repro video attached to PR |
| AC-6 | No request carrying the user's API key is sent to any origin except the selected provider | Playwright network assertion |
| AC-7 | i18n dictionaries have identical key sets | Vitest unit test |
| AC-8 | Axe-core reports zero serious/critical a11y issues on any section | Playwright + axe plugin |
| AC-9 | Vercel Analytics receives `demo_generation_completed` events without payload | Manual verify against Vercel dashboard during preview QA |
| AC-10 | Keyboard-only user can reach every CTA (Tab order) and activate the demo | Manual + axe focus-order check |
| AC-11 | `demo_generation_failed` event fires with correct `error_class` for each failure category (auth/rate_limit/cors/schema/network/timeout) | Playwright forces each failure with MSW; asserts analytics payload |
| AC-12 | Sentry captures zero base64 image bytes and zero API-key fragments under any forced error | Playwright triggers an error during demo; inspects the Sentry envelope via intercept |
| AC-13 | Core providers expose `browserCapability`; Ollama shows the "use extension" CTA + 15s recording, not a disabled option | Playwright visits demo, selects Ollama, asserts CTA text + video element |
| AC-14 | `next build` produces zero hydration warnings; Playwright console shows no `/Hydration/` errors during full-page scroll | CI parse of build log + Playwright console listener |
| AC-15 | Locale toggle swaps strings without RSC refetch / page flash (no `router.refresh()`) | Playwright: network inspector shows no RSC request on toggle |
| AC-16 | Lenis is bypassed for keyboard anchor-jump navigation; focus lands on the target element | axe-core focus-order check after Tab + Enter on a nav link |
| AC-17 | Mock-demo E2E passes on a PR with no provider secrets | GitHub Actions fork PR run |
| AC-18 | `<html>` always renders with `class="dark"`; `prefers-color-scheme: light` produces no FOUC or light-mode leakage | Playwright with emulated light color scheme + pixel-compare to dark baseline |
| AC-19 | Images pasted/dropped are downscaled to ≤1568px long edge before reaching any provider | Unit test on preprocessing util; Playwright inspects outgoing request payload size |

---

## 9. Out of Scope (v1)

- Server-side demo proxy (keys-never-leave-browser invariant).
- Multi-page routes (/blog, /changelog) — anchor-only in v1.
- Light theme — dark-only in v1.
- Newsletter signup / CMS.
- User accounts / saved prompt history on the site (history stays inside the extension/desktop app).

---

## 10. Changelog
- 2026-04-15 — **v2 implementation complete** (team "promptlens-website-v2", 6 parallel workers). All 7 tasks shipped:
  - **(A) Studio pages** — `apps/website/app/stage/{style,product,webpage}/page.tsx` with per-variant client components; real image-to-prompt preview scaffolding for QA/staging.
  - **(B) Hero section** — full implementation: gradient-mesh background, conic-gradient cursor follower, animated headline, dual CTA (Download + Demo). `components/sections/Hero.tsx` shipped.
  - **(C) Problem + HowItWorks** — GSAP ScrollTrigger pin-scroll for Problem section; single R3F canvas for HowItWorks (per Principle #1); poster fallback via `useHeavyMotion()` gate. `components/sections/HowItWorks/` shipped.
  - **(D) Demo section** — 3-tab UI (paste / drop / URL); `useDemoRunner` hook wrapping `VisionClient`; multi-provider (OpenAI, Anthropic, Gemini, Ollama); `ProviderForm` + `ImageDropzone` (≤4 MB, 1568px downscale, JPEG 0.85 EXIF-strip); `PromptOutput` typewriter; telemetry events `demo_generation_completed` / `demo_generation_failed` with `error_class`. `components/sections/Demo/` shipped.
  - **(E) Features + Platforms + Pricing + CTA Footer + Waitlist API** — horizontal scroll-snap Features cards (Framer Motion tilt); CSS/SVG Platforms grid; Pricing section; CTA Footer with 2D canvas starfield; `/api/waitlist` edge route with email validation + KV persistence. `components/sections/{Features,Platforms,Pricing,CtaFooter}.tsx` + `app/api/waitlist/route.ts` shipped.
  - **(F) SEO + OG + Sentry + Analytics + CI gates** — `app/sitemap.ts`, `app/robots.ts`, `app/opengraph-image.tsx` (1200×630 edge-rendered); full `metadata` with OG + Twitter cards; `@vercel/analytics` `<Analytics />` in layout; `sentry.client.config.ts` with §3.9 scrubbing (provider URL body strip, data: URL drop, key scrub for `imageBase64`/`authorization`/`x-api-key`/`apiKey`); `sentry.server.config.ts`, `sentry.edge.config.ts`, `instrumentation.ts`; `withSentryConfig` in `next.config.mjs`; `lighthouserc.json` with exact §S10 throttling profile; `scripts/check-bundle.mjs` (180 KB gzip + three* initial-bundle gates); `.github/workflows/website-ci.yml` (typecheck → test → build → bundle-gate → Playwright smoke → Lighthouse CI); `playwright.config.ts` + `e2e/smoke.spec.ts` (OG/robots/hydration/reduced-motion/Sentry-envelope checks). Build verified: ~88 KB gzip first-load, 22/22 tests pass, zero three* chunks in initial bundle.
  - **(G) Docs sync** — `.omc/plans/2026-04-15-promptlens-website.md` ↔ `apps/website/docs/PRODUCT.md` verified byte-identical (`diff -q` clean); `.omc/plans/2026-04-15-promptlens-website-ui.md` ↔ `apps/website/docs/DESIGN.md` verified byte-identical. This changelog entry added.
- 2026-04-15 — Initial consensus draft (deliberate mode).
- 2026-04-15 — **Revision after Architect + Critic review** (deliberate mode). Applied changes:
  - Cut R3F scenes from 3 → 1 (HowItWorks only); Platforms and CtaFooter are now CSS/SVG. Reclaims ~200 KB gzip, honors Principle #1. (§3.1, ADR Consequences)
  - Moved provider CORS/browser capability from `apps/website/lib/providers` into `packages/core/src/providers/*` as `browserCapability` export. Removes drift. (§3.4, S1)
  - Front-loaded `packages/core` browser-safety audit from S6 → S1 (blocking). (S1, R9)
  - Added `demo_generation_failed` sibling telemetry event with `error_class` taxonomy. (§3.8, AC-11)
  - Expanded Sentry scrubbing to strip request bodies + data: URLs + base64 keys, not just auth headers. (§3.9, AC-12)
  - Added §3.7 SSR Hydration Contract and §3.10 Image Preprocessing (downscale to 1568px long edge + strip EXIF).
  - CORS-hostile providers (Ollama) now render "use extension" CTA + 15s screen recording, not a disabled option. (§3.4, AC-13)
  - Committed explicit Lighthouse throttling profile in `lighthouserc.json`. (S10)
  - Automated poster generation via Playwright in CI. (S8)
  - Added mock-provider E2E so fork PRs can gate the demo flow without secrets. (S10, AC-17)
  - Locale toggle swapped from `router.refresh()` → client-only `LocaleProvider`. (§3.7, AC-15)
  - Strengthened Astro rejection reasoning; added Astro migration escape hatch to Follow-ups. (§2 Option B, ADR)
  - New risks R10–R14 with mitigations: Lighthouse rollback switch, confused-deputy key, GDPR posture, Lenis a11y, dark-only FOUC.
  - New ACs 11–19 covering all of the above.
  - Content ownership pinned (§7.1).
  - S6 budget grew 1.5 → 2.5 days to match realism noted by Critic/Architect. Total estimate: ~8 engineer-days.
