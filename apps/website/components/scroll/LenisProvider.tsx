'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import useScrollTriggerProxy from './useScrollTriggerProxy';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LenisRef = React.MutableRefObject<any>;

// Provides the Lenis instance ref so child components can call lenis.scrollTo()
// The ref starts as { current: null } and is populated once Lenis initialises
const defaultRef: LenisRef = { current: null };
export const LenisContext = createContext<LenisRef>(defaultRef);

export function useLenis(): LenisRef {
  return useContext(LenisContext);
}

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lenisRef = useRef<any>(null);
  // lenisReady triggers useScrollTriggerProxy once Lenis is live
  const [lenisReady, setLenisReady] = useState(false);

  // Wire GSAP ScrollTrigger scrollerProxy to Lenis (runs once lenisReady = true)
  useScrollTriggerProxy(lenisRef, lenisReady);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    if (prefersReduced || isCoarse) return;

    let rafId = 0;
    let mounted = true;

    void import('lenis').then(({ default: Lenis }) => {
      if (!mounted) return;
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        // Let wheel/touch events inside the PromptLens extension panels scroll
        // their own content instead of being captured by Lenis for page scroll.
        prevent: (node: HTMLElement) =>
          node.id === 'img2prompt-overlay-host' ||
          node.id === 'img2prompt-panel-host' ||
          node.closest?.('#img2prompt-overlay-host, #img2prompt-panel-host') !== null,
      });
      lenisRef.current = lenis;
      setLenisReady(true);

      function loop(time: number) {
        lenis.raf(time);
        rafId = requestAnimationFrame(loop);
      }
      rafId = requestAnimationFrame(loop);
    });

    return () => {
      mounted = false;
      cancelAnimationFrame(rafId);
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
  }, []);

  return (
    <LenisContext.Provider value={lenisRef}>
      {children}
    </LenisContext.Provider>
  );
}
