# PromptLens 官网 — UI 设计规范

**配套文件**：`.omc/plans/2026-04-15-promptlens-website.md`
**风格**：Linear / Raycast — dark-first，高饱和渐变，极窄网格线，工程师审美
**Date**: 2026-04-15

---

## 1. Design Tokens

### 1.1 调色板

```
背景层：
  --pl-bg-base:    #07070a   /* 近黑，主背景 */
  --pl-bg-elev-1:  #0d0d12   /* 卡片底，比 base 高 1 层 */
  --pl-bg-elev-2:  #15151c   /* 弹层、Demo 输入区 */
  --pl-bg-overlay: rgba(7,7,10,0.72)  /* 模糊遮罩，配 backdrop-blur */

文字层：
  --pl-fg-primary:    #f5f5f7   /* 标题、强调正文 */
  --pl-fg-secondary:  #a1a1a8   /* 副标题、说明文字 */
  --pl-fg-tertiary:   #6b6b73   /* 弱化文字、占位 */
  --pl-fg-disabled:   #3d3d44

品牌色（双向渐变核心）：
  --pl-accent-from:   #7c5cff   /* 紫 — 主品牌起点 */
  --pl-accent-to:     #00e1ff   /* 青 — 主品牌终点 */
  --pl-accent-mid:    #4d8eff   /* 视觉中点（蓝），用于高频出现的小图标 */

辅助状态：
  --pl-success: #2ee59d
  --pl-warning: #ffb454
  --pl-danger:  #ff5c7c

边界 / 网格：
  --pl-border-subtle: rgba(255,255,255,0.06)   /* 默认分隔线 */
  --pl-border-default: rgba(255,255,255,0.10)
  --pl-border-strong:  rgba(255,255,255,0.18)
  --pl-grid-line:      rgba(124,92,255,0.08)   /* 全站网格背景线 */
```

**渐变预设**（高频复用，全部走 CSS 变量，不要散写）：

```css
--pl-grad-brand:      linear-gradient(135deg, var(--pl-accent-from) 0%, var(--pl-accent-to) 100%);
--pl-grad-brand-soft: linear-gradient(135deg, rgba(124,92,255,0.18), rgba(0,225,255,0.18));
--pl-grad-radial-spot:
  radial-gradient(60% 80% at 50% 30%,
    rgba(124,92,255,0.35) 0%,
    rgba(0,225,255,0.10) 45%,
    transparent 75%);
--pl-grad-text-shimmer: /* hero 标题用 */
  linear-gradient(110deg, #f5f5f7 0%, #c9b8ff 30%, #7ce0ff 55%, #f5f5f7 80%);
```

### 1.2 字体

```
Latin: Inter Variable (next/font/google, weights 400/500/600/700, italic 不用)
CJK:   MiSans VF Latin / MiSans VF (next/font/local, woff2)
等宽:  JetBrains Mono (代码块、API endpoint、provider 名)

Fallback chain:
  --pl-font-sans: 'Inter', 'MiSans VF', -apple-system, BlinkMacSystemFont, sans-serif;
  --pl-font-mono: 'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace;
```

### 1.3 字号 / 行高（rem，桌面基准 16px）

| Token              | 桌面            | 移动           | 用途                              |
|--------------------|-----------------|----------------|----------------------------------|
| `--pl-text-display`| 5.5rem / 1.05   | 3rem / 1.1     | Hero 主标题（仅 1 处出现）         |
| `--pl-text-h1`     | 3.5rem / 1.1    | 2.25rem / 1.15 | Section 大标题                    |
| `--pl-text-h2`     | 2.25rem / 1.2   | 1.625rem / 1.25| 子标题                            |
| `--pl-text-h3`     | 1.5rem / 1.3    | 1.25rem / 1.3  | 卡片标题                          |
| `--pl-text-body-lg`| 1.125rem / 1.6  | 1.0625rem / 1.6| Hero 副文案、Section 引言         |
| `--pl-text-body`   | 1rem / 1.6      | 0.9375rem / 1.6| 正文                              |
| `--pl-text-caption`| 0.875rem / 1.5  | 0.8125rem / 1.5| 标签、辅助说明                    |
| `--pl-text-mono-sm`| 0.8125rem / 1.5 | 同              | API 端点、provider 名             |

字重：标题 600（部分 display 700），正文 400/500，强调 500。

### 1.4 间距 / 栅格

栅格：12 列，gutter 24px，container max-width 1280px，外边距 96px（桌面）/ 20px（移动）。

间距 token（4 的倍数）：

```
--pl-space-1:  4px
--pl-space-2:  8px
--pl-space-3:  12px
--pl-space-4:  16px
--pl-space-5:  20px
--pl-space-6:  24px
--pl-space-8:  32px
--pl-space-10: 40px
--pl-space-12: 48px
--pl-space-16: 64px
--pl-space-20: 80px
--pl-space-24: 96px
--pl-space-32: 128px
```

Section 垂直节奏：每段 `padding-block: var(--pl-space-32)`（桌面 128px），移动 `var(--pl-space-20)`（80px）。

### 1.5 圆角 / 阴影 / 边框

```
--pl-radius-sm:   4px   /* 标签、徽章 */
--pl-radius-md:   8px   /* 按钮、输入框 */
--pl-radius-lg:   12px  /* 卡片 */
--pl-radius-xl:   20px  /* 大型容器、Demo 主面板 */
--pl-radius-full: 9999px

阴影（不叠 3 层以上）：
--pl-shadow-glow:
  0 0 0 1px rgba(124,92,255,0.25),
  0 8px 32px -8px rgba(124,92,255,0.45);
--pl-shadow-card:
  0 1px 0 rgba(255,255,255,0.04) inset,
  0 24px 48px -16px rgba(0,0,0,0.6);

描边按钮（核心 CTA 风格）：
1px solid transparent + background-clip 实现的渐变描边
```

### 1.6 全站网格背景

固定 fixed 层，最底层：

```css
.pl-grid-bg {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background-image:
    linear-gradient(to right, var(--pl-grid-line) 1px, transparent 1px),
    linear-gradient(to bottom, var(--pl-grid-line) 1px, transparent 1px);
  background-size: 96px 96px;
  mask-image: radial-gradient(ellipse 80% 60% at 50% 30%, black 0%, transparent 80%);
}
```

效果：上半部分网格隐约可见，越往下越淡。配合每屏切换时 opacity 在 [0.3, 1] 间轻微呼吸。

### 1.7 动效曲线 / 时长

```
--pl-ease-out:    cubic-bezier(0.16, 1, 0.3, 1)    /* Linear 同款 */
--pl-ease-inout:  cubic-bezier(0.65, 0, 0.35, 1)
--pl-ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1) /* 微反弹，慎用 */

--pl-dur-quick:  120ms   /* hover, focus */
--pl-dur-base:   240ms   /* 默认过渡 */
--pl-dur-mid:    480ms   /* 进场、卡片展开 */
--pl-dur-slow:   1200ms  /* hero 标题渐入、shimmer */
```

reduced-motion 下：所有 `transition`/`animation` 统一退化为 `0.01ms`，移除 `transform` 类型动画。

---

## 2. 全局 Chrome

### 2.1 Navbar（sticky top）

```
高度：64px（桌面） / 56px（移动）
背景：var(--pl-bg-overlay) + backdrop-filter: blur(20px) saturate(180%)
底边：1px solid var(--pl-border-subtle)
滚动 > 100px 时：底边变 var(--pl-border-default)，logo 缩 4px

布局：
[Logo Type]   [Anchor: Why · How · Demo · Features · Platforms]   [zh|en] [GitHub] [Install ↗]
```

ASCII：
```
╭───────────────────────────────────────────────────────────────────────────────╮
│  ◇ PromptLens   Why  How  Demo  Features  Platforms          中/EN  ⌧  Install│
╰───────────────────────────────────────────────────────────────────────────────╯
```

### 2.2 自定义光标（仅桌面、非触摸）

- 中心：12×12 圆点，`background: var(--pl-fg-primary)`，`mix-blend-mode: difference`
- 跟随：弹簧延迟 60ms，`transform: translate3d`（GPU）
- hover 在可点击元素上：放大到 28×28，描边 `1px solid var(--pl-fg-primary)`
- 触摸设备/键盘 focus 模式自动隐藏（`@media (pointer: coarse)` + `:has(:focus-visible)`）

---

## 3. 各屏视觉与动效

### S1 · Hero

ASCII 布局（桌面，1440 宽）：
```
╭─────────────────── 上方有渐变光斑（conic-gradient 跟鼠标） ───────────────────╮
│                                                                                │
│   ┌─ 徽章 ──────────────────────┐                                               │
│   │ ★  v1.0 · 浏览器 + 桌面端    │                                               │
│   └────────────────────────────┘                                               │
│                                                                                │
│      Turn any                                                                  │
│      screenshot into                                                           │
│      ▓▓▓▓▓▓▓▓▓ a perfect prompt.    ← 渐变文字 shimmer                          │
│                                                                                │
│      Capture a region. Get the exact prompt that recreates the style          │
│      in MidJourney, SDXL, or your own model. 100% local-first.                │
│                                                                                │
│      ┌── Try the demo ──┐    ┌── Install for Chrome ↗ ──┐                     │
│      └──────────────────┘    └──────────────────────────┘                     │
│         ▲ 主 CTA              ▲ 次 CTA                                         │
│      渐变填充                  描边按钮                                          │
│                                                                                │
│   ◇ Used by 600+ designers · Open source · MIT licensed                       │
│                                                                                │
│   ┌──────────────── 镜像区：产品截图 + 反射 ────────────────────┐               │
│   │   [PromptLens 抽屉浮层 截图，1440×900 缩放展示]              │               │
│   │   底部 CSS reflection（mask-image gradient 渐隐）            │               │
│   └─────────────────────────────────────────────────────────────┘               │
╰────────────────────────────────────────────────────────────────────────────────╯
```

**关键元素**：
- **Logo 形变**：左上角 logo 是 SVG，`<path>` 在 mount 时从「相机框」插值到「prompt 气泡」（Framer Motion `motion.path` + `pathLength`），耗时 1.2s
- **标题文字**：`background: var(--pl-grad-text-shimmer)` + `background-clip: text`，`background-size: 200% 100%`，`@keyframes` 横向滚动 8s 一次
- **conic 渐变光斑**：放在 hero 顶部 200×200px 区域，CSS `@property --pl-hero-angle` + JS rAF 让它跟鼠标 X 偏转 ±15°，鼠标不动时缓慢自转 60s/circle
- **CTA 主按钮**：`var(--pl-grad-brand)` 填充，hover 时 box-shadow `var(--pl-shadow-glow)` 渐入，按钮内部加一道 1s 横扫的高光（`::before` `linear-gradient` 平移）
- **产品截图镜像**：底部用 `mask-image: linear-gradient(to bottom, black 60%, transparent)` + `transform: scaleY(-1) translateY(100%)` 做倒影，opacity 0.3
- **进场顺序**（按 50ms 错开）：徽章 → 主标题逐行 mask-reveal → 副文案淡入 → CTA → 截图镜像

### S2 · Problem（痛点）

ASCII：
```
╭────────────────────────── viewport 被 pin 住，滚动 1.5x 高度 ──────────────────╮
│                                                                                │
│   THE PROBLEM                                                                  │
│   Describing a reference takes longer than designing it.                       │
│                                                                                │
│   ┌────────┐  ┌────────┐  ┌────────┐                                          │
│   │ 12 min │  │ 3 try  │  │  ?     │   ← 三张卡片，初始堆叠在中间               │
│   │ writing│  │ regen  │  │ still  │     滚动时扇形展开（GSAP stagger）         │
│   │ prompt │  │ fails  │  │ wrong  │                                          │
│   └────────┘  └────────┘  └────────┘                                          │
│                                                                                │
│   左下角小字：avg. for "make this image but in the style of..."                │
╰────────────────────────────────────────────────────────────────────────────────╯
```

**动效**：
- ScrollTrigger pin（`pinSpacing: true`），section 高度 = 1.5 × viewport
- 三张卡片初始 `transform: translateX(0) translateY(0) rotate(0)` 堆叠
- 滚动 0% → 50%：左卡 `x: -260, rotate: -8°`；右卡 `x: 260, rotate: 8°`；中卡上浮 `y: -20`
- 滚动 50% → 100%：每张卡片底部出现红色下划线（`var(--pl-danger)`），写出问题文字

### S3 · How It Works（**唯一 R3F 场景**）

ASCII：
```
╭────────── 左：文案三步走（粘性侧栏） · 右：R3F canvas（全屏铺）──────────────╮
│                                                                                │
│   01 / Capture                                              ┌──────────────┐  │
│   ──────────                                                │              │  │
│   Drag to select any region                                 │   3D 截图    │  │
│   on a webpage or screen.                                   │   平面 mesh  │  │
│                                                             │              │  │
│   02 / Extract                                              │  ↓ 滚动到此  │  │
│   ──────────                                                │              │  │
│   Multi-modal vision model                                  │  分解成      │  │
│   reads composition, palette,                               │  粒子云      │  │
│   typography, mood.                                         │              │  │
│                                                             │  ↓ 继续      │  │
│   03 / Prompt                                               │              │  │
│   ──────────                                                │  粒子重组成  │  │
│   Get a structured prompt                                   │  prompt token│  │
│   ready for your model.                                     │  3D 浮字     │  │
│                                                             │              │  │
│                                                             └──────────────┘  │
╰────────────────────────────────────────────────────────────────────────────────╯
```

**R3F 场景脚本**（`HowItWorksScene.tsx`）：
- 一个 `<PlaneGeometry>` 贴着产品截图贴图，初始尺寸 4×3 单位
- `useScroll().scrollYProgress` 驱动两个 uniforms：
  - `uDissolve` (0→1)：自定义 fragment shader，按噪声纹理逐像素淘汰，被淘汰的像素生成对应位置的粒子
  - `uReform` (0→1)：粒子按 prompt token 字符的 SDF 路径重组
- 0% → 33%：原始截图保持，相机做 dolly-in
- 33% → 66%：dissolve 推进，粒子扩散到 3D 空间，camera 略微环绕
- 66% → 100%：reform 推进，粒子聚合成多个浮空 token：`"isometric"`, `"#7C5CFF"`, `"soft shadow"`, `"32mm lens"` 等
- 移动端 / reduced-motion：换成 3 张静态海报 + 文案，无 canvas

### S4 · Demo（**核心转化区**）

ASCII：
```
╭─────────────────────────── 容器：90vw × 720px，居中 ────────────────────────╮
│                                                                              │
│   LIVE DEMO  ╱  Try it now without installing                                 │
│   ─────────────────────────────────────────                                   │
│                                                                              │
│   ┌─ 模式 Tab ───────────────────────────────────┐  ┌─ Provider ⚙ ─────┐    │
│   │ ◉ Image → Prompt   ○ Product Style   ○ Web   │  │ OpenAI · gpt-4o ▾│    │
│   └──────────────────────────────────────────────┘  └──────────────────┘    │
│                                                                              │
│   ┌──────────────────────┬─────────────────────────────────────────────┐    │
│   │                      │  ┌──────────────────────────────────────┐  │    │
│   │   ┌──────────────┐   │  │ A photographic close-up of...        │  │    │
│   │   │  ↑ Drop image│   │  │                                      │  │    │
│   │   │   or paste   │   │  │ Style: cinematic, soft natural light │  │    │
│   │   │   (Cmd+V)    │   │  │ Camera: 50mm f/1.4                   │  │    │
│   │   │              │   │  │ Palette: muted earth tones #c4a484…  │  │    │
│   │   └──────────────┘   │  │                                      │  │    │
│   │                      │  │ ▌ ← 打字机光标                       │  │    │
│   │   📷 sample.png      │  └──────────────────────────────────────┘  │    │
│   │   1568×980 · 184 KB  │                                             │    │
│   │                      │  Latency: 2.3s · Provider: OpenAI · Tokens │    │
│   │   [Run →]            │  ┌─Copy─┐ ┌─Try in MidJourney↗─┐         │    │
│   │                      │  └──────┘ └────────────────────┘         │    │
│   └──────────────────────┴─────────────────────────────────────────────┘    │
│                                                                              │
│   ⚠ Your API key never leaves your browser. We don't see your images.       │
│                                                                              │
╰──────────────────────────────────────────────────────────────────────────────╯
```

**关键交互**：
- 整张卡片用 `border-image-source: var(--pl-grad-brand)` 做 1px 渐变描边
- Provider 设置点开后是右侧 **滑出抽屉**（不弹 modal），含 baseURL / API Key / model 三个字段，每个字段右侧带 ⓘ tooltip 解释 CORS / 安全
- Drop zone 拖拽时：边框变 `var(--pl-accent-from)`，背景出现脉冲渐变（500ms 一次呼吸）
- Run 按钮按下：按钮内部出现进度条（左→右扫光），同时输出区开始打字机
- 打字机用 `requestAnimationFrame` 每帧增加 ~3 字符（不是 `setInterval`），尊重 reduced-motion 时一次性显示
- 复制按钮 click：按钮 label 在 1.5s 内变成 ✓ Copied
- 错误状态：输出区变成红边，显示 `error_class` 对应的友好文案 + 「检查 Key」按钮 + 「报告问题」链接

**Ollama 特殊态**（`browserCapability.cors === 'same-origin-only'`）：
```
┌────────────────────────────────────────────────────────────┐
│  Ollama runs locally — your browser can't reach it from   │
│  this site. Use the desktop or extension to keep it        │
│  fully offline.                                             │
│                                                             │
│  ▶ [15s 录屏：在桌面端用 Ollama 跑 demo]                    │
│                                                             │
│  ┌─ Get the desktop app ──┐  ┌─ Add to Chrome ──┐         │
│  └────────────────────────┘  └──────────────────┘         │
└────────────────────────────────────────────────────────────┘
```

### S5 · Features

6 张卡片，水平 scroll-snap-x：

```
╭── FEATURES · 6 things you'll quietly love ────────────────────────────────╮
│                                                                            │
│  ◀  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  ▶            │
│     │ 🜂    │ │ 🜁    │ │ 🜃    │ │ 🜄    │ │ ✶    │ │ ⚐    │             │
│     │Multi │ │Themes│ │Short │ │Histy │ │Export│ │Privcy│             │
│     │provdr│ │      │ │cuts  │ │      │ │      │ │      │             │
│     │      │ │      │ │      │ │      │ │      │ │      │             │
│     │OpenAI│ │Light │ │⌘⇧Y to│ │SQLite│ │JSON / │ │No log│             │
│     │Anthrp│ │+ dark│ │capture│ │locally│ │MD / 📋│ │No proxy│            │
│     │Gemini│ │      │ │      │ │      │ │      │ │      │             │
│     │Ollama│ │      │ │      │ │      │ │      │ │      │             │
│     └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘             │
│                                                                            │
│       1/6                                                                  │
╰────────────────────────────────────────────────────────────────────────────╯
```

每张卡 320×400，圆角 `var(--pl-radius-lg)`，hover 时 3D tilt（max ±8°，pointer 跟随），描边在 hover 时变成跑动渐变（`@keyframes` conic 旋转）。

**键盘可达**：左右箭头切换 focus，Enter 打开详情。

### S6 · Platforms（**改为 CSS/SVG**，不再用 R3F）

```
╭── BUILT FOR YOUR WORKFLOW ────────────────────────────────────────────────╮
│                                                                            │
│      Chrome Extension          macOS Menu Bar           Windows Tray       │
│   ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐   │
│   │  [浏览器 mockup] │    │  [Mac mockup]    │    │  [Win mockup]    │   │
│   │   带 PromptLens  │    │   菜单栏 ◇ icon  │    │   托盘 ◇ icon   │   │
│   │   抽屉打开       │    │   抽屉浮在右侧   │    │   抽屉浮在右侧  │   │
│   └──────────────────┘    └──────────────────┘    └──────────────────┘   │
│                                                                            │
│   Free · Open source       Universal · M-series       x64 · Win 10+        │
│   [Add to Chrome ↗]        [Download .dmg ↗]          [Download .msi ↗]    │
│                                                                            │
╰────────────────────────────────────────────────────────────────────────────╯
```

- 三张 SVG mockup 平铺，scroll-snap-x（移动端）/ 桌面平铺
- 滚入视口时：每张 mockup 从 `y: 40, opacity: 0` 弹入，`stagger: 0.12`
- 鼠标在 mockup 上时，mockup 屏幕内的截图按 `transform: perspective(800px) rotateY()` 跟鼠标 X 轻微转动（±5°），制造立体感但不上 WebGL
- mockup 上方有一道 `linear-gradient` 高光，鼠标移动时位置跟随（CSS conic-gradient 跟随鼠标）

### S7 · Pricing-or-Free

```
╭── ALWAYS FREE. ALWAYS YOURS. ─────────────────────────────────────────────╮
│                                                                            │
│   No accounts. No telemetry by default. No vendor lock-in.                 │
│   Source on GitHub, MIT license.                                           │
│                                                                            │
│   ┌─ ★ Star on GitHub ──┐  ┌─ Read the code ──┐                          │
│   └─────────────────────┘  └──────────────────┘                          │
│                                                                            │
╰────────────────────────────────────────────────────────────────────────────╯
```

极简，背景一道横向渐变细线（`height: 1px; background: var(--pl-grad-brand);`）从中央向两侧扩散动画。

### S8 · CTA Footer

```
╭── 背景：CSS canvas 星空（粒子按鼠标缓慢吸附）───────────────────────────────╮
│                                                                            │
│              See your designs through                                      │
│              the eyes of an AI.                                            │
│                                                                            │
│        ┌─ Try the demo ─┐   ┌─ Install ↗ ─┐                              │
│        └────────────────┘   └─────────────┘                              │
│                                                                            │
│                                                                            │
│   ─────────────────────────────────────────────────────────────────────   │
│   ◇ PromptLens                                                             │
│   GitHub · X · Discord · Privacy · Changelog                              │
│   © 2026 · MIT License                                                     │
╰────────────────────────────────────────────────────────────────────────────╯
```

- 星空：2D `<canvas>`，~120 个白色 1-2px 粒子，每帧 sin/cos 漂浮，鼠标周围 200px 半径内施加 0.3 的吸附力
- 上方文案 `var(--pl-grad-text-shimmer)`，重复 hero 的 shimmer 节奏
- 链接 hover：底部下划线从中心向两侧 stroke-draw（`@keyframes` `transform-origin: center`）

---

## 4. 组件原子库（小抄）

| 组件         | 关键样式 | 状态 |
|-------------|---------|------|
| `<Button variant="primary">` | `var(--pl-grad-brand)` 填充，`var(--pl-radius-md)`，hover `var(--pl-shadow-glow)`，按下 scale 0.98 | hover/active/disabled |
| `<Button variant="ghost">` | 渐变描边，背景透明，hover 时背景 `var(--pl-grad-brand-soft)` | 同上 |
| `<Card>` | `var(--pl-bg-elev-1)`, `var(--pl-radius-lg)`, `var(--pl-shadow-card)`, `1px solid var(--pl-border-subtle)` | hover 时 border 变 `var(--pl-border-default)` |
| `<Badge>` | `var(--pl-bg-elev-2)`, `var(--pl-radius-full)`, `padding: 4px 10px`, mono 字体 | — |
| `<Input>` | `var(--pl-bg-elev-2)`, `1px solid var(--pl-border-default)`, focus 时 border `var(--pl-accent-from)` + `box-shadow: 0 0 0 3px rgba(124,92,255,0.18)` | focus/error/disabled |
| `<Tab>` | 底部 2px 渐变指示条，未选 `var(--pl-fg-tertiary)`，选中 `var(--pl-fg-primary)` | — |
| `<KbdHint>` | 键位徽章，`<kbd>⌘</kbd><kbd>⇧</kbd><kbd>Y</kbd>` mono 8px 圆角 | — |

---

## 5. 响应式断点

```
sm:  ≥ 640px   /* 大手机 */
md:  ≥ 768px   /* 平板 */
lg:  ≥ 1024px  /* 小桌面 */
xl:  ≥ 1280px  /* 标准桌面 */
2xl: ≥ 1536px  /* 大屏 */
```

- `< md`：导航折叠成汉堡 + 抽屉，所有 R3F 退化为静态海报，水平 scroll-snap 改为单列堆叠，hero display 字号降到 3rem
- `≥ lg`：完整体验
- `≥ 2xl`：内容容器仍 1280px 居中，外侧空白增大

---

## 6. 可访问性约束

- 所有交互元素 focus state 必须可见：`outline: 2px solid var(--pl-accent-from); outline-offset: 3px;`
- 文字对比度：正文 ≥ 7:1（WCAG AAA），副文案 ≥ 4.5:1（AA）— 已用 `--pl-fg-secondary: #a1a1a8` 在 `#07070a` 上验证 7.4:1
- 渐变文字必须有 fallback：`@supports not (background-clip: text)` 时退化纯色
- R3F canvas 必须有 `aria-hidden="true"` 且配套 `<div class="sr-only">` 描述等价信息
- 自定义光标不能是唯一指示器（按钮自身的 hover 样式必须独立可见）
- `prefers-reduced-motion: reduce`：禁止 transform 动画，允许 opacity，禁用 R3F + canvas，shimmer 文字停在中位

---

## 7. 资源清单（需要你提供 / 我生成）

| 资源 | 数量 | 来源建议 |
|------|------|---------|
| Logo SVG（含 morph 起止两态） | 2 | 你提供，或我用项目里现有 logo 拓展 |
| 产品截图（hero 镜像 + how-it-works 贴图） | 4 张 | 用现在 PromptLens 实际界面，截 2x retina |
| 设备 mockup SVG（Chrome / Mac / Win） | 3 | Figma 社区开源 mockup，转 SVG |
| Demo 用 sample 图（演示 paste） | 2-3 张 | 选有明显风格的图（cinematic/illustration/3D），需有版权 |
| OG 分享图模板 | 1 | `@vercel/og` 动态生成，模板我可以画 |
| 字体文件 MiSans VF | 1 套 | 小米官方免费下载 |

---

## 8. 与 plan 文件的对应关系

| Plan 章节 | UI 文档章节 |
|-----------|------------|
| §3.1 Section Map | §3 各屏视觉与动效 |
| §3.2 Global Chrome | §2 全局 Chrome |
| §3.3 Component Tree | §4 组件原子库 |
| §3.4 Demo Data Flow | §3 S4 Demo |
| §3.6 Performance Budget | §1.7 动效曲线（影响 R3F 决策） |
| AC-1 ~ AC-19 | 各屏的「关键交互」段落隐含验收点 |

---

## 9. 实现顺序建议（与 plan S1-S11 对应）

1. **S2 落 Tokens** 时，按本文档 §1 完整粘贴到 `globals.css` 的 `@theme` block
2. **S3 落 Chrome** 时，按 §2 实现 Navbar + 自定义光标 + 网格背景
3. **S4 Hero** 严格按 §3 S1 ASCII 布局；优先把 logo morph + shimmer 标题做出来，CTA 渐变是品牌锚点
4. **S5 HowItWorks** R3F 是全站唯一硬骨头，建议先做静态海报版本跑通整页节奏，再回头精雕 shader
5. **S6 Demo** 抽屉式 Provider 设置是 UX 关键，别用 modal
6. **S7 Platforms** mockup 的 SVG 准备好之前可以用占位灰块开发布局
7. **S8 CtaFooter** 星空 canvas 放最后，复杂度低

---

## 10. 一些不写在 plan 里的视觉判断

- **不要用 emoji 当装饰图标**（你之前明确说过去 AI 味），所有图标用 1.5px stroke 的 lucide / 自绘 SVG
- **不要用 glassmorphism 卡片**（毛玻璃 + 半透明背景）— Linear/Raycast 风是「实色卡片 + 极薄边框」，毛玻璃只用在 Navbar
- **不要用大圆角**（`24px+`）—保持 8/12/20 三档，避免「Web2.0 早期可爱风」
- **不要给所有元素加渐变** — 渐变是稀缺资源，集中在：Hero 标题 / 主 CTA / Demo 卡片描边 / 网格背景。其它地方用纯色 + 透明度
- **不要 dark mode 切换器** — v1 dark only，把开关砍掉省 UI 复杂度（plan 已写）
- **不要"Trusted by"的灰色 logo 墙** — SaaS 套路烂大街，换成 GitHub stars 数字 + 真实用户引用 1 句话即可

