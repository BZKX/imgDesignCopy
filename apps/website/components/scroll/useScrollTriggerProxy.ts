'use client';

import { useEffect } from 'react';

/**
 * Bridges Lenis smooth-scroll with GSAP ScrollTrigger so pin + scrub
 * timelines read the correct scroll position from Lenis instead of
 * the native window.scrollY.
 *
 * Must be called inside a 'use client' component (e.g. LenisProvider).
 * lenisReady gates the effect so the proxy is only wired after Lenis exists.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function useScrollTriggerProxy(
  lenisRef: React.MutableRefObject<any>,
  lenisReady: boolean,
): void {
  useEffect(() => {
    if (!lenisReady || !lenisRef.current) return;

    const lenis = lenisRef.current;
    let onScroll: (() => void) | null = null;

    void (async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      // Pipe Lenis position into ScrollTrigger so pin calculations are accurate
      ScrollTrigger.scrollerProxy(document.body, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        scrollTop(value?: number): any {
          if (typeof value === 'number') {
            lenis.scrollTo(value, { immediate: true });
          }
          return lenis.scroll ?? window.scrollY;
        },
        getBoundingClientRect() {
          return {
            top: 0,
            left: 0,
            width: window.innerWidth,
            height: window.innerHeight,
          };
        },
      });

      ScrollTrigger.defaults({ scroller: document.body });

      // Keep ScrollTrigger in sync on every Lenis tick
      onScroll = () => ScrollTrigger.update();
      lenis.on('scroll', onScroll);
    })();

    return () => {
      if (onScroll) {
        lenis.off('scroll', onScroll);
      }
    };
  // lenisRef is a stable ref object — lenisReady is the meaningful trigger
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lenisReady]);
}
