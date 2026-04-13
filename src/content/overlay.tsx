import { useEffect, useRef, useState } from 'react';
import { clampRectToViewport, isRectTooSmall, normalizeRect } from './selection';
import { MSG, type SelectionRect } from '@/lib/messages';

interface OverlayProps {
  onComplete: (rect: SelectionRect) => void;
  onCancel: () => void;
  excludeHost?: HTMLElement | null;
}

type Mode = 'rect' | 'element';

export function Overlay({ onComplete, onCancel, excludeHost }: OverlayProps) {
  const [mode, setMode] = useState<Mode>('element');
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);
  const [current, setCurrent] = useState<{ x: number; y: number } | null>(null);
  const [hoverRect, setHoverRect] = useState<SelectionRect | null>(null);
  const [hoverLabel, setHoverLabel] = useState<string>('');
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
      }
      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        setMode((m) => (m === 'rect' ? 'element' : 'rect'));
        setStart(null);
        setCurrent(null);
        setHoverRect(null);
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onCancel]);

  // Rect mode handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (mode !== 'rect') return;
    if (e.button !== 0) return;
    setStart({ x: e.clientX, y: e.clientY });
    setCurrent({ x: e.clientX, y: e.clientY });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (mode === 'rect') {
      if (!start) return;
      setCurrent({ x: e.clientX, y: e.clientY });
      return;
    }
    // element mode: find deepest element under cursor, excluding our host
    const stack = document.elementsFromPoint(e.clientX, e.clientY) as HTMLElement[];
    const target = stack.find((el) => {
      if (!el) return false;
      if (excludeHost && (el === excludeHost || excludeHost.contains(el))) return false;
      if (el === document.documentElement || el === document.body) return false;
      return true;
    });
    if (!target) {
      setHoverRect(null);
      return;
    }
    const r = target.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) {
      setHoverRect(null);
      return;
    }
    setHoverRect({
      x: Math.max(0, Math.floor(r.left)),
      y: Math.max(0, Math.floor(r.top)),
      w: Math.min(window.innerWidth - Math.max(0, Math.floor(r.left)), Math.ceil(r.width)),
      h: Math.min(window.innerHeight - Math.max(0, Math.floor(r.top)), Math.ceil(r.height)),
    });
    setHoverLabel(describeElement(target));
  };
  const handleMouseUp = (e: React.MouseEvent) => {
    if (mode !== 'rect') return;
    if (!start) return;
    const raw = normalizeRect(start.x, start.y, e.clientX, e.clientY);
    const rect = clampRectToViewport(raw, window.innerWidth, window.innerHeight);
    setStart(null);
    setCurrent(null);
    if (isRectTooSmall(rect)) {
      onCancel();
      return;
    }
    onComplete(rect);
  };
  const handleClick = (e: React.MouseEvent) => {
    if (mode !== 'element') return;
    if (!hoverRect) return;
    e.preventDefault();
    e.stopPropagation();
    onComplete(hoverRect);
  };

  const rect =
    mode === 'rect'
      ? start && current
        ? clampRectToViewport(
            normalizeRect(start.x, start.y, current.x, current.y),
            window.innerWidth,
            window.innerHeight,
          )
        : null
      : hoverRect;

  return (
    <div
      ref={rootRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      className={`overlay-root ${mode === 'element' ? 'mode-element' : 'mode-rect'}`}
    >
      {rect ? (
        <>
          <div
            className="overlay-rect"
            style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
          />
          <div
            className="overlay-dim-mask"
            style={{
              clipPath: `polygon(
                0 0, 100% 0, 100% 100%, 0 100%, 0 0,
                ${rect.x}px ${rect.y}px,
                ${rect.x}px ${rect.y + rect.h}px,
                ${rect.x + rect.w}px ${rect.y + rect.h}px,
                ${rect.x + rect.w}px ${rect.y}px,
                ${rect.x}px ${rect.y}px
              )`,
            }}
          />
          <div
            className="overlay-badge"
            style={{
              left: Math.min(rect.x + rect.w - 100, window.innerWidth - 110),
              top: Math.min(rect.y + rect.h + 10, window.innerHeight - 32),
            }}
          >
            {mode === 'element' && hoverLabel
              ? `${hoverLabel} · ${rect.w} × ${rect.h}`
              : `${rect.w} × ${rect.h}`}
          </div>
        </>
      ) : (
        <div className="overlay-dim-mask overlay-dim-full" />
      )}

      <div
        className="overlay-toolbar"
        onMouseDown={stopAll}
        onMouseUp={stopAll}
        onMouseMove={stopAll}
        onClick={stopAll}
      >
        <div className="overlay-segment" role="tablist">
          <button
            type="button"
            className={mode === 'element' ? 'active' : ''}
            onClick={(e) => {
              e.stopPropagation();
              setMode('element');
              setStart(null);
              setCurrent(null);
            }}
          >
            <CursorIcon /> 元素
          </button>
          <button
            type="button"
            className={mode === 'rect' ? 'active' : ''}
            onClick={(e) => {
              e.stopPropagation();
              setMode('rect');
              setHoverRect(null);
            }}
          >
            <RectIcon /> 框选
          </button>
        </div>
        <div className="overlay-hint">
          {mode === 'rect'
            ? '拖动选择任意区域'
            : '移动鼠标高亮元素，点击确认'}
          <span className="overlay-hint-sep" />
          <kbd>E</kbd> 切换模式
          <span className="overlay-hint-sep" />
          <kbd>Esc</kbd> 取消
        </div>
      </div>
    </div>
  );
}

function stopAll(e: React.SyntheticEvent) {
  e.stopPropagation();
}

function describeElement(el: HTMLElement): string {
  const tag = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : '';
  const cls = el.classList.length
    ? '.' + Array.from(el.classList).slice(0, 2).join('.')
    : '';
  return `${tag}${id}${cls}`.slice(0, 48);
}

function RectIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 12, height: 12 }}>
      <rect x="2.5" y="2.5" width="11" height="11" rx="1.5" strokeDasharray="2 1.5" />
    </svg>
  );
}
function CursorIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}>
      <path d="M3 3l4.5 10 1.7-4 4-1.7z" />
    </svg>
  );
}

export const OVERLAY_STYLES = `
:host, :root { all: initial; }
* { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', system-ui, sans-serif; letter-spacing: -0.003em; }
button { background: transparent; border: none; cursor: pointer; color: inherit; font: inherit; }

.overlay-root {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  user-select: none;
}
.mode-rect { cursor: crosshair; }
.mode-element { cursor: pointer; }
.overlay-dim-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.42);
  pointer-events: none;
}
.overlay-dim-full { background: rgba(0, 0, 0, 0.28); }
.overlay-rect {
  position: absolute;
  border: 1.5px solid #ffffff;
  border-radius: 4px;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.35);
  pointer-events: none;
}
.overlay-badge {
  position: absolute;
  padding: 5px 12px;
  background: rgba(28, 28, 30, 0.85);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  backdrop-filter: blur(16px) saturate(180%);
  color: #ffffff;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  font-weight: 500;
  border-radius: 980px;
  letter-spacing: -0.005em;
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.overlay-toolbar {
  position: absolute;
  left: 50%;
  top: 28px;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px 6px 6px;
  background: rgba(28, 28, 30, 0.78);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  backdrop-filter: blur(20px) saturate(180%);
  color: #ffffff;
  border-radius: 980px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.25);
}
.overlay-segment {
  display: flex;
  gap: 2px;
  padding: 2px;
  background: rgba(255,255,255,0.08);
  border-radius: 980px;
}
.overlay-segment button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 500;
  color: rgba(255,255,255,0.7);
  border-radius: 980px;
  transition: background 160ms ease, color 160ms ease;
}
.overlay-segment button:hover { color: #ffffff; }
.overlay-segment button.active {
  background: rgba(255,255,255,0.18);
  color: #ffffff;
}
.overlay-hint {
  font-size: 12px;
  color: rgba(255,255,255,0.85);
  display: flex;
  align-items: center;
  gap: 8px;
  padding-right: 8px;
}
.overlay-hint kbd {
  display: inline-block;
  background: rgba(255,255,255,0.16);
  padding: 2px 7px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
}
.overlay-hint-sep {
  width: 1px; height: 11px;
  background: rgba(255,255,255,0.25);
  display: inline-block;
}
`;

export { MSG };
