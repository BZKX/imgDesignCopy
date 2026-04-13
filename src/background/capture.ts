import type { SelectionRect } from '@/lib/messages';

export function stripDataUrlPrefix(dataUrl: string): string {
  const comma = dataUrl.indexOf(',');
  if (comma < 0) return dataUrl;
  return dataUrl.slice(comma + 1);
}

// Prefer FileReader.readAsDataURL then slice — roughly 2-4x faster than
// manual ArrayBuffer -> String.fromCharCode -> btoa for large blobs, because
// the browser implements base64 in native code.
export async function blobToBase64(blob: Blob): Promise<string> {
  const maybeReader = typeof FileReader !== 'undefined';
  if (maybeReader) {
    try {
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const r = reader.result;
          if (typeof r !== 'string') {
            reject(new Error('FileReader did not return string'));
            return;
          }
          resolve(stripDataUrlPrefix(r));
        };
        reader.onerror = () => reject(reader.error ?? new Error('FileReader failed'));
        reader.readAsDataURL(blob);
      });
    } catch {
      /* fall through to ArrayBuffer path */
    }
  }
  const buf = await readBlobAsArrayBuffer(blob);
  const bytes = new Uint8Array(buf);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function readBlobAsArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  const maybe = blob as Blob & { arrayBuffer?: () => Promise<ArrayBuffer> };
  if (typeof maybe.arrayBuffer === 'function') {
    return maybe.arrayBuffer();
  }
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error ?? new Error('FileReader failed'));
    reader.readAsArrayBuffer(blob);
  });
}

// Vision models don't benefit from > ~1536px on the long edge. Scaling down
// on client side drops payload size and speeds up both our encode and the
// server-side decode/inference.
const MAX_EDGE = 1280;
const JPEG_QUALITY = 0.85;

export async function cropToBase64(
  dataUrl: string,
  rect: SelectionRect,
  dpr: number,
): Promise<{ base64: string; blob: Blob; mime: string }> {
  const res = await fetch(dataUrl);
  const srcBlob = await res.blob();
  const bitmap = await createImageBitmap(srcBlob);

  const rawW = Math.max(1, Math.round(rect.w * dpr));
  const rawH = Math.max(1, Math.round(rect.h * dpr));

  // Downscale so the longer edge <= MAX_EDGE.
  const scale = Math.min(1, MAX_EDGE / Math.max(rawW, rawH));
  const targetW = Math.max(1, Math.round(rawW * scale));
  const targetH = Math.max(1, Math.round(rawH * scale));

  const canvas = new OffscreenCanvas(targetW, targetH);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to acquire 2d context on OffscreenCanvas.');
  // drawImage supports the full src->dst mapping, which also handles our
  // scale + crop in one call — cheaper than cropping first then scaling.
  ctx.drawImage(
    bitmap,
    rect.x * dpr, rect.y * dpr, rawW, rawH, // source
    0, 0, targetW, targetH,                  // destination
  );
  bitmap.close?.();

  const outBlob = await canvas.convertToBlob({
    type: 'image/jpeg',
    quality: JPEG_QUALITY,
  });
  const base64 = await blobToBase64(outBlob);
  return { base64, blob: outBlob, mime: 'image/jpeg' };
}
