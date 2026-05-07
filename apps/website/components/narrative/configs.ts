import dynamic from 'next/dynamic';
import type { NarrativeConfig } from './types';
import type { SceneProps, OutputProps } from './types';

// Scene + output components — dynamically imported for per-mode code splitting.
// The entire ScrollNarrative is already lazy-loaded at the page level; these
// dynamic imports give each mode its own chunk so only the active mode's assets
// are parsed at runtime.

const StylePromptScene = dynamic<SceneProps>(
  () => import('./scenes/StylePromptScene'),
  { ssr: false },
);

const StylePromptOutput = dynamic<OutputProps>(
  () => import('./scenes/StylePromptOutput'),
  { ssr: false },
);

const ProductVisualScene = dynamic<SceneProps>(
  () => import('./scenes/ProductVisualScene'),
  { ssr: false },
);

const ProductVisualOutput = dynamic<OutputProps>(
  () => import('./scenes/ProductVisualOutput'),
  { ssr: false },
);

const WebDesignScene = dynamic<SceneProps>(
  () => import('./scenes/WebDesignScene'),
  { ssr: false },
);

const WebDesignOutput = dynamic<OutputProps>(
  () => import('./scenes/WebDesignOutput'),
  { ssr: false },
);

// ── Style Prompt — flagship narrative, 500vh, 4 stages ───────────────────────
//
// Compressed arc: photos fade in quickly → plugin slides in + center image
// highlights + scan simultaneously → card flips while plugin retracts →
// extended interactive rest with wobble hint for user engagement.

export const STYLE_PROMPT_CONFIG: NarrativeConfig = {
  id: 'style-prompt',
  eyebrowKey: 'sections.stylePrompt.eyebrow',
  titleKey: 'sections.stylePrompt.title',
  sectionHeight: '500vh',
  scrub: 0.5,
  stages: [
    { label: 'scene-enter',      startPct: 0,    endPct: 0.10 },
    { label: 'plugin-and-scan',  startPct: 0.10, endPct: 0.35 },
    { label: 'card-flip',        startPct: 0.35, endPct: 0.70 },
    { label: 'interactive-rest', startPct: 0.70, endPct: 1.0  },
  ],
  sceneComponent: StylePromptScene,
  outputComponent: StylePromptOutput,
  particleConfig: {
    count: 1200,
    colorFrom: '#7c5cff',
    colorTo: '#00e1ff',
    scatterRadius: 400,
    convergeTarget: { x: 0.5, y: 0.5 },
  },
};

// ── Product Visual — compressed, 400vh, 6 stages ─────────────────────────────
//
// User already understands the pattern from Style Prompt.
// Stages 1 (scene-enter) and 2 (plugin-slide) are merged into a single
// simultaneous entrance so the section feels faster and more confident.

export const PRODUCT_VISUAL_CONFIG: NarrativeConfig = {
  id: 'product-visual',
  eyebrowKey: 'sections.productVisual.eyebrow',
  titleKey: 'sections.productVisual.title',
  sectionHeight: '400vh',
  scrub: 0.5,
  stages: [
    { label: 'scene-and-plugin',     startPct: 0,    endPct: 0.25 },
    { label: 'selection-centerize',  startPct: 0.25, endPct: 0.40 },
    { label: 'ai-scan',             startPct: 0.40, endPct: 0.50 },
    { label: 'cards-scatter',       startPct: 0.50, endPct: 0.75 },
    { label: 'rest',                startPct: 0.75, endPct: 1.0  },
  ],
  sceneComponent: ProductVisualScene,
  outputComponent: ProductVisualOutput,
  particleConfig: {
    count: 1000,
    colorFrom: '#7c5cff',
    colorTo: '#00e1ff',
    scatterRadius: 350,
    convergeTarget: { x: 0.5, y: 0.5 },
  },
};

// ── Web Design — compressed, 400vh, 6 stages ─────────────────────────────────
//
// Same compressed pattern as Product Visual. Demonstrates token extraction
// from a SaaS dashboard — a different visual context to keep the narrative
// fresh even after the previous two modes.

export const WEB_DESIGN_CONFIG: NarrativeConfig = {
  id: 'web-design',
  eyebrowKey: 'sections.webDesign.eyebrow',
  titleKey: 'sections.webDesign.title',
  sectionHeight: '400vh',
  scrub: 0.5,
  stages: [
    { label: 'scene-and-plugin', startPct: 0,    endPct: 0.15 },
    { label: 'scan-full',        startPct: 0.15, endPct: 0.35 },
    { label: 'crack-open',       startPct: 0.35, endPct: 0.55 },
    { label: 'zoom-in',          startPct: 0.55, endPct: 0.70 },
    { label: 'modules-reveal',   startPct: 0.70, endPct: 0.88 },
    { label: 'rest',             startPct: 0.88, endPct: 1.0  },
  ],
  sceneComponent: WebDesignScene,
  outputComponent: WebDesignOutput,
  particleConfig: {
    count: 1000,
    colorFrom: '#7c5cff',
    colorTo: '#00e1ff',
    scatterRadius: 350,
    convergeTarget: { x: 0.5, y: 0.5 },
  },
};
