# Chrome Web Store — 中英文详细说明

在开发者后台 **Store listing → Localized listing** 里，可以分别为 `English (en)` 和 `Chinese (Simplified) (zh_CN)` 添加独立文案。下面是两个语言的成对内容。

---

## 🇬🇧 English (en)

### Short description (≤ 132 chars)

```
Select any screenshot to get AI prompts, product visual analysis, or webpage design tokens — via your own OpenAI/Anthropic/Gemini key.
```

### Detailed description

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

## 🇨🇳 中文（简体 zh_CN）

### Short description 短描述（≤ 132 字符）

```
截取任意网页区域，一键生成 AI 绘图提示词、产品视觉分析或网页设计 Token —— 使用你自己的 OpenAI / Anthropic / Gemini API Key。
```

> 字符数：63，安全在 132 以内。

### Detailed description 详细说明

```
PromptLens 把网页上的任意图像 —— 照片、产品图、界面截图 —— 转化为结构化的创意情报，提供三种分析模式：

• 风格提示词（Style Prompt）—— 一键生成可直接粘贴到 Midjourney、Stable Diffusion、Flux、DALL·E / GPT-4o 的提示词，自动带上 --ar、--style、权重等参数。

• 产品视觉（Product Visual）—— 对产品图进行六个维度的拆解：配色、CMF、光线+镜头、构图+场景、情绪+道具，以及一条可复用的生成 Prompt。

• 网页设计（Web Design）—— 从任意页面提取字体、配色、组件、交互和符合 DTCG 规范的设计 Token。支持导出为 Skill.md（给 AI 代理使用）或 Tokens Studio JSON（给 Figma 使用）。

使用方式
1. 按下快捷键（Mac 默认 ⌘⇧Y，Windows/Linux 默认 Ctrl+Shift+Y）
2. 在当前页面拖选任意区域
3. 在侧边面板选择分析模式，数秒内得到结构化结果
4. 一键复制、导出为 skill.md，或直接粘贴到你的创意工具中

自带 API Key（BYOK）
PromptLens 不带服务端。你可以接入 OpenAI、Anthropic、Google Gemini，或任意 OpenAI 兼容端点（Azure、本地自建模型、国内云服务商等）。请求从你的浏览器直达你选择的服务商，使用你自己的 API Key，不会经过我们。

目前 PromptLens 100% 本地优先，完全 BYOK。未来会提供可选的云端服务套餐，但 BYOK 模式永久保留。

隐私保护
• 无账号、无埋点、无服务端
• API Key 仅存储于 chrome.storage.sync（只同步到你自己的 Google 账号）
• 图像仅存在于内存中；除发送到你配置的端点外，不会被保存或上传到任何其他地方
• 最近 50 条分析记录缓存在本地 IndexedDB，可随时清空

所需权限（最小化）
• activeTab —— 在你触发快捷键的标签页注入选择浮层
• storage —— 保存你的 API 配置和本地历史记录

适用人群：设计师、品牌研究员、产品团队，以及任何在 Pinterest、Dribbble、小红书、X 或竞品页面上持续积累视觉素材库的人。

PromptLens 本地优先，功能透明、不藏私。
```

---

## 📝 填表时注意

1. **Primary language 选 English**（用户覆盖面更广，Chrome Web Store 默认按用户浏览器语言匹配）
2. 在 **Add translation / 添加译文** 里添加 `Chinese (Simplified)` → 粘贴上面的中文版
3. 两个语言的 **Short description** 和 **Detailed description** 各自独立

### 其他字段不用翻译
下列是**全球统一**的，所有语言共用同一份，无需分别填：
- 图标、推广图、截图
- Category、Homepage URL、Privacy policy URL
- Permission justifications（审核团队读英文）
- Data usage disclosure（勾选框）
- Single-purpose description（审核团队读英文）

如果你担心审核团队更看重哪种语言的文案 —— Chrome Web Store 全球审核团队以**英文**为准，中文版是展示给中国用户看的。两份保持一致即可。
