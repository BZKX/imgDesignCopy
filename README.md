# img2prompt

Chrome extension that turns any on-page image selection into **three** AI-image
prompts (Midjourney · Stable Diffusion / Flux · DALL·E / GPT-4o) via an
OpenAI-compatible Vision API you control.

## Install

### From Chrome Web Store

_TODO — pending v0.1.0 submission_

### From a packaged zip

1. Grab `store-assets/img2prompt-<version>.zip` from the latest release.
2. `chrome://extensions` → enable **Developer mode** → **Load unpacked** and
   point it at the unzipped folder.

### From source

```bash
pnpm install
pnpm build    # production build → ./dist
```

Then load `./dist` as an unpacked extension.

## Develop

```bash
pnpm dev         # Vite + HMR into ./dist
pnpm test        # vitest unit tests (40+ cases covering error paths)
pnpm test:e2e    # playwright e2e (requires a prior build)
pnpm typecheck
pnpm lint
```

To ship a store-ready zip:

```bash
./scripts/pack.sh
# → store-assets/img2prompt-<version>.zip
```

`pack.sh` enforces two invariants before zipping: `dist/` must be < 2 MB and
`manifest.json` permissions must stay `["activeTab", "storage", "scripting"]`.

## Shortcut

Default: `Ctrl+Shift+Y` (mac: `Cmd+Shift+Y`). Remap at `chrome://extensions/shortcuts`.

## Configuration

Open the options page and fill in:

- `baseURL` — any OpenAI-compatible Vision endpoint (OpenAI, Azure, self-hosted,
  etc.)
- `apiKey`
- `model` — e.g. `gpt-4o-mini`, `qwen-vl-max`, `claude-3-5-sonnet-20240620`

Data lives in `chrome.storage.sync`. Images stay in memory and are sent **only**
to the endpoint you configure. See [`PRIVACY.md`](./PRIVACY.md).

## Screenshots

_Capture these at 1280×800 and drop them in `store-assets/` before submission._

| View | Asset path |
|---|---|
| Selection overlay mid-drag | `store-assets/screen-01-overlay.png` _(TODO)_ |
| Result popup, Midjourney tab | `store-assets/screen-02-result.png` _(TODO)_ |
| History panel with entries | `store-assets/screen-03-history.png` _(TODO)_ |

## Project docs

- [`.omc/plans/2026-04-13-img2prompt-chrome-mvp.md`](./.omc/plans/2026-04-13-img2prompt-chrome-mvp.md) — acceptance criteria, architecture, roadmap
- [`PRIVACY.md`](./PRIVACY.md) — what the extension does and does not transmit
- [`store-assets/README.md`](./store-assets/README.md) — listing copy and permission justifications

## Stack

Vite · React 18 · TypeScript · Tailwind · @crxjs/vite-plugin · zustand · zod · idb · vitest · playwright.
