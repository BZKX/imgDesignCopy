export const SIDE_PANEL_STYLES = `
:host, :root { all: initial; }
* { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', system-ui, sans-serif; letter-spacing: -0.003em; }
input, select, button, textarea { font-family: inherit; font-size: inherit; color: inherit; }

.panel {
  position: fixed;
  top: 16px;
  right: 16px;
  bottom: 16px;
  width: 440px;
  max-width: calc(100vw - 32px);
  background: rgba(255, 255, 255, 0.86);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  backdrop-filter: blur(24px) saturate(180%);
  border-radius: 22px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.14), 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  z-index: 2147483646;
  color: #1d1d1f;
  overflow: hidden;
  transform: translateX(calc(100% + 24px));
  opacity: 0;
  transition: transform 320ms cubic-bezier(0.22, 1, 0.36, 1), opacity 240ms ease;
}
.panel.open { transform: translateX(0); opacity: 1; }

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  min-height: 56px;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.brand {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.015em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.brand-dot {
  display: inline-block;
  width: 10px; height: 10px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0071e3, #5e5ce6);
  flex-shrink: 0;
}
.header-actions { display: flex; gap: 2px; }
.icon-btn {
  width: 30px; height: 30px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #515154;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 160ms ease, color 160ms ease;
}
.icon-btn:hover { background: rgba(0,0,0,0.06); color: #1d1d1f; }
.icon-btn svg { width: 15px; height: 15px; }

.body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  animation: fade-in 220ms ease;
}
@keyframes fade-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
.body::-webkit-scrollbar { width: 10px; }
.body::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 8px; border: 3px solid transparent; background-clip: padding-box; }
.body::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.28); border: 3px solid transparent; background-clip: padding-box; }

/* ---------- Launcher ---------- */
.launcher { display: flex; flex-direction: column; gap: 16px; }
.hero-card {
  background: linear-gradient(135deg, #f5f5f7 0%, #ebebed 100%);
  border-radius: 20px;
  padding: 28px 24px;
  text-align: center;
  animation: hero-swap 280ms cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes hero-swap {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
.hero-eyebrow {
  font-size: 11.5px;
  font-weight: 600;
  color: #86868b;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 12px;
}
.hero-title {
  font-size: 22px;
  line-height: 1.2;
  font-weight: 600;
  letter-spacing: -0.022em;
  color: #1d1d1f;
  margin-bottom: 20px;
}
.btn-lg { font-size: 14px; padding: 11px 22px; }
.shortcut-row {
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex-wrap: wrap;
}
.shortcut-sep { color: #c7c7cc; margin: 0 4px; }
.shortcut-hint { margin-left: 8px; font-size: 11px; color: #86868b; }
.kbd {
  display: inline-flex;
  min-width: 22px;
  justify-content: center;
  align-items: center;
  background: #ffffff;
  color: #1d1d1f;
  padding: 2px 7px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  border: 1px solid rgba(0,0,0,0.08);
  box-shadow: 0 1px 0 rgba(0,0,0,0.04);
}

.warning-banner {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  background: #fff5f0;
  color: #a1501a;
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 12.5px;
}

.tile-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.tile {
  background: #f5f5f7;
  border: none;
  border-radius: 16px;
  padding: 18px 16px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-start;
  text-align: left;
  color: #1d1d1f;
  transition: background 160ms ease, transform 120ms ease;
}
.tile:hover { background: #ebebed; }
.tile:active { transform: scale(0.98); }
.tile svg { width: 18px; height: 18px; color: #0071e3; }
.tile-label { font-size: 14px; font-weight: 600; letter-spacing: -0.01em; }
.tile-desc { font-size: 11.5px; color: #86868b; }

/* ---------- Result / Hero image ---------- */
.hero {
  background: #f5f5f7;
  border-radius: 16px;
  padding: 12px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 140px;
  max-height: 220px;
  overflow: hidden;
}
.hero img {
  max-width: 100%;
  max-height: 196px;
  object-fit: contain;
  border-radius: 10px;
  display: block;
}

.segment {
  background: rgba(0,0,0,0.05);
  border-radius: 10px;
  padding: 3px;
  display: flex;
  gap: 2px;
  margin-bottom: 16px;
}
.segment button {
  flex: 1;
  background: transparent;
  border: none;
  padding: 7px 10px;
  font-size: 12.5px;
  font-weight: 500;
  color: #515154;
  border-radius: 8px;
  cursor: pointer;
  transition: background 180ms ease, color 180ms ease, box-shadow 180ms ease;
  letter-spacing: -0.005em;
}
.segment button.active {
  background: #ffffff;
  color: #1d1d1f;
  box-shadow: 0 1px 2px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.04);
  font-weight: 600;
}

.prompt-card {
  background: #ffffff;
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 12px;
}
.prompt-card-label {
  font-size: 11px;
  font-weight: 600;
  color: #86868b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}
.prompt-text {
  font-family: -apple-system, 'SF Pro Text', system-ui, sans-serif;
  font-size: 13px;
  line-height: 1.55;
  color: #1d1d1f;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 240px;
  overflow-y: auto;
}

.actions { display: flex; gap: 8px; align-items: center; margin-top: 12px; flex-wrap: wrap; }

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: none;
  border-radius: 980px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 160ms ease, color 160ms ease, transform 120ms ease, opacity 160ms ease;
  letter-spacing: -0.005em;
  -webkit-tap-highlight-color: transparent;
}
.btn:active { transform: scale(0.97); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary { background: #0071e3; color: #ffffff; }
.btn-primary:hover:not(:disabled) { background: #0077ed; }
.btn-primary:active:not(:disabled) { background: #006edb; }
.btn-secondary { background: rgba(0,0,0,0.06); color: #1d1d1f; }
.btn-secondary:hover:not(:disabled) { background: rgba(0,0,0,0.09); }
.btn-danger { background: #ff3b30; color: #ffffff; }
.btn-danger:hover:not(:disabled) { filter: brightness(1.06); }
.btn-sm { font-size: 11.5px; padding: 5px 12px; }

.toast {
  font-size: 12px;
  color: #34c759;
  font-weight: 500;
  opacity: 0;
  transform: translateX(-4px);
  transition: opacity 180ms ease, transform 180ms ease;
}
.toast.visible { opacity: 1; transform: translateX(0); }

.collapse-trigger {
  background: none;
  border: none;
  color: #0071e3;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 0;
  margin-top: 4px;
}
.collapse-trigger:hover { text-decoration: underline; }

.sub-card {
  background: #f5f5f7;
  border-radius: 12px;
  padding: 10px 12px;
  margin-top: 8px;
}
.sub-card-label {
  font-size: 11px;
  font-weight: 600;
  color: #86868b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}
.sub-card pre {
  font-family: -apple-system, 'SF Pro Text', system-ui, sans-serif;
  font-size: 12.5px;
  line-height: 1.5;
  color: #1d1d1f;
  white-space: pre-wrap;
  word-break: break-word;
}

/* ---------- Mode segment ---------- */
.mode-segment {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: rgba(0,0,0,0.05);
  border-radius: 12px;
}
.mode-segment-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 8px 6px;
  font-size: 12px;
  font-weight: 500;
  color: #515154;
  background: transparent;
  border: none;
  border-radius: 9px;
  cursor: pointer;
  transition: background 160ms ease, color 160ms ease, box-shadow 160ms ease;
  letter-spacing: -0.005em;
}
.mode-segment-btn:hover { color: #1d1d1f; }
.mode-segment-btn--active {
  background: #ffffff;
  color: #1d1d1f;
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.04);
}
.mode-segment-icon { font-size: 14px; line-height: 1; }
.mode-segment-label { white-space: nowrap; }

/* ---------- Result mode label ---------- */
.result-mode {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: rgba(0,113,227,0.08);
  color: #0071e3;
  border-radius: 980px;
  font-size: 11.5px;
  font-weight: 600;
  margin-bottom: 12px;
  letter-spacing: -0.005em;
}
.result-mode-icon { font-size: 13px; line-height: 1; }

/* ---------- Stepper ---------- */
.stepper-state {
  align-items: stretch;
  padding: 32px 24px;
}
.stepper {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
}
.stepper-step {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  min-height: 36px;
}
.stepper-rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  padding-top: 4px;
}
.stepper-dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  background: rgba(0,0,0,0.18);
  transition: background 200ms ease, box-shadow 200ms ease;
}
.stepper-line {
  width: 2px;
  flex: 1;
  min-height: 14px;
  background: rgba(0,0,0,0.08);
  margin-top: 4px;
}
.stepper-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-bottom: 8px;
}
.stepper-label {
  font-size: 13px;
  font-weight: 500;
  color: #515154;
  letter-spacing: -0.005em;
}
.stepper-elapsed {
  font-size: 11.5px;
  color: #86868b;
  font-variant-numeric: tabular-nums;
}
.stepper-elapsed--done { color: #34c759; }
.stepper-step--current .stepper-dot {
  background: #0071e3;
  box-shadow: 0 0 0 4px rgba(0,113,227,0.18);
  animation: stepper-pulse 1.2s ease-in-out infinite;
}
.stepper-step--current .stepper-label { color: #1d1d1f; font-weight: 600; }
.stepper-step--done .stepper-dot {
  background: #34c759;
  box-shadow: 0 0 0 0 rgba(52,199,89,0);
}
.stepper-step--done .stepper-label { color: #1d1d1f; }
.stepper-step--failed .stepper-dot { background: #ff3b30; }
.stepper-step--failed .stepper-label { color: #ff3b30; font-weight: 600; }
.stepper-step--pending .stepper-label { color: #aeaeb2; }
.stepper-error { color: #ff3b30; font-weight: 500; }
@keyframes stepper-pulse {
  0%, 100% { box-shadow: 0 0 0 4px rgba(0,113,227,0.18); }
  50% { box-shadow: 0 0 0 7px rgba(0,113,227,0.06); }
}

/* ---------- Renderers (product / web) ---------- */
.renderer { display: flex; flex-direction: column; gap: 14px; margin-bottom : 12px;}
.renderer-section {
  background: #ffffff;
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.renderer-section-title {
  font-size: 11px;
  font-weight: 600;
  color: #86868b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.renderer-block {
  font-size: 13px;
  line-height: 1.5;
  color: #1d1d1f;
  white-space: pre-wrap;
}
.renderer-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 12.5px;
  padding: 4px 0;
  border-top: 1px solid rgba(0,0,0,0.04);
}
.renderer-row:first-child { border-top: none; }
.renderer-row-label { color: #86868b; flex-shrink: 0; }
.renderer-row-value { color: #1d1d1f; text-align: right; word-break: break-word; }
.renderer-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.renderer-chip {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  background: rgba(0,0,0,0.05);
  color: #1d1d1f;
  border-radius: 980px;
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: -0.005em;
}
.renderer-chip--accent {
  background: rgba(0,113,227,0.1);
  color: #0071e3;
}
.renderer-palette {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.palette-swatch {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.palette-swatch--primary .palette-chip {
  box-shadow: 0 0 0 2px rgba(0,113,227,0.4);
}
.palette-chip {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid rgba(0,0,0,0.08);
}
.palette-code {
  font-size: 10px;
  color: #86868b;
  font-variant-numeric: tabular-nums;
}

/* ---------- History mode badge ---------- */
.history-thumb { position: relative; }
.history-mode {
  position: absolute;
  top: 6px;
  left: 6px;
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(28,28,30,0.65);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  color: #ffffff;
  border-radius: 50%;
  font-size: 12px;
  line-height: 1;
}
.history-mode-inline { font-size: 13px; }

/* ---------- Loading ---------- */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  gap: 16px;
}
.spinner {
  width: 28px; height: 28px;
  border: 2.5px solid rgba(0,0,0,0.08);
  border-top-color: #0071e3;
  border-radius: 50%;
  animation: spin 720ms linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.loading-label { font-size: 14px; color: #515154; font-weight: 500; letter-spacing: -0.01em; }

/* ---------- Empty ---------- */
.empty-state { padding: 60px 24px; text-align: center; }
.empty-title { font-size: 15px; font-weight: 600; color: #1d1d1f; letter-spacing: -0.01em; }
.empty-desc { font-size: 12.5px; color: #86868b; margin-top: 4px; }

/* ---------- Error ---------- */
.error-state {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 32px 12px;
}
.error-icon {
  width: 44px; height: 44px;
  border-radius: 50%;
  background: rgba(255, 59, 48, 0.1);
  color: #ff3b30;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}
.error-title {
  font-size: 15px;
  font-weight: 600;
  text-align: center;
  color: #1d1d1f;
  letter-spacing: -0.01em;
}
.error-message {
  font-size: 12.5px;
  color: #86868b;
  text-align: center;
  line-height: 1.5;
  word-break: break-word;
}
.error-action { display: flex; justify-content: center; margin-top: 4px; }

.footer {
  padding: 12px 20px 16px;
  border-top: 1px solid rgba(0,0,0,0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  font-size: 11.5px;
  color: #86868b;
}
.footer a { color: #86868b; text-decoration: none; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 280px; }
.footer a:hover { color: #0071e3; }

/* ---------- History ---------- */
.history-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 0 2px;
}
.history-count { font-size: 12px; color: #86868b; font-weight: 500; }
.link-danger {
  background: none; border: none; padding: 0;
  color: #ff3b30; font-size: 12.5px; font-weight: 500; cursor: pointer;
}
.link-danger:hover { opacity: 0.75; }

.inline-confirm {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff5f0;
  color: #a1501a;
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 12.5px;
  margin-bottom: 12px;
  gap: 10px;
}
.inline-confirm-actions { display: flex; gap: 6px; }
.inline-confirm-mini { display: inline-flex; gap: 6px; align-items: center; }

.history-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.history-item {
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
}
.history-thumb {
  overflow: hidden;
  border-radius: 12px;
  background: #f5f5f7;
  aspect-ratio: 4/3;
  transition: box-shadow 220ms ease, transform 220ms ease;
}
.history-item:hover .history-thumb {
  box-shadow: 0 6px 20px rgba(0,0,0,0.1);
  transform: translateY(-1px);
}
.history-thumb img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 300ms ease;
}
.history-item:hover .history-thumb img { transform: scale(1.03); }
.history-time { font-size: 10.5px; color: #86868b; padding: 0 2px; }
.thumb-skeleton {
  width: 100%; height: 100%;
  background: linear-gradient(100deg, #f5f5f7 30%, #ebebed 50%, #f5f5f7 70%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}
@keyframes shimmer {
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}

.result-footer-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding-top: 4px;
}

.history-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 11.5px;
  color: #86868b;
  padding: 0 2px;
}
.link-source {
  display: block;
  font-size: 11px;
  color: #86868b;
  text-decoration: none;
  margin-top: -4px;
  margin-bottom: 8px;
  padding: 0 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.link-source:hover { color: #0071e3; }

/* ---------- Settings ---------- */
.settings-form { display: flex; flex-direction: column; gap: 14px; }
.settings-section {
  background: #ffffff;
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 16px;
  padding: 16px 18px;
}
.settings-section-title {
  font-size: 13.5px;
  font-weight: 600;
  letter-spacing: -0.01em;
  margin-bottom: 4px;
}
.settings-section-desc {
  font-size: 11.5px;
  color: #86868b;
  line-height: 1.5;
  margin-bottom: 12px;
}
.settings-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 0;
  border-top: 1px solid rgba(0,0,0,0.05);
}
.settings-field:first-of-type { border-top: none; padding-top: 4px; }
.settings-field-label {
  font-size: 12.5px;
  font-weight: 500;
  color: #1d1d1f;
}
.settings-input {
  width: 100%;
  padding: 8px 12px;
  border-radius: 10px;
  background: #f5f5f7;
  border: 1px solid transparent;
  font-size: 13px;
  color: #1d1d1f;
  outline: none;
  transition: background 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
}
.settings-input:focus {
  background: #ffffff;
  border-color: #0071e3;
  box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.18);
}
.settings-input-row { display: flex; gap: 8px; align-items: center; }
.settings-input-row .settings-input { flex: 1; }
.settings-error { font-size: 11.5px; color: #ff3b30; }

.settings-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-top: 4px;
  padding: 12px 16px;
  background: rgba(245, 245, 247, 0.6);
  border-radius: 14px;
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  position: sticky;
  bottom: -20px;
}
.status-ok { font-size: 12.5px; color: #34c759; font-weight: 500; }
.status-err { font-size: 12.5px; color: #ff3b30; font-weight: 500; }

/* ---------- Dark ---------- */
@media (prefers-color-scheme: dark) {
  .panel:not(.theme-light) {
    background: rgba(28, 28, 30, 0.85);
    border-color: rgba(255,255,255,0.08);
    color: #f5f5f7;
  }
  .header, .footer { border-color: rgba(255,255,255,0.08); }
  .icon-btn { color: #aeaeb2; }
  .icon-btn:hover { background: rgba(255,255,255,0.08); color: #ffffff; }
  .hero, .sub-card, .tile, .history-thumb { background: rgba(255,255,255,0.06); }
  .hero-card { background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)); }
  .hero-title { color: #f5f5f7; }
  .tile:hover { background: rgba(255,255,255,0.1); }
  .segment { background: rgba(255,255,255,0.08); }
  .segment button { color: #aeaeb2; }
  .segment button.active { background: rgba(255,255,255,0.14); color: #ffffff; }
  .prompt-card, .settings-section { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.08); }
  .prompt-card-label, .sub-card-label, .error-message, .loading-label, .footer, .history-count, .history-time, .settings-section-desc, .empty-desc, .shortcut-hint, .hero-eyebrow { color: #aeaeb2; }
  .prompt-text, .sub-card pre, .error-title, .empty-title, .settings-field-label, .settings-section-title { color: #f5f5f7; }
  .btn-secondary { background: rgba(255,255,255,0.1); color: #f5f5f7; }
  .btn-secondary:hover:not(:disabled) { background: rgba(255,255,255,0.14); }
  .btn-primary { background: #0a84ff; }
  .btn-primary:hover:not(:disabled) { background: #0a84ff; filter: brightness(1.1); }
  .kbd { background: rgba(255,255,255,0.12); color: #f5f5f7; border-color: rgba(255,255,255,0.16); box-shadow: 0 1px 0 rgba(0,0,0,0.2); }
  .settings-input { background: rgba(255,255,255,0.06); color: #f5f5f7; }
  .settings-input:focus { background: rgba(255,255,255,0.1); border-color: #0a84ff; box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.22); }
  .settings-field { border-color: rgba(255,255,255,0.06); }
  .settings-actions { background: rgba(255,255,255,0.04); }
  .warning-banner, .inline-confirm { background: rgba(255, 149, 0, 0.16); color: #ffd180; }
  .mode-segment { background: rgba(255,255,255,0.08); }
  .mode-segment-btn { color: #aeaeb2; }
  .mode-segment-btn--active { background: rgba(255,255,255,0.14); color: #ffffff; }
  .renderer-section { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.08); }
  .renderer-block, .renderer-row-value { color: #f5f5f7; }
  .renderer-row { border-color: rgba(255,255,255,0.06); }
  .renderer-chip { background: rgba(255,255,255,0.08); color: #f5f5f7; }
  .renderer-chip--accent { background: rgba(10,132,255,0.16); color: #4aa6ff; }
  .palette-chip { border-color: rgba(255,255,255,0.12); }
  .stepper-dot { background: rgba(255,255,255,0.18); }
  .stepper-line { background: rgba(255,255,255,0.08); }
  .stepper-step--current .stepper-dot { background: #0a84ff; box-shadow: 0 0 0 4px rgba(10,132,255,0.22); }
  .stepper-step--done .stepper-dot { background: #34c759; }
  .stepper-step--pending .stepper-label { color: #6e6e72; }
  .stepper-label { color: #aeaeb2; }
  .stepper-step--current .stepper-label, .stepper-step--done .stepper-label { color: #f5f5f7; }
  .result-mode { background: rgba(10,132,255,0.16); color: #4aa6ff; }
}

/* Mode icon svg sizing */
.mode-segment-icon svg { width: 13px; height: 13px; display: block; }
.result-mode-icon svg { width: 12px; height: 12px; display: block; }
.history-mode svg { width: 11px; height: 11px; display: block; }
.history-mode-inline svg { width: 11px; height: 11px; vertical-align: -1px; }
.overlay-mode-icon { display: inline-flex; align-items: center; margin-right: 4px; }
.overlay-mode-icon svg { width: 11px; height: 11px; display: block; }

/* Extra tile override — .tile has its own color so needs dark reset */
@media (prefers-color-scheme: dark) {
  .panel:not(.theme-light) .tile { color: #f5f5f7; }
}
.panel.theme-dark .tile { color: #f5f5f7; }

/* Explicit dark theme class overrides */
.panel.theme-dark {
    background: rgba(28, 28, 30, 0.85);
    border-color: rgba(255,255,255,0.08);
    color: #f5f5f7;
   }
.panel.theme-dark .header, .panel.theme-dark .footer { border-color: rgba(255,255,255,0.08);  }
.panel.theme-dark .icon-btn { color: #aeaeb2;  }
.panel.theme-dark .icon-btn:hover { background: rgba(255,255,255,0.08); color: #ffffff;  }
.panel.theme-dark .hero, .panel.theme-dark .sub-card, .panel.theme-dark .tile, .panel.theme-dark .history-thumb { background: rgba(255,255,255,0.06);  }
.panel.theme-dark .hero-card { background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));  }
.panel.theme-dark .hero-title { color: #f5f5f7;  }
.panel.theme-dark .tile:hover { background: rgba(255,255,255,0.1);  }
.panel.theme-dark .segment { background: rgba(255,255,255,0.08);  }
.panel.theme-dark .segment button { color: #aeaeb2;  }
.panel.theme-dark .segment button.active { background: rgba(255,255,255,0.14); color: #ffffff;  }
.panel.theme-dark .prompt-card, .panel.theme-dark .settings-section { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.08);  }
.panel.theme-dark .prompt-card-label, .panel.theme-dark .sub-card-label, .panel.theme-dark .error-message, .panel.theme-dark .loading-label, .panel.theme-dark .footer, .panel.theme-dark .history-count, .panel.theme-dark .history-time, .panel.theme-dark .settings-section-desc, .panel.theme-dark .empty-desc, .panel.theme-dark .shortcut-hint, .panel.theme-dark .hero-eyebrow { color: #aeaeb2;  }
.panel.theme-dark .prompt-text, .panel.theme-dark .sub-card pre, .panel.theme-dark .error-title, .panel.theme-dark .empty-title, .panel.theme-dark .settings-field-label, .panel.theme-dark .settings-section-title { color: #f5f5f7;  }
.panel.theme-dark .btn-secondary { background: rgba(255,255,255,0.1); color: #f5f5f7;  }
.panel.theme-dark .btn-secondary:hover:not(:disabled) { background: rgba(255,255,255,0.14);  }
.panel.theme-dark .btn-primary { background: #0a84ff;  }
.panel.theme-dark .btn-primary:hover:not(:disabled) { background: #0a84ff; filter: brightness(1.1);  }
.panel.theme-dark .kbd { background: rgba(255,255,255,0.12); color: #f5f5f7; border-color: rgba(255,255,255,0.16); box-shadow: 0 1px 0 rgba(0,0,0,0.2);  }
.panel.theme-dark .settings-input { background: rgba(255,255,255,0.06); color: #f5f5f7;  }
.panel.theme-dark .settings-input:focus { background: rgba(255,255,255,0.1); border-color: #0a84ff; box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.22);  }
.panel.theme-dark .settings-field { border-color: rgba(255,255,255,0.06);  }
.panel.theme-dark .settings-actions { background: rgba(255,255,255,0.04);  }
.panel.theme-dark .warning-banner, .panel.theme-dark .inline-confirm { background: rgba(255, 149, 0, 0.16); color: #ffd180;  }
.panel.theme-dark .mode-segment { background: rgba(255,255,255,0.08);  }
.panel.theme-dark .mode-segment-btn { color: #aeaeb2;  }
.panel.theme-dark .mode-segment-btn--active { background: rgba(255,255,255,0.14); color: #ffffff;  }
.panel.theme-dark .renderer-section { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.08);  }
.panel.theme-dark .renderer-block, .panel.theme-dark .renderer-row-value { color: #f5f5f7;  }
.panel.theme-dark .renderer-row { border-color: rgba(255,255,255,0.06);  }
.panel.theme-dark .renderer-chip { background: rgba(255,255,255,0.08); color: #f5f5f7;  }
.panel.theme-dark .renderer-chip--accent { background: rgba(10,132,255,0.16); color: #4aa6ff;  }
.panel.theme-dark .palette-chip { border-color: rgba(255,255,255,0.12);  }
.panel.theme-dark .stepper-dot { background: rgba(255,255,255,0.18);  }
.panel.theme-dark .stepper-line { background: rgba(255,255,255,0.08);  }
.panel.theme-dark .stepper-step--current .stepper-dot { background: #0a84ff; box-shadow: 0 0 0 4px rgba(10,132,255,0.22);  }
.panel.theme-dark .stepper-step--done .stepper-dot { background: #34c759;  }
.panel.theme-dark .stepper-step--pending .stepper-label { color: #6e6e72;  }
.panel.theme-dark .stepper-label { color: #aeaeb2;  }
.panel.theme-dark .stepper-step--current .stepper-label, .panel.theme-dark .stepper-step--done .stepper-label { color: #f5f5f7;  }
.panel.theme-dark .result-mode { background: rgba(10,132,255,0.16); color: #4aa6ff;  }
`;
