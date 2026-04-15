# PromptLens

Monorepo shipping two apps that turn an image selection into structured design
insights via an OpenAI-compatible Vision API you control. Three modes: **绘图
Prompt** (MJ / SD / DALL·E), **产品风格** (palette · materials · lighting ·
camera · mood tags), and **网页设计** (grid · typography · colors · components
· interactions).

- **apps/chrome** — the original Chrome extension (MV3, on-page overlay).
- **apps/desktop** — a Tauri 2 desktop app (fullscreen region capture, tray,
  global shortcut, SQLite history).
- **packages/core** — shared types, modes, schemas, system prompts, vision client.

## Install

### Chrome Web Store

_TODO — pending v0.1.0 submission_

### From a packaged zip (Chrome)

1. Grab `store-assets/promptlens-chrome-<version>.zip` from the latest release.
2. `chrome://extensions` → enable **Developer mode** → **Load unpacked** and
   point it at the unzipped folder.

### Desktop (Tauri)

Grab the platform-specific artifact under
`apps/desktop/src-tauri/target/release/bundle/` produced by `pnpm build:desktop`
(`.dmg` on macOS, `.msi`/`.exe` on Windows, `.AppImage`/`.deb` on Linux).

Artifacts are **unsigned**; see [Signing & notarization](#signing--notarization).

## Develop

```bash
pnpm install
pnpm dev:chrome        # Vite + HMR into apps/chrome/dist
pnpm dev:desktop       # tauri dev (web UI + Rust shell)
pnpm test              # vitest across packages
pnpm typecheck
```

### Desktop dev prerequisites

- Rust toolchain (`rustup` — stable).
- Tauri 2 [system deps](https://tauri.app/start/prerequisites/) for your OS.
- `pnpm --filter @promptlens/desktop build:web` — front-end bundle only.
- `cd apps/desktop/src-tauri && cargo check` — fast Rust type-check without
  running a full bundle.

## Packaging

```bash
pnpm build:chrome      # → store-assets/promptlens-chrome-<version>.zip
pnpm build:desktop     # → apps/desktop/src-tauri/target/release/bundle/*
pnpm build:all         # both
```

Scripts live in [`scripts/`](./scripts). `pack-chrome.sh` wraps the Vite build
and zips `apps/chrome/dist`. `pack-desktop.sh` wraps `tauri build` and reports
the bundle directory.

### macOS Screen Recording permission

The desktop app calls `xcap::Monitor::capture_image()` which requires
**Screen Recording** consent. First run will prompt; if you deny, grant it
manually at **System Settings → Privacy & Security → Screen Recording** and
restart PromptLens. Global shortcut (`⌘⇧Y`) also needs
**Accessibility** in some macOS configurations.

### Windows tray note

The tray icon builds against `tauri::tray::TrayIconBuilder` and should work on
Windows 10+; it has only been smoke-tested on macOS in this repo. Windows users
may see the icon under the overflow chevron by default — pin it for visibility.

### Signing & notarization

The `pack-desktop.sh` script produces **unsigned** artifacts. To sign:

- macOS: set `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_ID`,
  `APPLE_PASSWORD`, `APPLE_TEAM_ID`. See
  [Tauri signing docs](https://tauri.app/distribute/sign/macos/).
- Windows: set `WINDOWS_CERTIFICATE`, `WINDOWS_CERTIFICATE_PASSWORD`. See
  [Tauri Windows signing](https://tauri.app/distribute/sign/windows/).

## Shortcut

Default: `Ctrl+Shift+Y` (mac: `Cmd+Shift+Y`). Registered globally in both
apps. In Chrome, remap at `chrome://extensions/shortcuts`.

## Configuration

Open the app's Settings panel and fill in:

- `baseURL` — any OpenAI-compatible Vision endpoint (OpenAI, Azure, self-hosted, …)
- `apiKey`
- `model` — e.g. `gpt-4o-mini`, `qwen-vl-max`, `claude-3-5-sonnet-20240620`

Chrome stores config in `chrome.storage.sync`. Desktop stores it in
`tauri-plugin-store` (`config.json` under the app data dir) and history in a
SQLite DB (`promptlens.db`). Images never leave your machine except to hit the
endpoint you configure.

## Stack

Vite · React 18 · TypeScript · zustand · zod · vitest · playwright ·
Tauri 2 · Rust · xcap · tauri-plugin-sql (sqlite).

## Project docs

- [`.omc/plans/2026-04-13-img2prompt-chrome-mvp.md`](./.omc/plans/2026-04-13-img2prompt-chrome-mvp.md)
- [`PRIVACY.md`](./PRIVACY.md)
- [`store-assets/README.md`](./store-assets/README.md)
