'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { SceneProps } from '../types';
import ExtensionPanelMock from '../ExtensionPanelMock';

// 6-stage config:
// 0 scene-and-plugin | 1 selection | 2 centerize | 3 ai-scan | 4 cards-scatter | 5 rest

const clamp = (v: number) => Math.min(1, Math.max(0, v));

const FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', system-ui, sans-serif";
const MONO_FONT = "'JetBrains Mono', 'SF Mono', 'Fira Mono', 'Consolas', monospace";

// ── Card content ──────────────────────────────────────────────────────────────

const PALETTE_COLORS = ['#c07a4a', '#e8c9a8', '#8b5a3c', '#d9b38c', '#f3e6d6'];

// Scatter positions relative to center of viewport
// Positive X = right, positive Y = down
// Responsive positions (vw/vh). Symmetric around scene center.
// Wider spread so cards sit outside the centered product image (no overlap).
// At 1498vw: x=±30vw=±449px, x=±34vw=±509px; y=±34vh=±276px
const CARD_POSITIONS = [
  { x: -30, y: -34 }, // Card 1 palette — top-left
  { x: -34, y:   0 }, // Card 2 CMF    — mid-left
  { x: -30, y:  34 }, // Card 3 light  — bottom-left
  { x:  30, y: -34 }, // Card 4 comp   — top-right
  { x:  34, y:   0 }, // Card 5 mood   — mid-right
  { x:  30, y:  34 }, // Card 6 prompt — bottom-right
];

const CARD_STAGGER_MS = [0, 40, 80, 120, 160, 200];

// Shared card shell styles
// NOTE: position is NOT set here — cards must flow naturally inside their
// absolute-positioned wrapper so the wrapper can size to card width and
// translate(-50%, -50%) computes correctly.
const cardBase: React.CSSProperties = {
  background: '#17171b',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '14px',
  padding: '16px 18px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  fontFamily: FONT,
  boxSizing: 'border-box',
  transformOrigin: 'center center',
};

const cardTitle: React.CSSProperties = {
  fontSize: '10.5px',
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#86868b',
  marginBottom: '10px',
};

const cardBody: React.CSSProperties = {
  fontSize: '12px',
  color: '#c7c7cc',
  lineHeight: 1.55,
};

const subLabel: React.CSSProperties = {
  fontSize: '10px',
  textTransform: 'uppercase',
  color: '#6e6e73',
  marginBottom: '4px',
  letterSpacing: '0.06em',
};

const chip: React.CSSProperties = {
  display: 'inline-block',
  padding: '3px 8px',
  fontSize: '10px',
  background: 'rgba(255,255,255,0.06)',
  color: '#c7c7cc',
  borderRadius: '980px',
  marginRight: '4px',
  marginBottom: '4px',
  whiteSpace: 'nowrap',
};

const swatch: React.CSSProperties = {
  width: '28px',
  height: '28px',
  borderRadius: '6px',
  border: '1px solid rgba(255,255,255,0.08)',
  flexShrink: 0,
};

// ── Card components ───────────────────────────────────────────────────────────

function Card1Palette() {
  return (
    <div style={{ ...cardBase, width: '280px' }}>
      <div style={cardTitle}>配色</div>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {PALETTE_COLORS.map((c) => (
          <div key={c} style={{ ...swatch, background: c }} />
        ))}
      </div>
    </div>
  );
}

function Card2CMF() {
  return (
    <div style={{ ...cardBase, width: '280px' }}>
      <div style={cardTitle}>CMF</div>
      <div style={{ ...cardBody, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div>
          <div style={subLabel}>色</div>
          <div style={{ display: 'flex', gap: '5px' }}>
            {['#c07a4a', '#e8c9a8', '#8b5a3c', '#9b9b9b'].map((c) => (
              <div key={c} style={{ ...swatch, background: c }} />
            ))}
          </div>
        </div>
        <div>
          <div style={subLabel}>材</div>
          <div>
            {['天然木', '真皮', '羊毛织物', '陶瓷'].map((t) => (
              <span key={t} style={chip}>{t}</span>
            ))}
          </div>
        </div>
        <div>
          <div style={subLabel}>饰</div>
          <div>
            {['哑光', '油蜡木', '自然纹理', '柔软褶皱'].map((t) => (
              <span key={t} style={chip}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Card3Lighting() {
  return (
    <div style={{ ...cardBase, width: '280px' }}>
      <div style={cardTitle}>光线 + 镜头</div>
      <div style={{ ...cardBody, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div>
          <div style={subLabel}>光线</div>
          <div style={{ fontSize: '11.5px', color: '#c7c7cc', lineHeight: 1.6 }}>
            主光: 右侧窗外直射暖阳<br />
            辅光: 左侧墙面弱反射补光<br />
            氛围: 室内暖调自然环境光
          </div>
        </div>
        <div>
          <div style={subLabel}>镜头</div>
          <div style={{ fontSize: '11.5px', color: '#c7c7cc' }}>
            50mm · 三分之二侧前 · 中等景深
          </div>
        </div>
      </div>
    </div>
  );
}

function Card4Composition() {
  return (
    <div style={{ ...cardBase, width: '280px' }}>
      <div style={cardTitle}>构图 + 场景</div>
      <div style={{ ...cardBody, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div>
          <div style={subLabel}>构图</div>
          <div style={{ fontSize: '11.5px', color: '#c7c7cc' }}>
            主体偏右、留白充足、对角光影
          </div>
        </div>
        <div>
          <div style={subLabel}>场景</div>
          <div style={{ fontSize: '11.5px', color: '#c7c7cc' }}>
            暖米色室内墙角空间
          </div>
        </div>
      </div>
    </div>
  );
}

function Card5Mood() {
  return (
    <div style={{ ...cardBase, width: '280px' }}>
      <div style={cardTitle}>情绪 + 道具</div>
      <div style={{ ...cardBody, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div>
          <div style={subLabel}>情绪</div>
          <div>
            {['温暖', '自然', '北欧', '静谧', '高端'].map((t) => (
              <span key={t} style={chip}>{t}</span>
            ))}
          </div>
        </div>
        <div>
          <div style={subLabel}>道具</div>
          <div style={{ fontSize: '11.5px', color: '#c7c7cc', lineHeight: 1.6 }}>
            灰色披毯 · 白色陶瓷杯 · 绿植枝叶 · 简约木边几
          </div>
        </div>
      </div>
    </div>
  );
}

const MJ_PROMPT =
  'premium Scandinavian lounge chair with light natural wood frame and cognac brown leather cushions, styled in a warm minimalist interior corner, strong golden sunlight entering from the right casting geometric window shadows, beige plaster wall, pale wood floor, gray throw draped over one arm, small wooden side table with a white ceramic mug, subtle olive branches, three-quarter front side view, 50mm lens, medium depth of field, calm refined editorial furniture photography --ar 1:1 --style raw --v 6';

function Card6Prompt() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(MJ_PROMPT).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{ ...cardBase, width: '280px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={cardTitle}>Midjourney</div>
        <button
          onClick={handleCopy}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '6px',
            color: copied ? '#34c759' : '#86868b',
            fontSize: '10px',
            padding: '3px 8px',
            cursor: 'pointer',
            fontFamily: FONT,
            transition: 'color 200ms',
          }}
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div
        style={{
          fontFamily: MONO_FONT,
          fontSize: '10.5px',
          color: '#c7c7cc',
          lineHeight: 1.6,
          overflowY: 'auto',
          maxHeight: '160px',
          wordBreak: 'break-word',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.12) transparent',
        }}
      >
        {MJ_PROMPT}
      </div>
    </div>
  );
}

const CARDS = [Card1Palette, Card2CMF, Card3Lighting, Card4Composition, Card5Mood, Card6Prompt];

// ── Main scene ────────────────────────────────────────────────────────────────

export default function ProductVisualScene({ stage, stageProgress }: SceneProps) {
  // ── Stage 0: scene AND plugin enter simultaneously ────────────────────────
  const enterProg = clamp(stage === 0 ? stageProgress : stage > 0 ? 1 : 0);
  const sceneOpacity = enterProg;
  const enterY = stage === 0 ? 30 * (1 - stageProgress) : 0;

  // ── Stage 1: selection + centerize merged ─────────────────────────────────
  // First half (0–50%): selection glow; second half (50–100%): centerize
  const selProg = clamp(stage === 1 ? Math.min(stageProgress / 0.5, 1) : stage > 1 ? 1 : 0);
  const selGlow = selProg;
  const sidebarDim = 1 - 0.6 * selProg;

  const centerProg = clamp(stage === 1 ? Math.max((stageProgress - 0.5) / 0.5, 0) : stage > 1 ? 1 : 0);
  const sidebarOpacity = (1 - centerProg) * sidebarDim;
  const bgOverlayOpacity = centerProg * 0.88;

  // ── Stage 2: ai-scan — scan line sweeps top→bottom ───────────────────────
  const scanActive = stage === 2;
  const scanProgress = stage === 2 ? stageProgress : 0;
  const scatterProg = clamp(stage === 3 ? stageProgress : stage > 3 ? 1 : 0);
  const productBaseWidth = 440;

  // effective scale across all stages (product stays large after centering)
  const effectiveScale =
    stage < 1
      ? 1
      : stage === 1
      ? 1 + centerProg * 0.22
      : 1.22; // stages 2+ — stays at centered-zoom size

  // effective translateX (vw):
  const effectiveTranslateX =
    stage < 1 ? -26 : stage === 1 ? (1 - centerProg) * -26 : 0;

  // ── Stage 3: plugin retracts + cards scatter ───────────────────────────────
  const pluginRetractProg = clamp(stage === 3 ? stageProgress : stage > 3 ? 1 : 0);
  const pluginX =
    stage === 0
      ? (1 - enterProg) * 100
      : stage < 3
      ? 0
      : pluginRetractProg * 100;
  const pluginOpacity =
    stage === 0
      ? enterProg
      : stage < 3
      ? 1
      : 1 - pluginRetractProg;

  // ── Cards scatter ─────────────────────────────────────────────────────────
  const showCards = stage >= 3;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>

      {/* ── Background darkening overlay (stages 2+) ──────────────────────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: '#000',
          opacity: stage >= 1 ? bgOverlayOpacity : 0,
          pointerEvents: 'none',
          zIndex: 1,
          transition: 'none',
        }}
      />

      {/* ── Product page layout base — sidebar only (stages 0-1, fades in stage 2) ── */}
      {/* paddingRight reserves right column for the plugin panel */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          paddingRight: '472px',
          opacity: sceneOpacity,
          transform: `translateY(${enterY}px)`,
          zIndex: 2,
        }}
      >
        {/* Product info sidebar — fades out in stage 2 */}
        <div
          style={{
            flex: '0 0 40%',
            marginLeft: '60%',
            opacity: sidebarOpacity,
            padding: '100px 24px 40px 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            overflowY: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '0.6875rem',
              fontFamily: 'var(--font-pl-mono,monospace)',
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: '0.04em',
            }}
          >
            Furniture / Seating / Lounge
          </p>

          <h3
            style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--color-pl-fg-primary,#f5f5f7)',
              lineHeight: 1.2,
            }}
          >
            Arc Lounge Chair
          </h3>

          <p
            style={{
              margin: 0,
              fontSize: '0.875rem',
              color: 'rgba(255,255,255,0.5)',
              lineHeight: 1.6,
            }}
          >
            Mid-century modern silhouette with sculpted walnut frame and premium bouclé upholstery.
          </p>

          {/* Thumbnail row */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {['chair', 'skincare', 'audio'].map((img, i) => (
              <div
                key={img}
                style={{
                  position: 'relative',
                  width: '64px',
                  height: '64px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  flexShrink: 0,
                  border:
                    i === 0
                      ? '2px solid rgba(124,92,255,0.7)'
                      : '2px solid rgba(255,255,255,0.08)',
                }}
              >
                <Image
                  src={`/stage/product/${img}.webp`}
                  alt=""
                  aria-hidden="true"
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="64px"
                />
              </div>
            ))}
          </div>

          {/* Price */}
          <div
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: 'var(--color-pl-fg-primary,#f5f5f7)',
            }}
          >
            $2,400
            <span
              style={{
                fontSize: '0.875rem',
                fontWeight: 400,
                color: 'rgba(255,255,255,0.35)',
                marginLeft: '8px',
              }}
            >
              USD
            </span>
          </div>

          {/* Add to cart mock */}
          <div
            style={{
              padding: '12px 20px',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
              fontSize: '0.9375rem',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.5)',
              textAlign: 'center',
            }}
          >
            Add to Cart
          </div>
        </div>
      </div>

      {/* ── Product image — independent layer, true viewport center as reference ── */}
      {/* Uses vw directly for horizontal center — viewport-absolute, independent of container */}
      <div
        style={{
          position: 'absolute',
          left: `calc(50vw + ${effectiveTranslateX}vw)`,
          top: '50vh',
          transform: `translate(-50%, -50%) scale(${effectiveScale})`,
          width: `${productBaseWidth}px`,
          aspectRatio: '1/1',
          zIndex: 3,
          opacity: sceneOpacity,
          transition: 'none',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius: '20px',
            overflow: 'hidden',
            background: '#1a1a22',
            border: selGlow > 0 && stage <= 3
              ? `2px solid rgba(124,92,255,${selGlow.toFixed(3)})`
              : '2px solid transparent',
            boxShadow:
              selGlow > 0 && stage <= 2
                ? `0 0 36px rgba(124,92,255,${(selGlow * 0.4).toFixed(3)})`
                : stage >= 1
                ? '0 32px 80px rgba(0,0,0,0.7)'
                : '0 8px 40px rgba(0,0,0,0.5)',
          }}
        >
          <Image
            src="/stage/product/chair.webp"
            alt=""
            aria-hidden="true"
            fill
            style={{ objectFit: 'cover' }}
            sizes="520px"
          />

          {/* Scan line overlay — stage 3 only */}
          {scanActive && scanProgress > 0 && (
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
      </div>

      {/* ── Scatter cards (stage 3+) ─────────────────────────────────────────── */}
      {/* Full viewport, no padding — left:50% = true viewport center, same as product image */}
      {showCards && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 4,
            pointerEvents: stage >= 4 ? 'auto' : 'none',
          }}
        >
          {CARDS.map((CardComponent, i) => {
            // Each card has a stagger delay expressed as a fraction of stage 3 progress
            const staggerFrac = CARD_STAGGER_MS[i] / 800;
            const cardRawProg = stage === 3
              ? clamp((scatterProg - staggerFrac) / (1 - staggerFrac))
              : stage > 3
              ? 1
              : 0;

            const pos = CARD_POSITIONS[i];
            // Positions are in vw/vh. At final rest, cards sit at exact pos.x vw / pos.y vh.
            const tx = pos.x * cardRawProg;
            const ty = pos.y * cardRawProg;
            const rotDir = i % 2 === 0 ? 1 : -1;
            const rot = rotDir * 20 * (1 - cardRawProg);
            const cardOpacity = cardRawProg;
            const cardScale = 0.4 + cardRawProg * 0.6;

            // Use vw/vh directly (independent of any container width/padding)
            // Card center = 50vw + tx vw, card positioned using left: calc(50vw + tx vw) then translate(-50%, -50%)
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `calc(50vw + ${tx.toFixed(2)}vw)`,
                  top: `calc(50vh + ${ty.toFixed(2)}vh)`,
                  transform: `translate(-50%, -50%) rotate(${rot.toFixed(2)}deg) scale(${cardScale.toFixed(3)})`,
                  opacity: cardOpacity,
                  transition: 'none',
                }}
              >
                <CardComponent />
              </div>
            );
          })}
        </div>
      )}

      {/* ── Plugin panel ───────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: '80px',
          right: '16px',
          bottom: '16px',
          width: '440px',
          zIndex: 10,
          transform: `translateX(${pluginX.toFixed(2)}%)`,
          opacity: pluginOpacity,
          transition: 'none',
        }}
      >
        <ExtensionPanelMock mode="product" stage={stage} />
      </div>
    </div>
  );
}
