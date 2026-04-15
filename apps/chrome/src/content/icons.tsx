export function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="kbd">{children}</kbd>;
}

export function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <path d="M3 3l10 10M13 3L3 13" />
    </svg>
  );
}
export function SettingsIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="2" />
      <path
        d="M8 1.5v2M8 12.5v2M14.5 8h-2M3.5 8h-2M12.6 3.4l-1.4 1.4M4.8 11.2l-1.4 1.4M12.6 12.6l-1.4-1.4M4.8 4.8L3.4 3.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
export function CopyIcon() {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      style={{ width: 13, height: 13 }}
    >
      <rect x="3.5" y="3.5" width="8" height="9" rx="1.5" />
      <path d="M6 3.5V2.5a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-.5" />
    </svg>
  );
}
export function AlertIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      style={{ width: 20, height: 20 }}
    >
      <path d="M12 8v5M12 16.5v.01" />
      <circle cx="12" cy="12" r="9.5" />
    </svg>
  );
}
export function BackIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 3L5 8l5 5" />
    </svg>
  );
}
export function HistoryIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.8 7.5a5.3 5.3 0 11.7 3" />
      <path d="M1.5 10.6l2 .1.1-2" />
      <path d="M8 5.2v3.1l2 1.2" />
    </svg>
  );
}
export function SunIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="8" cy="8" r="2.8" />
      <path d="M8 1.5v1.8M8 12.7v1.8M14.5 8h-1.8M3.3 8H1.5M12.6 3.4l-1.3 1.3M4.7 11.3l-1.3 1.3M12.6 12.6l-1.3-1.3M4.7 4.7L3.4 3.4" />
    </svg>
  );
}
export function MoonIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13.2 9.4A5.5 5.5 0 016.6 2.8a5.5 5.5 0 106.6 6.6z" />
    </svg>
  );
}
export function DrawIcon() {
  return (
    <svg viewBox="0 0 1024 1024" fill="currentColor" aria-hidden>
      <path d="M512 170.666667a341.333333 341.333333 0 1 1 0 682.666666c-55.722667 0-21.930667-39.552-83.925333-103.253333C368.170667 688.64 170.666667 725.12 170.666667 512a341.333333 341.333333 0 0 1 341.333333-341.333333z m74.666667 413.866666a64 64 0 1 0 0 128 64 64 0 0 0 0-128z m117.333333-136.533333a42.666667 42.666667 0 1 0 0 85.333333 42.666667 42.666667 0 0 0 0-85.333333zM640 341.333333a42.666667 42.666667 0 1 0 0 85.333334 42.666667 42.666667 0 0 0 0-85.333334z m-245.333333-12.8a42.666667 42.666667 0 1 0 0 85.333334 42.666667 42.666667 0 0 0 0-85.333334z m128-40.533333a42.666667 42.666667 0 1 0 0 85.333333 42.666667 42.666667 0 0 0 0-85.333333z" />
    </svg>
  );
}
export function ProductIcon() {
  return (
    <svg viewBox="0 0 1024 1024" fill="currentColor" aria-hidden>
      <path d="M832 736l-249.6 153.6c-19.2 12.8-38.4 0-38.4-25.6L544 505.6c0-6.4 6.4-19.2 12.8-25.6l249.6-153.6c19.2-12.8 38.4 0 38.4 25.6l0 364.8C844.8 723.2 838.4 736 832 736z" />
      <path d="M192 736l249.6 153.6c19.2 12.8 38.4 0 38.4-25.6L480 505.6c0-6.4-6.4-19.2-12.8-25.6L217.6 326.4C204.8 320 179.2 332.8 179.2 352l0 364.8C179.2 723.2 185.6 736 192 736z" />
      <path d="M505.6 128 217.6 236.8c-12.8 6.4-12.8 25.6 0 32L505.6 448C512 448 518.4 448 518.4 448l294.4-179.2c12.8-6.4 12.8-25.6 0-32L518.4 128C512 128 512 128 505.6 128z" />
    </svg>
  );
}
export function WebIcon() {
  return (
    <svg viewBox="0 0 1024 1024" fill="currentColor" aria-hidden>
      <path d="M853.333333 170.666667 170.666667 170.666667C123.733333 170.666667 85.333333 209.066667 85.333333 256l0 512c0 46.933333 38.4 85.333333 85.333333 85.333333l682.666667 0c46.933333 0 85.333333-38.4 85.333333-85.333333L938.666667 256C938.666667 209.066667 900.266667 170.666667 853.333333 170.666667zM640 768 170.666667 768l0-170.666667 469.333333 0L640 768zM640 554.666667 170.666667 554.666667 170.666667 384l469.333333 0L640 554.666667zM853.333333 768l-170.666667 0L682.666667 384l170.666667 0L853.333333 768z" />
    </svg>
  );
}
export function ModeIcon({ mode }: { mode: 'image_to_prompt' | 'product_style' | 'webpage_style' }) {
  if (mode === 'product_style') return <ProductIcon />;
  if (mode === 'webpage_style') return <WebIcon />;
  return <DrawIcon />;
}
export function ScissorIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: 14, height: 14 }}
    >
      <circle cx="4" cy="5" r="1.75" />
      <circle cx="4" cy="11" r="1.75" />
      <path d="M5.5 6.2L14 13M5.5 9.8L14 3" />
    </svg>
  );
}
