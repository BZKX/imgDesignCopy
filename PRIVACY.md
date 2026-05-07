# PromptLens Privacy Policy

_Last updated: 2026-04-17_

PromptLens is a Chrome extension that turns a user-selected region of a web
page into structured AI prompts and design references across three modes:
Style Prompt, Product Visual, and Web Design. We take privacy seriously: the
extension has **no backend**, **no analytics**, and **no telemetry**.

## 1. What we collect

**We (the publisher) do not collect, transmit, or store any user data.**

The extension processes the following locally on your device:

| Data | Where it lives | When it leaves your device |
|---|---|---|
| Your API config (`provider`, `baseURL`, `apiKey`, `model`, language, shortcut) | `chrome.storage.sync` — local, optionally synced to your own Google account by Chrome | Never sent anywhere by us |
| Selected image region (PNG, base64) | Held in memory inside the extension's service worker | Sent **only** to the API endpoint you configured, using your own API key |
| Prompt / analysis history (thumbnail + output JSON, up to 50 entries) | IndexedDB, local to your browser profile | Never sent anywhere; you can clear it from the side panel at any time |

## 2. What the extension does

1. When you trigger the shortcut (⌘⇧Y on macOS, Ctrl+Shift+Y on Windows/Linux),
   an overlay is injected into the active tab so you can draw a selection.
2. The selected rectangle is captured via `chrome.tabs.captureVisibleTab`,
   cropped in memory, and converted to base64.
3. The base64 image is POSTed — exactly once, over HTTPS — to the endpoint you
   configured in the options page. Supported providers include **OpenAI**,
   **Anthropic**, **Google Gemini**, and any **OpenAI-compatible** endpoint
   (Azure, self-hosted models, Chinese clouds, etc.).
4. The returned JSON is validated and rendered in the side panel as one of:
   Style Prompt (Midjourney / SD / Flux / DALL·E variants), Product Visual
   (color, CMF, lighting, composition, mood, prompt), or Web Design (layout,
   typography, colors, components, tokens, skill.md export).
5. A local history entry is written to IndexedDB.

## 3. What the extension does *not* do

- It does not upload images, prompts, or any other data to servers operated by
  the publisher.
- It does not contact any third-party service other than the API endpoint you
  explicitly configure.
- It does not use cookies, web beacons, analytics SDKs, or trackers.
- It does not read tab content other than what you explicitly select via the
  overlay.

## 4. Permissions, and why

| Permission | Why |
|---|---|
| `activeTab` | Inject the selection overlay and capture the visible area of the tab you triggered the shortcut on |
| `storage` | Persist your API settings (`chrome.storage.sync`) and local history (IndexedDB) |

We do **not** request `<all_urls>`, `scripting`, tab-browsing, history, cookies,
downloads, or any other broad permission.

## 5. Third-party services

The only network destination the extension reaches is the API endpoint you
configure. Your API key is sent with that request as an `Authorization`
(`Bearer`) or `x-api-key` header, exactly as the respective provider's
protocol requires. Please review the privacy policy of whatever provider you
point PromptLens at — we have no control over how that provider uses the data
you send them.

## 6. Children

The extension is not directed at children under 13. We do not knowingly
collect information from anyone.

## 7. Future managed service (informational)

PromptLens is currently 100% local-first and BYOK (bring your own key). A
managed service tier ("PromptLens Cloud") may be introduced in the future as
an **optional** alternative provider — the BYOK option will remain available.
If and when we add a managed tier, this policy and the Chrome Web Store data
disclosure will be updated **before** any server-side data handling is
introduced, and only users who explicitly opt in by selecting the managed
provider will have their requests processed by our servers.

## 8. Changes

If this policy changes, the new version will ship in a new release of the
extension and be posted to the repository.

## 9. Contact

Questions or requests: open an issue on the project repository or email
support via the website (https://promptlens.cc).
