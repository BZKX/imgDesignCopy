'use client';

import { useEffect, useState } from 'react';

/**
 * Gates Canvas 2D particle rendering on:
 *   - prefers-reduced-motion: reduce  →  false (no animation)
 *   - deviceMemory < 2GB              →  false (low-memory device)
 *
 * Does NOT gate on WebGL (not needed for Canvas 2D) or iOS (Canvas 2D works on iOS).
 * Canvas 2D is universally supported — this hook only filters extreme cases.
 */
export function useCanvasCapable(): boolean {
  const [capable, setCapable] = useState(false);

  useEffect(() => {
    // Reduced motion: never animate
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setCapable(false);
      return;
    }

    // Low memory gate (deviceMemory API, Chrome only — graceful fallback)
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    if (typeof memory === 'number' && memory < 2) {
      setCapable(false);
      return;
    }

    setCapable(true);
  }, []);

  return capable;
}
