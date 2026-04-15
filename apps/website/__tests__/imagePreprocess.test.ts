/**
 * Unit tests for imagePreprocess utilities.
 * Uses jsdom — canvas API is mocked via a lightweight stub.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FileTooLargeError, preprocessImage } from '../components/sections/Demo/imagePreprocess';

// ---- Canvas / createImageBitmap stubs ----

const MOCK_BASE64 = 'bW9ja0ltYWdlRGF0YQ=='; // "mockImageData" in base64

function makeCanvasStub(w: number, h: number) {
  return {
    width: w,
    height: h,
    getContext: () => ({
      drawImage: vi.fn(),
    }),
    toDataURL: (_mime: string, _quality: number) =>
      `data:image/jpeg;base64,${MOCK_BASE64}`,
  };
}

beforeEach(() => {
  vi.stubGlobal('createImageBitmap', async (_source: Blob) => ({
    width: 2000,
    height: 1500,
    close: vi.fn(),
  }));

  vi.stubGlobal('document', {
    createElement: (tag: string) => {
      if (tag === 'canvas') return makeCanvasStub(0, 0);
      return {};
    },
  });
});

describe('FileTooLargeError', () => {
  it('message includes file size in MB', () => {
    const err = new FileTooLargeError(5 * 1_048_576);
    expect(err.message).toContain('5.0 MB');
    expect(err.name).toBe('FileTooLargeError');
  });
});

describe('preprocessImage', () => {
  it('throws FileTooLargeError for files > 4 MB', async () => {
    const bigBlob = new Blob([new Uint8Array(5 * 1_048_576)], { type: 'image/jpeg' });
    await expect(preprocessImage(bigBlob)).rejects.toThrow(FileTooLargeError);
  });

  it('returns ProcessedImage with correct mime', async () => {
    const blob = new Blob([new Uint8Array(100)], { type: 'image/png' });
    const result = await preprocessImage(blob);
    expect(result.mime).toBe('image/jpeg');
    expect(result.base64).toBe(MOCK_BASE64);
  });

  it('downscales image exceeding 1568px long edge', async () => {
    // createImageBitmap stub returns 2000×1500 → scale = 1568/2000 = 0.784
    const blob = new Blob([new Uint8Array(100)], { type: 'image/png' });
    const result = await preprocessImage(blob);
    // width should be 2000 * (1568/2000) = 1568
    expect(result.width).toBe(1568);
    expect(result.height).toBe(Math.round(1500 * (1568 / 2000)));
  });

  it('does not upscale small images', async () => {
    vi.stubGlobal('createImageBitmap', async () => ({
      width: 800,
      height: 600,
      close: vi.fn(),
    }));
    const blob = new Blob([new Uint8Array(100)], { type: 'image/png' });
    const result = await preprocessImage(blob);
    expect(result.width).toBe(800);
    expect(result.height).toBe(600);
  });
});
