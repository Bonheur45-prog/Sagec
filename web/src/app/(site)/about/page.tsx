import { HydrationBoundary } from '@tanstack/react-query';
import AboutPage from '@pages/AboutPage';
import { prefetch } from '@/lib/site/prefetch';
import { buildMetadata } from '@/lib/site/seo';

export const dynamic = 'force-dynamic';

export const generateMetadata = () => buildMetadata({ pageKey: 'about', path: '/about', title: "About Us" });

export default async function Page() {
  const { state } = await prefetch([["about-page"]]);
  return (
    <HydrationBoundary state={state}>
      <AboutPage />
    </HydrationBoundary>
  );
}
