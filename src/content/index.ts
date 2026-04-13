import { createRoot, type Root } from 'react-dom/client';
import { createElement } from 'react';
import { Overlay, OVERLAY_STYLES } from './overlay';
import { SidePanel } from './side-panel';
import { SIDE_PANEL_STYLES } from './side-panel-styles';
import {
  MSG,
  type Img2PromptMessage,
  type SelectionRect,
} from '@/lib/messages';

const OVERLAY_HOST_ID = 'img2prompt-overlay-host';
const PANEL_HOST_ID = 'img2prompt-panel-host';

let overlayRoot: Root | null = null;
let overlayHost: HTMLDivElement | null = null;

let panelRoot: Root | null = null;
let panelHost: HTMLDivElement | null = null;
let panelMountPoint: HTMLDivElement | null = null;
let latestIncoming: Img2PromptMessage | null = null;
let panelCloser: (() => void) | null = null;

function mountOverlay() {
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
      onComplete: (rect: SelectionRect) => {
        chrome.runtime.sendMessage({
          type: MSG.SELECTION_COMPLETE,
          rect,
          dpr: window.devicePixelRatio || 1,
          pageUrl: location.href,
        });
        unmountOverlay();
      },
      onCancel: () => {
        chrome.runtime.sendMessage({ type: MSG.SELECTION_CANCEL });
        unmountOverlay();
        // Esc → bring the panel back in launcher mode with its slide-in animation.
        renderPanel({ initial: 'launcher' });
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

chrome.runtime.onMessage.addListener((msg: unknown) => {
  const m = msg as { type?: string };
  if (!m || typeof m !== 'object') return;
  console.log('[img2prompt][content] received', m.type);

  if (m.type === MSG.START_SELECTION) {
    // If panel is open, collapse it in parallel with overlay mount so the two
    // motions feel simultaneous rather than sequential.
    closePanelAnimated();
    mountOverlay();
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
