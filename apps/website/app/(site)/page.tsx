'use client';

import dynamic from 'next/dynamic';
import Hero from '@/components/sections/Hero';
import Features from '@/components/sections/Features';
import Platforms from '@/components/sections/Platforms';
import Pricing from '@/components/sections/Pricing';
import Roadmap from '@/components/sections/Roadmap';
import { ScrollNarrativeProvider } from '@/components/narrative/ScrollNarrativeContext';
import ScrollProgressNav from '@/components/narrative/ScrollProgressNav';
import {
  STYLE_PROMPT_CONFIG,
  PRODUCT_VISUAL_CONFIG,
  WEB_DESIGN_CONFIG,
} from '@/components/narrative/configs';

const ScrollNarrative = dynamic(
  () => import('@/components/narrative/ScrollNarrative'),
  { ssr: false },
);

const CtaFooter = dynamic(
  () => import('@/components/sections/CtaFooter'),
  { ssr: false },
);

export default function Home() {
  return (
    <ScrollNarrativeProvider>
      <Hero />

      <ScrollNarrative config={STYLE_PROMPT_CONFIG} />
      <ScrollNarrative config={PRODUCT_VISUAL_CONFIG} />
      <ScrollNarrative config={WEB_DESIGN_CONFIG} />

      <Features />

      <Platforms />

      <Pricing />

      <Roadmap />

      <CtaFooter />

      <ScrollProgressNav />
    </ScrollNarrativeProvider>
  );
}
