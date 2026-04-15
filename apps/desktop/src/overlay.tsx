import { useEffect, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { emit } from '@tauri-apps/api/event';

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface CaptureResult {
  base64: string;
  width: number;
  height: number;
  mime: string;
}

function normalize(x1: number, y1: number, x2: number, y2: number): Rect {
  const x = Math.min(x1, x2);
  const y = Math.min(y1, y2);
  return { x, y, w: Math.abs(x2 - x1), h: Math.abs(y2 - y1) };
}

export function OverlayApp() {
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);
  const [cur, setCur] = useState<{ x: number; y: number } | null>(null);
  const cancelling = useRef(false);

  const cancel = async () => {
    if (cancelling.current) return;
    cancelling.current = true;
    await emit('region-cancelled', {});
    await invoke('hide_overlay').catch(() => {});
    await invoke('show_drawer').catch(() => {});
  };

  const complete = async (rect: Rect) => {
    if (cancelling.current) return;
    cancelling.current = true;
    // Hide overlay BEFORE capturing so it doesn't appear in the screenshot.
    try {
      await getCurrentWebviewWindow().hide();
    } catch { /* noop */ }
    // Small delay to let compositor unmount the transparent surface.
    await new Promise((r) => setTimeout(r, 120));
    const dpr = window.devicePixelRatio || 1;
    try {
      const shot = await invoke<CaptureResult>('capture_screen', {
        region: { x: rect.x, y: rect.y, w: rect.w, h: rect.h, dpr },
      });
      await emit('region-captured', shot);
    } catch (err) {
      await emit('region-error', { message: String(err) });
    }
    await invoke('hide_overlay').catch(() => {});
    await invoke('show_drawer').catch(() => {});
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        void cancel();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    cancelling.current = false;
    setStart({ x: e.clientX, y: e.clientY });
    setCur({ x: e.clientX, y: e.clientY });
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!start) return;
    setCur({ x: e.clientX, y: e.clientY });
  };
  const onMouseUp = (e: React.MouseEvent) => {
    if (!start) return;
    const rect = normalize(start.x, start.y, e.clientX, e.clientY);
    setStart(null);
    setCur(null);
    if (rect.w < 8 || rect.h < 8) {
      void cancel();
      return;
    }
    void complete(rect);
  };

  const rect = start && cur ? normalize(start.x, start.y, cur.x, cur.y) : null;

  return (
    <div
      className="overlay-root"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
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
            {rect.w} × {rect.h}
          </div>
        </>
      ) : (
        <div className="overlay-dim-mask overlay-dim-full" />
      )}
      <div className="overlay-toolbar">
        <span className="overlay-hint">拖动选择区域 · <kbd>Esc</kbd> 取消</span>
      </div>
    </div>
  );
}

export const OVERLAY_STYLES = `
html, body, #root { margin: 0; padding: 0; width: 100%; height: 100%; background: transparent; overflow: hidden; }
* { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', system-ui, sans-serif; }
.overlay-root { position: fixed; inset: 0; cursor: crosshair; user-select: none; }
.overlay-dim-mask { position: absolute; inset: 0; background: rgba(0,0,0,0.42); pointer-events: none; }
.overlay-dim-full { background: rgba(0,0,0,0.28); }
.overlay-rect { position: absolute; border: 1.5px solid #fff; border-radius: 4px; box-shadow: 0 0 0 1px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.35); pointer-events: none; }
.overlay-badge { position: absolute; padding: 5px 12px; background: rgba(28,28,30,0.85); color: #fff; font-size: 12px; font-variant-numeric: tabular-nums; font-weight: 500; border-radius: 980px; pointer-events: none; }
.overlay-toolbar { position: absolute; left: 50%; top: 28px; transform: translateX(-50%); padding: 8px 16px; background: rgba(28,28,30,0.78); color: #fff; border-radius: 980px; pointer-events: none; }
.overlay-hint { font-size: 12px; color: rgba(255,255,255,0.85); }
.overlay-hint kbd { background: rgba(255,255,255,0.16); padding: 2px 7px; border-radius: 6px; font-size: 11px; font-weight: 600; margin: 0 2px; }
`;
