import Seo from '@components/ui/Seo';
import TestimonialsHero from '../sections/testimonials/TestimonialsHero';
import TestimonialsGrid from '../sections/testimonials/TestimonialsGrid';

export default function TestimonialsPage() {
  return (
    <div>
      <Seo pageKey="testimonials" title="Testimonials" description="See what clients say about working with SAGEC Ltd on their architecture and construction projects." path="/testimonials" />
      <TestimonialsHero />
      <TestimonialsGrid />
    </div>
  )
}
