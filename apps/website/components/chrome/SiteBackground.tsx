'use client';

import { useEffect, useRef } from 'react';

/**
 * Site-wide dynamic background:
 * 4 drifting colored blobs + breathing grid + film noise.
 * Fixed to viewport, stays behind all content as user scrolls.
 * Mouse movement drives parallax via CSS variables on the root bg element.
 */
export default function SiteBackground() {
  const bgRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return;

    let mx = 0;
    let my = 0;
    let targetMx = 0;
    let targetMy = 0;

    const onMouseMove = (e: MouseEvent) => {
      const rx = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const ry = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
      targetMx = rx * 40;
      targetMy = ry * 40;
    };

    const tick = () => {
      mx += (targetMx - mx) * 0.06;
      my += (targetMy - my) * 0.06;
      const el = bgRef.current;
      if (el) {
        el.style.setProperty('--pl-mx', `${mx.toFixed(2)}px`);
        el.style.setProperty('--pl-my', `${my.toFixed(2)}px`);
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div ref={bgRef} className="pl-site-bg" aria-hidden="true">
      <div className="pl-site-blob pl-site-blob--1" />
      <div className="pl-site-blob pl-site-blob--2" />
      <div className="pl-site-blob pl-site-blob--3" />
      <div className="pl-site-blob pl-site-blob--4" />
      <div className="pl-site-grid" />
      <div className="pl-site-noise" />
    </div>
  );
}
