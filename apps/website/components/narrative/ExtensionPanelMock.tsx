'use client';

import { useTranslations } from 'next-intl';

// Inline SVG icons copied exactly from apps/chrome/src/content/icons.tsx

function DrawIcon() {
  return (
    <svg viewBox="0 0 1024 1024" fill="currentColor" aria-hidden width="14" height="14">
      <path d="M512 170.666667a341.333333 341.333333 0 1 1 0 682.666666c-55.722667 0-21.930667-39.552-83.925333-103.253333C368.170667 688.64 170.666667 725.12 170.666667 512a341.333333 341.333333 0 0 1 341.333333-341.333333z m74.666667 413.866666a64 64 0 1 0 0 128 64 64 0 0 0 0-128z m117.333333-136.533333a42.666667 42.666667 0 1 0 0 85.333333 42.666667 42.666667 0 0 0 0-85.333333zM640 341.333333a42.666667 42.666667 0 1 0 0 85.333334 42.666667 42.666667 0 0 0 0-85.333334z m-245.333333-12.8a42.666667 42.666667 0 1 0 0 85.333334 42.666667 42.666667 0 0 0 0-85.333334z m128-40.533333a42.666667 42.666667 0 1 0 0 85.333333 42.666667 42.666667 0 0 0 0-85.333333z" />
    </svg>
  );
}

function ProductIcon() {
  return (
    <svg viewBox="0 0 1024 1024" fill="currentColor" aria-hidden width="14" height="14">
      <path d="M832 736l-249.6 153.6c-19.2 12.8-38.4 0-38.4-25.6L544 505.6c0-6.4 6.4-19.2 12.8-25.6l249.6-153.6c19.2-12.8 38.4 0 38.4 25.6l0 364.8C844.8 723.2 838.4 736 832 736z" />
      <path d="M192 736l249.6 153.6c19.2 12.8 38.4 0 38.4-25.6L480 505.6c0-6.4-6.4-19.2-12.8-25.6L217.6 326.4C204.8 320 179.2 332.8 179.2 352l0 364.8C179.2 723.2 185.6 736 192 736z" />
      <path d="M505.6 128 217.6 236.8c-12.8 6.4-12.8 25.6 0 32L505.6 448C512 448 518.4 448 518.4 448l294.4-179.2c12.8-6.4 12.8-25.6 0-32L518.4 128C512 128 512 128 505.6 128z" />
    </svg>
  );
}

function WebIcon() {
  return (
    <svg viewBox="0 0 1024 1024" fill="currentColor" aria-hidden width="14" height="14">
      <path d="M853.333333 170.666667 170.666667 170.666667C123.733333 170.666667 85.333333 209.066667 85.333333 256l0 512c0 46.933333 38.4 85.333333 85.333333 85.333333l682.666667 0c46.933333 0 85.333333-38.4 85.333333-85.333333L938.666667 256C938.666667 209.066667 900.266667 170.666667 853.333333 170.666667zM640 768 170.666667 768l0-170.666667 469.333333 0L640 768zM640 554.666667 170.666667 554.666667 170.666667 384l469.333333 0L640 554.666667zM853.333333 768l-170.666667 0L682.666667 384l170.666667 0L853.333333 768z" />
    </svg>
  );
}

function ScissorIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="13"
      height="13"
    >
      <circle cx="4" cy="5" r="1.75" />
      <circle cx="4" cy="11" r="1.75" />
      <path d="M5.5 6.2L14 13M5.5 9.8L14 3" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
      <path d="M13.2 9.4A5.5 5.5 0 016.6 2.8a5.5 5.5 0 106.6 6.6z" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
      <path d="M2.8 7.5a5.3 5.3 0 11.7 3" />
      <path d="M1.5 10.6l2 .1.1-2" />
      <path d="M8 5.2v3.1l2 1.2" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" width="13" height="13">
      <path d="M3 3l10 10M13 3L3 13" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
      <circle cx="8" cy="8" r="2" />
      <path
        d="M8 1.5v2M8 12.5v2M14.5 8h-2M3.5 8h-2M12.6 3.4l-1.4 1.4M4.8 11.2l-1.4 1.4M12.6 12.6l-1.4-1.4M4.8 4.8L3.4 3.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

// PromptLens logo: purple rounded square with white lens mark
function PromptLensLogo() {
  return (
    <div
      style={{
        width: '22px',
        height: '22px',
        borderRadius: '6px',
        background: '#5b4cff',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <svg viewBox="0 0 22 22" fill="none" width="22" height="22">
        <circle cx="11" cy="11" r="5.5" stroke="white" strokeWidth="1.8" fill="none" opacity="0.9" />
        <circle cx="11" cy="11" r="1.5" fill="white" opacity="0.9" />
      </svg>
    </div>
  );
}

export type ExtensionMode = 'style' | 'product' | 'web';

interface ModeConfig {
  key: ExtensionMode;
  icon: React.ReactNode;
  label: string;
  eyebrow: string;
  line1: string;
  line2: string;
}

const MODE_DEFS = [
  { key: 'style' as const, icon: <DrawIcon />, labelKey: 'modeStylePrompt' as const, eyebrow: 'STYLE PROMPT', line1Key: 'styleLine1' as const, line2Key: 'styleLine2' as const },
  { key: 'product' as const, icon: <ProductIcon />, labelKey: 'modeProductVisual' as const, eyebrow: 'PRODUCT VISUAL', line1Key: 'productLine1' as const, line2Key: 'productLine2' as const },
  { key: 'web' as const, icon: <WebIcon />, labelKey: 'modeWebDesign' as const, eyebrow: 'WEB DESIGN', line1Key: 'webLine1' as const, line2Key: 'webLine2' as const },
];

// Shared Apple-system font stack matching the real extension exactly
const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', system-ui, sans-serif";

interface ExtensionPanelMockProps {
  mode: ExtensionMode;
  /** stage drives visual state: 2–3 = analyzing (body dimmed + active indicator) */
  stage: number;
  /** Override analyzing state; when omitted, falls back to stage === 2 || 3 */
  analyzing?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function ExtensionPanelMock({ mode, stage, analyzing: analyzingProp, style }: ExtensionPanelMockProps) {
  const tp = useTranslations('extensionPanel');
  const modes: ModeConfig[] = MODE_DEFS.map((d) => ({
    key: d.key,
    icon: d.icon,
    label: tp(d.labelKey),
    eyebrow: d.eyebrow,
    line1: tp(d.line1Key),
    line2: tp(d.line2Key),
  }));
  const activeMeta = modes.find((m) => m.key === mode) ?? modes[0];

  // Analyzing mode — dim body and show active indicator in hero
  const isAnalyzing = analyzingProp ?? (stage === 2 || stage === 3);
  const bodyOpacity = isAnalyzing ? 0.72 : 1;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'rgba(28,28,30,0.92)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderRadius: '22px',
        boxShadow: '0 16px 48px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        color: '#f5f5f7',
        fontFamily: FONT,
        letterSpacing: '-0.003em',
        fontSize: '14px',
        ...style,
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          minHeight: '56px',
          flexShrink: 0,
        }}
      >
        {/* Left: logo + brand name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <PromptLensLogo />
          <span
            style={{
              fontSize: '15px',
              fontWeight: 600,
              letterSpacing: '-0.015em',
              color: '#f5f5f7',
            }}
          >
            PromptLens
          </span>
        </div>

        {/* Right: icon buttons */}
        <div style={{ display: 'flex', gap: '2px' }}>
          {[
            { icon: <MoonIcon />, label: 'Toggle theme' },
            { icon: <HistoryIcon />, label: 'History' },
            { icon: <CloseIcon />, label: 'Close' },
          ].map(({ icon, label }) => (
            <div
              key={label}
              aria-label={label}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#aeaeb2',
                cursor: 'default',
              }}
            >
              {icon}
            </div>
          ))}
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          opacity: bodyOpacity,
          transition: 'opacity 300ms ease',
        }}
      >
        {/* Mode segment switcher */}
        <div
          style={{
            display: 'flex',
            gap: '4px',
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '12px',
            padding: '4px',
            marginBottom: '14px',
          }}
        >
          {modes.map((m) => {
            const active = m.key === mode;
            return (
              <div
                key={m.key}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  padding: '7px 6px',
                  borderRadius: '9px',
                  background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                  boxShadow: active
                    ? '0 1px 2px rgba(0,0,0,0.3), 0 2px 6px rgba(0,0,0,0.2)'
                    : 'none',
                  color: active ? '#f5f5f7' : '#6e6e73',
                  fontWeight: active ? 600 : 500,
                  fontSize: '11.5px',
                  letterSpacing: '-0.005em',
                  cursor: 'default',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', color: active ? '#f5f5f7' : '#6e6e73' }}>
                  {m.icon}
                </span>
                <span>{m.label}</span>
              </div>
            );
          })}
        </div>

        {/* Hero card */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.08))',
            borderRadius: '18px',
            padding: '24px 20px',
            textAlign: 'center',
            marginBottom: '14px',
            border: '1px solid rgba(255,255,255,0.06)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Eyebrow */}
          <div
            style={{
              fontSize: '10.5px',
              fontWeight: 600,
              color: '#6e6e73',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '10px',
            }}
          >
            {activeMeta.eyebrow}
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: '19px',
              lineHeight: 1.2,
              fontWeight: 600,
              letterSpacing: '-0.022em',
              color: '#f5f5f7',
              marginBottom: '18px',
            }}
          >
            {activeMeta.line1}
            <br />
            {activeMeta.line2}
          </div>

          {/* Analyzing indicator (stage 2–3) or Capture button */}
          {isAnalyzing ? (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(10,132,255,0.15)',
                color: '#0a84ff',
                padding: '9px 18px',
                borderRadius: '980px',
                fontSize: '13px',
                fontWeight: 500,
                letterSpacing: '-0.005em',
                border: '1px solid rgba(10,132,255,0.3)',
                marginBottom: '14px',
              }}
            >
              {/* Subtle spinner */}
              <svg
                viewBox="0 0 16 16"
                width="13"
                height="13"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                style={{ animation: 'spin 1s linear infinite' }}
              >
                <circle cx="8" cy="8" r="6" strokeDasharray="28" strokeDashoffset="10" opacity="0.4" />
                <path d="M8 2a6 6 0 016 6" />
              </svg>
              <span>{tp('analyzing')}</span>
            </div>
          ) : (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#0a84ff',
                color: '#ffffff',
                padding: '9px 18px',
                borderRadius: '980px',
                fontSize: '13px',
                fontWeight: 500,
                letterSpacing: '-0.005em',
                cursor: 'default',
                marginBottom: '14px',
              }}
            >
              <ScissorIcon />
              <span>截图</span>
            </div>
          )}

          {/* Keyboard shortcut row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              flexWrap: 'wrap',
            }}
          >
            {['⌘', '⇧', 'Y'].map((k) => (
              <kbd
                key={k}
                style={{
                  display: 'inline-flex',
                  minWidth: '20px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  background: 'rgba(255,255,255,0.08)',
                  color: '#aeaeb2',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: 600,
                  border: '1px solid rgba(255,255,255,0.10)',
                  boxShadow: '0 1px 0 rgba(0,0,0,0.3)',
                  fontFamily: FONT,
                }}
              >
                {k}
              </kbd>
            ))}
            <span style={{ color: 'rgba(255,255,255,0.2)', margin: '0 4px', fontSize: '10px' }}>·</span>
            {['Ctrl', '⇧', 'Y'].map((k) => (
              <kbd
                key={`ctrl-${k}`}
                style={{
                  display: 'inline-flex',
                  minWidth: '20px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  background: 'rgba(255,255,255,0.08)',
                  color: '#aeaeb2',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: 600,
                  border: '1px solid rgba(255,255,255,0.10)',
                  boxShadow: '0 1px 0 rgba(0,0,0,0.3)',
                  fontFamily: FONT,
                }}
              >
                {k}
              </kbd>
            ))}
            <span style={{ marginLeft: '6px', fontSize: '10px', color: '#6e6e73' }}>
              点击即可开始
            </span>
          </div>

          {/* Spinner keyframe injection */}
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>

        {/* Bottom tile grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
          }}
        >
          {/* History tile */}
          <div
            style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '14px',
              padding: '16px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
              cursor: 'default',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <span style={{ color: '#0a84ff', display: 'flex' }}>
              <HistoryIcon />
            </span>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                color: '#f5f5f7',
              }}
            >
              查看历史
            </span>
            <span style={{ fontSize: '10.5px', color: '#aeaeb2', lineHeight: 1.4 }}>
              浏览之前的分析结果
            </span>
          </div>

          {/* Settings tile */}
          <div
            style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '14px',
              padding: '16px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
              cursor: 'default',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <span style={{ color: '#0a84ff', display: 'flex' }}>
              <SettingsIcon />
            </span>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                color: '#f5f5f7',
              }}
            >
              设置
            </span>
            <span style={{ fontSize: '10.5px', color: '#aeaeb2', lineHeight: 1.4 }}>
              配置 API 密钥
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
