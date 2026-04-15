import type { Metadata } from 'next';
import { Suspense } from 'react';
import ProductStageClient from './ProductStageClient';

export const metadata: Metadata = {
  title: 'Product Stage — PromptLens',
  robots: { index: false, follow: false },
};

export default function ProductStagePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#07070a' }} />}>
      <ProductStageClient />
    </Suspense>
  );
}
