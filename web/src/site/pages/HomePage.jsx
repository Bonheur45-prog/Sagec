'use client';

import Seo from '@components/ui/Seo';
import Hero from '@sections/home/Hero';
import Stats from '@sections/home/Stats';
import ServicesOverview from '@sections/home/Services';
import FeaturedProjects from '@sections/home/FeaturedProjects';
import WhyChooseUs from '@sections/home/WhyChooseUs';
import Testimonials from '@sections/home/Testimonials';
import PartnersStrip from '@sections/home/PartnersStrip';
import CTASection from '@sections/home/CTASection';

export default function HomePage() {
  return (
    <>
      <Seo pageKey="home" path="/" />
      <Hero />
      <Stats />
      <ServicesOverview />
      <FeaturedProjects />
      <WhyChooseUs />
      <Testimonials />
      <PartnersStrip />
      <CTASection />
      {/* Remaining sections will be added one by one */}
    </>
  )
}
