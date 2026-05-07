'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

const INTERACTIVE_SELECTORS = 'a, button, [data-cursor="interactive"]';

export default function CustomCursor() {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [coarsePointer, setCoarsePointer] = useState(false);

  // Tight spring — keeps slight smoothing without lag (Apple Pencil-ish feel)
  const springConfig = { damping: 30, stiffness: 900, mass: 0.18 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  const rafRef = useRef<number | null>(null);
  const firstMoveRef = useRef(true);

  useEffect(() => {
    const mqlCoarse = window.matchMedia('(pointer: coarse)');
    const mqlMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    setCoarsePointer(mqlCoarse.matches);
    setReducedMotion(mqlMotion.matches);

    const onCoarseChange = (e: MediaQueryListEvent) => setCoarsePointer(e.matches);
    const onMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mqlCoarse.addEventListener('change', onCoarseChange);
    mqlMotion.addEventListener('change', onMotionChange);

    return () => {
      mqlCoarse.removeEventListener('change', onCoarseChange);
      mqlMotion.removeEventListener('change', onMotionChange);
    };
  }, []);

  useEffect(() => {
    if (coarsePointer || reducedMotion) return;

    const onMove = (e: MouseEvent) => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        // First move: jump to position without spring animation so the cursor
        // doesn't visibly swoop in from (0,0).
        if (firstMoveRef.current) {
          x.jump(e.clientX);
          y.jump(e.clientY);
          firstMoveRef.current = false;
          setVisible(true);
        } else {
          x.set(e.clientX);
          y.set(e.clientY);
        }
        rafRef.current = null;
      });
    };

    const onEnter = () => setVisible(true);
    const onLeave = () => setVisible(false);

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as Element;
      setHovered(!!target.closest(INTERACTIVE_SELECTORS));
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseenter', onEnter);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseover', onMouseOver);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseenter', onEnter);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseover', onMouseOver);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [coarsePointer, reducedMotion, x, y]);

  if (coarsePointer || reducedMotion) return null;

  const size = hovered ? 28 : 12;

  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: size,
        height: size,
        borderRadius: '9999px',
        pointerEvents: 'none',
        zIndex: 9999,
        mixBlendMode: 'difference',
        background: hovered ? 'transparent' : 'var(--color-pl-fg-primary)',
        border: hovered ? '1px solid var(--color-pl-fg-primary)' : 'none',
        opacity: visible ? 1 : 0,
        translateX: '-50%',
        translateY: '-50%',
        x,
        y,
        transition: 'width 0.15s, height 0.15s, background 0.15s, border 0.15s',
      }}
    />
  );
}
