/**
 * Image preprocessing for the Demo section.
 * Enforces the 4 MB client-side size gate, downscales to max 1568px long edge,
 * and re-encodes as JPEG 0.85 (strips EXIF / GPS — privacy bonus).
 * Only dimensions + byte size are logged — never image bytes.
 */

export class FileTooLargeError extends Error {
  constructor(bytes: number) {
    super(`File too large: ${(bytes / 1_048_576).toFixed(1)} MB (max 4 MB)`);
    this.name = 'FileTooLargeError';
  }
}

export interface ProcessedImage {
  base64: string;
  mime: 'image/jpeg';
  width: number;
  height: number;
  byteSize: number;
}

const MAX_BYTES = 4 * 1_048_576; // 4 MB
const MAX_LONG_EDGE = 1568;
const JPEG_QUALITY = 0.85;

export async function preprocessImage(source: File | Blob): Promise<ProcessedImage> {
  if (source.size > MAX_BYTES) {
    throw new FileTooLargeError(source.size);
  }

  const bitmap = await createImageBitmap(source);
  const { width: origW, height: origH } = bitmap;

  // Scale down if needed
  const scale = Math.min(1, MAX_LONG_EDGE / Math.max(origW, origH));
  const w = Math.round(origW * scale);
  const h = Math.round(origH * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  // dataUrl = "data:image/jpeg;base64,<base64>"
  const base64 = dataUrl.slice('data:image/jpeg;base64,'.length);
  const byteSize = Math.round((base64.length * 3) / 4);

  return { base64, mime: 'image/jpeg', width: w, height: h, byteSize };
}
