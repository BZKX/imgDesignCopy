'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { ParticleConfig } from './types';

// ── Helpers ───────────────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0];
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

// ── Particle storage (Float32Arrays for cache performance) ────────────────────

interface ParticleArrays {
  ox: Float32Array;         // origin x (scatter center)
  oy: Float32Array;         // origin y
  vx: Float32Array;         // scatter velocity x
  vy: Float32Array;         // scatter velocity y
  size: Float32Array;       // radius in px
  opacityBase: Float32Array; // per-particle base opacity (0.4–1.0)
}

// ── Hook API ──────────────────────────────────────────────────────────────────

export interface ParticleSystemAPI {
  /** Pass to <canvas ref={canvasRef}> */
  canvasRef: React.RefObject<HTMLCanvasElement>;
  /**
   * Call on every scroll update:
   *  dissolve 0→1: particles scatter from image region
   *  reform   0→1: scattered particles converge toward output card position
   */
  setProgress: (dissolve: number, reform: number) => void;
}

// ── Implementation ────────────────────────────────────────────────────────────

export function useParticleSystem(config: ParticleConfig): ParticleSystemAPI {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const arraysRef = useRef<ParticleArrays | null>(null);
  const rafRef = useRef<number>(0);
  const activeRef = useRef(false);
  const dissolveRef = useRef(0);
  const reformRef = useRef(0);

  const [fromR, fromG, fromB] = hexToRgb(config.colorFrom);
  const [toR, toG, toB] = hexToRgb(config.colorTo);

  // Allocate particles positioned near the center of the canvas
  const initParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { width, height } = canvas;
    const n = config.count;

    const ox = new Float32Array(n);
    const oy = new Float32Array(n);
    const vx = new Float32Array(n);
    const vy = new Float32Array(n);
    const size = new Float32Array(n);
    const opacityBase = new Float32Array(n);

    const cx = width / 2;
    const cy = height / 2;

    for (let i = 0; i < n; i++) {
      // Particles spawn in a cluster simulating the selected image region
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * 60 + 10;
      ox[i] = cx + Math.cos(angle) * r;
      oy[i] = cy + Math.sin(angle) * r;

      // Random scatter direction proportional to scatterRadius
      const speed = (Math.random() * 0.6 + 0.4) * config.scatterRadius;
      const scatterAngle = Math.random() * Math.PI * 2;
      vx[i] = Math.cos(scatterAngle) * speed;
      vy[i] = Math.sin(scatterAngle) * speed;

      size[i] = Math.random() * 2.5 + 0.5;
      opacityBase[i] = Math.random() * 0.6 + 0.4;
    }

    arraysRef.current = { ox, oy, vx, vy, size, opacityBase };
  }, [config.count, config.scatterRadius]);

  // Draw a single frame
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const arrays = arraysRef.current;
    if (!canvas || !arrays) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const dissolve = dissolveRef.current;
    const reform = reformRef.current;
    const n = config.count;

    // Converge target in canvas pixels
    const tx = config.convergeTarget.x * width;
    const ty = config.convergeTarget.y * height;

    ctx.clearRect(0, 0, width, height);

    // Color interpolates from colorFrom → colorTo as reform progresses
    const r = Math.round(lerp(fromR, toR, reform));
    const g = Math.round(lerp(fromG, toG, reform));
    const b = Math.round(lerp(fromB, toB, reform));

    const { ox, oy, vx, vy, size, opacityBase } = arrays;

    for (let i = 0; i < n; i++) {
      // Scattered position
      const dx = ox[i] + vx[i] * dissolve;
      const dy = oy[i] + vy[i] * dissolve;

      // Final position: lerp scattered → converge target
      const px = lerp(dx, tx, reform);
      const py = lerp(dy, ty, reform);

      // Opacity: fade in as dissolve starts, fade out as reform nears completion
      let opacity = opacityBase[i] * dissolve;
      if (reform > 0.85) {
        opacity *= clamp((1 - reform) / 0.15, 0, 1);
      }
      if (opacity <= 0.01) continue;

      ctx.globalAlpha = opacity;
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.beginPath();
      ctx.arc(px, py, size[i], 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }, [config.count, config.convergeTarget, fromR, fromG, fromB, toR, toG, toB]);

  // rAF loop — only running when dissolve > 0
  const loop = useCallback(() => {
    draw();
    if (activeRef.current) {
      rafRef.current = requestAnimationFrame(loop);
    }
  }, [draw]);

  const setProgress = useCallback((dissolve: number, reform: number) => {
    dissolveRef.current = clamp(dissolve, 0, 1);
    reformRef.current = clamp(reform, 0, 1);

    const shouldBeActive = dissolveRef.current > 0;

    if (shouldBeActive && !activeRef.current) {
      activeRef.current = true;
      rafRef.current = requestAnimationFrame(loop);
    } else if (!shouldBeActive && activeRef.current) {
      activeRef.current = false;
      cancelAnimationFrame(rafRef.current);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [loop]);

  // Setup: called whenever the canvas element is mounted/resized
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const syncSize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        initParticles();
      }
    };

    syncSize();

    const observer = new ResizeObserver(syncSize);
    observer.observe(canvas.parentElement ?? canvas);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafRef.current);
      activeRef.current = false;
    };
  }, [initParticles]);

  return { canvasRef, setProgress };
}
