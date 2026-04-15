import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import LocaleProvider from '@/components/scroll/LocaleProvider';
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-pl-sans-inter',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://promptlens.app';

export const metadata: Metadata = {
  title: 'PromptLens — Screenshot to AI Prompt',
  description:
    'Turn any screenshot or image into a precise AI drawing prompt. Chrome extension + desktop app.',
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: 'PromptLens — Screenshot to AI Prompt',
    description:
      'Turn any screenshot or image into a precise AI drawing prompt. Chrome extension + desktop app.',
    siteName: 'PromptLens',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'PromptLens — Screenshot to AI Prompt' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PromptLens — Screenshot to AI Prompt',
    description:
      'Turn any screenshot or image into a precise AI drawing prompt. Chrome extension + desktop app.',
    images: ['/opengraph-image'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark" suppressHydrationWarning>
      <body className={inter.variable}>
        <LocaleProvider>{children}</LocaleProvider>
        <Analytics />
      </body>
    </html>
  );
}
