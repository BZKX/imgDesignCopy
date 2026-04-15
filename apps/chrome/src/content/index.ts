import { createRoot, type Root } from 'react-dom/client';
import { createElement } from 'react';
import { Overlay, OVERLAY_STYLES } from './overlay';
import { SidePanel } from './side-panel';
import { SIDE_PANEL_STYLES } from './side-panel-styles';
import {
  MSG,
  type Img2PromptMessage,
  type SelectionRect,
} from '@promptlens/core';
import { DEFAULT_MODE, isMode, type Mode } from '@promptlens/core';
import { isExtensionAlive, safeSend } from './panel-utils';
import { readUiLanguageOnce, t as tr } from '@/lib/i18n';

let toastTimer: number | null = null;
function showStaleToast(message: string): void {
  const id = 'img2prompt-stale-toast';
  let el = document.getElementById(id) as HTMLDivElement | null;
  if (!el) {
    el = document.createElement('div');
    el.id = id;
    el.style.cssText = [
      'position:fixed',
      'left:50%',
      'top:32px',
      'transform:translateX(-50%)',
      'z-index:2147483647',
      'padding:10px 16px',
      'background:rgba(28,28,30,0.92)',
      'color:#fff',
      'font:500 13px/1.4 -apple-system,BlinkMacSystemFont,system-ui,sans-serif',
      'border-radius:999px',
      'box-shadow:0 6px 24px rgba(0,0,0,0.25)',
      'pointer-events:none',
      'backdrop-filter:blur(16px) saturate(180%)',
      '-webkit-backdrop-filter:blur(16px) saturate(180%)',
    ].join(';');
    document.documentElement.appendChild(el);
  }
  el.textContent = message;
  if (toastTimer != null) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el?.remove(), 3200);
}

const OVERLAY_HOST_ID = 'img2prompt-overlay-host';
const PANEL_HOST_ID = 'img2prompt-panel-host';

let overlayRoot: Root | null = null;
let overlayHost: HTMLDivElement | null = null;

let panelRoot: Root | null = null;
let panelHost: HTMLDivElement | null = null;
let panelMountPoint: HTMLDivElement | null = null;
let latestIncoming: Img2PromptMessage | null = null;
let panelCloser: (() => void) | null = null;

function mountOverlay(mode: Mode, lang: 'zh' | 'en') {
  if (overlayHost) return;
  overlayHost = document.createElement('div');
  overlayHost.id = OVERLAY_HOST_ID;
  overlayHost.style.all = 'initial';
  const shadow = overlayHost.attachShadow({ mode: 'open' });
  const styleEl = document.createElement('style');
  styleEl.textContent = OVERLAY_STYLES;
  shadow.appendChild(styleEl);
  const mount = document.createElement('div');
  shadow.appendChild(mount);
  document.documentElement.appendChild(overlayHost);

  overlayRoot = createRoot(mount);
  overlayRoot.render(
    createElement(Overlay, {
      excludeHost: overlayHost,
      mode,
      lang,
      onComplete: (rect: SelectionRect) => {
        // mode is closed over from mountOverlay arg — frozen at mount per plan §8a.
        const ok = safeSend({
          type: MSG.SELECTION_COMPLETE,
          rect,
          dpr: window.devicePixelRatio || 1,
          pageUrl: location.href,
          mode,
        });
        unmountOverlay();
        if (!ok) {
          showStaleToast(tr('error.stale', lang));
          unmountPanel();
        }
      },
      onCancel: () => {
        safeSend({ type: MSG.SELECTION_CANCEL });
        unmountOverlay();
        if (isExtensionAlive()) renderPanel({ initial: 'launcher' });
        else showStaleToast(tr('error.stale', lang));
      },
    }),
  );
}

function unmountOverlay() {
  if (overlayRoot) {
    overlayRoot.unmount();
    overlayRoot = null;
  }
  if (overlayHost && overlayHost.parentNode) {
    overlayHost.parentNode.removeChild(overlayHost);
  }
  overlayHost = null;
}

function ensurePanelMounted(): void {
  if (panelHost) return;
  panelHost = document.createElement('div');
  panelHost.id = PANEL_HOST_ID;
  panelHost.style.all = 'initial';
  const shadow = panelHost.attachShadow({ mode: 'open' });
  const styleEl = document.createElement('style');
  styleEl.textContent = SIDE_PANEL_STYLES;
  shadow.appendChild(styleEl);
  panelMountPoint = document.createElement('div');
  shadow.appendChild(panelMountPoint);
  document.documentElement.appendChild(panelHost);
  panelRoot = createRoot(panelMountPoint);
}

function unmountPanel(): void {
  if (panelRoot) {
    panelRoot.unmount();
    panelRoot = null;
  }
  if (panelHost && panelHost.parentNode) {
    panelHost.parentNode.removeChild(panelHost);
  }
  panelHost = null;
  panelMountPoint = null;
  panelCloser = null;
  latestIncoming = null;
}

function renderPanel(opts: { initial?: 'launcher'; incoming?: Img2PromptMessage | null }) {
  ensurePanelMounted();
  if (!panelRoot) return;
  if (opts.incoming !== undefined) {
    latestIncoming = opts.incoming;
  }
  panelRoot.render(
    createElement(SidePanel, {
      initialView: { kind: 'launcher' },
      incoming: latestIncoming,
      onClose: unmountPanel,
      registerCloser: (fn: () => void) => {
        panelCloser = fn;
      },
    }),
  );
}

function closePanelAnimated(): void {
  if (panelCloser) {
    panelCloser();
    panelCloser = null;
  }
}

export async function resolveModeForSelection(): Promise<Mode> {
  try {
    const res = await chrome.storage.sync.get('mode');
    const raw = (res as { mode?: unknown }).mode;
    if (isMode(raw)) return raw;
  } catch {
    /* fall through with DEFAULT_MODE */
  }
  return DEFAULT_MODE;
}

async function startSelection() {
  const [mode, lang] = await Promise.all([
    resolveModeForSelection(),
    readUiLanguageOnce(),
  ]);
  closePanelAnimated();
  mountOverlay(mode, lang);
}

chrome.runtime.onMessage.addListener((msg: unknown) => {
  const m = msg as { type?: string };
  if (!m || typeof m !== 'object') return;
  console.log('[img2prompt][content] received', m.type);

  if (m.type === MSG.START_SELECTION) {
    void startSelection();
    return;
  }
  if (m.type === MSG.PANEL_OPEN) {
    renderPanel({ initial: 'launcher' });
    return;
  }
  if (m.type === MSG.LOADING || m.type === MSG.RESULT || m.type === MSG.ERROR) {
    renderPanel({ incoming: msg as Img2PromptMessage });
    return;
  }
});

export {};
