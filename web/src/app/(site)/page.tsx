import { HydrationBoundary } from '@tanstack/react-query';
import HomePage from '@pages/HomePage';
import { prefetch } from '@/lib/site/prefetch';
import { buildMetadata } from '@/lib/site/seo';

export const dynamic = 'force-dynamic';

export const generateMetadata = () => buildMetadata({ pageKey: 'home', path: '/' });

export default async function Page() {
  const { state } = await prefetch([["home-page"], ["services"], ["projects"], ["testimonials"], ["partners"]]);
  return (
    <HydrationBoundary state={state}>
      <HomePage />
    </HydrationBoundary>
  );
}
