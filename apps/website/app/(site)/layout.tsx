import GridOverlay from '@/components/chrome/GridOverlay';
import Navbar from '@/components/chrome/Navbar';
import ClientCursorLoader from '@/components/chrome/ClientCursorLoader';
import ClientLenisLoader from '@/components/scroll/ClientLenisLoader';

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClientLenisLoader>
      <GridOverlay />
      <Navbar />
      <main style={{ position: 'relative', zIndex: 10 }}>{children}</main>
      <ClientCursorLoader />
    </ClientLenisLoader>
  );
}
