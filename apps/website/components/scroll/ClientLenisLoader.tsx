'use client';

import dynamic from 'next/dynamic';

const LenisProvider = dynamic(() => import('./LenisProvider'), { ssr: false });

export default function ClientLenisLoader({ children }: { children: React.ReactNode }) {
  return <LenisProvider>{children}</LenisProvider>;
}
