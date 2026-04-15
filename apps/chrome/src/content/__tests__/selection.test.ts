import { describe, expect, it } from 'vitest';
import { clampRectToViewport, isRectTooSmall, normalizeRect } from '../selection';

describe('normalizeRect', () => {
  it('handles drag right-down', () => {
    expect(normalizeRect(10, 20, 110, 120)).toEqual({ x: 10, y: 20, w: 100, h: 100 });
  });

  it('handles drag up-left (negative direction)', () => {
    expect(normalizeRect(200, 150, 50, 40)).toEqual({ x: 50, y: 40, w: 150, h: 110 });
  });

  it('handles zero-size selection', () => {
    expect(normalizeRect(5, 5, 5, 5)).toEqual({ x: 5, y: 5, w: 0, h: 0 });
  });

  it('handles mixed directions', () => {
    expect(normalizeRect(100, 50, 40, 200)).toEqual({ x: 40, y: 50, w: 60, h: 150 });
  });
});

describe('clampRectToViewport', () => {
  it('clamps overflow on right/bottom', () => {
    expect(clampRectToViewport({ x: 900, y: 500, w: 300, h: 400 }, 1000, 800)).toEqual({
      x: 900,
      y: 500,
      w: 100,
      h: 300,
    });
  });

  it('clamps negative origin to 0', () => {
    expect(clampRectToViewport({ x: -50, y: -20, w: 100, h: 60 }, 1000, 800)).toEqual({
      x: 0,
      y: 0,
      w: 100,
      h: 60,
    });
  });
});

describe('isRectTooSmall', () => {
  it('detects tiny selections', () => {
    expect(isRectTooSmall({ x: 0, y: 0, w: 2, h: 2 })).toBe(true);
  });
  it('accepts normal selections', () => {
    expect(isRectTooSmall({ x: 0, y: 0, w: 20, h: 20 })).toBe(false);
  });
});
