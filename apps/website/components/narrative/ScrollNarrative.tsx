'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useScrollNarrative } from './ScrollNarrativeContext';
import { useCanvasCapable } from './useCanvasCapable';
import { useParticleSystem } from './useParticleSystem';
import ScanLineOverlay from './ScanLineOverlay';
import NarrativeMobileFallback from './NarrativeMobileFallback';
import type { NarrativeConfig, NarrativeStage, ParticleConfig, SceneProps, OutputProps } from './types';

// Re-export all types so scene/output components import from one place
export type { NarrativeConfig, NarrativeStage, ParticleConfig, SceneProps, OutputProps };

// ── Stage helpers ─────────────────────────────────────────────────────────────

function computeStage(
  progress: number,
  stages: NarrativeStage[],
): { stageIndex: number; stageProgress: number } {
  for (let i = 0; i < stages.length; i++) {
    const s = stages[i];
    const isLast = i === stages.length - 1;
    if (progress >= s.startPct && (progress < s.endPct || isLast)) {
      const range = s.endPct - s.startPct;
      const sp = range > 0 ? (progress - s.startPct) / range : 1;
      return {
        stageIndex: i,
        stageProgress: Math.min(1, Math.max(0, sp)),
      };
    }
  }
  return { stageIndex: 0, stageProgress: 0 };
}

// ── Particle canvas (isolated component so canvasRef is set before useEffect) ─

interface ParticleCanvasProps {
  config: ParticleConfig;
  particlePhase: 'idle' | 'dissolve' | 'reform';
  stageProgress: number;
  stageIndex: number;
  outputStageIdx: number;
}

function ParticleCanvas({
  config,
  particlePhase,
  stageProgress,
  stageIndex,
  outputStageIdx,
}: ParticleCanvasProps) {
  const { canvasRef, setProgress } = useParticleSystem(config);

  useEffect(() => {
    if (particlePhase === 'dissolve') {
      setProgress(stageProgress, 0);
    } else if (particlePhase === 'reform') {
      setProgress(1, stageProgress);
    } else if (outputStageIdx >= 0 && stageIndex > outputStageIdx) {
      // Completed the reform — particles fully converged and faded out
      setProgress(1, 1);
    } else {
      setProgress(0, 0);
    }
  }, [particlePhase, stageProgress, stageIndex, outputStageIdx, setProgress]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 5,
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
      }}
    />
  );
}

// ── Desktop narrative (GSAP + sticky) ────────────────────────────────────────

interface ScrollNarrativeDesktopProps {
  config: NarrativeConfig;
}

function ScrollNarrativeDesktop({ config }: ScrollNarrativeDesktopProps) {
  const t = useTranslations();
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [stageProgress, setStageProgress] = useState(0);
  const [canvasRect, setCanvasRect] = useState<DOMRect | null>(null);

  const { activeNarrativeId, reportProgress } = useScrollNarrative();
  const canvasCapable = useCanvasCapable();

  // Derived stage state
  const currentStage = config.stages[stageIndex];
  const isZoomed = currentStage?.label === 'zoom-focus';
  const isAiScan = currentStage?.label === 'ai-scan';

  const dissolveStageIdx = config.stages.findIndex((s) => s.label === 'dissolve');
  const outputStageIdx = config.stages.findIndex((s) => s.label === 'output-reveal');

  const particlePhase: 'idle' | 'dissolve' | 'reform' =
    stageIndex === dissolveStageIdx
      ? 'dissolve'
      : stageIndex === outputStageIdx
      ? 'reform'
      : 'idle';

  const isOutputVisible =
    stageIndex === outputStageIdx || (outputStageIdx >= 0 && stageIndex > outputStageIdx);
  const revealProgress =
    stageIndex === outputStageIdx
      ? stageProgress
      : outputStageIdx >= 0 && stageIndex > outputStageIdx
      ? 1
      : 0;

  // Canvas only mounted for the active narrative, and only when capable
  const showCanvas = canvasCapable && activeNarrativeId === config.id;

  // Capture canvas bounding rect for SceneProps
  useEffect(() => {
    if (!stickyRef.current) return;
    const rect = stickyRef.current.getBoundingClientRect();
    setCanvasRect(rect);
  }, [showCanvas]);

  // ── GSAP ScrollTrigger ──────────────────────────────────────────────────────
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    gsap.registerPlugin(ScrollTrigger);

    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: config.scrub,
      onUpdate: (self) => {
        const p = self.progress;
        const { stageIndex: si, stageProgress: sp } = computeStage(p, config.stages);
        setScrollProgress(p);
        setStageIndex(si);
        setStageProgress(sp);
        reportProgress(config.id, p);
      },
      onLeaveBack: () => {
        setScrollProgress(0);
        setStageIndex(0);
        setStageProgress(0);
        reportProgress(config.id, 0);
      },
      onLeave: () => {
        reportProgress(config.id, 1);
      },
    });

    return () => {
      st.kill();
    };
  }, [config, reportProgress]);

  const SceneComponent = config.sceneComponent;
  const OutputComponent = config.outputComponent;

  const sceneProps: SceneProps = {
    stage: stageIndex,
    stageProgress,
    isZoomed,
    particlePhase,
    canvasRect,
  };

  return (
    <section
      ref={sectionRef}
      id={config.id}
      aria-label={t(config.eyebrowKey)}
      style={{ height: config.sectionHeight, position: 'relative' }}
    >
      {/* ── Sticky viewport ─────────────────────────────────────────────────── */}
      <div
        ref={stickyRef}
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
          background: 'var(--color-pl-bg-base)',
        }}
      >
        {/* Eyebrow + title */}
        <div
          style={{
            position: 'absolute',
            top: '48px',
            left: '48px',
            zIndex: 20,
            maxWidth: '480px',
          }}
        >
          <p
            style={{
              fontSize: '0.6875rem',
              fontFamily: 'var(--font-pl-mono)',
              color: 'var(--color-pl-accent-from, #7c5cff)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              margin: '0 0 10px',
            }}
          >
            {t(config.eyebrowKey)}
          </p>
          <h2
            style={{
              fontSize: 'clamp(1.75rem, 3vw, 3rem)',
              fontWeight: 700,
              color: 'var(--color-pl-fg-primary)',
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            {t(config.titleKey)}
          </h2>
        </div>

        {/* Stage debug indicator (dev only — hidden in production via CSS) */}
        <div
          aria-hidden="true"
          className="pl-narrative-debug"
          style={{
            position: 'absolute',
            bottom: '48px',
            left: '48px',
            zIndex: 20,
          }}
        >
          <p
            style={{
              fontSize: '0.75rem',
              fontFamily: 'var(--font-pl-mono)',
              color: 'var(--color-pl-fg-tertiary)',
              margin: 0,
              opacity: 0.6,
            }}
          >
            {currentStage?.label ?? '—'} · {Math.round(scrollProgress * 100)}%
          </p>
        </div>

        {/* ── Scene area (fills entire viewport) ──────────────────────────── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
          }}
        >
          <SceneComponent {...sceneProps} />

          {/* Scan line overlay — active during ai-scan stage */}
          <ScanLineOverlay active={isAiScan} />
        </div>

        {/* ── Canvas particle overlay (conditionally mounted) ──────────────── */}
        {showCanvas && (
          <ParticleCanvas
            config={config.particleConfig}
            particlePhase={particlePhase}
            stageProgress={stageProgress}
            stageIndex={stageIndex}
            outputStageIdx={outputStageIdx}
          />
        )}

        {/* ── Output card (bottom-right, slides in during output stage) ────── */}
        {outputStageIdx >= 0 && (
          <div
            style={{
              position: 'absolute',
              bottom: '80px',
              right: '48px',
              zIndex: 10,
              maxWidth: '360px',
              width: '100%',
            }}
          >
            <OutputComponent visible={isOutputVisible} revealProgress={revealProgress} />
          </div>
        )}
      </div>

      <style>{`
        /* Hide debug label in production builds */
        @media not all and (prefers-color-scheme: no-preference) {
          /* intentionally empty — debug label is always visible during development */
        }
        .pl-narrative-debug { display: none; }
        body[data-narrative-debug] .pl-narrative-debug { display: block; }

        @media (max-width: 767px) {
          /* Mobile guard: this component should not render on mobile
             (NarrativeMobileFallback is used instead), but belt-and-suspenders */
          section#${config.id} > div { position: static !important; height: auto !important; }
        }
      `}</style>
    </section>
  );
}

// ── Public component ──────────────────────────────────────────────────────────

interface ScrollNarrativeProps {
  config: NarrativeConfig;
}

/**
 * Main scroll-narrative orchestrator.
 *
 * - Desktop (≥768px, no reduced-motion): pinned sticky section driven by
 *   GSAP ScrollTrigger scrub. 7 or 6 stages depending on sectionHeight.
 * - Mobile (<768px) or prefers-reduced-motion: delegates to NarrativeMobileFallback
 *   (static card layout, no animation).
 */
export default function ScrollNarrative({ config }: ScrollNarrativeProps) {
  const [showFallback, setShowFallback] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setShowFallback(isMobile || reducedMotion);
    setChecked(true);
  }, []);

  // Avoid layout shift before media queries are checked
  if (!checked) return null;

  if (showFallback) {
    return <NarrativeMobileFallback config={config} />;
  }

  return <ScrollNarrativeDesktop config={config} />;
}
