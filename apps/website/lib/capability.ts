'use client';

import { useEffect, useState } from 'react';

/**
 * Returns true when it's safe to mount heavy WebGL / R3F content.
 * Gates on: reduced-motion OFF, device memory ≥ 4 GB, not iOS UA, WebGL available.
 * Always returns false on the server (SSR-safe).
 */
export function useHeavyMotion(): boolean {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const nav = navigator as Navigator & { deviceMemory?: number };
    if (nav.deviceMemory !== undefined && nav.deviceMemory < 4) return;

    if (/iPhone|iPad/i.test(navigator.userAgent)) return;

    try {
      const canvas = document.createElement('canvas');
      const hasWebGL = !!(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
      if (!hasWebGL) return;
    } catch {
      return;
    }

    setOk(true);
  }, []);

  return ok;
}
