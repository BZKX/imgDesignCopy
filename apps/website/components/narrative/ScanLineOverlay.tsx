'use client';

interface ScanLineOverlayProps {
  active: boolean;
  /** Container height in px — drives the translateY end value. Default: '100%'. */
  containerHeight?: number | string;
}

/**
 * Pure CSS horizontal scan line that sweeps top-to-bottom when `active` is true.
 * Adds/removes the animation class each time `active` flips to true (via key reset).
 */
export default function ScanLineOverlay({ active, containerHeight = '100%' }: ScanLineOverlayProps) {
  const height = typeof containerHeight === 'number' ? `${containerHeight}px` : containerHeight;

  return (
    <>
      {/* Animated scan line */}
      <div
        key={active ? 'scan-active' : 'scan-idle'}
        aria-hidden="true"
        className={active ? 'pl-scanline pl-scanline--active' : 'pl-scanline'}
        style={{ '--pl-scan-end': height } as React.CSSProperties}
      />
      {/* Purple glow border around container when scanning */}
      {active && (
        <div
          aria-hidden="true"
          className="pl-scan-glow"
        />
      )}
      <style>{`
        .pl-scanline {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(124,92,255,0.6) 20%,
            #7c5cff 40%,
            #00e1ff 60%,
            rgba(0,225,255,0.6) 80%,
            transparent 100%
          );
          box-shadow:
            0 0 8px 2px rgba(124,92,255,0.5),
            0 0 20px 4px rgba(0,225,255,0.25);
          pointer-events: none;
          z-index: 15;
          opacity: 0;
          transform: translateY(0);
        }

        .pl-scanline--active {
          animation: pl-scanline-sweep 1.6s ease-in-out forwards;
        }

        @keyframes pl-scanline-sweep {
          0%   { opacity: 0; transform: translateY(0); }
          8%   { opacity: 1; }
          90%  { opacity: 1; }
          100% { opacity: 0; transform: translateY(var(--pl-scan-end, 100%)); }
        }

        .pl-scan-glow {
          position: absolute;
          inset: 0;
          border: 1px solid rgba(124,92,255,0.4);
          border-radius: inherit;
          box-shadow:
            0 0 0 1px rgba(124,92,255,0.15),
            inset 0 0 40px rgba(124,92,255,0.06);
          pointer-events: none;
          z-index: 14;
          animation: pl-scan-pulse 1.6s ease-in-out forwards;
        }

        @keyframes pl-scan-pulse {
          0%   { opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { opacity: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .pl-scanline--active,
          .pl-scan-glow {
            animation: none;
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}
