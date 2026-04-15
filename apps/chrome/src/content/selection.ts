import type { SelectionRect } from '@promptlens/core';

export function normalizeRect(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
): SelectionRect {
  const x = Math.min(startX, endX);
  const y = Math.min(startY, endY);
  const w = Math.abs(endX - startX);
  const h = Math.abs(endY - startY);
  return { x, y, w, h };
}

export function clampRectToViewport(
  rect: SelectionRect,
  viewportW: number,
  viewportH: number,
): SelectionRect {
  const x = Math.max(0, Math.min(rect.x, viewportW));
  const y = Math.max(0, Math.min(rect.y, viewportH));
  const w = Math.max(0, Math.min(rect.w, viewportW - x));
  const h = Math.max(0, Math.min(rect.h, viewportH - y));
  return { x, y, w, h };
}

export function isRectTooSmall(rect: SelectionRect, min = 4): boolean {
  return rect.w < min || rect.h < min;
}
