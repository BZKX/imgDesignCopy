import type { Metadata } from 'next';
import StyleStageClient from './StyleStageClient';

export const metadata: Metadata = {
  title: 'Style Stage — PromptLens',
  robots: { index: false, follow: false },
};

export default function StyleStagePage() {
  return <StyleStageClient />;
}
