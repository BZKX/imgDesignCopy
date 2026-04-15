import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { OverlayApp, OVERLAY_STYLES } from './overlay';
import { SIDE_PANEL_STYLES } from './styles';

const isOverlay = new URLSearchParams(window.location.search).get('overlay') === '1';

const style = document.createElement('style');
style.textContent = isOverlay ? OVERLAY_STYLES : SIDE_PANEL_STYLES;
document.head.appendChild(style);

// Drawer mode: the Tauri window is full-screen transparent; the panel is
// right-anchored 440px and the rest of the surface is a click-to-dismiss layer.
if (!isOverlay) {
  const reset = document.createElement('style');
  reset.textContent = `
    html, body, #root { margin:0; padding:0; height:100%; width:100%; background:transparent !important; overflow:hidden; }
    .drawer-shell.panel { position:absolute; top:44px; right:16px; bottom:96px; left:auto; width:440px; max-width:calc(100vw - 32px); }
    .drawer-dismiss { position:fixed; inset:0; background:transparent; z-index:2147483645; }
  `;
  document.head.appendChild(reset);
}

const root = document.getElementById('root');
if (!root) throw new Error('#root not found');

createRoot(root).render(
  <React.StrictMode>
    {isOverlay ? <OverlayApp /> : <App />}
  </React.StrictMode>,
);
