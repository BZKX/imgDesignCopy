# PromptLens Design Language

> 把 PromptLens 官网积累的 UI 设计系统整理成可复用的方案册。
> 复用时只改 **品牌色 / 叙事主题 / 文案**，骨架保持不变。

---

## 📑 目录

1. [核心原则](#-核心原则)
2. [视觉系统（Visual System）](#-视觉系统visual-system)
   - Design Tokens · Elevation · Brand Gradient · Glass Morphism
3. [动效语言（Motion Language）](#-动效语言motion-language)
   - Scroll Narrative · Scrub vs Pin · Decoupled Animation · Parallax · Easing · Reduced Motion
4. [布局与叙事（Layout & Storytelling）](#-布局与叙事layout--storytelling)
   - Safe Zone · Stage Anchor · Three-Act Structure · Hero Pattern · Progress Nav
5. [工程模式（Engineering Patterns）](#-工程模式engineering-patterns)
   - Config-Driven · Compound Components · Code Splitting · Capability Gating · i18n
6. [审美取向（Aesthetic Direction）](#-审美取向aesthetic-direction)
7. [复用清单（Reuse Checklist）](#-复用清单reuse-checklist)
8. [附录：代码片段](#-附录代码片段)

---

## 🧭 核心原则

三条不变的公理，贯穿所有设计决策：

1. **Tokens over Hex**：组件里永远不写 `#7c5cff`，只写 `var(--color-pl-accent-from)`。
2. **Decouple Motion from Noise**：连续渐变（颜色、大小、位置）用 scrub 绑定滚动；离散状态切换（翻转、展开、消失）用独立触发的 CSS transition，不跟滚动绑定。
3. **Detect Before You Dazzle**：粒子、WebGL、blur、大量 transform 都要做能力探测降级（`prefers-reduced-motion` + `deviceMemory`）。

---

## 🎨 视觉系统（Visual System）

### 1. Design Tokens（设计令牌）

**定义**：把所有视觉原子（颜色、字号、间距、阴影、圆角、时长）抽象成命名变量，而不是散落在代码里写 hex/px。

**现在的实现**：`apps/website/app/globals.css`

```css
/* Color */
--color-pl-bg-base: #07070a;
--color-pl-bg-elev-1: #0d0d12;
--color-pl-bg-elev-2: #15151c;
--color-pl-fg-primary: #f5f5f7;
--color-pl-accent-from: #7c5cff;
--color-pl-accent-to: #00e1ff;

/* Gradient */
--pl-grad-brand: linear-gradient(135deg, #7c5cff 0%, #00e1ff 100%);
--pl-grad-radial-spot: radial-gradient(60% 80% at 50% 30%, rgba(124,92,255,0.35), transparent 75%);

/* Motion */
--pl-ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--pl-ease-inout: cubic-bezier(0.65, 0, 0.35, 1);
--pl-dur-quick: 120ms;
--pl-dur-base: 240ms;
```

**为什么值得做**：调品牌色时改 1 行，全站同步。主题化（dark/light）只需替换 token 值。Figma 变量能 1:1 对应。

---

### 2. Elevation Layers（层级明度系统）

**定义**：深色背景里用不同亮度的"地板"表达层级深浅。用户大脑会无意识感知前后关系。

**规范**：准备 **≥ 3 级** elevation
- `bg-base`：页面底
- `bg-elev-1`：卡片
- `bg-elev-2`：嵌套卡片 / 代码块

---

### 3. Brand Gradient as Identity（品牌色做身份）

**定义**：用一条线性渐变替代单一品牌色，提升视觉密度和记忆点。

**方法**：
- 选 2-3 个色值组成 brand gradient
- 规范**角度**（我们用 `135deg`）和 **stop 位置**（`0% / 50% / 100%`）
- Logo、CTA、文字高亮、hover 光晕统一使用

**Stripe / Linear / Vercel 都用这个套路。**

---

### 4. Glass Morphism（毛玻璃态）

**定义**：`backdrop-filter: blur() + saturate()` 实现的半透明磨砂层。iOS / macOS 经典语言。

**我们的做法**：
```css
.navbar {
  backdrop-filter: blur(20px) saturate(180%);
  background: rgba(7,7,10,0.72);
}
```

**坑**：只 `blur` 会发灰，加 `saturate(150-180%)` 才生动。需要浮层（顶栏、侧栏、modal）且背后有动态内容时首选。

---

## 🎬 动效语言（Motion Language）

### 5. Scroll-Driven Narrative（滚动叙事）

**定义**：把一段连续的产品体验按滚动进度切成若干 stage，每个 stage 有独立的入场/过渡/退场动作。Apple 产品页的看家本领。

**参数规范**：
- 单幕时长：**400-500vh**
- stage 数量：**4-6 个**（超过 6 个用户累）
- scrub 值：**0.5**（有一点平滑感但不过度拖尾）

**技术栈**：GSAP ScrollTrigger + Lenis（平滑滚动源）

---

### 6. Scrub vs Pin（绑定滚动 vs 固定滚动）

**区分**：

| 方式 | 用途 | 实现 |
|------|------|------|
| **Scrub** | 动画进度 = 滚动进度 | CSS `position: sticky` + `ScrollTrigger.scrub: 0.5` |
| **Pin** | 页面固定一段，内容原地不动 | 避免用 ScrollTrigger `pin`，直接用 CSS sticky |

**为什么弃用 `pin`**：传统 pin 与 Lenis 平滑滚动有兼容问题，sticky 更干净、性能更好。

---

### 7. Decoupled Animation（动画解绑）— ⚠️ 关键经验

**定义**：某些动作不适合跟滚动绑定，应该**进入特定状态时触发**，独立播放完整。

**踩过的坑**：Act 1 的卡片翻转原本绑滚动。用户慢慢滚时，卡片翻到 90° 卡住，很诡异。

**修复方式**：改为 `flipTriggered = stage >= 2` 作为**布尔触发器**，配合 CSS transition `700ms cubic-bezier(0.23, 1, 0.32, 1)` 一次播放完。

**普适规则**：

| 效果类型 | 用什么 |
|---------|--------|
| 连续渐变（颜色、大小、位置） | Scrub 绑定滚动 |
| 离散状态切换（翻转、展开、消失、打字机） | **布尔触发 + CSS transition**，脱离滚动 |

---

### 8. Parallax Layers（视差层）

**定义**：背景多层元素以不同系数响应鼠标/滚动，产生景深。

**规范**：
- 至少 2 层才有效果
- 每层乘数差 0.3-0.5（太接近看不出）
- 层越"靠近相机"移动越快

**我们的做法**：4 个色块 blob 各自有 parallax multiplier（`+1 / -1 / +0.6 / -0.6`），鼠标移动时反向位移。

```css
.site-blob--1 { transform: translate3d(calc(var(--pl-mx) * 1), calc(var(--pl-my) * 1), 0); }
.site-blob--2 { transform: translate3d(calc(var(--pl-mx) * -1), calc(var(--pl-my) * -1), 0); }
.site-blob--3 { transform: translate3d(calc(var(--pl-mx) * 0.6), calc(var(--pl-my) * 0.6), 0); }
.site-blob--4 { transform: translate3d(calc(var(--pl-mx) * -0.6), calc(var(--pl-my) * -0.6), 0); }
```

---

### 9. Easing Functions（缓动曲线）

**定义**：动画不用线性匀速，用非线性曲线模拟物理惯性。

**规范的 3 条曲线**：

```css
/* out-expo — 进入动作（迅速冲进来慢慢停下） */
--pl-ease-out: cubic-bezier(0.16, 1, 0.3, 1);

/* in-out — 双向过渡（翻转、切换） */
--pl-ease-inout: cubic-bezier(0.65, 0, 0.35, 1);

/* spring — 微弹性（按钮点击反馈） */
--pl-ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

**禁用**：
- ❌ `linear`（除非真正的物理匀速，如 Logo 旋转）
- ❌ `ease`（太平庸）

---

### 10. Reduced Motion（尊重无障碍）

**定义**：用户系统设置里开启"减少动画"时，所有动画降级为瞬时/无。

**强制规则**：
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**任何带动画的项目都必须加这个，否则是可访问性缺陷。**

---

## 🏗️ 布局与叙事（Layout & Storytelling）

### 11. Safe Zone（安全区）

**定义**：内容在大屏上不铺满到视口边缘，保留气息。

**Pattern**：
```css
padding: 0 max(24px, calc((100% - 720px) / 2));
```

- 小屏：至少 24px
- 大屏：居中 720px 内容列

正文区必备；装饰/背景可以铺满。

---

### 12. Stage Anchor（舞台锚点）

**定义**：滚动叙事里，视口中心作为视觉锚点，元素围绕它编排。

**反例**：用父容器相对定位——容器有 padding/margin 会污染坐标。

**正例**：
```css
.product-image {
  position: absolute;
  left: calc(50vw + ${tx}vw);
  top: 50vh;
  transform: translate(-50%, -50%);
}
```

视觉元素用**视口绝对定位**（vw/vh），不用容器相对百分比。

---

### 13. Three-Act Structure（三幕结构）

**定义**：借鉴电影三幕法，每个 Section 有起承转合。

**固定模板**：

| 阶段 | 滚动范围 | 作用 |
|------|---------|------|
| 1. Context Setup | 0–10% | 入场，建立场景 |
| 2. Action Trigger | 10–35% | 用户操作被触发（插件出现等） |
| 3. Transformation | 35–70% | 主要视觉变换（翻转、分析等） |
| 4. Payoff + Rest | 70–100% | 结果展示 + 停留消化 |

**规则**：
- 叙事段长度 ≥ **300vh** 才值得编排
- < 200vh 直接用普通卡片列
- 最后的 rest 阶段**很重要**，给用户消化时间

---

### 14. Hero Pattern（Hero 锚点模板）

**定义**：首屏在 3 秒内让用户知道"这个产品在哪个阶段、什么调性"。

**三元素组合**：

1. **Hero Badge**：小号徽章（`v0.2.0 · 3 Modes`）
   ```css
   padding: 6px 14px;
   border-radius: 9999px;
   border: 1px solid rgba(124,92,255,0.25);
   background: rgba(124,92,255,0.08);
   ```

2. **主标题最后一行用 shimmer**：
   ```css
   background: linear-gradient(110deg, #f5f5f7, #c9b8ff 30%, #7ce0ff 55%, #f5f5f7 80%);
   background-size: 200% 100%;
   -webkit-background-clip: text;
   color: transparent;
   animation: shimmer 8s linear infinite;
   ```

3. **Social Proof 一行**：`已被 600+ 设计师使用 · 永久免费`

Landing page 默认走这套，比单纯大字报专业 50%。

---

### 15. Scroll Progress Nav（滚动进度导航）

**定义**：侧边小圆点群指示当前在叙事的哪一幕，点击可跳转。

**规则**：
- 叙事 ≥ 3 段时加，让用户有全局感
- < 3 段反而累赘
- 位置：`position: fixed; right: 16px`

---

## ⚙️ 工程模式（Engineering Patterns）

### 16. Config-Driven Components（配置驱动）

**定义**：组件不写死内容，接受一个配置对象定义其行为和资源。

**Interface**：
```ts
interface NarrativeConfig {
  id: string;
  eyebrowKey: string;
  titleKey: string;
  sectionHeight: string;  // '500vh'
  scrub: number;          // 0.5
  stages: Array<{ label: string; startPct: number; endPct: number }>;
  sceneComponent: ComponentType<SceneProps>;
  outputComponent: ComponentType<OutputProps>;
  particleConfig?: ParticleConfig;
}
```

**效果**：一个 `ScrollNarrative.tsx` 跑三幕完全不同的动画。

**普适规则**：任何"有多个变体但结构相似"的东西（feature card、timeline、showcase），都用 config 数组驱动，别写 3 个类似的组件。

---

### 17. Compound Components（组合式组件）

**定义**：父组件提供结构，子组件是插槽，通过 Context 共享状态。

**我们的做法**：
```tsx
<ScrollNarrativeProvider>   {/* context: activeNarrativeId + globalProgress */}
  <Hero />
  <ScrollNarrative config={STYLE_PROMPT_CONFIG} />
  <ScrollNarrative config={PRODUCT_VISUAL_CONFIG} />
  <ScrollNarrative config={WEB_DESIGN_CONFIG} />
  <ScrollProgressNav />   {/* 从 context 读取当前活跃幕 */}
</ScrollNarrativeProvider>
```

复杂组件（tabs、accordion、scroll narrative）必备，比 props drilling 优雅得多。

---

### 18. Dynamic Import for Code Splitting（按需加载）

**定义**：大组件用 `next/dynamic` 或 React.lazy，首屏不加载。

**规则**：组件 > 20KB **或** 只在滚到下面才用到，就动态加载。

```tsx
const ScrollNarrative = dynamic(() => import('./ScrollNarrative'), { ssr: false });
```

效果：本项目首屏 163KB gzip（省了约 80KB）。

---

### 19. Capability Gating（能力探测）

**定义**：不盲目开启炫酷效果，先检测设备能力。

**检测维度**：
```ts
function useCanvasCapable() {
  const [capable, setCapable] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lowMem = (navigator as any).deviceMemory && (navigator as any).deviceMemory < 4;
    setCapable(!reduced && !lowMem);
  }, []);
  return capable;
}
```

粒子、WebGL、blur filter、大量 transform **都要做降级**。

---

### 20. i18n from Day 1（多语言从第一天做）

**定义**：所有文本走 `t('key')` 函数，翻译单独放 JSON。

**栈**：`next-intl` + `messages/<locale>.json`

**规则**：即使现在只一种语言，也用 `t()` 读取。后期补 i18n 成本是早期的 5 倍。

---

## 🎨 审美取向（Aesthetic Direction）

### 21. Dark-first, Dense, Editorial

Linear / Vercel / Raycast / Arc 这类开发者和设计师工具的共同调性：

| 特征 | 做法 |
|------|------|
| **暗色底** | 所有 elevation 在 `#07` – `#15` 范围 |
| **低饱和色块** | 品牌色用 rgba alpha 透明叠加，而非纯色填充 |
| **信息密度高** | 不是大留白，而是精准间距（行高 1.5–1.6，段距 24–32px） |
| **等宽字体混排** | JetBrains Mono 在标签、代码、numeric 处用，强化"精密"感 |
| **排版讲究** | 大标题 `letter-spacing: -0.02em` 紧排、小标题 `0.1em` 散开 |
| **装饰极少** | 靠字体、间距、动效建立节奏，不用 emoji / 插画 |

**选择规则**：B2B / 开发者工具 / 设计工具 → 默认走这个调性。C2C / 儿童教育 / 消费品 → 选其他方向（彩色、插画、圆润）。

---

## ✅ 复用清单（Reuse Checklist）

启动新项目时按这个顺序抄过来：

### Phase 0 — 基础设施（30 分钟）
- [ ] 拷贝 `globals.css` 里的整个 `:root` + `@theme` tokens 区域
- [ ] 替换 3 个品牌色：`--color-pl-accent-from` / `--color-pl-accent-to` / `--pl-grad-brand`
- [ ] 设置 `next-intl` + `messages/{en,zh-CN}.json` 骨架
- [ ] 加 `@media (prefers-reduced-motion: reduce)` 全局规则

### Phase 1 — 动效基础（1 小时）
- [ ] 拷贝 `LenisProvider.tsx` + `useScrollTriggerProxy.ts`（GSAP ScrollTrigger 代理）
- [ ] 拷贝 `useCanvasCapable()` hook
- [ ] 拷贝背景 `SiteBackground.tsx`（4 色块 + 网格 + 噪点）
- [ ] 调整 4 个 blob 的颜色和位置

### Phase 2 — Hero 首屏（1 小时）
- [ ] 拷贝 Hero 结构：Badge + Logo + 3 行标题（第 3 行 shimmer） + Subtitle + CTA + SocialProof
- [ ] 替换文案和 Logo

### Phase 3 — 滚动叙事（按场次 2-4 小时）
- [ ] 拷贝 `ScrollNarrative.tsx` + `ScrollNarrativeContext.tsx` + `NarrativeConfig` 类型
- [ ] 为每幕写一个 `Scene` 组件（按 4-stage 三幕结构编排）
- [ ] 调 scrub 值（0.5 是甜蜜点）

### Phase 4 — 工程细节
- [ ] Dynamic import 所有 scene 组件
- [ ] 加 `ScrollProgressNav` 侧边导航（如果叙事 ≥ 3 段）
- [ ] Safe zone padding 模式套到所有正文 section

---

## 📚 附录：代码片段

### A. 完整 tokens 模板

```css
/* ========================================
   DESIGN TOKENS — copy to globals.css
   ======================================== */

:root {
  /* ── Background layers ── */
  --color-bg-base: #07070a;
  --color-bg-elev-1: #0d0d12;
  --color-bg-elev-2: #15151c;

  /* ── Foreground ── */
  --color-fg-primary: #f5f5f7;
  --color-fg-secondary: #a1a1a8;
  --color-fg-tertiary: #6b6b73;

  /* ── Brand (replace 3 hex) ── */
  --color-accent-from: #7c5cff;
  --color-accent-to: #00e1ff;
  --color-accent-mid: #4d8eff;

  /* ── Gradients ── */
  --grad-brand: linear-gradient(135deg, var(--color-accent-from) 0%, var(--color-accent-to) 100%);
  --grad-brand-soft: linear-gradient(135deg, rgba(124,92,255,0.18), rgba(0,225,255,0.18));
  --grad-text-shimmer: linear-gradient(110deg, #f5f5f7 0%, #c9b8ff 30%, #7ce0ff 55%, #f5f5f7 80%);

  /* ── Shadows ── */
  --shadow-glow: 0 0 0 1px rgba(124,92,255,0.25), 0 8px 32px -8px rgba(124,92,255,0.45);
  --shadow-card: 0 1px 0 rgba(255,255,255,0.04) inset, 0 24px 48px -16px rgba(0,0,0,0.6);

  /* ── Easing ── */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-inout: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

  /* ── Duration ── */
  --dur-quick: 120ms;
  --dur-base: 240ms;
  --dur-mid: 480ms;
  --dur-slow: 1200ms;

  /* ── Radii ── */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 20px;
  --radius-full: 9999px;

  color-scheme: dark;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### B. Shimmer 文字

```css
.hero-shimmer-text {
  background: var(--grad-text-shimmer);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  animation: shimmer 8s linear infinite;
}

@keyframes shimmer {
  0% { background-position: 200% center; }
  100% { background-position: -200% center; }
}
```

### C. Safe zone 布局

```tsx
<section style={{
  padding: `96px max(24px, calc((100% - 720px) / 2))`,
}}>
  {/* content */}
</section>
```

### D. 叙事 4-stage 模板

```ts
export const NARRATIVE_CONFIG: NarrativeConfig = {
  id: 'my-scene',
  eyebrowKey: 'sections.myScene.eyebrow',
  titleKey: 'sections.myScene.title',
  sectionHeight: '500vh',
  scrub: 0.5,
  stages: [
    { label: 'context-setup',  startPct: 0,    endPct: 0.10 },
    { label: 'action-trigger', startPct: 0.10, endPct: 0.35 },
    { label: 'transformation', startPct: 0.35, endPct: 0.70 },
    { label: 'rest',           startPct: 0.70, endPct: 1.00 },
  ],
  sceneComponent: MyScene,
  outputComponent: MyOutput,
};
```

### E. 动态背景 4 色块（SiteBackground 核心 CSS）

```css
.site-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  mix-blend-mode: screen;
  will-change: transform;
}

.site-blob--1 {
  top: -12%; left: -8%;
  width: 640px; height: 640px;
  background: radial-gradient(circle at 40% 40%, rgba(124,92,255,0.55), transparent 65%);
  animation: blob-drift-1 22s ease-in-out infinite;
}

/* ... blob 2, 3, 4 各自有独立 drift 轨迹 */

@keyframes blob-drift-1 {
  0%, 100% { transform: translate3d(var(--mx), var(--my), 0) scale(1); }
  33%      { transform: translate3d(calc(var(--mx) + 80px), calc(var(--my) + 60px), 0) scale(1.08); }
  66%      { transform: translate3d(calc(var(--mx) + 40px), calc(var(--my) - 40px), 0) scale(0.95); }
}
```

---

## 📖 参考与灵感来源

| 站点 | 看什么 |
|------|--------|
| [Apple Vision Pro](https://www.apple.com/vision-pro/) | 顶级 scroll narrative 范本 |
| [Linear](https://linear.app) | 暗色 + gradient + 密集信息的教科书 |
| [Vercel](https://vercel.com) | Hero badge + shimmer + 品牌色系统 |
| [Raycast](https://raycast.com) | 极简但高密度，字体用法一流 |
| [Arc](https://arc.net) | Dark-first 色彩系统和微交互 |
| [Figma 设计博客](https://www.figma.com/blog) | Motion design 语言、easing 选择 |

---

## 🔖 版本记录

| 日期 | 项目 | 收获 |
|------|------|------|
| 2026-04-18 | PromptLens v0.2.0 官网 | 初版方案册，21 条模式 |

---

*PromptLens · Design Language v1.0*
