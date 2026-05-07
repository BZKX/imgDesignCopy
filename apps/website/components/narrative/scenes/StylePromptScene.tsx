'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import type { SceneProps } from '../types';
import ExtensionPanelMock from '../ExtensionPanelMock';

// 4-stage config:
// 0 scene-enter | 1 plugin-and-scan | 2 card-flip (+ plugin retract) | 3 interactive-rest

// ── Image list ────────────────────────────────────────────────────────────────
const IMAGES = [
  '01-cinematic-portrait-moody',  // index 0 — col 0 top    (portrait 3/4)
  '03-landscape-dusk-mountains',  // index 1 — col 0 bottom (landscape 16/9)
  '09-street-neon-tokyo',         // index 2 — col 1 solo   ← TARGET (9/16)
  '05-landscape-desert-cosmic',   // index 3 — col 2 top    (landscape 16/9)
  '04-landscape-foggy-coast',     // index 4 — col 2 middle (landscape 16/9)
  '06-still-life-coffee',         // index 5 — col 2 bottom (square 1/1)
];

// Col 0: 2 images, Col 1: 1 image (tokyo hero), Col 2: 3 images
const COLS = [[0, 1], [2], [3, 4, 5]];

// Aspect ratio per image index — matches the ACTUAL image dimensions (no cropping)
const ASPECT: Record<number, string> = {
  0: '1196/1600',  // portrait moody     (3/4)
  1: '1600/893',   // mountains          (16/9)
  2: '894/1600',   // tokyo (TARGET)     (9/16)
  3: '1600/893',   // desert cosmic      (16/9)
  4: '1600/893',   // coast              (16/9)
  5: '1600/1597',  // coffee             (1/1)
};

// Target image index (center col solo — auto-flip)
const TARGET_IDX = 2;

// ── Prompt data ───────────────────────────────────────────────────────────────
// Prompts sourced from imgPrompt.json mapping + fallbacks for unlisted images
interface PromptInfo {
  name: string;
  prompt: string;
}

// Prompt mapping (all from imgPrompt.json):
// idx 0 (01 portrait moody)  → id 1
// idx 1 (03 mountains)       → id 3
// idx 2 (09 tokyo)           → id 2 ← center/target
// idx 3 (05 desert cosmic)   → id 6
// idx 4 (04 coast)           → id 4
// idx 5 (06 coffee)          → id 5
const PROMPTS: PromptInfo[] = [
  {
    name: 'Melancholy dusk window silhouette',
    prompt:
      'A solitary person in side profile standing indoors before tall aged wooden windows at dusk, dark silhouette against a blurred city skyline, blue hour sky, warm amber interior spill, moody cinematic photography, low-key lighting, teal and orange color grade, subtle film grain, intimate melancholy, weathered glass, quiet contemplative atmosphere, vertical composition --ar 3:4 --style raw --v 6',
  },
  {
    name: 'Serene alpine dusk reflection',
    prompt:
      'A serene alpine mountain range at dusk reflected perfectly in a calm lake, dark silhouetted ridgelines with subtle snow on the peaks, tiny moon high in a clear gradient sky, minimalist wide composition, mirror symmetry, soft blue-to-peach color palette, crisp air, contemplative mood, fine art landscape photography, natural light, ultra-clean horizon, gentle tonal transitions --ar 16:9 --style raw --v 6',
  },
  {
    name: 'Neon Noir Alley Solitude',
    prompt:
      'A lone man in a beige trench coat walking away through a narrow rain-slick urban alley at night, glowing vertical neon signs, drifting steam, cramped facades with air conditioners and pipes, reflective pavement, subdued green and amber color palette, cinematic neo-noir mood, back view composition, shallow depth of field, soft haze, gritty realistic street photography, atmospheric bokeh --ar 3:4 --style raw --v 6',
  },
  {
    name: 'Milky Way Over Silent Salt Flats',
    prompt:
      'A vast cracked salt flat under an immense arcing Milky Way, two tiny silhouettes near the distant horizon, ultra-wide astrophotography, deep indigo and violet sky, faint magenta twilight glow, highly detailed stars, subtle cool reflections in the ground cracks, quiet cinematic scale, serene and awe-filled desert night, crisp long-exposure realism --ar 16:9 --style raw --v 6',
  },
  {
    name: 'Moody Minimalist Seascape at Dusk',
    prompt:
      'A minimalist fine-art seascape photograph with dark volcanic rocks emerging from smooth long-exposure water, a small distant lighthouse near the horizon, cool gray-blue tones, overcast dusk light, wide negative space, quiet melancholic mood, subtle atmospheric haze, clean cinematic composition, realistic texture, soft tonal gradients --ar 16:9 --style raw --v 6',
  },
  {
    name: 'Warm Rustic Coffee Still Life',
    prompt:
      'A rustic tabletop still life with a steaming pour-over coffee cup on a glass carafe, antique hand coffee grinder with visible beans, worn leather journal and pen, scattered eucalyptus branches, arranged on an aged wooden table. Soft morning window light, muted brown and sage palette, gentle steam, tactile textures, intimate editorial food photography, calm contemplative mood, shallow depth of field --ar 1:1 --style raw --v 6',
  },
];

function getPrompt(idx: number): PromptInfo {
  return PROMPTS[idx] ?? { name: `Image ${idx + 1}`, prompt: '' };
}

// ── Typewriter hook ───────────────────────────────────────────────────────────
function useTypewriter(text: string, enabled: boolean, speed: number = 18): string {
  const [displayed, setDisplayed] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled) {
      setDisplayed('');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    setDisplayed('');
    let idx = 0;
    intervalRef.current = setInterval(() => {
      idx++;
      setDisplayed(text.slice(0, idx));
      if (idx >= text.length) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, speed);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [text, enabled, speed]);

  return displayed;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const clamp = (v: number) => Math.min(1, Math.max(0, v));

const FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', system-ui, sans-serif";
const MONO_FONT = "'JetBrains Mono', 'SF Mono', 'Fira Mono', 'Consolas', monospace";

// ── FlipCard component ────────────────────────────────────────────────────────
interface FlipCardProps {
  idx: number;
  colIdx: number;
  isCenter: boolean;
  aspectRatio: string;
  /** Whether the center card flip has been triggered (fixed animation, not scroll-driven) */
  flipTriggered: boolean;
  isFlipped: boolean;
  isInteractive: boolean;
  onToggle: () => void;
  selGlow: number;
  scanActive: boolean;
  scanProgress: number;
  typewriterEnabled: boolean;
}

function FlipCard({
  idx,
  isCenter,
  aspectRatio,
  flipTriggered,
  isFlipped,
  isInteractive,
  onToggle,
  selGlow,
  scanActive,
  scanProgress,
  typewriterEnabled,
}: FlipCardProps) {
  const fileName = IMAGES[idx];
  const { name, prompt } = getPrompt(idx);

  // For center: fixed animation triggered by flipTriggered; for others: boolean toggle
  const rotateY = isCenter ? (flipTriggered ? 180 : 0) : isFlipped ? 180 : 0;
  const typedPrompt = useTypewriter(prompt, typewriterEnabled, 16);

  const clickable = isInteractive;

  return (
    <div
      onClick={clickable ? onToggle : undefined}
      style={{
        position: 'relative',
        aspectRatio,
        flexShrink: 0,
        perspective: '1200px',
        cursor: clickable ? 'pointer' : 'default',
        transform: isCenter && !isInteractive ? 'scale(1.05)' : 'scale(1)',
        zIndex: isCenter ? 2 : 1,
        animation: isInteractive ? `pl-card-wobble 500ms ease-in-out ${idx * 80}ms 1 both` : 'none',
      }}
    >
      {/* Glow border for center image during selection-scan */}
      {isCenter && selGlow > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: '-2px',
            borderRadius: '14px',
            border: `2px solid rgba(124,92,255,${selGlow.toFixed(3)})`,
            boxShadow: `0 0 32px rgba(124,92,255,${(selGlow * 0.6).toFixed(3)})`,
            zIndex: 5,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Hover glow for interactive cards */}
      {isInteractive && (
        <style>{`
          .flip-card-idx-${idx}:hover {
            box-shadow: 0 0 0 2px rgba(124,92,255,0.5), 0 8px 24px rgba(124,92,255,0.2) !important;
          }
        `}</style>
      )}

      {/* 3D flip container */}
      <div
        className={isInteractive ? `flip-card-idx-${idx}` : undefined}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transform: `rotateY(${rotateY}deg)`,
          transition: 'transform 700ms cubic-bezier(0.23, 1, 0.32, 1)',
          borderRadius: '12px',
        }}
      >
        {/* Front face: image */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <Image
            src={`/stage/style/${fileName}.webp`}
            alt=""
            aria-hidden="true"
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 1280px) 180px, 240px"
          />
          {/* Scan line overlay — only on center image during scan stage */}
          {isCenter && scanActive && scanProgress > 0 && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                overflow: 'hidden',
                pointerEvents: 'none',
                zIndex: 3,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: `${scanProgress * 100}%`,
                  height: '2px',
                  background:
                    'linear-gradient(90deg, transparent 0%, rgba(124,92,255,0.8) 20%, rgba(124,92,255,1) 50%, rgba(124,92,255,0.8) 80%, transparent 100%)',
                  boxShadow: '0 0 12px rgba(124,92,255,0.8)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  height: `${scanProgress * 100}%`,
                  background: 'rgba(124,92,255,0.07)',
                }}
              />
            </div>
          )}
        </div>

        {/* Back face: prompt card */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            borderRadius: '12px',
            overflow: 'hidden',
            background: '#1a1a1e',
            border: '1px solid rgba(124,92,255,0.24)',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: FONT,
            boxSizing: 'border-box',
          }}
        >
          {/* Top row: badge + name */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '10px',
              flexShrink: 0,
            }}
          >
            {/* MJ badge */}
            <div
              style={{
                background: 'rgba(10,132,255,0.16)',
                color: '#0a84ff',
                fontSize: '9px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '3px 8px',
                borderRadius: '980px',
                flexShrink: 0,
                whiteSpace: 'nowrap',
              }}
            >
              Midjourney
            </div>
            {/* Name */}
            <div
              style={{
                color: '#f5f5f7',
                fontSize: '12px',
                fontWeight: 600,
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {name}
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              height: '1px',
              background: 'rgba(255,255,255,0.08)',
              margin: '12px 0',
              flexShrink: 0,
            }}
          />

          {/* Prompt text with typewriter */}
          <div
            style={{
              fontFamily: MONO_FONT,
              fontSize: '11px',
              lineHeight: 1.6,
              color: '#c7c7cc',
              overflowY: 'auto',
              flex: 1,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              scrollbarWidth: 'thin' as const,
              scrollbarColor: 'rgba(255,255,255,0.12) transparent',
            }}
          >
            {typedPrompt}
            {typewriterEnabled && typedPrompt.length < prompt.length && (
              <span
                style={{
                  display: 'inline-block',
                  width: '1px',
                  height: '1em',
                  background: '#c7c7cc',
                  verticalAlign: 'text-bottom',
                  animation: 'blink 1s step-end infinite',
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main scene ────────────────────────────────────────────────────────────────
export default function StylePromptScene({ stage, stageProgress }: SceneProps) {
  // Bidirectional flip state for all images (by index)
  const [flippedSet, setFlippedSet] = useState<Set<number>>(new Set());

  const toggleFlip = (idx: number) => {
    setFlippedSet((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  // ── Stage 0: scene fades in quickly ────────────────────────────────────────
  const sceneOpacity = clamp(stage === 0 ? stageProgress : stage > 0 ? 1 : 0);
  const enterY = stage === 0 ? 40 * (1 - stageProgress) : 0;

  // ── Stage 1: plugin slides in + selection glow + scan — all simultaneous ─
  // Plugin has its own independent slide duration (30% of each stage)
  const SLIDE_DURATION = 0.3;
  const pluginIn = stage === 1 ? clamp(stageProgress / SLIDE_DURATION) : stage > 1 ? 1 : 0;
  const pluginRetract = stage === 3 ? clamp(stageProgress / SLIDE_DURATION) : stage > 3 ? 1 : 0;
  const pluginX =
    stage < 1
      ? 100
      : stage === 1
      ? (1 - pluginIn) * 100
      : stage >= 3
      ? pluginRetract * 100
      : 0;

  const selProg = clamp(stage === 1 ? stageProgress : stage > 1 ? 1 : 0);
  const scanActive = stage === 1;
  const scanProgress = stage === 1 ? stageProgress : 0;

  // ── Stage 2: card-flip — triggered on enter, plays as fixed animation ─────
  // Once we enter stage 2, flip is triggered and completes independently of scroll
  const flipTriggered = stage >= 2;

  // ── Stage 3: interactive rest with wobble hint ────────────────────────────
  const isInteractive = stage >= 3;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* Keyframes */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes pl-card-wobble {
          0%, 100% { transform: rotate(0deg) scale(1); }
          20% { transform: rotate(-1.5deg) scale(1.02); }
          40% { transform: rotate(1.5deg) scale(1.02); }
          60% { transform: rotate(-0.8deg) scale(1.01); }
          80% { transform: rotate(0.8deg) scale(1.01); }
        }
      `}</style>

      {/* ── Waterfall grid (centered, fills scene) ─────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: sceneOpacity,
          transform: `translateY(${enterY}px)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: '88px',
          paddingBottom: '32px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: '24px',
            width: '100%',
            maxWidth: '1600px',
            padding: '0 48px',
            alignItems: 'center',
          }}
        >
          {COLS.map((colIndices, ci) => (
            <div
              key={ci}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                justifyContent: 'center',
              }}
            >
              {colIndices.map((idx) => {
                const isCenter = idx === TARGET_IDX;
                // Determine effective flip state for this card
                let isFlipped: boolean;
                if (isCenter) {
                  if (isInteractive) {
                    // Center starts flipped, unless user toggled it back
                    isFlipped = !flippedSet.has(TARGET_IDX);
                  } else {
                    isFlipped = flipTriggered;
                  }
                } else {
                  isFlipped = isInteractive && flippedSet.has(idx);
                }

                // Typewriter: center when flipped, others when flipped
                const typewriterEnabled = isCenter
                  ? (flipTriggered && !isInteractive) || (isInteractive && isFlipped)
                  : isFlipped;

                // For center in interactive: flip is driven by flippedSet
                const effectiveFlipTriggered = isCenter && isInteractive
                  ? !flippedSet.has(TARGET_IDX)
                  : flipTriggered;

                return (
                  <FlipCard
                    key={idx}
                    idx={idx}
                    colIdx={ci}
                    isCenter={isCenter}
                    aspectRatio={ASPECT[idx]}
                    flipTriggered={effectiveFlipTriggered}
                    isFlipped={isFlipped}
                    isInteractive={isInteractive}
                    onToggle={() => toggleFlip(idx)}
                    selGlow={isCenter ? selProg : 0}
                    scanActive={isCenter && scanActive}
                    scanProgress={scanProgress}
                    typewriterEnabled={typewriterEnabled}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ── Plugin panel (absolutely positioned, overlays grid) ────────────── */}
      <div
        style={{
          position: 'absolute',
          top: '80px',
          right: '16px',
          bottom: '16px',
          width: '440px',
          zIndex: 10,
          transform: `translateX(${pluginX.toFixed(2)}%)`,
          opacity: sceneOpacity,
          transition: 'none',
        }}
      >
        <ExtensionPanelMock mode="style" stage={stage} analyzing={stage === 1} />
      </div>
    </div>
  );
}
