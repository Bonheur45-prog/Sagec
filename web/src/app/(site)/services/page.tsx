import { HydrationBoundary } from '@tanstack/react-query';
import ServicesPage from '@pages/ServicesPage';
import { prefetch } from '@/lib/site/prefetch';
import { buildMetadata } from '@/lib/site/seo';

export const dynamic = 'force-dynamic';

export const generateMetadata = () => buildMetadata({ pageKey: 'services', path: '/services', title: "Our Services" });

export default async function Page() {
  const { state } = await prefetch([["services-page"], ["services"]]);
  return (
    <HydrationBoundary state={state}>
      <ServicesPage />
    </HydrationBoundary>
  );
}
