import { describe, expect, it } from 'vitest';
import { blobToBase64, stripDataUrlPrefix } from '../capture';

describe('stripDataUrlPrefix', () => {
  it('strips standard data URL prefix', () => {
    const input = 'data:image/png;base64,iVBORw0KGgo=';
    expect(stripDataUrlPrefix(input)).toBe('iVBORw0KGgo=');
  });

  it('returns input unchanged when no comma', () => {
    expect(stripDataUrlPrefix('iVBORw0KGgo=')).toBe('iVBORw0KGgo=');
  });

  it('handles empty payload after comma', () => {
    expect(stripDataUrlPrefix('data:image/png;base64,')).toBe('');
  });
});

describe('blobToBase64', () => {
  it('round-trips bytes via base64', async () => {
    const bytes = new Uint8Array([0, 1, 2, 3, 250, 251, 252, 253, 254, 255]);
    const blob = new Blob([bytes]);
    const b64 = await blobToBase64(blob);
    const decoded = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    expect(Array.from(decoded)).toEqual(Array.from(bytes));
  });

  it('returns empty string for empty blob', async () => {
    const b64 = await blobToBase64(new Blob([]));
    expect(b64).toBe('');
  });
});
