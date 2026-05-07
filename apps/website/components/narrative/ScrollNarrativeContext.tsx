'use client';

import { createContext, useCallback, useContext, useRef, useState } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

export interface ScrollNarrativeState {
  activeNarrativeId: string | null;
  globalProgress: number;
  reportProgress: (id: string, localProgress: number) => void;
}

// Narrative order and weights (proportional to section height)
// Style Prompt: 500vh (5/13), Product Visual: 400vh (4/13), Web Design: 400vh (4/13)
const NARRATIVE_ORDER = ['style-prompt', 'product-visual', 'web-design'] as const;
type NarrativeId = typeof NARRATIVE_ORDER[number];

const NARRATIVE_WEIGHTS: Record<NarrativeId, number> = {
  'style-prompt': 5 / 13,
  'product-visual': 4 / 13,
  'web-design': 4 / 13,
};

// ── Context ──────────────────────────────────────────────────────────────────

export const ScrollNarrativeContext = createContext<ScrollNarrativeState>({
  activeNarrativeId: null,
  globalProgress: 0,
  reportProgress: () => {},
});

export function useScrollNarrative(): ScrollNarrativeState {
  return useContext(ScrollNarrativeContext);
}

// ── Provider ─────────────────────────────────────────────────────────────────

export function ScrollNarrativeProvider({ children }: { children: React.ReactNode }) {
  const [activeNarrativeId, setActiveNarrativeId] = useState<string | null>(null);
  const [globalProgress, setGlobalProgress] = useState(0);

  // Store local progress for each narrative without causing re-renders
  const progressMap = useRef<Partial<Record<string, number>>>({});

  const reportProgress = useCallback((id: string, localProgress: number) => {
    const clamped = Math.min(1, Math.max(0, localProgress));
    progressMap.current[id] = clamped;

    // Active narrative: the one currently being scrolled through (0 < progress < 1)
    if (clamped > 0 && clamped < 1) {
      setActiveNarrativeId(id);
    } else if (clamped >= 1) {
      // Scrolled past this narrative — activate next if this was the active one
      setActiveNarrativeId((prev) => {
        if (prev !== id) return prev;
        const idx = NARRATIVE_ORDER.indexOf(id as NarrativeId);
        return idx >= 0 ? (NARRATIVE_ORDER[idx + 1] ?? null) : null;
      });
    } else {
      // clamped === 0, scrolled above this narrative — activate previous if needed
      setActiveNarrativeId((prev) => {
        if (prev !== id) return prev;
        const idx = NARRATIVE_ORDER.indexOf(id as NarrativeId);
        return idx > 0 ? (NARRATIVE_ORDER[idx - 1] ?? null) : null;
      });
    }

    // Compute global progress (0–1 across all 3 narratives weighted by height)
    let globalPct = 0;
    for (const narrativeId of NARRATIVE_ORDER) {
      const w = NARRATIVE_WEIGHTS[narrativeId];
      const p = progressMap.current[narrativeId] ?? 0;
      globalPct += p * w;
    }
    setGlobalProgress(globalPct);
  }, []);

  return (
    <ScrollNarrativeContext.Provider value={{ activeNarrativeId, globalProgress, reportProgress }}>
      {children}
    </ScrollNarrativeContext.Provider>
  );
}
