import Navbar from '@/components/chrome/Navbar';
import SiteBackground from '@/components/chrome/SiteBackground';
import ClientCursorLoader from '@/components/chrome/ClientCursorLoader';
import ClientLenisLoader from '@/components/scroll/ClientLenisLoader';

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClientLenisLoader>
      <SiteBackground />
      <Navbar />
      <main style={{ position: 'relative', zIndex: 10 }}>{children}</main>
      <ClientCursorLoader />
    </ClientLenisLoader>
  );
}
