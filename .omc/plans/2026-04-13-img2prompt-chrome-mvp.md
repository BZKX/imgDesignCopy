# 图片转 AI 绘图 Prompt — Chrome 插件 MVP v1

**创建日期**：2026-04-13
**目标**：2–3 周内上架 Chrome Web Store 的可用版本，验证「灵感收集者」场景。
**非目标**：Tauri 桌面端、云同步、账号系统、商业化、多语言（均列入后续迭代）。

---

## 1. 需求总结

面向「浏览小红书 / Pinterest / X / Dribbble 看到好图，想复现风格」的用户，提供 Chrome 插件：

1. 快捷键唤起 → 框选页面任意区域（含背景图、canvas、视频帧）
2. 截图上传到用户配置的 **OpenAI-compatible Vision API**（用户填 `baseURL + apiKey + model`）
3. 同一张图一次性生成 **三种格式 prompt**：
   - **Midjourney**：自然语言 + `--ar` / `--style raw` 等参数
   - **Stable Diffusion / Flux**：关键词堆叠 + 权重 + 负向提示词
   - **DALL·E / GPT-4o / Nano Banana**：纯自然语言段落
4. 每种格式支持一键复制，最近 50 条本地历史记录可重开/复制/删除

---

## 2. 验收标准（Acceptance Criteria，可测）

| # | 标准 | 如何验证 |
|---|---|---|
| AC1 | 按下快捷键（默认 `Cmd+Shift+P`，可在插件设置改）能在当前 tab 唤起遮罩选区 UI | 手动：3 个网站 × macOS/Win 验证 |
| AC2 | 框选任意矩形区域后松手，遮罩关闭并触发识别 | 手动测试 + E2E |
| AC3 | 设置页未填 apiKey 时，选区后弹出「请先配置 API」引导 | 手动 + 单测 |
| AC4 | 一次 API 调用返回后同时渲染 MJ / SD / DALL·E 三种 prompt（Tab 切换） | Mock API 响应测试 |
| AC5 | 每个 Tab 的「复制」按钮点击后 500ms 内提示「已复制」且剪贴板包含对应文本 | E2E（Playwright） |
| AC6 | 历史记录页展示最近 50 条（缩略图 + 时间 + 3 种 prompt），支持删除单条/清空 | 单测：IndexedDB 读写；手动 |
| AC7 | 插件打包体 ≤ 2 MB，manifest v3，Chrome 120+ 可安装加载 | CI 脚本检查 |
| AC8 | 从按快捷键 → 显示 prompt 的端到端 P50 ≤ 8s（排除网络）、P95 ≤ 15s | 前端埋点日志自测 |
| AC9 | 失败路径（网络错误 / 401 / 429 / 超时）均有明确文案，不白屏 | 单测覆盖四种错误 |
| AC10 | 所有图片数据只在内存处理，不写入 localStorage；只 base64 发给用户自己的 API | 代码审查 + 静态扫描 |

---

## 3. 技术方案

### 3.1 技术栈

- **框架**：Vite + React 18 + TypeScript + Tailwind
- **扩展脚手架**：[`@crxjs/vite-plugin`](https://crxjs.dev/) （MV3，HMR 好用）
- **存储**：`chrome.storage.sync`（配置）+ IndexedDB via `idb`（历史记录，含缩略图）
- **截图流水线**：
  1. content-script 注入全屏 canvas 遮罩
  2. 用户框选 → 调 `chrome.tabs.captureVisibleTab()` 拿整页 png
  3. 在 service worker 里用 `OffscreenCanvas` 裁剪成选区 png
  4. 转 base64，POST 给用户 API
- **API 协议**：OpenAI Chat Completions 格式，`messages[].content = [{type:"text"}, {type:"image_url", image_url:{url:"data:image/png;base64,..."}}]`
- **Prompt 工程**：一次 system prompt 要求模型以严格 JSON 返回 `{midjourney, stable_diffusion, dalle}` 三字段，前端按 schema 校验
- **测试**：Vitest（单测）+ Playwright（E2E，用 `--disable-extensions-except`）

### 3.2 目录结构（建议）

```
src/
  background/        # service worker：截屏裁剪、API 调用、历史写入
  content/           # 遮罩选区 UI
  popup/             # 点击插件图标的气泡窗（显示结果 + 历史入口）
  options/           # 设置页（baseURL / apiKey / model / 快捷键）
  lib/
    vision-client.ts # OpenAI-compatible API 封装（后期抽成独立包）
    prompt-schema.ts # JSON Schema + zod 校验
    storage.ts       # IndexedDB 历史记录
    system-prompts/  # 三种目标模型的生成规则
  components/
manifest.config.ts
```

### 3.3 关键实现要点（分步，含文件引用）

| 步骤 | 产出 | 关键文件 |
|---|---|---|
| 1 | 脚手架初始化，能加载到 Chrome | `package.json`, `vite.config.ts`, `manifest.config.ts` |
| 2 | 设置页表单，保存到 `chrome.storage.sync` | `src/options/Options.tsx`, `src/lib/config.ts` |
| 3 | 全局快捷键注册 + 触发遮罩 | `manifest.config.ts` (commands), `src/background/index.ts`, `src/content/overlay.tsx` |
| 4 | 选区坐标 → 截图裁剪 → base64 | `src/background/capture.ts`（`OffscreenCanvas`） |
| 5 | Vision 客户端：调用 + JSON 校验 + 重试 | `src/lib/vision-client.ts`, `src/lib/prompt-schema.ts` |
| 6 | system prompt 模板（3 个目标模型各一份） | `src/lib/system-prompts/*.ts` |
| 7 | 结果面板（popup 或 in-page 浮层，三 Tab） | `src/popup/Result.tsx` |
| 8 | 历史记录：IndexedDB 写入 + 查询 + 管理 UI | `src/lib/storage.ts`, `src/popup/History.tsx` |
| 9 | 错误状态 / loading / 空态 | 各组件 |
| 10 | 打包、manifest 审核自查、截图、上架文案 | `scripts/pack.sh`, `store-assets/` |

### 3.4 Prompt 模板核心思路（写进 system prompt）

```
You are a reverse-prompt expert. Given an image, produce a JSON object with THREE prompts
that, when used in their respective models, would generate an image with a similar VISUAL STYLE
(not identical content). Focus on: medium, lighting, composition, color palette, texture, mood,
camera / render style. Avoid naming specific IPs or real people.

Return strictly valid JSON:
{
  "midjourney": "... --ar W:H --style raw --v 6",
  "stable_diffusion": { "positive": "...", "negative": "...", "weights_explained": "..." },
  "dalle": "natural language paragraph, ~60 words"
}
```

前端用 zod 校验并在失败时自动重试一次（带 `"Your previous response was invalid JSON..."` 追加消息）。

---

## 4. 风险与缓解

| 风险 | 影响 | 缓解 |
|---|---|---|
| `captureVisibleTab` 在跨域 iframe / 全屏视频 / DRM 内容失败 | 用户体验崩 | 捕获失败时降级到「手动粘贴图片」流程；文档说明限制 |
| 第三方 Vision API 返回 JSON 不规范 | 解析失败白屏 | zod 校验 + 一次自动重试 + fallback 展示原始文本 |
| 用户 apiKey 泄露风险 | 安全 / 信任 | 只存 `chrome.storage.sync`（本机，可选同步到同一 Google 账号），**绝不**上传到任何后端；设置页明示 |
| 模型识别质量不稳（小图、抽象画） | 输出质量差 | 对 < 256px 的选区提示「太小可能识别不准」；提供「重新生成」按钮 |
| Chrome Web Store 审核拒绝（权限过多） | 无法上架 | 只申请 `activeTab` + `storage` + `scripting`，不要 `<all_urls>` |
| 快捷键冲突（Cmd+Shift+P 是 Chrome 命令面板） | 不可用 | 默认选 `Cmd+Shift+I`？实测后定；设置页可改 |
| MV3 service worker 30s 被 kill | 大图上传超时 | 用 `chrome.runtime.connect` 长连接保活；超 25s 分段提示进度 |

---

## 5. 验证步骤（ship 前必过）

1. `pnpm build` 产物 `dist/` < 2MB，`manifest.json` 权限仅 3 项
2. `pnpm test` 单测全绿（含三种错误路径）
3. `pnpm e2e` Playwright 跑通「快捷键 → 选区 → 模拟 API → 出结果 → 复制」
4. 手动回归（checklist）：
   - [ ] 小红书网页图 ✓
   - [ ] Pinterest pin 详情页 ✓
   - [ ] X（Twitter）大图 ✓
   - [ ] CSS 背景图（Dribbble）✓
   - [ ] 视频帧截图（YouTube 暂停帧）✓
   - [ ] 本地 file:// 图 ✓
   - [ ] 无 apiKey 引导 ✓
   - [ ] 网络断开错误提示 ✓
   - [ ] 历史记录 50 条滚动流畅 ✓
5. 准备 Chrome Web Store 素材：1280×800 截图 ×3、128 图标、中英文描述、隐私政策（强调不收集数据）

---

## 6. 迭代路线（MVP 之后）

- **v1.1**：一键投喂 MJ/SD/ChatGPT Web 页面（打开 tab + 注入 prompt）
- **v1.2**：prompt 编辑器（关键词开关 / 权重滑块 / 风格预设）
- **v2.0**：Tauri 桌面端 v0（复用 `vision-client` 和 `system-prompts`），支持本地文件夹批量
- **v2.1**：云端同步（Supabase / Cloudflare D1），账号系统
- **v2.2**：风格标签 / 收藏夹 / 分享

---

## 7. 关键决策与权衡（摘要）

| 决策 | 选择 | 放弃方案 | 理由 |
|---|---|---|---|
| 视觉模型接入 | 用户填 OpenAI-compatible API | 自己代理 / 本地模型 | MVP 零服务器成本，用户掌控 |
| MVP 形态 | 仅 Chrome 插件 | Chrome + Tauri 并行 | 2-3 周可发布，先验证需求 |
| 触发方式 | 快捷键 + 截屏选区 | 右键菜单 / hover | 能覆盖 CSS 背景 / canvas / 视频帧，差异化 |
| 输出格式 | 一次出 MJ/SD/DALL·E 三种 | 只做一种 | 目标用户不确定最终用哪个模型，一次给全 |
| 历史同步 | 仅本地 IndexedDB | 云端同步 | 账号系统拖慢 MVP；v2 再做 |
| UI 框架 | React + Tailwind | 原生 JS / Svelte | 生态成熟，后续桌面端可共用组件 |

---

## 8. 开始执行

该计划已写入 `.omc/plans/2026-04-13-img2prompt-chrome-mvp.md`。

下一步建议：

- `/oh-my-claudecode:team` ← 推荐，多 agent 并行执行（脚手架 / 设置页 / 截屏 / Vision 客户端可并行）
- `/oh-my-claudecode:ralph` ← 顺序执行 + 每步验证，适合想逐步跟进
- `/oh-my-claudecode:autopilot` ← 全自主，从 0 到能跑

是否现在就开干？选哪个执行模式？
