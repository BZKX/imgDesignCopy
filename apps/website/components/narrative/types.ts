import type React from 'react';

// ── Scene / Output interfaces (consumed by scene components in Step 3) ────────

export interface SceneProps {
  /** 0-indexed stage number within the config.stages array */
  stage: number;
  /** 0–1 progress within the current stage */
  stageProgress: number;
  /** true when the current stage is the zoom-focus stage */
  isZoomed: boolean;
  /** Particle phase for the canvas overlay */
  particlePhase: 'idle' | 'dissolve' | 'reform';
  /** Bounding rect of the scene canvas area (null until mounted) */
  canvasRect: DOMRect | null;
}

export interface OutputProps {
  /** true when the output-reveal stage is active (or has completed) */
  visible: boolean;
  /** 0–1 reveal animation progress within the output-reveal stage */
  revealProgress: number;
}

// ── Particle system ───────────────────────────────────────────────────────────

export interface ParticleConfig {
  /** Number of particles (800–1500) */
  count: number;
  /** Starting color (hex), e.g. '#7c5cff' */
  colorFrom: string;
  /** Ending color (hex), e.g. '#00e1ff' */
  colorTo: string;
  /** Max scatter distance in pixels from origin */
  scatterRadius: number;
  /**
   * Normalized 0–1 position within the sticky container (100vh viewport)
   * where particles converge. NOT relative to canvas bounds or full section height.
   */
  convergeTarget: { x: number; y: number };
}

// ── Narrative stage ───────────────────────────────────────────────────────────

export interface NarrativeStage {
  /** GSAP timeline label and identifier for this stage */
  label: string;
  /** Scroll progress (0–1) where this stage begins */
  startPct: number;
  /** Scroll progress (0–1) where this stage ends */
  endPct: number;
}

// ── Narrative config ──────────────────────────────────────────────────────────

export interface NarrativeConfig {
  /** Unique identifier: 'style-prompt' | 'product-visual' | 'web-design' */
  id: string;
  /** next-intl key for the eyebrow label (e.g. 'sections.stylePrompt.eyebrow') */
  eyebrowKey: string;
  /** next-intl key for the section title */
  titleKey: string;
  /** 7 stages for full narrative (500vh), 6 for compressed (400vh) */
  stages: NarrativeStage[];
  /** The "background" scene component */
  sceneComponent: React.ComponentType<SceneProps>;
  /** The final output card component */
  outputComponent: React.ComponentType<OutputProps>;
  /** Canvas particle system configuration */
  particleConfig: ParticleConfig;
  /** CSS height of the outer section: '500vh' | '400vh' */
  sectionHeight: string;
  /**
   * GSAP scrub value (default 0.5).
   * Starting point — Lenis 1.2s duration + GSAP scrub creates compound
   * dampening; tune per-mode during visual QA.
   */
  scrub: number;
}
