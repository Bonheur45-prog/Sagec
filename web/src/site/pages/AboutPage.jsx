'use client';

import Seo from '@components/ui/Seo';
import AboutHero from '@sections/about/AboutHero';
import OurStory from '@sections/about/OurStory';
import MissionVision from '@sections/about/MissionVision';
import Timeline from '@sections/about/Timeline';
import AboutCTA from '@sections/about/AboutCTA';

export default function AboutPage() {
  return (
    <>
      <Seo pageKey="about" title="About Us" description="Learn about SAGEC Ltd — Rwanda's architectural and engineering firm delivering landmark construction projects across Kigali." path="/about" />
      <AboutHero />
      <OurStory />
      <MissionVision />
      <Timeline />
      <AboutCTA />
    </>
  )
}