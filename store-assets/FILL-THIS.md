# Chrome Web Store — 表单填写指引

上传 zip 后在商店表单里要填的所有内容。按顺序复制粘贴即可。

---

## 🖼️ 商店图标 (Store Icon)

**文件**: `store-assets/store-icon-128.png`（128×128 PNG，已准备）

> 注：扩展 zip 内部已经打包了这个 icon（manifest 里的 `icons.128`），但商店**还要你单独再上传一次**作为商店列表展示用。用同一张图就行。

---

## 📝 Name（最多 75 字符）

```
PromptLens — Screenshot → AI Prompt, Product Analysis, Design Tokens
```

---

## 📝 Short description / Summary（≤ 132 字符）

```
Select any screenshot to get AI prompts, product visual analysis, or webpage design tokens — via your own OpenAI/Anthropic/Gemini key.
```

---

## 📝 Detailed description（详细说明）

直接复制下面整段粘贴到 "Detailed description" 或 "详细说明" 字段：

```
PromptLens turns any on-page image — photo, product shot, UI capture — into structured creative intelligence across three modes:

• Style Prompt — ready-to-paste prompts for Midjourney, Stable Diffusion, Flux, and DALL·E / GPT-4o, with --ar, --style, and weighting parameters pre-filled.

• Product Visual — six-dimension analysis of any product photo: Color, CMF, Lighting + Lens, Composition + Scene, Mood + Props, and a reusable generation Prompt.

• Web Design — extract typography, palette, components, interactions, and DTCG-compliant design tokens from any page. Export as Skill.md (for AI agents) or Tokens Studio JSON (for Figma).

HOW IT WORKS
1. Hit the shortcut (default ⌘⇧Y on Mac, Ctrl+Shift+Y on Windows/Linux).
2. Drag to select any region on the active page.
3. Pick a mode in the side panel, get structured output in seconds.
4. Copy, export to skill.md, or paste straight into your creative tool.

BRING YOUR OWN KEY
PromptLens ships without a server. Plug in OpenAI, Anthropic, Google Gemini, or any OpenAI-compatible endpoint (Azure, self-hosted, regional clouds). The request goes from your browser directly to your chosen provider, using your own API key. Nothing is sent to us.

Today PromptLens is 100% local-first and BYOK. A managed service tier is on our roadmap — the BYOK option will always remain.

PRIVACY
• No accounts, no telemetry, no backend.
• API key lives in chrome.storage.sync (synced only to your own Google account).
• Images stay in memory; never stored or sent anywhere other than your configured endpoint.
• Last 50 generations cached locally in IndexedDB; clear any time.

PERMISSIONS (MINIMUM)
• activeTab — inject the selection overlay on the page you triggered
• storage — remember your API config and local history

Built for designers, brand researchers, product teams, and anyone compounding a visual vocabulary from scrolling Pinterest, Dribbble, Xiaohongshu, X, or their own competitor pages.

PromptLens is local-first and open about what it does.
```

---

## 📝 Category

- **Primary**: Productivity
- **Secondary** (if asked): Developer Tools

---

## 📝 Language

- **Primary**: English
- **Also supports**: Chinese (Simplified) — 简体中文

---

## 📝 Single-purpose description

```
Convert a user-selected screenshot region into structured AI prompts, product visual analysis, or design tokens for creative workflows.
```

---

## 📝 Permission justifications（三段，逐项粘贴）

### activeTab
```
Needed to inject the selection overlay and to call chrome.tabs.captureVisibleTab on the tab where the user pressed the shortcut. Not used to observe browsing or read pages passively.
```

### storage
```
Needed to persist the user's provider and API configuration (chrome.storage.sync) and a local-only prompt/analysis history stored in IndexedDB. Never transmitted.
```

---

## 📝 Homepage URL

```
https://promptlens.cc
```

> 现在域名还没部署也没关系，先填这个。审核只会验证格式，不会访问。

---

## 📝 Support URL

```
https://promptlens.cc
```

---

## 📝 Privacy policy URL

**先发布到 GitHub Gist**（10秒完成）：

1. 打开 https://gist.github.com
2. Filename: `PRIVACY.md`
3. 内容: 复制 `/Users/zhukexin/Desktop/个人/imgDesignCopy/PRIVACY.md` 全部
4. 点 "Create public gist"
5. 复制 Gist URL

填进表单那个 URL 即可（`https://gist.github.com/<你的用户名>/<hash>`）。

---

## 📝 Data usage disclosure（数据使用披露）

按以下选项勾选：

| 字段 | 值 |
|---|---|
| Personally identifiable info | **No** |
| Health info | **No** |
| Financial / payment info | **No** |
| Authentication info | **Yes** — API key, stored locally, transmitted only to user-configured endpoint |
| Personal communications | **No** |
| Location | **No** |
| Web history | **No** |
| User activity | **No** |
| Website content | **Yes** — selected image region sent to user-configured API; not stored on publisher's servers |

**三项 certifications 全部打勾**：
- [x] I do not sell or transfer user data to third parties, outside of the approved use cases.
- [x] I do not use or transfer user data for purposes unrelated to my item's single purpose.
- [x] I do not use or transfer user data to determine creditworthiness or for lending purposes.

---

## 🖼️ Images（图片资产全部在 store-assets/）

| 字段 | 文件 | 必填 |
|---|---|---|
| Store icon | `store-assets/store-icon-128.png` | ✅ 必填 |
| Small promo tile | `store-assets/promo-tile-440x280.png` | ✅ 必填 |
| Marquee / Large promo tile | `store-assets/promo-tile-920x680.png` | 可选，建议传 |
| Screenshots | `store-assets/screenshots/*.png`（1280×800） | **至少 1 张**，推荐 3–5 张 |

截图要求：**真实使用截图**，不能是营销图/合成图。参考建议：
1. Screenshot 1 — 拖选框状态（在 Pinterest / Dribbble / 任意设计类页面）
2. Screenshot 2 — Product Visual 结果（6 张分析卡片，视觉最丰富）
3. Screenshot 3 — Web Design 结果 + Skill.md 导出
