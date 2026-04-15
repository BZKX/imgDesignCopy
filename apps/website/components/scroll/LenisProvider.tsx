'use client';

import { useEffect } from 'react';

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    if (prefersReduced || isCoarse) return;

    let rafId = 0;
    let lenisDestroy: (() => void) | null = null;
    let mounted = true;

    void import('lenis').then(({ default: Lenis }) => {
      if (!mounted) return;
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });
      lenisDestroy = () => lenis.destroy();

      function loop(time: number) {
        lenis.raf(time);
        rafId = requestAnimationFrame(loop);
      }
      rafId = requestAnimationFrame(loop);
    });

    return () => {
      mounted = false;
      cancelAnimationFrame(rafId);
      lenisDestroy?.();
    };
  }, []);

  return <>{children}</>;
}
