'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// TODO: Replace these placeholder paths with the final PromptLens brand logo paths.
// Both outer paths must have identical command structures (M + nC + Z) for clean d-morph.
// Current: camera icon (state 0) ↔ speech-bubble icon (state 1)
// Swap these two constants once the brand SVG is finalised.

// 24×24 viewBox — M + 11×C + Z  (matching structure required for interpolation)
const CAMERA_BODY =
  'M 8 5 C 8 4 9 3 10 3 C 11 3 13 3 14 3 C 15 3 16 4 16 5 C 18 5 19 6 19 7 C 19 8 19 16 19 17 C 19 18 18 19 17 19 C 16 19 9 19 8 19 C 7 19 5 18 5 17 C 5 16 5 8 5 7 C 5 6 6 5 7 5 C 7 5 8 5 8 5 Z';

const BUBBLE_BODY =
  'M 5 5 C 5 4 6 3 7 3 C 8 3 16 3 17 3 C 18 3 19 4 19 5 C 19 5 19 13 19 14 C 19 15 18 16 17 16 C 17 16 14 16 13 16 C 13 16 12 20 12 20 C 12 20 11 16 11 16 C 11 16 8 16 7 16 C 6 16 5 15 5 14 C 5 14 5 5 5 5 Z';

// Inner detail — M + 4×C + Z  (camera lens circle)
const CAMERA_LENS =
  'M 12 9 C 13.7 9 15 10.3 15 12 C 15 13.7 13.7 15 12 15 C 10.3 15 9 13.7 9 12 C 9 10.3 10.3 9 12 9 Z';

// Inner detail — M + 4×C + Z  (speech-bubble text pill)
// TODO: Replace with matched brand inner-detail path once finalised.
const BUBBLE_LINE =
  'M 9 8 C 9 7.4 9.4 7 10 7 C 11.3 7 12.7 7 14 7 C 14.6 7 15 7.4 15 8 C 15 8.6 14.6 9 14 9 Z';

const MORPH_TRANSITION = { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const };

export default function PromptLensLogo() {
  const [morphed, setMorphed] = useState(false);

  // Auto-morph once, 1.2 s after mount
  useEffect(() => {
    const t = setTimeout(() => setMorphed(true), 1200);
    return () => clearTimeout(t);
  }, []);

  const targetBody = morphed ? BUBBLE_BODY : CAMERA_BODY;
  const targetInner = morphed ? BUBBLE_LINE : CAMERA_LENS;

  return (
    <motion.svg
      width={40}
      height={40}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      // Hover toggles morph again
      onHoverStart={() => setMorphed((v) => !v)}
      style={{ cursor: 'default', display: 'block' }}
    >
      <defs>
        <linearGradient id="pl-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c5cff" />
          <stop offset="100%" stopColor="#00e1ff" />
        </linearGradient>
      </defs>

      {/* Outer body — morphs between camera and bubble shapes */}
      <motion.path
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        d={targetBody as any}
        fill="url(#pl-logo-grad)"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        animate={{ d: targetBody } as any}
        transition={MORPH_TRANSITION}
      />

      {/* Inner detail — crossfades (opacity) while also morphing d */}
      <motion.path
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        d={targetInner as any}
        fill="var(--color-pl-bg-base, #07070a)"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        animate={{ d: targetInner, opacity: 1 } as any}
        transition={MORPH_TRANSITION}
      />
    </motion.svg>
  );
}
