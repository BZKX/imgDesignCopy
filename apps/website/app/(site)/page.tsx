'use client';

import dynamic from 'next/dynamic';
import Hero from '@/components/sections/Hero';
import Problem from '@/components/sections/Problem';
import HowItWorks from '@/components/sections/HowItWorks';
import Features from '@/components/sections/Features';
import Platforms from '@/components/sections/Platforms';
import Pricing from '@/components/sections/Pricing';
import Roadmap from '@/components/sections/Roadmap';

const DemoSection = dynamic(
  () => import('@/components/sections/Demo/DemoSection'),
  { ssr: false },
);

const CtaFooter = dynamic(
  () => import('@/components/sections/CtaFooter'),
  { ssr: false },
);

export default function Home() {
  return (
    <>
      <Hero />

      <Problem />

      <HowItWorks />

      <DemoSection />

      <Features />

      <Platforms />

      <Pricing />

      <Roadmap />

      <CtaFooter />
    </>
  );
}
