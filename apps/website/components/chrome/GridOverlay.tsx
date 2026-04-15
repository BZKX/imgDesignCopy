export default function GridOverlay() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        backgroundImage: [
          'linear-gradient(to right, var(--pl-grid-line) 1px, transparent 1px)',
          'linear-gradient(to bottom, var(--pl-grid-line) 1px, transparent 1px)',
        ].join(', '),
        backgroundSize: '96px 96px',
        maskImage:
          'radial-gradient(ellipse 80% 60% at 50% 30%, black 0%, transparent 80%)',
        WebkitMaskImage:
          'radial-gradient(ellipse 80% 60% at 50% 30%, black 0%, transparent 80%)',
      }}
    />
  );
}
