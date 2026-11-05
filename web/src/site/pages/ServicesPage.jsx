'use client';

import Seo from '@components/ui/Seo';
import ServicesHero from '@sections/services/ServicesHero';
import ServicesList from '@sections/services/ServicesList';
import ServicesProcess from '@sections/services/ServicesProcess';
import ServicesCTA from '@sections/services/ServicesCTA';

export default function ServicesPage() {
  return (
    <>
      <Seo pageKey="services" title="Our Services" description="Architecture, structural engineering, MEP, and construction management services from SAGEC Ltd, Kigali." path="/services" />
      <ServicesHero />
      <ServicesList />
      <ServicesProcess />
      <ServicesCTA />
    </>
  )
}
