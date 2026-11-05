'use client';

import Seo from '@components/ui/Seo';
import CareersHero from "@sections/careers/CareersHero";
import OpenPositions from "@sections/careers/OpenPositions";

export default function CareersPage() {
  return (
    <>
      <Seo title="Careers" description="Join the SAGEC Ltd team — explore current career opportunities in architecture, engineering, and construction." path="/careers" />
      <CareersHero />
      <OpenPositions />
    </>
  );
}
