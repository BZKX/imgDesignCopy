import type { Metadata } from 'next';
import { Suspense } from 'react';
import WebpageStageClient from './WebpageStageClient';

export const metadata: Metadata = {
  title: 'Webpage Stage — PromptLens',
  robots: { index: false, follow: false },
};

export default function WebpageStagePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#ffffff' }} />}>
      <WebpageStageClient />
    </Suspense>
  );
}
