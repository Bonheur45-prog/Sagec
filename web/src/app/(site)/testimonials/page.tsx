import { HydrationBoundary } from '@tanstack/react-query';
import TestimonialsPage from '@pages/TestimonialsPage';
import { prefetch } from '@/lib/site/prefetch';
import { buildMetadata } from '@/lib/site/seo';

export const dynamic = 'force-dynamic';

export const generateMetadata = () => buildMetadata({ pageKey: 'testimonials', path: '/testimonials', title: "Testimonials" });

export default async function Page() {
  const { state } = await prefetch([["testimonials-page"], ["testimonials"]]);
  return (
    <HydrationBoundary state={state}>
      <TestimonialsPage />
    </HydrationBoundary>
  );
}
