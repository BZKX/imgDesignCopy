// Stage layout — opts out of global Navbar & GridOverlay.
// This layout replaces the root chrome for all /stage/* routes.

export default function StageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: '#07070a',
        minHeight: '100vh',
        color: '#f5f5f7',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {children}
    </div>
  );
}
