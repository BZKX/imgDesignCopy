# @promptlens/website

Marketing website for [PromptLens](https://github.com/AidenZhu/promptlens) — screenshot to AI drawing prompt.

## Dev Setup

Install dependencies from the repo root:

```bash
pnpm install
```

Run the dev server:

```bash
pnpm dev:website
```

Or directly:

```bash
pnpm --filter @promptlens/website dev
```

## Build

```bash
pnpm build:website
# or
pnpm --filter @promptlens/website build
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `SENTRY_DSN` | Optional | Sentry DSN for error tracking |
| `NEXT_PUBLIC_DEMO_MOCK=1` | Optional | Force mock provider in the embedded demo (no real API calls) |

## Stack

- Next.js 15 App Router
- Tailwind CSS v4
- Framer Motion + GSAP ScrollTrigger
- Lenis smooth scroll
- React Three Fiber (single R3F scene in how-it-works)
- next-intl (zh-CN + en)
- @promptlens/core for the embedded demo (same client as the extension)
