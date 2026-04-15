import { invoke } from '@tauri-apps/api/core';
import { listen, once } from '@tauri-apps/api/event';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';

export interface CaptureResult {
  base64: string;
  width: number;
  height: number;
  mime: string;
}

export interface Region {
  x: number;
  y: number;
  w: number;
  h: number;
  dpr?: number;
}

export async function captureScreen(region?: Region): Promise<CaptureResult> {
  return invoke<CaptureResult>('capture_screen', { region: region ?? null });
}

/**
 * Hides the main window, shows the fullscreen overlay, and resolves when the
 * user either completes a region selection (captured) or cancels (Esc / tiny rect).
 * Cancellation rejects with `Error("CAPTURE_CANCELLED")`.
 */
export async function captureRegionViaOverlay(): Promise<CaptureResult> {
  const main = getCurrentWebviewWindow();
  await main.hide();
  await invoke('show_overlay');

  return new Promise<CaptureResult>((resolve, reject) => {
    let unCaptured: (() => void) | null = null;
    let unCancel: (() => void) | null = null;
    let unError: (() => void) | null = null;
    const cleanup = () => {
      unCaptured?.();
      unCancel?.();
      unError?.();
    };
    once<CaptureResult>('region-captured', (e) => {
      cleanup();
      resolve(e.payload);
    }).then((u) => (unCaptured = u));
    once<unknown>('region-cancelled', () => {
      cleanup();
      reject(new Error('CAPTURE_CANCELLED'));
    }).then((u) => (unCancel = u));
    once<{ message: string }>('region-error', (e) => {
      cleanup();
      reject(new Error(e.payload?.message ?? 'capture failed'));
    }).then((u) => (unError = u));
  }).finally(async () => {
    await invoke('hide_overlay').catch(() => {});
    await main.show().catch(() => {});
    await main.setFocus().catch(() => {});
  });
}

// Re-export for parity with previous listen-based API
export { listen };
